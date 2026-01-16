'use client';

import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
    const signupImage = PlaceHolderImages.find((img) => img.id === "login-hero");

    return (
        <div className="relative w-full min-h-screen">
            {/* Background Image */}
            {signupImage && (
                <Image
                    src={signupImage.imageUrl}
                    alt={signupImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={signupImage.imageHint}
                    priority
                />
            )}
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />

            {/* Centered Signup Form */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                        <Logo className="h-8 w-8 text-primary" />
                        <CardTitle className="text-3xl font-bold font-headline">CampusOS</CardTitle>
                        </div>
                        <CardDescription>
                         Create your account to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SignupForm />
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
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
