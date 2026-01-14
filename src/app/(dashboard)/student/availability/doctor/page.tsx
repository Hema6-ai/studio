'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { XCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const availabilityColors: Record<string, string> = {
      available: 'ring-green-500',
      'not-available': 'ring-red-500',
      'nurse-available': 'ring-orange-500',
      'on-leave': 'ring-yellow-500',
}

const getAvailabilityStatus = (s: any) => {
    const status = s?.availabilityStatus;
    switch (status) {
        case "available":
            return { text: "Available", variant: "default", className: "bg-green-600" };
        case "not-available":
            return { text: "Unavailable", variant: "destructive" };
        case "nurse-available":
             return { text: "Nurse Available", variant: "secondary", className: "bg-orange-500" };
        case "on-leave":
            return { text: "On Leave", variant: "secondary", className: "bg-yellow-500 text-black" };
        default:
            return { text: "Unavailable", variant: "destructive" };
    }
}

export default function DoctorAvailabilityPage() {
    const firestore = useFirestore();
    const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar-1');

    const doctorAvailabilityQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'doctorAvailability');
    }, [firestore]);
    const { data: doctorAvailability, isLoading: loadingDoctors } = useCollection(doctorAvailabilityQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Doctor Availability</CardTitle>
                <CardDescription>Check the real-time availability status of doctors on campus.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {loadingDoctors && <li>Loading availability...</li>}
                    {doctorAvailability?.map(staff => {
                        const status = getAvailabilityStatus(staff);
                        const availability = staff?.availabilityStatus || 'not-available';
                        const name = staff.doctorName || "Doctor";
                        const role = "Doctor";
                        return (
                            <li key={staff.id || name} className="flex flex-col p-3 rounded-lg bg-muted/50 gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className={cn("h-10 w-10", `ring-2 ring-offset-2 ring-offset-background ${availabilityColors[availability]}`)}>
                                            {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt="User avatar" data-ai-hint={avatarImage.imageHint} />}
                                            <AvatarFallback>{name?.charAt(0).toUpperCase() || 'D'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium capitalize">{name}</p>
                                            <p className="text-xs text-muted-foreground">{role}</p>
                                        </div>
                                    </div>
                                    <Badge variant={status.variant} className={cn('text-xs', status.className)}>
                                        {status.text}
                                    </Badge>
                                </div>
                                {(availability === 'not-available') && (
                                    <p className="text-xs text-red-500 pl-12 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" /> Not available — please mail your query.
                                    </p>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </CardContent>
        </Card>
    )
}
