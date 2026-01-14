"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useRouter, usePathname } from "next/navigation"
import { getRoleFromEmail, UserRole } from "@/lib/roles"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const availabilityColors: Record<string, string> = {
    available: 'ring-green-500',
    'not-available': 'ring-red-500',
    'nurse-available': 'ring-orange-500',
    'on-leave': 'ring-yellow-500',
}

export function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const role = pathname.split('/')[1] as UserRole;

  const [availability, setAvailability] = useState('available'); // Mock state

  const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar-1');

  // This is a mock. In a real app, you'd get the email from the user's session.
  const userEmail = "hema.p23@iiits.in";
  const userRole = getRoleFromEmail(userEmail);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className={cn("h-9 w-9", role === 'doctor' && `ring-2 ring-offset-2 ring-offset-background ${availabilityColors[availability]}`)}>
            {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt="User avatar" data-ai-hint={avatarImage.imageHint} />}
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Hema</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/login')}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
