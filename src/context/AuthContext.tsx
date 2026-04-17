import { createContext, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

type User = {
  id: number;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('landchecker_token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('landchecker_user');
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const persist = (nextToken: string, nextUser: User) => {
    localStorage.setItem('landchecker_token', nextToken);
    localStorage.setItem('landchecker_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const payload = await authApi.login(email, password);
    persist(payload.token, payload.user);
  };

  const register = async (email: string, password: string) => {
    const payload = await authApi.register(email, password);
    persist(payload.token, payload.user);
  };

  const logout = () => {
    localStorage.removeItem('landchecker_token');
    localStorage.removeItem('landchecker_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
