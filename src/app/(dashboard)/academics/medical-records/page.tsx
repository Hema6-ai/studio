'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MedicalRecordsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

    const approvedRequests: any[] = []; // This would be fetched
    const rejectedRequests: any[] = []; // This would be fetched
    const loadingApproved = false;
    const loadingRejected = false;

    const filterRequests = (requests: any[]) => {
        if (!requests) return [];
        return requests.filter(req => {
          const matchesSearch = searchTerm === '' ||
            req.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.ugNumber?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesDate = !dateFilter || format(new Date(req.dateRequested), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
          return matchesSearch && matchesDate;
        });
    };

    const filteredApprovedRequests = useMemo(() => filterRequests(approvedRequests as any[]), [approvedRequests, searchTerm, dateFilter]);
    const filteredRejectedRequests = useMemo(() => filterRequests(rejectedRequests as any[]), [rejectedRequests, searchTerm, dateFilter]);

    const clearFilters = () => {
        setSearchTerm('');
        setDateFilter(undefined);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Finalized Medical Leave Records</CardTitle>
                <CardDescription>View and filter all finalized medical leave requests.</CardDescription>
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
            <CardContent className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="text-green-600">Approved Medical Leaves</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>UG Number</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loadingApproved && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
                        {filteredApprovedRequests.map((req: any) => (
                            <TableRow key={req.id}>
                            <TableCell>{req.studentName}</TableCell>
                            <TableCell>{req.ugNumber}</TableCell>
                            <TableCell>{new Date(req.dateRequested).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <CardTitle className="text-red-600">Rejected Medical Leaves</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>UG Number</TableHead>
                            <TableHead>Reason</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loadingRejected && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
                        {filteredRejectedRequests.map((req: any) => (
                            <TableRow key={req.id}>
                            <TableCell>{req.studentName}</TableCell>
                            <TableCell>{req.ugNumber}</TableCell>
                            <TableCell>{req.rejectionReason}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}
