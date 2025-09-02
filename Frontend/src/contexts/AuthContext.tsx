/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, userType: string) => Promise<User | null>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string, userType: string) => Promise<User | null>;
  googleLogin: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Fallback to local URL if not set
  
  useEffect(() => {
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem('droneflux-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('droneflux-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType }), // send userType
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('droneflux-user', JSON.stringify(data.user));
        localStorage.setItem('droneflux-token', data.token);
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.name}!`,
        });
        return data.user;
      } else {
        toast({
          title: "Login failed",
          description: data.error || "Invalid email or password",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, userType: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, userType }), // send userType
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('droneflux-user', JSON.stringify(data.user));
        toast({
          title: "Signup successful",
          description: `Welcome, ${data.user.name}!`,
        });
        return data.user;
      } else {
        toast({
          title: "Signup failed",
          description: data.error || "Could not register user",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch (error) {
      // Ignore error, just clear local state
    }
    setUser(null);
    localStorage.removeItem('droneflux-user');
    localStorage.removeItem('droneflux-token');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const googleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup, googleLogin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
