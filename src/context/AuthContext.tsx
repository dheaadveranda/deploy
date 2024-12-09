// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  username: string;
  role: string;
  setAuthData: (authData: { username: string; role: string }) => void;
  clearAuthData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<string>('');

  // Fungsi untuk set data auth dengan objek
  const setAuthData = (authData: { username: string; role: string }) => {
    setUsername(authData.username);
    setRole(authData.role);
    localStorage.setItem('username', authData.username);
    localStorage.setItem('role', authData.role);
  };

  // Fungsi untuk clear data auth
  const clearAuthData = () => {
    setUsername('');
    setRole('');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ username, role, setAuthData, clearAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
