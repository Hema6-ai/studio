"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRoleFromEmail } from "@/lib/roles";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "An internal error occurred. Please try again later.",
        });
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const potentialRole = getRoleFromEmail(user.email || "");

      let finalRole = potentialRole;

      if (potentialRole === 'student') {
        const studentsRef = collection(firestore, 'students');
        const q = query(studentsRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          finalRole = null; // Block access if no student record found
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Your student profile is not created yet. Please contact the Academic Office.",
          });
        }
      }

      if (finalRole) {
        toast({
          title: "Login Successful",
          description: `Redirecting to ${finalRole} dashboard...`,
        });
        router.push(`/${finalRole}`);
      } else if (potentialRole !== 'student') {
        // This case handles if getRoleFromEmail returns null but it wasn't a student check failure
         throw new Error("This email is not associated with a valid role.");
      }
    } catch (error: any) {
        // Avoid showing a generic error if a specific student access error was already shown
        if (getRoleFromEmail(email) !== 'student' || error.code) {
             toast({
              variant: "destructive",
              title: "Login Failed",
              description: error.message || "An unknown error occurred.",
            });
        }
    } finally {
        setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
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
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="#"
            className="ml-auto inline-block text-sm underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
