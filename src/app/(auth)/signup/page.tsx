'use client';

import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
    const bgImageUrl = "https://images.shiksha.com/mediadata/images/1587541819phpZp6y2Y.jpeg";
    const logoUrl = "https://www.iiits.ac.in/wp-content/uploads/2020/03/IIITS-Logo-Dark.png";

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
            
            {/* Centered Signup Form */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/65 p-8 shadow-2xl backdrop-blur-lg animate-in fade-in-50 duration-500">
                    <div className="mb-6 text-center">
                        <div className="flex justify-center mb-4">
                          <Image src={logoUrl} alt="IIIT Sricity Logo" width={80} height={80} />
                        </div>
                        <h1 className="text-3xl font-bold font-headline text-primary">CampusOS</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                         Create your account to get started
                        </p>
                    </div>

                    <SignupForm />
                    
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
