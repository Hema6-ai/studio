'use client';

import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Logo } from "@/components/icons";

export default function ForgotPasswordPage() {
  const bgImageUrl = "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Image */}
      <Image
        src={bgImageUrl}
        alt="IIIT campus background"
        fill
        className="object-cover"
        priority
      />

      {/* Centered Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/65 p-8 shadow-2xl backdrop-blur-lg animate-in fade-in-50 duration-500">
            <div className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                    <Logo className="h-16 w-16 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-headline text-primary">CampusOS</h1>
                <p className="text-sm text-muted-foreground mt-2">
                Enter your email to reset your password
                </p>
            </div>
            
            <ForgotPasswordForm />
            
            <div className="mt-4 text-center text-sm">
              Remembered your password?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
