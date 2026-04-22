import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Admin' | 'Operator' | 'Viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<boolean>;
  register: (username: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const createToken = (user: User): string => {
  const payload = btoa(JSON.stringify({ ...user, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  return `header.${payload}.signature`;
};

const decodeToken = (token: string): User | null => {
  try {
    const payload = token.split('.')[1];
    const data = JSON.parse(atob(payload));
    if (data.exp < Date.now()) return null;
    const { exp, ...user } = data;
    return user as User;
  } catch { return null; }
};

const USERS_KEY = 'crisis_users';
const TOKEN_KEY = 'crisis_token';

const getUsers = (): User[] => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      const decoded = decodeToken(savedToken);
      if (decoded) { setUser(decoded); setToken(savedToken); }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, remember: boolean): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const defaultAdmin: User = { id: 'admin-1', username: 'admin', email: 'admin@crisis.com', role: 'Admin' };
    const users = getUsers();
    let foundUser: User | undefined;
    if (username === 'admin' && password === 'admin123') {
      foundUser = defaultAdmin;
    } else {
      foundUser = users.find(u => u.username === username);
    }
    if (!foundUser) return false;
    const newToken = createToken(foundUser);
    setUser(foundUser);
    setToken(newToken);
    if (remember) localStorage.setItem(TOKEN_KEY, newToken);
    else sessionStorage.setItem(TOKEN_KEY, newToken);
    return true;
  };

  const register = async (username: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const users = getUsers();
    if (users.find(u => u.username === username)) return false;
    const newUser: User = { id: `user-${Date.now()}`, username, email, role };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const newToken = createToken(newUser);
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
