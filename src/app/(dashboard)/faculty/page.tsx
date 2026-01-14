'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle } from 'lucide-react';
  
export default function FacultyDashboard() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    // Faculty name is derived from email, but could be from a profile in a real app
    const facultyName = user?.email?.split('@')[0].replace('.', ' ') || 'faculty-member';

    const facultyAvailabilityRef = useMemoFirebase(() => {
        if (!firestore || !facultyName) return null;
        // Use faculty name as the document ID. This assumes names are unique.
        return doc(firestore, 'availability', 'faculty');
    }, [firestore, facultyName]);
    
    const { data: availabilityData, isLoading: loadingAvailability } = useDoc(facultyAvailabilityRef);
    
    const facultyList = availabilityData?.faculty || [];
    const currentFaculty = facultyList.find((f: any) => f.name === facultyName);
    const isAvailable = currentFaculty?.status === 'YES';

    const handleAvailabilityChange = (checked: boolean) => {
        if (!facultyAvailabilityRef) return;
        const status = checked ? 'YES' : 'NO';

        const updatedFacultyList = facultyList.filter((f: any) => f.name !== facultyName);
        updatedFacultyList.push({
            name: facultyName,
            status: status,
            role: 'Faculty'
        });

        setDocumentNonBlocking(facultyAvailabilityRef, { 
            faculty: updatedFacultyList
        }, { merge: true });

        toast({ title: 'Availability Updated', description: `You are now set to ${status === 'YES' ? 'available' : 'unavailable'}.`});
    };

    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Dashboard</CardTitle>
            <CardDescription>Welcome to the Faculty dashboard.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>My Availability</CardTitle>
                <CardDescription>Let students know if you are available for queries.</CardDescription>
            </CardHeader>
            <CardContent>
                 {loadingAvailability ? <p>Loading status...</p> : (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                            Your Availability Status
                            </p>
                            <p className="text-sm text-muted-foreground">
                            This status is visible to all students.
                            </p>
                        </div>
                        <Switch
                            checked={isAvailable}
                            onCheckedChange={handleAvailabilityChange}
                        />
                    </div>
                 )}
            </CardContent>
            <CardFooter>
                 <div className="flex items-center w-full">
                    {isAvailable ? 
                        <span className="flex items-center text-sm text-green-600"><CheckCircle className="h-4 w-4 mr-2" /> You are currently available.</span> :
                        <span className="flex items-center text-sm text-red-600"><XCircle className="h-4 w-4 mr-2" /> You are currently unavailable.</span>
                    }
                </div>
            </CardFooter>
        </Card>
      </div>
    );
  }

    