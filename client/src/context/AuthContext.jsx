import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
    localStorage.removeItem('foodbridge_login_time');
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('foodbridge_token');
      const loginTime = localStorage.getItem('foodbridge_login_time');
      const ONE_HOUR_MS = 60 * 60 * 1000;

      // Check if session has exceeded 1 hour
      if (loginTime && (Date.now() - Number(loginTime) > ONE_HOUR_MS)) {
        logout();
        setLoading(false);
        return;
      }

      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Auto-check session expiration every minute
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem('foodbridge_login_time');
      const ONE_HOUR_MS = 60 * 60 * 1000;
      if (loginTime && (Date.now() - Number(loginTime) > ONE_HOUR_MS)) {
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('foodbridge_token', res.data.token);
      localStorage.setItem('foodbridge_user', JSON.stringify(res.data.user));
      localStorage.setItem('foodbridge_login_time', Date.now().toString());
      setUser(res.data.user);
      setProfile(res.data.profile);
      return res.data;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
