'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function AcademicsDashboard() {
  const firestore = useFirestore();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'rejected'
  const [activeTab, setActiveTab] = useState('approved');

  const approvedQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'medicalRequests'), where('directorApprovalStatus', '==', 'Approved'));
  }, [firestore]);

  const rejectedQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'medicalRequests'), where('directorApprovalStatus', '==', 'Rejected'));
  }, [firestore]);
  
  const { data: approvedRequests, isLoading: loadingApproved } = useCollection(approvedQuery);
  const { data: rejectedRequests, isLoading: loadingRejected } = useCollection(rejectedQuery);

  const filterRequests = (requests: any[]) => {
    if (!requests) return [];
    return requests.filter(req => {
      const matchesSearch = searchTerm === '' ||
        req.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.ugNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || format(new Date(req.dateRequested), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
      
      // Status filter is handled by the tabs themselves in this dashboard.

      return matchesSearch && matchesDate;
    });
  };

  const filteredApprovedRequests = useMemo(() => filterRequests(approvedRequests as any[]), [approvedRequests, searchTerm, dateFilter]);
  const filteredRejectedRequests = useMemo(() => filterRequests(rejectedRequests as any[]), [rejectedRequests, searchTerm, dateFilter]);


  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter(undefined);
    setStatusFilter('all');
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Academic Office Dashboard</CardTitle>
          <CardDescription>View and filter all finalized medical leave requests.</CardDescription>
        </CardHeader>
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
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="approved">Approved Requests</TabsTrigger>
              <TabsTrigger value="rejected">Rejected Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="approved" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Approved Medical Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>UG Number</TableHead>
                        <TableHead>Date Requested</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingApproved && <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>}
                      {filteredApprovedRequests.map((req: any) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.studentName}</TableCell>
                          <TableCell>{req.studentId}</TableCell>
                           <TableCell>{req.ugNumber}</TableCell>
                          <TableCell>{new Date(req.dateRequested).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rejected Medical Leaves</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Student ID</TableHead>
                         <TableHead>UG Number</TableHead>
                        <TableHead>Date Requested</TableHead>
                        <TableHead>Rejected By</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {loadingRejected && <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>}
                      {filteredRejectedRequests.map((req: any) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.studentName}</TableCell>
                          <TableCell>{req.studentId}</TableCell>
                          <TableCell>{req.ugNumber}</TableCell>
                           <TableCell>{new Date(req.dateRequested).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{req.doctorVerificationStatus === 'Rejected' ? 'Doctor' : 'Director'}</Badge>
                          </TableCell>
                          <TableCell>{req.rejectionReason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
