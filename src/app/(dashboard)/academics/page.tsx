'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export default function AcademicsDashboard() {
  const firestore = useFirestore();

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


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Academic Office Dashboard</CardTitle>
          <CardDescription>View all finalized medical leave requests.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="approved">
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
                        <TableHead>Date Requested</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingApproved && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
                      {approvedRequests?.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.studentName}</TableCell>
                          <TableCell>{req.studentId}</TableCell>
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
                        <TableHead>Date Requested</TableHead>
                        <TableHead>Rejected By</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {loadingRejected && <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>}
                      {rejectedRequests?.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.studentName}</TableCell>
                          <TableCell>{req.studentId}</TableCell>
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
