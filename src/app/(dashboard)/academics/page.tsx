'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { dummyFaculty } from "@/lib/data";


// --- Main Dashboard Component ---
export default function AcademicsDashboard() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const academicAvailabilityRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'availability', 'academic');
  }, [firestore]);

  const { data: academicAvailability, isLoading: loadingAcademicAvailability } = useDoc(academicAvailabilityRef);
  const isAvailable = academicAvailability?.status === 'YES';

  const handleAvailabilityChange = (checked: boolean) => {
    if (!academicAvailabilityRef) return;
    setDocumentNonBlocking(academicAvailabilityRef, { status: checked ? 'YES' : 'NO' }, { merge: true });
    toast({ title: 'Availability Updated', description: `Academic office is now ${checked ? 'available' : 'unavailable'}.`});
  };

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'students');
  }, [firestore]);
  const { data: students, isLoading: loadingStudents } = useCollection(studentsQuery);

  const facultyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'faculty');
  }, [firestore]);
  const { data: facultyFromFirestore, isLoading: loadingFaculty } = useCollection(facultyQuery);

  const faculty = useMemo(() => {
    const facultyMap = new Map();
    // Add dummy faculty first, using email as a key to avoid duplicates
    dummyFaculty.forEach(f => facultyMap.set(f.email.toLowerCase(), f));
    // Overwrite or add faculty from Firestore
    facultyFromFirestore?.forEach((f: any) => facultyMap.set(f.email.toLowerCase(), f));
    return Array.from(facultyMap.values());
  }, [facultyFromFirestore]);

  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Get all requests not yet finalized by director, which the academic office would need to track.
    return query(collection(firestore, 'medicalRequests'), where('directorApprovalStatus', '==', null));
  }, [firestore]);
  const { data: pendingRequests, isLoading: loadingPendingRequests } = useCollection(pendingRequestsQuery);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Welcome to the Academic Office</CardTitle>
                <CardDescription>Select a feature from the sidebar to manage students, faculty, timetables, or view records.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p>Total Students: {loadingStudents ? '...' : students?.length ?? 0}</p>
                            <p>Total Faculty: {loadingFaculty ? '...' : faculty.length}</p>
                            <p>Pending Approvals: {loadingPendingRequests ? '...' : pendingRequests?.length ?? 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">No recent activity.</p>
                        </CardContent>
                    </Card>
            </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Office Availability</CardTitle>
                <CardDescription>Set the global availability for the Academic Office.</CardDescription>
            </CardHeader>
            <CardContent>
               {loadingAcademicAvailability ? <p>Loading status...</p> : (
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                        Academic Office Availability
                        </p>
                        <p className="text-sm text-muted-foreground">
                        This status is visible to all students.
                        </p>
                    </div>
                    <Switch
                        checked={isAvailable}
                        onCheckedChange={handleAvailabilityChange}
                        aria-readonly
                    />
                </div>
               )}
            </CardContent>
            <CardFooter>
               <div className="flex items-center w-full">
                   {isAvailable ? 
                        <span className="flex items-center text-sm text-green-600"><CheckCircle className="h-4 w-4 mr-2" /> Office is currently available.</span> :
                        <span className="flex items-center text-sm text-red-600"><XCircle className="h-4 w-4 mr-2" /> Office is currently unavailable.</span>
                    }
               </div>
            </CardFooter>
        </Card>
    </div>
  );
}
