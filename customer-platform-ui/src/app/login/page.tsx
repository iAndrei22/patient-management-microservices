"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, AtSign, Building2, Lock, Shield } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function IconInput({
  id,
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input id={id} className={cn("h-10 pl-9", className)} {...props} />
    </div>
  );
}

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showRegisteredMessage = searchParams.get("registered") === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      const token = data.token ?? data.accessToken;

      if (!token) {
        throw new Error("No token returned from server");
      }

      login(token);
    } catch {
      setError("Login failed. Check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
       {/* Brand panel — hidden on small screens */}
       <aside className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white lg:flex">
         <div
           className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,oklch(0.50_0.15_260/0.25),transparent_60%)]"
           aria-hidden
         />
         <div className="relative animate-enter">
           <div className="flex items-center gap-2.5">
             <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/40">
               <Building2 className="size-5" />
             </div>
             <span className="text-lg font-bold tracking-tight">
               Customer Platform
             </span>
           </div>
         </div>
         <div className="relative space-y-6 animate-enter stagger-2">
           <h2 className="max-w-sm text-4xl font-bold leading-tight tracking-tight">
             Enterprise customer management, simplified.
           </h2>
           <p className="max-w-sm text-sm leading-relaxed text-slate-300">
             Secure access to your client records. Built for teams that need
             reliability, clarity, and speed.
           </p>
           <ul className="space-y-3 text-sm text-slate-200">
             <li className="flex items-center gap-2.5">
               <Shield className="size-4 shrink-0 text-accent" />
               Role-based secure authentication
             </li>
             <li className="flex items-center gap-2.5">
               <Building2 className="size-4 shrink-0 text-accent" />
               Full customer lifecycle management
             </li>
           </ul>
         </div>
         <p className="relative text-xs text-slate-400">
           © {new Date().getFullYear()} Customer Platform
         </p>
       </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Customer Platform</span>
        </div>

         <Card className="animate-enter w-full max-w-md border-border/60 bg-card/98 py-6 shadow-xl shadow-primary/10 ring-1 ring-border/40 backdrop-blur-md stagger-1">
           <CardHeader className="space-y-1 px-6 pb-3">
             <CardTitle className="text-2xl font-bold tracking-tight">
               Sign in
             </CardTitle>
             <CardDescription className="text-sm leading-relaxed">
               Enter your credentials to access the platform.
             </CardDescription>
           </CardHeader>
          <CardContent className="px-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <IconInput
                  id="email"
                  icon={AtSign}
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <IconInput
                  id="password"
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p
                  className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}
              {showRegisteredMessage && (
                <p
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
                  role="status"
                >
                  Account created successfully. You can sign in now.
                </p>
              )}
               <Button
                 type="submit"
                 size="lg"
                 className="mt-2 h-10 w-full gap-2 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                 disabled={isSubmitting}
               >
                {isSubmitting ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link className="font-medium text-primary hover:underline" href="/register">
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
