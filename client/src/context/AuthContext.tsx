import React, { createContext, useState, useContext, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        // If not authenticated, clear any user data
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const registeredUser = await response.json();
      setUser(registeredUser);
      return true;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Logout error",
        description: "There was a problem logging you out",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
