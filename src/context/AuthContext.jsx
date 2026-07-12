import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_profile');
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
    } catch { clearAuth(); }
    finally { setLoading(false); }
  }, [clearAuth]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    const handler = () => { setUser(null); setProfile(null); setLoading(false); };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setProfile(data.profile);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, refreshProfile, setUser, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
