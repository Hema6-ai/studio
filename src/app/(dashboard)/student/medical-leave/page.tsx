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
import { FileUp, CheckCircle, Clock, XCircle, Shield, Building } from "lucide-react";

const medicalRequestStatus = {
    submitted: true,
    doctorVerified: true,
    doctorDecision: 'Approved',
    directorVerified: false,
    directorDecision: null,
    rejectionReason: null
};

export default function MedicalLeavePage() {

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

  const doctorApproved = medicalRequestStatus.doctorVerified && medicalRequestStatus.doctorDecision === 'Approved';
  const doctorRejected = medicalRequestStatus.doctorVerified && medicalRequestStatus.doctorDecision === 'Rejected';
  const directorApproved = medicalRequestStatus.directorVerified && medicalRequestStatus.directorDecision === 'Approved';
  const directorRejected = medicalRequestStatus.directorVerified && medicalRequestStatus.directorDecision === 'Rejected';


  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
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
                <Input id="student-name" defaultValue="Hema P." readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" placeholder="Enter your age" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ug-number">UG Number</Label>
              <Input id="ug-number" placeholder="e.g., P23001" />
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-requested">Date Requested</Label>
                <Input id="date-requested" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-requested">Time Requested</Label>
                <Input id="time-requested" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Upload Medical Documents (PDF/Image)</Label>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Drag & drop files or
                </p>
                <Button variant="outline" className="mt-2">
                  Browse Files
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Submit Request</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Request Status</CardTitle>
                <CardDescription>Track your medical leave request through the approval process.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Step 1: Student Applied */}
                    <div className="flex items-start">
                        {getStatusIcon(medicalRequestStatus.submitted, true)}
                        <div className="ml-4">
                            <p className="font-semibold">Student Applied</p>
                            <p className="text-xs text-muted-foreground">2024-07-29 at 09:15 AM</p>
                        </div>
                    </div>

                    {/* Connector */}
                    <div className={`ml-3 h-8 w-0.5 ${getConnectorClass(medicalRequestStatus.doctorVerified)}`}></div>

                    {/* Step 2: Doctor Verification */}
                    <div className="flex items-start">
                        {getStatusIcon(medicalRequestStatus.doctorVerified, medicalRequestStatus.doctorDecision === 'Approved', !medicalRequestStatus.doctorVerified)}
                        <div className="ml-4">
                             <p className="font-semibold flex items-center gap-2">Doctor Verified <UserCheck className="h-4 w-4" /></p>
                            {medicalRequestStatus.doctorVerified ? (
                                <>
                                 <p className={`text-sm font-bold ${doctorApproved ? 'text-green-600' : 'text-red-600'}`}>
                                    {medicalRequestStatus.doctorDecision}
                                 </p>
                                 <p className="text-xs text-muted-foreground">by Dr. Vikram Singh</p>
                                 </>
                            ) : (
                                <p className="text-xs text-muted-foreground">Pending verification</p>
                            )}
                        </div>
                    </div>
                    
                    {doctorRejected && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                            <p className="text-sm text-red-700 font-semibold">Your request was rejected.</p>
                            <p className="text-xs text-red-600 mt-1">For any queries, please visit the Academic Office.</p>
                        </div>
                    )}


                    {/* Connector */}
                    {doctorApproved && <div className={`ml-3 h-8 w-0.5 ${getConnectorClass(medicalRequestStatus.directorVerified)}`}></div>}


                    {/* Step 3: Director Approval */}
                    {doctorApproved && <div className="flex items-start">
                        {getStatusIcon(medicalRequestStatus.directorVerified, medicalRequestStatus.directorDecision === 'Approved', !medicalRequestStatus.directorVerified && doctorApproved)}
                        <div className="ml-4">
                             <p className="font-semibold flex items-center gap-2">Director Verified <Shield className="h-4 w-4" /></p>
                            {medicalRequestStatus.directorVerified ? (
                                <p className={`text-sm font-bold ${directorApproved ? 'text-green-600' : 'text-red-600'}`}>{medicalRequestStatus.directorDecision}</p>
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

                    {directorRejected && (
                         <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                            <p className="text-sm text-red-700 font-semibold">Your request was rejected by the Director.</p>
                             <p className="text-xs text-red-600 mt-1">Reason: [Reason from Director]</p>
                            <p className="text-xs text-red-600 mt-2">For any queries, please visit the Academic Office.</p>
                        </div>
                    )}


                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
