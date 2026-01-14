'use client';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Folder, UserCheck, Check, X, CalendarIcon } from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


export default function DoctorDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [availability, setAvailability] = useState('available');

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all');

  const availabilityRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `doctorAvailability/${user.uid}`);
  }, [firestore, user]);
  
  const { data: availabilityData, isLoading: loadingAvailability } = useDoc(availabilityRef);
  
  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'medicalRequests'), where('doctorVerificationStatus', '==', null));
  }, [firestore]);

  const processedRequestsQuery = useMemoFirebase(() => {
     if (!firestore || !user) return null;
     return query(collection(firestore, 'medicalRequests'), where('doctorVerificationStatus', '!=', null));
  }, [firestore, user]);

  const { data: pendingRequests, isLoading: loadingPending } = useCollection(pendingRequestsQuery);
  const { data: processedRequests, isLoading: loadingProcessed } = useCollection(processedRequestsQuery);

  const filterRequests = (requests: any[], status: 'pending' | 'processed') => {
    if (!requests) return [];
    return requests.filter(req => {
      const matchesSearch = searchTerm === '' ||
        req.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.ugNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || format(new Date(req.dateRequested), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
      
      let matchesStatus = true;
      if (status === 'processed') {
          matchesStatus = statusFilter === 'all' || req.doctorVerificationStatus?.toLowerCase() === statusFilter;
      }

      return matchesSearch && matchesDate && matchesStatus;
    });
  }

  const filteredPendingRequests = useMemo(() => filterRequests(pendingRequests as any[], 'pending'), [pendingRequests, searchTerm, dateFilter]);
  const filteredProcessedRequests = useMemo(() => filterRequests(processedRequests as any[], 'processed'), [processedRequests, searchTerm, dateFilter, statusFilter]);

  const handleAvailabilityUpdate = () => {
    if (!availabilityRef || !user) return;
    setDocumentNonBlocking(availabilityRef, { 
      availabilityStatus: availability,
      doctorId: user.uid,
      doctorName: user.displayName || user.email?.split('@')[0] || 'Doctor',
    }, { merge: true });
  };
  
  const handleApprove = (id: string) => {
    if (!firestore) return;
    const requestRef = doc(firestore, 'medicalRequests', id);
    updateDocumentNonBlocking(requestRef, { doctorVerificationStatus: 'Approved' });
  };
  
  const handleReject = (id: string) => {
     if (!firestore) return;
    const requestRef = doc(firestore, 'medicalRequests', id);
    updateDocumentNonBlocking(requestRef, { 
        doctorVerificationStatus: 'Rejected',
        rejectionReason: 'Invalid or insufficient documentation.'
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
    setStatusFilter('all');
  };

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Doctor Dashboard</CardTitle>
                <CardDescription>Manage your availability and review medical requests.</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
            <Card id="availability">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck/> My Availability
                    </CardTitle>
                    <CardDescription>Let students and staff know your current status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={availabilityData?.availabilityStatus || availability} onValueChange={setAvailability} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="available" id="r1" />
                            <Label htmlFor="r1">Available</Label>
                            <div className="h-3 w-3 rounded-full bg-green-500 ml-auto" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not-available" id="r2" />
                            <Label htmlFor="r2">Not Available</Label>
                             <div className="h-3 w-3 rounded-full bg-red-500 ml-auto" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nurse-available" id="r3" />
                            <Label htmlFor="r3">Doctor unavailable, Nurse available</Label>
                             <div className="h-3 w-3 rounded-full bg-orange-500 ml-auto" />
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="on-leave" id="r4" />
                            <Label htmlFor="r4">On Leave, Nurse available</Label>
                             <div className="h-3 w-3 rounded-full bg-yellow-500 ml-auto" />
                        </div>
                    </RadioGroup>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleAvailabilityUpdate}>Update Status</Button>
                </CardFooter>
            </Card>

            <Card id="history">
                <CardHeader>
                    <CardTitle>Approval History</CardTitle>
                    <CardDescription>Your recently processed requests.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingProcessed && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
                            {filteredProcessedRequests.slice(0, 5).map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.studentId}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.doctorVerificationStatus === 'Approved' ? 'default' : 'destructive'} className={req.doctorVerificationStatus === 'Approved' ? "bg-green-600" : ""}>
                                            {req.doctorVerificationStatus}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>{new Date(req.dateRequested).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <Card id="requests">
            <CardHeader>
                <CardTitle>Pending & Processed Requests</CardTitle>
                <CardDescription>You have {loadingPending ? '...' : filteredPendingRequests?.length ?? 0} requests to review.</CardDescription>
                <div className="flex flex-col md:flex-row gap-4 pt-4">
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
                          "w-[240px] justify-start text-left font-normal",
                          !dateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  <Button onClick={clearFilters} variant="ghost">Clear Filters</Button>
                </div>
            </CardHeader>
            <CardContent>
                <h3 className="text-lg font-semibold mb-4">Pending Review</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    {loadingPending && <p>Loading requests...</p>}
                    {!loadingPending && filteredPendingRequests?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <p>No pending requests match your filters.</p>
                        </div>
                    )}
                    {filteredPendingRequests?.map(request => (
                        <Card key={request.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">Student: {request.studentName}</CardTitle>
                                <CardDescription>ID: {request.studentId}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm"><strong>UG Number:</strong> {request.ugNumber}</p>
                                <p className="text-sm"><strong>Age:</strong> {request.age}</p>
                                <p className="text-sm"><strong>Requested:</strong> {new Date(request.dateRequested).toLocaleString()}</p>
                                <Button variant="outline" className="w-full" onClick={() => handleViewDocuments(request.medicalDocuments[0])}>
                                    <Folder className="mr-2 h-4 w-4"/> View Medical Documents
                                </Button>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2">
                                <Button variant="destructive" onClick={() => handleReject(request.id)}><X className="mr-2 h-4 w-4"/> Reject</Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(request.id)}><Check className="mr-2 h-4 w-4"/> Approve</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <hr className="my-8" />

                <h3 className="text-lg font-semibold mb-4">Processed Requests</h3>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>UG Number</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingProcessed && <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>}
                         {!loadingProcessed && filteredProcessedRequests?.length === 0 && (
                            <TableRow><TableCell colSpan={4} className="text-center">No processed requests match your filters.</TableCell></TableRow>
                        )}
                        {filteredProcessedRequests?.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{req.studentName}</TableCell>
                                <TableCell>{req.ugNumber}</TableCell>
                                <TableCell>{new Date(req.dateRequested).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={req.doctorVerificationStatus === 'Approved' ? 'default' : 'destructive'} className={req.doctorVerificationStatus === 'Approved' ? "bg-green-600" : ""}>
                                        {req.doctorVerificationStatus}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
