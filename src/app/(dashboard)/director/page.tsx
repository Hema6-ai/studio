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
import { Textarea } from "@/components/ui/textarea";
import { Folder, AlertTriangle } from "lucide-react";
import React from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, query, updateDoc, where } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function DirectorDashboard() {
  const firestore = useFirestore();
  const [rejectionReasons, setRejectionReasons] = React.useState<Record<string, string>>({});

  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'medicalRequests'), 
      where('doctorVerificationStatus', '==', 'Approved'),
      where('directorApprovalStatus', '==', null)
    );
  }, [firestore]);

  const { data: requests, isLoading } = useCollection(pendingRequestsQuery);

  const handleApprove = (id: string) => {
    if (!firestore) return;
    const requestRef = doc(firestore, "medicalRequests", id);
    updateDocumentNonBlocking(requestRef, { directorApprovalStatus: 'Approved' });
  };

  const handleReject = (id: string) => {
    if (!firestore || !rejectionReasons[id]) {
      alert("Please provide a reason for rejection.");
      return;
    }
    const requestRef = doc(firestore, "medicalRequests", id);
    updateDocumentNonBlocking(requestRef, { 
      directorApprovalStatus: 'Rejected',
      rejectionReason: rejectionReasons[id]
    });
  };

  const handleViewDocuments = (documentUrl: string) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Director's Dashboard</CardTitle>
          <CardDescription>Review and finalize medical leave requests approved by doctors.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You have {isLoading ? '...' : requests?.length ?? 0} pending request(s) for final approval.</p>
        </CardContent>
      </Card>

      {isLoading && <p>Loading requests...</p>}

      {!isLoading && requests?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No pending requests for final approval.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {requests?.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>Request from {request.studentName}</CardTitle>
              <CardDescription>
                Student ID: {request.studentId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p><strong>Age:</strong> {request.age}</p>
                <p><strong>UG Number:</strong> {request.ugNumber}</p>
                <p><strong>Requested on:</strong> {new Date(request.dateRequested).toLocaleString()}</p>
                <p className="text-green-600 mt-2">
                  <strong>Doctor Approved:</strong> {request.doctorVerificationStatus}
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => handleViewDocuments(request.medicalDocuments[0])}>
                <Folder className="mr-2 h-4 w-4" />
                View Medical Documents
              </Button>
              <div>
                <Textarea
                  placeholder="Mandatory reason for rejection..."
                  value={rejectionReasons[request.id] || ''}
                  onChange={(e) => setRejectionReasons({...rejectionReasons, [request.id]: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Button variant="destructive" onClick={() => handleReject(request.id)} disabled={!rejectionReasons[request.id]}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={() => handleApprove(request.id)}>Approve</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
