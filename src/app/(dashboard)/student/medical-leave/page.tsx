'use client';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileUp, Paperclip } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, query, where } from "firebase/firestore";
import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function MedicalLeavePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [age, setAge] = useState('');
  const [ugNumber, setUgNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const medicalRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "medicalRequests"), where("studentId", "==", user.uid));
  }, [firestore, user]);

  const { data: medicalRequests, isLoading } = useCollection(medicalRequestsQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!firestore || !user) return;
    setIsSubmitting(true);

    if (!selectedFile) {
        toast({
            variant: "destructive",
            title: "No File Selected",
            description: "Please upload your medical document.",
        });
        setIsSubmitting(false);
        return;
    }

    let fileURL = '';
    try {
        const storage = getStorage();
        const storageRef = ref(storage, `medical-documents/${user.uid}/${Date.now()}-${selectedFile.name}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        fileURL = await getDownloadURL(snapshot.ref);

    } catch (error) {
        console.error("Error uploading file: ", error);
        toast({
            variant: "destructive",
            title: "File Upload Failed",
            description: "Could not upload your medical document. Please try again.",
        });
        setIsSubmitting(false);
        return;
    }

    const requestData = {
        studentId: user.uid,
        studentName: studentName,
        age: Number(age),
        ugNumber: ugNumber,
        dateRequested: new Date().toISOString(),
        timeRequested: new Date().toISOString(),
        medicalDocuments: [fileURL],
        statusUpdates: ['Student Applied'],
        doctorVerificationStatus: null,
        directorApprovalStatus: null,
        rejectionReason: null
    };

    const requestsCollection = collection(firestore, 'medicalRequests');
    addDocumentNonBlocking(requestsCollection, requestData);

    toast({
        title: "Success",
        description: "Medical leave request submitted successfully."
    });
    // Clear form
    setStudentName('');
    setStudentId('');
    setAge('');
    setUgNumber('');
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setIsSubmitting(false);
  }

  const getStatusInfo = (req: any) => {
    if (req.directorApprovalStatus === 'Rejected' || req.doctorVerificationStatus === 'Rejected') {
        const reason = req.rejectionReason ? `Reason: ${req.rejectionReason}` : '';
        return { text: `Rejected by ${req.directorApprovalStatus ? 'Director' : 'Doctor'}`, variant: 'destructive', reason };
    }
    if (req.directorApprovalStatus === 'Approved') {
        return { text: 'Approved', variant: 'default', className: 'bg-green-600 hover:bg-green-700 text-white' };
    }
    if (req.doctorVerificationStatus === 'Approved') {
        return { text: 'Pending Director Approval', variant: 'secondary', className: 'bg-blue-500 hover:bg-blue-600 text-white' };
    }
    return { text: 'Pending Doctor Verification', variant: 'secondary' };
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Request Medical Leave</CardTitle>
            <CardDescription>
              Fill out the form below and upload your medical certificate. You can submit multiple requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Student Name</Label>
                <Input id="student-name" placeholder="Enter your name" required value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input id="student-id" placeholder="Enter your student ID" required value={studentId} onChange={e => setStudentId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" placeholder="Enter your age" required type="number" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ug-number">UG Number</Label>
                <Input id="ug-number" placeholder="e.g., P23001" required value={ugNumber} onChange={e => setUgNumber(e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Upload Medical Documents (PDF/Image)</Label>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Drag & drop files or
                </p>
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                />
                <Button variant="outline" className="mt-2" type="button" onClick={handleBrowseClick}>
                  Browse Files
                </Button>
                {selectedFile && (
                  <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>My Leave History</CardTitle>
                <CardDescription>Track all your submitted medical leave requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <p className="text-center text-muted-foreground">Loading history...</p>}
                {!isLoading && (!medicalRequests || medicalRequests.length === 0) ? (
                    <p className="text-center text-muted-foreground py-10">You have not submitted any requests yet.</p>
                ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card">
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medicalRequests?.sort((a,b) => new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime()).map((req) => {
                                const statusInfo = getStatusInfo(req);
                                return (
                                    <TableRow key={req.id}>
                                        <TableCell className="text-xs font-medium">
                                            {new Date(req.dateRequested).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant as any} className={statusInfo.className}>
                                                {statusInfo.text}
                                            </Badge>
                                            {statusInfo.reason && <p className="text-xs text-destructive mt-1">{statusInfo.reason}</p>}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
