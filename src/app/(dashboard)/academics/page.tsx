'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock Data - In a real app, this would come from Firestore
const approvedRequests = [
  { id: 'MR001', studentName: 'Hema P.', date: '2024-07-28', reason: 'Fever and body aches.' },
  { id: 'MR003', studentName: 'Ravi K.', date: '2024-07-27', reason: 'Minor injury.' },
];
const rejectedRequests = [
  { id: 'MR002', studentName: 'Suresh G.', date: '2024-07-28', rejectionReason: 'Insufficient documentation provided.', doctor: 'Dr. Singh' },
];


export default function AcademicsDashboard() {
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
                        <TableHead>Request ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.id}</TableCell>
                          <TableCell>{req.studentName}</TableCell>
                          <TableCell>{req.date}</TableCell>
                          <TableCell>{req.reason}</TableCell>
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
                        <TableHead>Request ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Rejected By</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.id}</TableCell>
                          <TableCell>{req.studentName}</TableCell>
                          <TableCell>{req.date}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{req.doctor}</Badge>
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
