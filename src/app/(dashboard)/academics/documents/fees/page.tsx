'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Eye } from "lucide-react";

export default function FeeReceiptsReviewPage() {
    const firestore = useFirestore();

    const receiptsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'fee_receipts'), orderBy('submittedAt', 'desc'));
    }, [firestore]);

    const { data: receipts, isLoading } = useCollection(receiptsQuery);

    return (
        <Card>
           <CardHeader>
               <CardTitle>Fee Receipt Submissions</CardTitle>
               <CardDescription>Review all fee receipts submitted by students.</CardDescription>
           </CardHeader>
           <CardContent>
               <Table>
                   <TableHeader>
                       <TableRow>
                           <TableHead>Student Name</TableHead>
                           <TableHead>Roll Number</TableHead>
                           <TableHead>Programme</TableHead>
                           <TableHead>Semester</TableHead>
                           <TableHead>Amount Paid</TableHead>
                           <TableHead>Submitted On</TableHead>
                           <TableHead>Actions</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {isLoading && <TableRow><TableCell colSpan={7} className="text-center">Loading receipts...</TableCell></TableRow>}
                       {!isLoading && receipts?.length === 0 && <TableRow><TableCell colSpan={7} className="text-center">No fee receipts have been submitted yet.</TableCell></TableRow>}
                       {receipts?.map((receipt: any) => (
                           <TableRow key={receipt.id}>
                               <TableCell>{receipt.fullName}</TableCell>
                               <TableCell>{receipt.rollNumber}</TableCell>
                               <TableCell>{receipt.programme}</TableCell>
                               <TableCell>{receipt.semester}</TableCell>
                               <TableCell>₹{receipt.amountPaid.toLocaleString('en-IN')}</TableCell>
                               <TableCell>{receipt.submittedAt ? format(receipt.submittedAt.toDate(), 'PPp') : 'N/A'}</TableCell>
                               <TableCell>
                                   <Button asChild variant="outline" size="sm">
                                       <Link href={receipt.receiptPdfUrl} target="_blank" rel="noopener noreferrer">
                                            <Eye className="mr-2 h-4 w-4" /> View Receipt
                                       </Link>
                                   </Button>
                               </TableCell>
                           </TableRow>
                       ))}
                   </TableBody>
               </Table>
           </CardContent>
        </Card>
    );
}
