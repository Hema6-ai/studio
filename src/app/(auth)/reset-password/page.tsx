'use client';

import { Suspense } from 'react';
import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


function ResetPasswordPageContent() {
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
                            Create a new password for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResetPasswordForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordPageContent />
        </Suspense>
    );
}
