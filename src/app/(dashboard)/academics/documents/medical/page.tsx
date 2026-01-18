'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MedicalDocumentsReviewPage() {
    const firestore = useFirestore();

    const requestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'medicalRequests'), orderBy('dateRequested', 'desc'));
    }, [firestore]);

    const { data: requests, isLoading } = useCollection(requestsQuery);

    const getStatusInfo = (req: any) => {
        if (req.directorApprovalStatus === 'Rejected' || req.doctorVerificationStatus === 'Rejected') {
            return { text: `Rejected by ${req.directorApprovalStatus ? 'Director' : 'Doctor'}`, variant: 'destructive' };
        }
        if (req.directorApprovalStatus === 'Approved') {
            return { text: 'Approved', variant: 'default', className: 'bg-green-600' };
        }
        if (req.doctorVerificationStatus === 'Approved') {
            return { text: 'Pending Director Approval', variant: 'secondary', className: 'bg-blue-500 text-white' };
        }
        return { text: 'Pending Doctor Verification', variant: 'secondary' };
    };

    return (
        <Card>
           <CardHeader>
               <CardTitle>Medical Document Submissions</CardTitle>
               <CardDescription>Review all medical leave requests submitted by students.</CardDescription>
           </CardHeader>
           <CardContent>
               <Table>
                   <TableHeader>
                       <TableRow>
                           <TableHead>Student Name</TableHead>
                           <TableHead>UG Number</TableHead>
                           <TableHead>Submitted On</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Actions</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading requests...</TableCell></TableRow>}
                       {!isLoading && requests?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No medical requests have been submitted yet.</TableCell></TableRow>}
                       {requests?.map((req: any) => {
                           const status = getStatusInfo(req);
                           return (
                               <TableRow key={req.id}>
                                   <TableCell>{req.studentName}</TableCell>
                                   <TableCell>{req.ugNumber}</TableCell>
                                   <TableCell>{format(new Date(req.dateRequested), 'PPp')}</TableCell>
                                   <TableCell>
                                       <Badge variant={status.variant as any} className={status.className}>{status.text}</Badge>
                                   </TableCell>
                                   <TableCell>
                                        {req.medicalDocuments && req.medicalDocuments[0] && (
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={req.medicalDocuments[0]} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="mr-2 h-4 w-4" /> View Document
                                                </Link>
                                            </Button>
                                        )}
                                   </TableCell>
                               </TableRow>
                           );
                       })}
                   </TableBody>
               </Table>
           </CardContent>
        </Card>
    );
}
