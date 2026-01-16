'use client';

import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Logo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const bgImage = PlaceHolderImages.find((img) => img.id === "login-hero");

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Image */}
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover"
          data-ai-hint={bgImage.imageHint}
          priority
        />
      )}
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />

      {/* Centered Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Logo className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold font-headline">CampusOS</CardTitle>
            </div>
            <CardDescription>
              Enter your email to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
            <div className="mt-4 text-center text-sm">
              Remembered your password?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
