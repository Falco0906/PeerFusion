"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  institution?: string;
  field_of_study?: string;
  avatar?: string;
  joined_date?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔐 Checking for existing token:", !!token);
        
        if (token) {
          console.log("📡 Fetching user data...");
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/auth/me`;
          
          const response = await fetch(apiUrl, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          console.log("🌐 Auth response status:", response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const userData = await response.json();
          console.log("✅ User data received:", userData);
          setUser(userData);
        } else {
          console.log("❌ No token found");
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
        console.log("🏁 Auth initialization complete");
      }
    };

    initAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      console.log("🔑 Logging in user:", userData.email);
      localStorage.setItem("token", token);
      setUser(userData);
      console.log("✅ Login successful");
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  const logout = () => {
    console.log("🚪 Logging out user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      console.log("📝 Updating user data:", userData);
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}