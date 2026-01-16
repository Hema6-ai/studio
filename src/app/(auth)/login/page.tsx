'use client';

import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find((img) => img.id === "login-hero");

  return (
    <div className="relative w-full min-h-screen">
        {/* Background Image */}
        {loginImage && (
            <Image
                src={loginImage.imageUrl}
                alt={loginImage.description}
                fill
                className="object-cover"
                data-ai-hint={loginImage.imageHint}
                priority
            />
        )}
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />

        {/* Centered Login Form */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Logo className="h-8 w-8 text-primary" />
                      <CardTitle className="text-3xl font-bold font-headline">CampusOS</CardTitle>
                    </div>
                    <CardDescription>
                      Enter your institutional email to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="underline">
                          Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
