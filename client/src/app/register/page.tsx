"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (): string | null => {
    if (!form.first_name.trim()) return "First name is required";
    if (!form.last_name.trim()) return "Last name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address";
    if (!form.password) return "Password is required";
    if (form.password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051';
      console.log('Registering with API:', apiUrl);
      console.log('Form data:', form);
      
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // If registration is successful and includes a token, log the user in
      if (data.token && data.user) {
        console.log('Registration successful, logging in...');
        login(data.token, data.user);
        router.push("/dashboard");
      } else {
        // If no token, redirect to login
        console.log('No token received, redirecting to login');
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(`An error occurred during registration: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 -z-10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg hover-glow">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-foreground">
            Create your account
          </h2>
          <p className="text-base text-muted-foreground">
            Or{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="glass-strong py-10 px-6 sm:px-10 shadow-2xl rounded-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-2">
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={form.first_name}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="John"
                  minLength={2}
                  maxLength={50}
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-foreground mb-2">
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={form.last_name}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Doe"
                  minLength={2}
                  maxLength={50}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="john.doe@example.com"
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                className="input w-full"
                placeholder="Min. 8 characters"
                minLength={8}
                title="Password must be at least 8 characters with uppercase, lowercase, and numbers"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center py-3 text-base font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}