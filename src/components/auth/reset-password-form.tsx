"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { confirmPasswordReset } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oobCode = searchParams.get('oobCode');

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    return hasUpperCase && hasLowerCase && hasNumber && isLongEnough;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!oobCode) {
      setError("Invalid or missing reset code. Please request a new link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      toast({
        title: "Password Updated Successfully",
        description: "You can now log in with your new password.",
      });
      setIsSuccess(true);
      
      router.push('/login');

    } catch (error: any) {
      switch (error.code) {
        case 'auth/expired-action-code':
          setError("This password reset link has expired. Please request a new one.");
          break;
        case 'auth/invalid-action-code':
          setError("This password reset link is invalid. It may have already been used.");
          break;
        case 'auth/weak-password':
          setError("The new password is too weak. Please choose a stronger one.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
      return (
         <div className="text-center text-sm text-destructive-foreground bg-destructive p-3 rounded-md">
            <p>This password reset link is invalid or has expired. Please request a new one from the 'Forgot Password' page.</p>
        </div>
      )
  }
  
  if (isSuccess && !error) {
    return (
        <div className="text-center text-sm text-muted-foreground">
            <p>Your password has been updated. Redirecting you to the login page...</p>
        </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
        {error && (
             <div className="text-center text-sm text-destructive-foreground bg-destructive p-3 rounded-md">
                <p>{error}</p>
            </div>
        )}
      <div className="grid gap-2">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm New Password</Label>
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
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
