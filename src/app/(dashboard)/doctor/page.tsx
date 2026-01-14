'use client';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Folder, UserCheck, Check, X } from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export default function DoctorDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [availability, setAvailability] = useState('available');

  const availabilityRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `doctorAvailability/${user.uid}`);
  }, [firestore, user]);
  
  const { data: availabilityData } = useDoc(availabilityRef);
  
  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'medicalRequests'), where('doctorVerificationStatus', '==', null));
  }, [firestore]);

  const processedRequestsQuery = useMemoFirebase(() => {
     if (!firestore || !user) return null;
     // This is a simplified query. A real app might need a dedicated `doctorId` field on the request.
     return query(collection(firestore, 'medicalRequests'), where('doctorVerificationStatus', '!=', null));
  }, [firestore, user]);

  const { data: pendingRequests, isLoading: loadingPending } = useCollection(pendingRequestsQuery);
  const { data: processedRequests, isLoading: loadingProcessed } = useCollection(processedRequestsQuery);

  const handleAvailabilityUpdate = () => {
    if (!availabilityRef) return;
    setDocumentNonBlocking(availabilityRef, { 
      availabilityStatus: availability,
      doctorId: user?.uid 
    }, { merge: true });
  };
  
  const handleApprove = (id: string) => {
    if (!firestore) return;
    const requestRef = doc(firestore, 'medicalRequests', id);
    updateDocumentNonBlocking(requestRef, { doctorVerificationStatus: 'Approved' });
  };
  
  const handleReject = (id: string, reason: string) => {
     if (!firestore) return;
    const requestRef = doc(firestore, 'medicalRequests', id);
    // In a real app, you'd likely open a dialog to get the reason
    updateDocumentNonBlocking(requestRef, { 
        doctorVerificationStatus: 'Rejected',
        rejectionReason: 'Invalid document'
    });
  };

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Doctor Dashboard</CardTitle>
                <CardDescription>Manage your availability and review medical requests.</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
            <Card id="availability">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck/> My Availability
                    </CardTitle>
                    <CardDescription>Let students and staff know your current status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup defaultValue={availabilityData?.availabilityStatus || "available"} onValueChange={setAvailability} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="available" id="r1" />
                            <Label htmlFor="r1">Available</Label>
                            <div className="h-3 w-3 rounded-full bg-green-500 ml-auto" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not-available" id="r2" />
                            <Label htmlFor="r2">Not Available</Label>
                             <div className="h-3 w-3 rounded-full bg-red-500 ml-auto" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nurse-available" id="r3" />
                            <Label htmlFor="r3">Doctor unavailable, Nurse available</Label>
                             <div className="h-3 w-3 rounded-full bg-orange-500 ml-auto" />
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="on-leave" id="r4" />
                            <Label htmlFor="r4">Doctor on leave, Nurse available</Label>
                             <div className="h-3 w-3 rounded-full bg-yellow-500 ml-auto" />
                        </div>
                    </RadioGroup>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleAvailabilityUpdate}>Update Status</Button>
                </CardFooter>
            </Card>

            <Card id="history">
                <CardHeader>
                    <CardTitle>Approval History</CardTitle>
                    <CardDescription>Your recently processed requests.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Request ID</TableHead>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingProcessed && <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>}
                            {processedRequests?.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.id.slice(0, 8)}</TableCell>
                                    <TableCell>{req.studentId}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.doctorVerificationStatus === 'Approved' ? 'default' : 'destructive'} className={req.doctorVerificationStatus === 'Approved' ? "bg-green-600" : ""}>
                                            {req.doctorVerificationStatus}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>{new Date(req.dateRequested).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <Card id="requests">
            <CardHeader>
                <CardTitle>Pending Medical Requests</CardTitle>
                <CardDescription>You have {loadingPending ? '...' : pendingRequests?.length ?? 0} requests to review.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                {loadingPending && <p>Loading requests...</p>}
                {pendingRequests?.map(request => (
                    <Card key={request.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">Student ID: {request.studentId}</CardTitle>
                            <CardDescription>UG Number: {request.ugNumber} | Age: {request.age}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">Requested on: {new Date(request.dateRequested).toLocaleString()}</p>
                            <Button variant="outline" className="w-full">
                                <Folder className="mr-2 h-4 w-4"/> View Medical Documents
                            </Button>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                             <Button variant="destructive" onClick={() => handleReject(request.id, "Invalid Document")}><X className="mr-2 h-4 w-4"/> Reject</Button>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(request.id)}><Check className="mr-2 h-4 w-4"/> Approve</Button>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
