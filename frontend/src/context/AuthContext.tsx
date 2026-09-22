import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  name: string;
  email: string;
  role: 'Candidate / Job Seeker' | 'Cyber Investigator' | 'Security Analyst';
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string, role?: UserSession['role']) => void;
  register: (name: string, email: string, role: UserSession['role']) => void;
  demoLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('kavach_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem('kavach_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('kavach_user_session');
    }
  }, [user]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (email: string, _password?: string, role: UserSession['role'] = 'Cyber Investigator') => {
    const defaultName = email.split('@')[0] || 'Security Analyst';
    const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    setUser({
      name: capitalizedName,
      email,
      role,
    });
    setIsAuthModalOpen(false);
  };

  const register = (name: string, email: string, role: UserSession['role']) => {
    setUser({
      name: name || 'Security Analyst',
      email,
      role,
    });
    setIsAuthModalOpen(false);
  };

  const demoLogin = () => {
    setUser({
      name: 'Guest Threat Analyst',
      email: 'analyst.demo@kavach.ai',
      role: 'Cyber Investigator',
    });
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
