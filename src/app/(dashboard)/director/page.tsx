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
import { Folder, AlertTriangle, CalendarIcon } from "lucide-react";
import React, { useState, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, query, updateDoc, where } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function DirectorDashboard() {
  const firestore = useFirestore();
  const [rejectionReasons, setRejectionReasons] = React.useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'medicalRequests'), 
      where('doctorVerificationStatus', '==', 'Approved'),
      where('directorApprovalStatus', '==', null)
    );
  }, [firestore]);

  const { data: requests, isLoading } = useCollection(pendingRequestsQuery);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    return requests.filter(req => {
       const matchesSearch = searchTerm === '' ||
        req.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.ugNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || format(new Date(req.dateRequested), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');

      return matchesSearch && matchesDate;
    });
  }, [requests, searchTerm, dateFilter]);

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

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter(undefined);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Director's Dashboard</CardTitle>
          <CardDescription>Review and finalize medical leave requests approved by doctors.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You have {isLoading ? '...' : filteredRequests?.length ?? 0} pending request(s) for final approval.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by Student Name or UG Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={clearFilters} variant="ghost">Clear Filters</Button>
          </div>
        </CardHeader>
      </Card>


      {isLoading && <p>Loading requests...</p>}

      {!isLoading && filteredRequests?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No matching pending requests for final approval.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {filteredRequests?.map((request) => (
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
