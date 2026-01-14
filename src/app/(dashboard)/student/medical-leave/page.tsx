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
import { FileUp, CheckCircle, Clock, XCircle, Shield, Building, AlertTriangle, UserCheck, Paperclip } from "lucide-react";
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
  const medicalRequestStatus = medicalRequests?.[0]; // Get the most recent one for this demo

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

    if (medicalRequestStatus && !medicalRequestStatus.directorApprovalStatus && !medicalRequestStatus.doctorVerificationStatus?.includes('Rejected')) {
        toast({
            variant: "destructive",
            title: "Existing Request Pending",
            description: "You already have a medical leave request in progress."
        });
        setIsSubmitting(false);
        return;
    }

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
        // Create a storage reference
        const storageRef = ref(storage, `medical-documents/${user.uid}/${selectedFile.name}`);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, selectedFile);
        
        // Get download URL
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
        studentId: studentId,
        studentName: studentName,
        age: Number(age),
        ugNumber: ugNumber,
        dateRequested: new Date().toISOString(),
        timeRequested: new Date().toISOString(),
        medicalDocuments: [fileURL], // Save the URL of the uploaded file
        statusUpdates: ['Student Applied'],
        doctorVerificationStatus: null, // null | 'Approved' | 'Rejected'
        directorApprovalStatus: null, // null | 'Approved' | 'Rejected'
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
    setIsSubmitting(false);
  }

  const getStatusIcon = (isComplete: boolean, isApproved?: boolean | null, isCurrent?: boolean) => {
    if (isComplete) {
      if (isApproved === false) return <XCircle className="h-6 w-6 text-red-500" />;
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    if(isCurrent) return <Clock className="h-6 w-6 text-blue-500 animate-pulse" />;
    return <Clock className="h-6 w-6 text-gray-400" />;
  };

  const getConnectorClass = (isComplete: boolean) => {
    return isComplete ? 'bg-green-500' : 'bg-gray-300';
  };
  
  const hasApplied = !!medicalRequestStatus;
  const doctorApproved = medicalRequestStatus?.doctorVerificationStatus === 'Approved';
  const doctorRejected = medicalRequestStatus?.doctorVerificationStatus === 'Rejected';
  const directorApproved = medicalRequestStatus?.directorApprovalStatus === 'Approved';
  const directorRejected = medicalRequestStatus?.directorApprovalStatus === 'Rejected';

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Request Medical Leave</CardTitle>
            <CardDescription>
              Fill out the form below and upload your medical certificate.
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
                <CardTitle>Request Status</CardTitle>
                <CardDescription>Track your medical leave request through the approval process.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <p className="text-muted-foreground text-center">Loading status...</p>}
                {!hasApplied && !isLoading && <p className="text-muted-foreground text-center">Submit a request to see its status here.</p>}
                
                {hasApplied && medicalRequestStatus && (
                <div className="space-y-6">
                    {/* Step 1: Student Applied */}
                    <div className="flex items-start">
                        {getStatusIcon(hasApplied, true)}
                        <div className="ml-4">
                            <p className="font-semibold">Student Applied</p>
                            <p className="text-xs text-muted-foreground">{new Date(medicalRequestStatus.dateRequested).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Connector */}
                    <div className={`ml-3 h-8 w-0.5 ${getConnectorClass(!!medicalRequestStatus.doctorVerificationStatus)}`}></div>

                    {/* Step 2: Doctor Verification */}
                    <div className="flex items-start">
                        {getStatusIcon(!!medicalRequestStatus.doctorVerificationStatus, doctorApproved, !medicalRequestStatus.doctorVerificationStatus)}
                        <div className="ml-4">
                             <p className="font-semibold flex items-center gap-2">Doctor Verified <UserCheck className="h-4 w-4" /></p>
                            {medicalRequestStatus.doctorVerificationStatus ? (
                                <>
                                 <p className={`text-sm font-bold ${doctorApproved ? 'text-green-600' : 'text-red-600'}`}>
                                    {medicalRequestStatus.doctorVerificationStatus}
                                 </p>
                                 </>
                            ) : (
                                <p className="text-xs text-muted-foreground">Pending verification</p>
                            )}
                        </div>
                    </div>
                    
                    {(doctorRejected || directorRejected) && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center gap-2 mt-4">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                            <p className="text-sm text-red-700 font-semibold">Your request was rejected.</p>
                             {medicalRequestStatus.rejectionReason && <p className="text-xs text-red-600 mt-1">Reason: {medicalRequestStatus.rejectionReason}</p>}
                            <p className="text-xs text-red-600 mt-1">For any queries, please visit the Academic Office.</p>
                        </div>
                    )}

                    {/* Connector */}
                    {doctorApproved && <div className={`ml-3 h-8 w-0.5 ${getConnectorClass(!!medicalRequestStatus.directorApprovalStatus)}`}></div>}


                    {/* Step 3: Director Approval */}
                    {doctorApproved && !doctorRejected && <div className="flex items-start">
                        {getStatusIcon(!!medicalRequestStatus.directorApprovalStatus, directorApproved, !medicalRequestStatus.directorApprovalStatus && doctorApproved)}
                        <div className="ml-4">
                             <p className="font-semibold flex items-center gap-2">Director Verified <Shield className="h-4 w-4" /></p>
                            {medicalRequestStatus.directorApprovalStatus ? (
                                <p className={`text-sm font-bold ${directorApproved ? 'text-green-600' : 'text-red-600'}`}>{medicalRequestStatus.directorApprovalStatus}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground">Pending final approval</p>
                            )}
                        </div>
                    </div>}

                    {/* Connector */}
                    {directorApproved && <div className={`ml-3 h-8 w-0.5 ${getConnectorClass(true)}`}></div>}

                     {/* Step 4: Academic Office */}
                    {directorApproved && <div className="flex items-start">
                        {getStatusIcon(true, true)}
                        <div className="ml-4">
                             <p className="font-semibold flex items-center gap-2">Final Decision <Building className="h-4 w-4" /></p>
                             <p className="text-sm font-bold text-green-600">Approved</p>
                             <p className="text-xs text-muted-foreground">Processed by Academic Office.</p>
                        </div>
                    </div>}
                </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
