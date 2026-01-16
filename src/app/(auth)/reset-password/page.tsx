'use client';

import { Suspense } from 'react';
import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/icons";

function ResetPasswordPageContent() {
    const bgImageUrl = "https://images.shiksha.com/mediadata/images/1587541819phpZp6y2Y.jpeg";

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
                 <div className="w-full max-w-sm rounded-[16px] border border-white/40 bg-white/65 p-8 shadow-lg backdrop-blur-[18px]">
                    <div className="mb-6 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Logo className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold font-headline text-primary">CampusOS</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
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
