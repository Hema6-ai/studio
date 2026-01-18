'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ComplaintDetailsDialog = ({ complaint }: { complaint: any }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState(complaint.status);
    const [internalNotes, setInternalNotes] = useState(complaint.internalNotes || '');

    const handleUpdate = () => {
        if (!firestore) return;
        const complaintRef = doc(firestore, 'hostelComplaints', complaint.id);
        updateDocumentNonBlocking(complaintRef, { status, internalNotes });
        toast({ title: "Complaint Updated", description: `Status set to ${status}.` });
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm">View</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Complaint ID: {complaint.id.substring(0,8)}...</DialogTitle>
                    <DialogDescription>
                        Hostel: {complaint.hostelName} | Category: {complaint.category}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div>
                        <h4 className="font-semibold">Description</h4>
                        <p className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">{complaint.description}</p>
                    </div>
                    {complaint.attachments?.length > 0 && (
                        <div>
                            <h4 className="font-semibold">Attachments</h4>
                            <ul className="text-sm list-disc pl-5">
                                {complaint.attachments.map((url: string, i: number) => (
                                    <li key={i}><a href={url} target="_blank" rel="noopener noreferrer" className="underline text-primary">Attachment {i + 1}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                         <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Set status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="In Review">In Review</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="internalNotes">Internal Notes</Label>
                            <Textarea id="internalNotes" value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Add notes visible only to SLC..." />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdate}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function SlcDashboard() {
    const firestore = useFirestore();
    const complaintsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'hostelComplaints') : null, [firestore]);
    const { data: complaints, isLoading } = useCollection(complaintsQuery);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New': return 'destructive';
            case 'In Review': return 'secondary';
            case 'Resolved': return 'default';
            default: return 'outline';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>SLC Dashboard</CardTitle>
                <CardDescription>Manage student life and hostel complaints.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hostel</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading complaints...</TableCell></TableRow>}
                        {!isLoading && complaints?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No complaints submitted yet.</TableCell></TableRow>}
                        {complaints?.map((c: any) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.hostelName}</TableCell>
                                <TableCell>{c.category}</TableCell>
                                <TableCell>{format(new Date(c.submittedAt), 'PPp')}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(c.status)} className={c.status === 'Resolved' ? 'bg-green-600' : ''}>{c.status}</Badge>
                                </TableCell>
                                <TableCell><ComplaintDetailsDialog complaint={c} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
