"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AtSign, Building2, Lock } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 409) {
        setError("An account with this email already exists.");
        return;
      }

      if (!response.ok) {
        setError("Registration failed. Please try again.");
        return;
      }

      router.replace("/login?registered=true");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-zinc-900 p-10 text-white lg:flex">
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30">
              <Building2 className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Customer Platform</span>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
            Create your account.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
            Register with your work email, then sign in and start managing customers.
          </p>
        </div>
        <p className="text-xs text-zinc-500">© {new Date().getFullYear()} Customer Platform</p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Customer Platform</span>
        </div>

        <Card className="w-full max-w-md border-border/80 bg-card/95 py-6 shadow-lg shadow-zinc-900/5 ring-1 ring-border/60 backdrop-blur-sm">
          <CardHeader className="space-y-1 px-6 pb-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">Create account</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Use your email and a secure password.
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
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm password
                </Label>
                <IconInput
                  id="confirmPassword"
                  icon={Lock}
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              <Button
                type="submit"
                size="lg"
                className="mt-1 h-10 w-full gap-2 text-sm font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Creating account..."
                ) : (
                  <>
                    Create account
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link className="font-medium text-primary hover:underline" href="/login">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

