'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { XCircle, Library } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const availabilityColors: Record<string, string> = {
    'YES': 'ring-green-500',
    'NO': 'ring-red-500'
}

const getAvailabilityStatus = (status: string) => {
    switch (status) {
        case "YES":
            return { text: "Available", variant: "default", className: "bg-green-600" };
        case "NO":
            return { text: "Unavailable", variant: "destructive" };
        default:
            return { text: "Unavailable", variant: "destructive" };
    }
}

export default function LibrarianAvailabilityPage() {
    const firestore = useFirestore();

    const availabilityQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'availability');
    }, [firestore]);
    
    const { data: allAvailability, isLoading: loadingAvailability } = useCollection(availabilityQuery);

    const librarianAvailability = allAvailability?.find(doc => doc.id.startsWith('librarian-'));

    const status = getAvailabilityStatus(librarianAvailability?.availabilityStatus);
    const availability = librarianAvailability?.availabilityStatus || 'NO';
    const name = "Librarian";
    const role = "Library Staff";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Librarian Availability</CardTitle>
                <CardDescription>Check the real-time availability status of the librarian.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-4">
                    {loadingAvailability ? <li>Loading availability...</li> : librarianAvailability ? (
                         <li className="flex flex-col p-3 rounded-lg bg-muted/50 gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className={cn("h-10 w-10", `ring-2 ring-offset-2 ring-offset-background ${availabilityColors[availability]}`)}>
                                        <AvatarFallback><Library /></AvatarFallback>
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
                            {availability === 'NO' && (
                                <p className="text-xs text-red-500 pl-12 flex items-center gap-1">
                                    <XCircle className="h-3 w-3" /> The librarian is not available — please mail your query.
                                </p>
                            )}
                        </li>
                    ) : (
                        <li>Could not load Librarian availability.</li>
                    )}
                </ul>
            </CardContent>
        </Card>
    )
}

    