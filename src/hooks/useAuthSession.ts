import { useState, useCallback } from 'react';
import { ActiveScreen, LoginResponse } from '../types/domain.types';

const SESSION_STORAGE_KEY = 'justi_pos_session_v1';

export function useAuthSession(onNavigateScreen: (screen: ActiveScreen) => void) {
  const [session, setSession] = useState<LoginResponse | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as LoginResponse) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = useCallback(
    (newSession: LoginResponse) => {
      setSession(newSession);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      } catch {
        // ignore
      }
      onNavigateScreen(
        newSession.user.role === 'CRM' ? 'CLIENTES' : 'BIENVENIDO',
      );
    },
    [onNavigateScreen],
  );

  const handleLogout = useCallback(() => {
    setSession(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    onNavigateScreen('BIENVENIDO');
  }, [onNavigateScreen]);

  return { session, handleLoginSuccess, handleLogout };
}
