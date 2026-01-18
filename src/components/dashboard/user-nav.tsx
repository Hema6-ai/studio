"use client"

import React, { useState } from "react"
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
import { useDoc, useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase"
import { doc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ProfileImageEditor } from "@/components/profile/ProfileImageEditor"

const availabilityColors: Record<string, string> = {
    available: 'ring-green-500',
    'not-available': 'ring-red-500',
    'nurse-available': 'ring-orange-500',
    'on-leave': 'ring-yellow-500',
}

export function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const role = pathname.split('/')[1] as UserRole;
  const userEmail = user?.email || "";
  const userRole = getRoleFromEmail(userEmail);

  // --- Data Fetching ---
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc(userProfileRef);

  const doctorAvailabilityRef = useMemoFirebase(() => {
    if (!firestore || !user || role !== 'doctor') return null;
    return doc(firestore, `doctorAvailability`, user.uid);
  }, [firestore, user, role]);

  const { data: availabilityData } = useDoc(doctorAvailabilityRef);
  const availability = availabilityData?.availabilityStatus || 'not-available';

  const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar-1');
  
  // --- Handlers ---
  const handleSaveProfileImage = async (imageBlob: Blob) => {
    if (!user || !userRole) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to do that.' });
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${userRole}/${user.uid}.jpg`);
      
      const snapshot = await uploadBytes(storageRef, imageBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (userProfileRef) {
        await updateDocumentNonBlocking(userProfileRef, { profilePhotoURL: downloadURL });
      }

      toast({ title: 'Success', description: 'Your profile picture has been updated.' });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not update your profile picture.' });
    }
  };

  const profilePhotoUrl = userProfile?.profilePhotoURL || avatarImage?.imageUrl;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className={cn("h-9 w-9", role === 'doctor' && `ring-2 ring-offset-2 ring-offset-background ${availabilityColors[availability]}`)}>
              {profilePhotoUrl && <AvatarImage src={profilePhotoUrl} alt="User avatar" />}
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.displayName || user?.email}</p>
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
             <DropdownMenuItem onSelect={() => setIsEditorOpen(true)}>
              Update Profile Picture
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

      <ProfileImageEditor
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onSave={handleSaveProfileImage}
      />
    </>
  )
}
