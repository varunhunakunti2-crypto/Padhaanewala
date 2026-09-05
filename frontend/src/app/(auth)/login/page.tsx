"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      toast.success("Signed in successfully");
      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast.error("Sign in failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center bg-canvas px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-geist-sans text-[32px] font-semibold leading-[36px] tracking-[-1.28px] text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-[14px] text-body">
            Sign in to your Padhaanewala account
          </p>
        </div>

        <div className="hairline-border rounded-md bg-canvas-elevated p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-link hover:text-link-deep"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </div>

            {error ? (
              <p className="rounded-sm bg-warning-soft px-3 py-2 text-[13px] text-warning-deep" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4" aria-hidden />
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[14px] text-body">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-link hover:text-link-deep">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
