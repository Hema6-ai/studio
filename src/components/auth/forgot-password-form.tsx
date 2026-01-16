"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!email.endsWith("@iiits.in")) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter your institutional email ending with @iiits.in",
      });
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      // Don't reveal if user exists. Show success message regardless.
      toast({
        title: "Check your email",
        description: "If an account exists for this email, a password reset link has been sent.",
      });
      setIsSubmitted(true);
    } catch (error: any) {
      // Firebase might throw errors for malformed emails, but for 'user-not-found', it doesn't.
      // We'll still show the generic message for most cases.
      // The primary client-side validation handles the most common error.
      toast({
        title: "Check your email",
        description: "If an account exists for this email, a password reset link has been sent.",
      });
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
        <div className="text-center text-sm text-muted-foreground">
            <p>A password reset link has been sent to your email address if it's associated with an account. Please check your inbox.</p>
        </div>
    )
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
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
