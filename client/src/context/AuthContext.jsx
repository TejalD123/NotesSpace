import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api/notesApi';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!api.getToken()); // token asel tar adhi verify

  // App ughadtana: saved token valid ahe ka
  useEffect(() => {
    if (!api.getToken()) return;
    let cancelled = false;
    api
      .getMe()
      .then((u) => !cancelled && setUser(u))
      .catch(() => {
        /* 401 asel tar interceptor ne token kadhla; network error asel tar token tasach rahto */
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Token expire zala (kontya pan request madhe 401)
  useEffect(() => {
    const onExpired = () => {
      setUser((current) => {
        if (current) toast.error('Your session expired. Please log in again.');
        return null;
      });
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [toast]);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login(email, password);
    api.setToken(token);
    setUser(u);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token, user: u } = await api.register(name, email, password);
    api.setToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
