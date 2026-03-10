/**
 * Welcome — redirects to / (welcome content lives at root for clean talreo.com URL).
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function WelcomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, []);
  return null;
}
