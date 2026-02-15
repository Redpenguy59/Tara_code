import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of our User to fix Issue #1 (Citizenship)
interface Citizenship {
  country: string;
  status: string;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  citizenship: Citizenship[];
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // Fixed: was 'bool'
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on boot to see if user was already logged in
    const savedUser = localStorage.getItem('tara_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem('tara_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('tara_user', JSON.stringify(userData));
    // Set a flag for the vault/pin lock logic
    localStorage.setItem('tara_logged_in', 'true');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tara_user');
    localStorage.removeItem('tara_logged_in');
  };

  // Useful for updating citizenship or profile info later
  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('tara_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};