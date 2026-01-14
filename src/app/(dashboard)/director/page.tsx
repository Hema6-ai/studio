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

// Mock data for requests approved by doctors
const pendingRequests = [
  {
    id: "MR20240728-001",
    studentName: "Hema P.",
    age: 21,
    ugNumber: "P23001",
    dateRequested: "2024-07-28",
    timeRequested: "10:30 AM",
    doctorVerification: {
      status: "Approved",
      doctorName: "Dr. Vikram Singh",
      timestamp: "2024-07-28 02:15 PM"
    }
  }
];

export default function DirectorDashboard() {
  const [requests, setRequests] = React.useState(pendingRequests);
  const [rejectionReasons, setRejectionReasons] = React.useState<Record<string, string>>({});

  const handleApprove = (id: string) => {
    // In a real app, this would update Firestore
    setRequests(requests.filter(req => req.id !== id));
  };

  const handleReject = (id: string) => {
    if (!rejectionReasons[id]) {
      alert("Please provide a reason for rejection.");
      return;
    }
    // In a real app, this would update Firestore
    console.log(`Rejecting ${id} with reason: ${rejectionReasons[id]}`);
    setRequests(requests.filter(req => req.id !== id));
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Director's Dashboard</CardTitle>
          <CardDescription>Review and finalize medical leave requests approved by doctors.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You have {requests.length} pending request(s) for final approval.</p>
        </CardContent>
      </Card>

      {requests.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No pending requests for final approval.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>Request: {request.id}</CardTitle>
              <CardDescription>
                From {request.studentName} (UG: {request.ugNumber})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p><strong>Age:</strong> {request.age}</p>
                <p><strong>Requested on:</strong> {request.dateRequested} at {request.timeRequested}</p>
                <p className="text-green-600 mt-2">
                  <strong>Doctor Approved:</strong> {request.doctorVerification.status} by {request.doctorVerification.doctorName} on {request.doctorVerification.timestamp}
                </p>
              </div>
              <Button variant="outline" className="w-full">
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
