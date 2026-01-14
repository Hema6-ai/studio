"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export function SignupForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: "Passwords do not match.",
      });
      return;
    }
    setIsLoading(true);

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        setIsLoading(false);
        setIsSuccess(true);
        toast({
            title: "Account Created Successfully",
            description: "You can now sign in with your new account.",
        });

    } catch (error: any) {
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Sign up Failed",
            description: error.message || "An unknown error occurred.",
        });
    }
  };

  if (!mounted) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Your account has been created.</p>
        <Link href="/login">
          <Button className="w-full">Go back to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@iiits.in"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
