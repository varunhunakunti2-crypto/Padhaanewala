"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const mobile = String(form.get("mobile") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (!name || !email || !password) {
      setError("Please fill in your name, email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name,
        email,
        password,
        mobile: mobile || undefined,
      });
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      toast.success("Account created successfully");
      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast.error("Sign up failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center bg-canvas px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-geist-sans text-[32px] font-semibold leading-[36px] tracking-[-1.28px] text-ink">
            Create your account
          </h1>
          <p className="mt-2 text-[14px] text-body">
            Join Padhaanewala to find the right college for your future
          </p>
        </div>

        <div className="hairline-border rounded-md bg-canvas-elevated p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile number (optional)</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Re-enter your password"
              />
            </div>

            {error ? (
              <p className="rounded-sm bg-warning-soft px-3 py-2 text-[13px] text-warning-deep" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              <UserPlus className="h-4 w-4" aria-hidden />
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[14px] text-body">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-link hover:text-link-deep">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
