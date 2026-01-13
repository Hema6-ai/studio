'use client';

import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function SignupPage() {
    const signupImage = PlaceHolderImages.find((img) => img.id === "login-hero");

    return (
        <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Logo className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold font-headline">CampusOS</h1>
                        </div>
                        <p className="text-balance text-muted-foreground">
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
            <div className="hidden bg-muted lg:block">
                {signupImage && (
                    <Image
                        src={signupImage.imageUrl}
                        alt={signupImage.description}
                        width="800"
                        height="1200"
                        className="h-full w-full object-cover dark:brightness-[0.4]"
                        data-ai-hint={signupImage.imageHint}
                    />
                )}
            </div>
        </div>
    );
}
