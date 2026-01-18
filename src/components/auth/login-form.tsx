"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRoleFromEmail, UserRole } from "@/lib/roles";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { collection, doc, getDoc, setDoc, serverTimestamp, DocumentData } from "firebase/firestore";

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

  const handleSuccessfulLogin = (role: UserRole, isNew: boolean = false) => {
    if (isNew) {
      toast({
        title: "Profile Created",
        description: "Your user profile has been set up. Welcome!",
      });
    }
    toast({
      title: "Login Successful",
      description: `Redirecting to ${role} dashboard...`,
    });
    router.push(`/${role}`);
  };

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
      
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role as UserRole;
        if (role) {
          handleSuccessfulLogin(role);
        } else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Your account does not have a role assigned. Please contact administration.",
          });
        }
      } else {
        // User profile doesn't exist, so create it now.
        const derivedRole = getRoleFromEmail(user.email || "");
        if (derivedRole) {
          const newUserProfile = {
            id: user.uid,
            email: user.email,
            role: derivedRole,
            createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserProfile);
          handleSuccessfulLogin(derivedRole, true);
        } else {
           toast({
              variant: "destructive",
              title: "Login Failed",
              description: "Could not determine a role for your account. Please contact administration.",
          });
        }
      }
    } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.code === 'auth/invalid-credential' 
            ? "Invalid email or password."
            : error.message || "An unknown error occurred.",
        });
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
            href="/forgot-password"
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
