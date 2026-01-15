'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function RescheduleLogPage() {
    const firestore = useFirestore();
    const rescheduleLogQuery = useMemoFirebase(() => firestore ? collection(firestore, 'rescheduleLog') : null, [firestore]);
    const { data: rescheduleLog, isLoading: loadingRescheduleLog } = useCollection(rescheduleLogQuery);

    return (
        <Card>
           <CardHeader>
               <CardTitle>Class Reschedule Log</CardTitle>
               <CardDescription>An audit trail of all rescheduled classes.</CardDescription>
           </CardHeader>
           <CardContent>
               <Table>
                   <TableHeader>
                       <TableRow>
                           <TableHead>Faculty</TableHead>
                           <TableHead>Subject</TableHead>
                           <TableHead>Original Slot</TableHead>
                           <TableHead>New Slot</TableHead>
                           <TableHead>Timestamp</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {loadingRescheduleLog && <TableRow><TableCell colSpan={5} className="text-center">Loading log...</TableCell></TableRow>}
                       {!loadingRescheduleLog && rescheduleLog?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No classes have been rescheduled yet.</TableCell></TableRow>}
                       {rescheduleLog?.map((log: any) => (
                           <TableRow key={log.id}>
                               <TableCell>{log.facultyName}</TableCell>
                               <TableCell>{log.subject}</TableCell>
                               <TableCell>{log.originalSlot}</TableCell>
                               <TableCell>{log.newSlot}</TableCell>
                               <TableCell>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</TableCell>
                           </TableRow>
                       ))}
                   </TableBody>
               </Table>
           </CardContent>
        </Card>
    );
}
