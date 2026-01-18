'use client';

import { Suspense } from 'react';
import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/icons";

function ResetPasswordPageContent() {
    const bgImageUrl = "https://images.shiksha.com/mediadata/images/1598428805phpfre1xS.jpeg";

    return (
        <div className="relative w-full min-h-screen">
            {/* Background Image */}
            <Image
                src={bgImageUrl}
                alt="IIIT campus background"
                fill
                className="object-cover"
                priority
                data-ai-hint="university campus aerial view"
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
                            Create a new password for your account.
                        </p>
                    </div>

                    <ResetPasswordForm />
                </div>
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
