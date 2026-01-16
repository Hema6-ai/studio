'use client';

import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/icons";

export default function LoginPage() {
  const bgImageUrl = "https://www.iiits.ac.in/wp-content/uploads/2023/07/IMG_2278-scaled.jpg";

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Image */}
      <Image
        src={bgImageUrl}
        alt="IIIT Sri City campus background"
        fill
        className="object-cover"
        priority
      />

      {/* Centered Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-[16px] border border-white/40 bg-white/65 p-8 shadow-lg backdrop-blur-[18px]">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Logo className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline text-primary">CampusOS</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your institutional email to access your dashboard
            </p>
          </div>
          
          <LoginForm />

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
