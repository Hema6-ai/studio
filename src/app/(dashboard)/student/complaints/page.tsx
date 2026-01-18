'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection } from 'firebase/firestore';


const ComplaintForm = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [hostel, setHostel] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hostel || !category || !description || !user || !firestore) {
            toast({ variant: 'destructive', title: "Missing Fields", description: "Please fill out all required fields."});
            return;
        }
        setIsSubmitting(true);

        let attachmentUrl = '';
        if (attachment) {
            try {
                const storage = getStorage();
                const storageRef = ref(storage, `complaints/${user.uid}/${Date.now()}-${attachment.name}`);
                const snapshot = await uploadBytes(storageRef, attachment);
                attachmentUrl = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error("File upload error:", error);
                toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload your file." });
                setIsSubmitting(false);
                return;
            }
        }
        
        const complaintsCollection = collection(firestore, 'hostelComplaints');
        addDocumentNonBlocking(complaintsCollection, {
            studentId: user.uid, // For audit purposes
            hostelName: hostel,
            category,
            description,
            attachments: attachmentUrl ? [attachmentUrl] : [],
            submittedAt: new Date().toISOString(),
            status: 'New',
            internalNotes: ''
        });

        toast({ title: "Complaint Submitted", description: "The SLC has been notified. Thank you." });
        setHostel('');
        setCategory('');
        setDescription('');
        setAttachment(null);
        setIsSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hostel">Hostel Name</Label>
                    <Select value={hostel} onValueChange={setHostel}>
                        <SelectTrigger id="hostel"><SelectValue placeholder="Select Hostel" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Boys Hostel 1">Boys Hostel 1</SelectItem>
                            <SelectItem value="Boys Hostel 2">Boys Hostel 2</SelectItem>
                             <SelectItem value="Girls Hostel 1">Girls Hostel 1</SelectItem>
                            <SelectItem value="Girls Hostel 2">Girls Hostel 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category"><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                            <SelectItem value="Water">Water</SelectItem>
                            <SelectItem value="Electricity">Electricity</SelectItem>
                            <SelectItem value="Safety">Safety</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="description">Complaint Description</Label>
                <Textarea id="description" placeholder="Please describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} required />
             </div>
             <div className="space-y-2">
                <Label htmlFor="attachment">Attach Image/File (Optional)</Label>
                <Input id="attachment" type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
             </div>
             <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
            </Button>
        </form>
    );
}

export default function ComplaintPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hostel Complaint Box</CardTitle>
                <CardDescription>Submit a confidential complaint about hostel issues. This form is anonymous to the SLC.</CardDescription>
            </CardHeader>
            <CardContent>
                <ComplaintForm />
            </CardContent>
        </Card>
    );
}
