# Talreo — wrzutka na GitHub i Cloudflare Pages

## Część 1: GitHub

### Krok 1.1 — Repozytorium tylko dla Talreo

Otwórz **PowerShell** lub **Terminal** i przejdź do folderu projektu:

```powershell
cd C:\Users\wojno\Desktop\talreo
```

### Krok 1.2 — Inicjalizacja Gita (jeśli w tym folderze nie ma jeszcze repozytorium)

Sprawdź, czy jest folder `.git`:

```powershell
dir .git
```

- **Jeśli NIE MA** folderu `.git` — załóż nowe repo:

```powershell
git init
```

- **Jeśli JEST** — pomiń `git init`.

### Krok 1.3 — Zdalne repo na GitHubie

1. Wejdź na https://github.com/new
2. **Repository name:** np. `talreo`
3. Opcja: **Private** lub **Public**
4. **NIE** zaznaczaj "Add a README" — projekt już istnieje lokalnie
5. Kliknij **Create repository**

### Krok 1.4 — Podłącz zdalny adres i wypchnij kod

W terminalu (wciąż w `C:\Users\wojno\Desktop\talreo`):

```powershell
# Podmień TWOJ_LOGIN na swoją nazwę użytkownika GitHub
git remote add origin https://github.com/TWOJ_LOGIN/talreo.git
```

Potem:

```powershell
git add .
git status
```

Upewnij się, że na liście są tylko pliki z folderu **talreo** (bez rzeczy z Pulpitu). Jeśli coś zbędnego jest dodane, popraw `.gitignore` lub usuń z indeksu: `git reset HEAD ścieżka/do/pliku`.

Pierwszy commit i push:

```powershell
git commit -m "Initial commit: Talreo app"
git branch -M main
git push -u origin main
```

Podaj login i hasło (albo **Personal Access Token** zamiast hasła, jeśli masz 2FA).

---

## Część 2: Cloudflare Pages

### Krok 2.1 — Wejście do Cloudflare

1. Wejdź na https://dash.cloudflare.com
2. Zaloguj się (lub załóż konto)
3. W lewym menu wybierz **Workers & Pages**

### Krok 2.2 — Nowa aplikacja Pages

1. Kliknij **Create application** → **Pages** → **Connect to Git**
2. Wybierz **GitHub** i zatwierdź dostęp do konta (jeśli pytane)
3. Wybierz repozytorium **talreo** z listy
4. Kliknij **Begin setup**

### Krok 2.3 — Ustawienia buildu

Wypełnij:

| Pole | Wartość |
|------|--------|
| **Project name** | `talreo` (albo dowolna nazwa) |
| **Production branch** | `main` |
| **Build command** | `npm run build:web` |
| **Build output directory** | `dist` |

Kliknij **Save and Deploy**.

### Krok 2.4 — Zmienne (opcjonalnie)

Jeśli aplikacja używa zmiennych (np. URL API Supabase):

1. W projekcie Pages: **Settings** → **Environment variables**
2. Dodaj np. `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` itd. dla **Production** (i Preview, jeśli chcesz)

---

## Co dalej: każda zmiana na stronie

1. W folderze `talreo` wprowadzasz zmiany w kodzie.
2. W terminalu:

```powershell
cd C:\Users\wojno\Desktop\talreo
git add .
git commit -m "Opis zmian"
git push
```

3. Cloudflare Pages sam zbuduje projekt z GitHub i wgra nową wersję. Po 1–2 minutach zmiany będą na Twojej domenie (np. `talreo.pages.dev`).

---

## Domena własna (opcjonalnie)

W Cloudflare Pages: **Custom domains** → **Set up a custom domain** i wpisz swoją domenę. Cloudflare podpowie, co ustawić u rejestrara (DNS).
