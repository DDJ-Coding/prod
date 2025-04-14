import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [_, setLocation] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        // Redirect based on user role
        const user = form.getValues();
        if (user.username === "sarahmiller" || user.username === "michaelchen") {
          setLocation("/instructor/dashboard");
        } else {
          setLocation("/student/dashboard");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 22h14a2 2 0 002-2V9a1 1 0 00-1-1h-3v-.777c0-2.896-1.2-5.545-3.134-7.447a1 1 0 00-1.732 0C10.2 2.678 9 5.327 9 8.223V8H6a1 1 0 00-1 1v11a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to FlightTrack</CardTitle>
          <p className="text-sm text-gray-500">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        autoComplete="username"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        autoComplete="current-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm mt-4">
            <p className="text-gray-500">
              Demo Accounts:
            </p>
            <div className="flex flex-col space-y-1 mt-2">
              <div className="text-xs text-left p-2 bg-gray-50 rounded">
                <p><strong>Student:</strong> username: alexjohnson / password: password123</p>
              </div>
              <div className="text-xs text-left p-2 bg-gray-50 rounded">
                <p><strong>Instructor:</strong> username: sarahmiller / password: password123</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Separator className="my-2" />
          <p className="text-sm text-center text-gray-500 mt-2">
            Don't have an account?{" "}
            <Link href="/register">
              <a className="text-primary hover:underline">Sign up</a>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
