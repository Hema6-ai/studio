'use client';
import { useState } from 'react';
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
import { Folder, UserCheck, Check, X } from 'lucide-react';

// Mock Data
const pendingRequests = [
  { id: 'MR001', studentName: 'Hema P.', age: 21, ugNumber: 'P23001', date: '2024-07-28', time: '10:30 AM' },
  { id: 'MR002', studentName: 'Suresh G.', age: 20, ugNumber: 'P23045', date: '2024-07-28', time: '11:15 AM' },
];

const processedRequests = [
    { id: 'MR003', studentName: 'Ravi K.', status: 'Approved', date: '2024-07-27' },
    { id: 'MR004', studentName: 'Priya M.', status: 'Rejected', date: '2024-07-26', reason: 'Invalid document' },
];


export default function DoctorDashboard() {
  const [availability, setAvailability] = useState('available');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-500';
      case 'not available': return 'bg-red-500';
      case 'nurse available': return 'bg-orange-500';
      case 'on leave, nurse available': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500';
    }
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck/> My Availability
                    </CardTitle>
                    <CardDescription>Let students and staff know your current status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup defaultValue="available" onValueChange={setAvailability} className="space-y-2">
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
                            <Label htmlFor="r4">Doctor on leave, Nurse available</Label>
                             <div className="h-3 w-3 rounded-full bg-yellow-500 ml-auto" />
                        </div>
                    </RadioGroup>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Update Status</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Approval History</CardTitle>
                    <CardDescription>Your recently processed requests.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Request ID</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.id}</TableCell>
                                    <TableCell>{req.studentName}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'Approved' ? 'default' : 'destructive'} className={req.status === 'Approved' ? "bg-green-600" : ""}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>{req.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Pending Medical Requests</CardTitle>
                <CardDescription>You have {pendingRequests.length} requests to review.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                {pendingRequests.map(request => (
                    <Card key={request.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{request.studentName}</CardTitle>
                            <CardDescription>UG Number: {request.ugNumber} | Age: {request.age}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">Requested on: {request.date} at {request.time}</p>
                            <Button variant="outline" className="w-full">
                                <Folder className="mr-2 h-4 w-4"/> View Medical Documents
                            </Button>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                             <Button variant="destructive"><X className="mr-2 h-4 w-4"/> Reject</Button>
                            <Button className="bg-green-600 hover:bg-green-700"><Check className="mr-2 h-4 w-4"/> Approve</Button>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
