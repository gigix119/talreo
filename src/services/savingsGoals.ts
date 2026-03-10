/**
 * Savings goals — CRUD, add/subtract funds, status.
 */
import { supabase } from './supabase';
import { alertsService } from './alerts';
import type {
  SavingsGoal,
  SavingsGoalInsert,
  SavingsGoalUpdate,
  SavingsGoalWithStatus,
  GoalStatus,
} from '@/types/database';

function getStatus(g: SavingsGoal): GoalStatus {
  if (g.is_completed || Number(g.current_amount) >= Number(g.target_amount)) return 'completed';
  if (g.target_date && g.target_date < new Date().toISOString().slice(0, 10)) return 'overdue';
  return 'active';
}

function toWithStatus(g: SavingsGoal): SavingsGoalWithStatus {
  const target = Number(g.target_amount);
  const current = Number(g.current_amount);
  const remaining = Math.max(0, target - current);
  const progressPercent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return {
    ...g,
    progressPercent,
    remaining,
    status: getStatus(g),
  };
}

export const savingsGoalsService = {
  async getSavingsGoals(userId: string): Promise<SavingsGoalWithStatus[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message || 'Could not load savings goals.');
    return ((data ?? []) as SavingsGoal[]).map(toWithStatus);
  },

  async createSavingsGoal(userId: string, g: SavingsGoalInsert): Promise<SavingsGoal | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        name: g.name,
        target_amount: g.target_amount,
        current_amount: g.current_amount ?? 0,
        target_date: g.target_date ?? null,
        icon: g.icon ?? null,
        color: g.color ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message || 'Could not create goal.');
    return data as SavingsGoal;
  },

  async updateSavingsGoal(userId: string, id: string, u: SavingsGoalUpdate): Promise<SavingsGoal | null> {
    if (!supabase) return null;
    const payload: Record<string, unknown> = {};
    if (u.name !== undefined) payload.name = u.name;
    if (u.target_amount !== undefined) payload.target_amount = u.target_amount;
    if (u.current_amount !== undefined) payload.current_amount = u.current_amount;
    if (u.target_date !== undefined) payload.target_date = u.target_date;
    if (u.icon !== undefined) payload.icon = u.icon;
    if (u.color !== undefined) payload.color = u.color;
    if (u.is_completed !== undefined) payload.is_completed = u.is_completed;
    const { data, error } = await supabase
      .from('savings_goals')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message || 'Could not update goal.');
    return data as SavingsGoal;
  },

  async deleteSavingsGoal(userId: string, id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message || 'Could not delete goal.');
  },

  async addFundsToGoal(userId: string, goalId: string, amount: number): Promise<SavingsGoal | null> {
    if (amount <= 0) throw new Error('Amount must be positive.');
    const goals = await this.getSavingsGoals(userId);
    const g = goals.find((x) => x.id === goalId);
    if (!g) throw new Error('Goal not found.');
    const newCurrent = Number(g.current_amount) + amount;
    const completed = newCurrent >= Number(g.target_amount);
    const updated = await this.updateSavingsGoal(userId, goalId, {
      current_amount: newCurrent,
      is_completed: completed,
    });
    if (updated && completed) {
      await alertsService.createAlert(userId, {
        type: 'goal_completed',
        title: 'Cel ukończony',
        message: `Cel "${g.name}" został osiągnięty.`,
        metadata: { goal_id: goalId, target_amount: g.target_amount },
      });
    }
    return updated;
  },

  async subtractFundsFromGoal(userId: string, goalId: string, amount: number): Promise<SavingsGoal | null> {
    if (amount <= 0) throw new Error('Amount must be positive.');
    const goals = await this.getSavingsGoals(userId);
    const g = goals.find((x) => x.id === goalId);
    if (!g) throw new Error('Goal not found.');
    const newCurrent = Math.max(0, Number(g.current_amount) - amount);
    return this.updateSavingsGoal(userId, goalId, {
      current_amount: newCurrent,
      is_completed: newCurrent < Number(g.target_amount) ? false : g.is_completed,
    });
  },
};
