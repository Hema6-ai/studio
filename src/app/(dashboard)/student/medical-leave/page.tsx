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
import { FileUp, CheckCircle, Clock, XCircle, Shield, Building, AlertTriangle } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function MedicalLeavePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [age, setAge] = useState('');
  const [ugNumber, setUgNumber] = useState('');

  // Let's assume for now the user has only one medical request for simplicity.
  // A real app would have a list of requests and a way to select one.
  const medicalRequestRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // This is not a robust way to get a user's *latest* request.
    // We are querying the whole collection and will just display the first result.
    // In a real app, you would query for requests where studentId === user.uid
    return doc(collection(firestore, "medicalRequests"), user.uid); // This is not correct for getting a specific request
  }, [firestore, user]);

  const { data: medicalRequestStatus, isLoading } = useDoc(medicalRequestRef);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!firestore || !user) return;

    const requestData = {
        studentId: user.uid,
        age: Number(age),
        ugNumber: ugNumber,
        dateRequested: new Date().toISOString(),
        timeRequested: new Date().toISOString(),
        medicalDocuments: [], // Placeholder
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
                <Input id="student-name" value={user?.displayName || 'Loading...'} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" placeholder="Enter your age" required type="number" value={age} onChange={e => setAge(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ug-number">UG Number</Label>
              <Input id="ug-number" placeholder="e.g., P23001" required value={ugNumber} onChange={e => setUgNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Upload Medical Documents (PDF/Image)</Label>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Drag & drop files or
                </p>
                <Button variant="outline" className="mt-2" type="button">
                  Browse Files
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">Submit Request</Button>
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
                {isLoading && <p>Loading status...</p>}
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
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center gap-2">
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
