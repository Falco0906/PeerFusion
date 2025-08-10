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
    console.log("AuthContext useEffect triggered");
    const token = localStorage.getItem("token");
    console.log("Token found:", !!token);
    
    if (token) {
      // Fetch user data if token exists
      console.log("Fetching user data from /api/auth/me");
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          console.log("Auth response status:", res.status);
          if (!res.ok) throw new Error("Unauthorized");
          const data = await res.json();
          console.log("User data received:", data);
          setUser(data);
        })
        .catch((error) => {
          console.error("Auth error:", error);
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => {
          console.log("Setting loading to false");
          setLoading(false);
        });
    } else {
      console.log("No token found, setting loading to false");
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
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
