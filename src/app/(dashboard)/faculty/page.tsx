'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle } from 'lucide-react';
import { useMemo } from "react";
import { dummyFaculty, dummyTimetable } from "@/lib/data";

const normalizeName = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace('dr.', '')
      .replace('dr', '')
      .replace('.', ' ')
      .replace(/\s+/g, '')
      .trim();
};
  
const parseEntry = (entry: string) => {
    // Regex to capture course, section, and room. Handles formats like "DSA1 G09", "CA4 Lab 103", "EDL1/G09"
    const match = entry.match(/^([A-Z\d]+)-?([\w\d]+)?\s*(.*)$/);
    if (!match) return { courseAbbr: entry, section: 'Common', room: '' };
    const [, courseAbbr, section, room] = match;
    return { courseAbbr, section: section || 'Common', room: room.trim() };
}

export default function FacultyDashboard() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    // --- Faculty Identity Normalization ---
    const facultyNameFromEmail = useMemo(() => {
        if (!user?.email) return '';
        return normalizeName(user.email.split('@')[0]);
    }, [user?.email]);

    const facultyDetails = useMemo(() => {
        if (!facultyNameFromEmail) return [];
        return dummyFaculty.filter(f => normalizeName(f.name) === facultyNameFromEmail);
    }, [facultyNameFromEmail]);

    const facultyDisplayName = facultyDetails.length > 0 ? facultyDetails[0].name : "Faculty Member";

    // --- Availability Logic ---
    const facultyAvailabilityDocRef = useMemoFirebase(() => {
        if (!firestore || !facultyDisplayName) return null;
        // Use faculty name as document ID for simplicity and uniqueness
        const docId = facultyDisplayName.replace(/\s+/g, '-').toLowerCase();
        return doc(firestore, 'availability/faculty');
    }, [firestore, facultyDisplayName]);

    const { data: availabilityData, isLoading: loadingAvailability } = useDoc(facultyAvailabilityDocRef);
    
    const facultyList = availabilityData?.faculty || [];
    const currentFaculty = facultyList.find((f: any) => normalizeName(f.name) === normalizeName(facultyDisplayName));
    const isAvailable = currentFaculty?.status === 'YES';

    const handleAvailabilityChange = (checked: boolean) => {
        if (!facultyAvailabilityDocRef) return;
        const status = checked ? 'YES' : 'NO';

        // Filter out the current faculty member to update their status
        const updatedFacultyList = facultyList.filter((f: any) => normalizeName(f.name) !== normalizeName(facultyDisplayName));
        
        // Add the updated/new faculty member back to the list
        updatedFacultyList.push({
            name: facultyDisplayName, // Use the display name from records
            status: status,
            role: 'Faculty'
        });

        setDocumentNonBlocking(facultyAvailabilityDocRef, { 
            faculty: updatedFacultyList
        }, { merge: true });

        toast({ title: 'Availability Updated', description: `You are now set to ${status === 'YES' ? 'available' : 'unavailable'}.`});
    };

    // --- Today's Schedule Logic ---
    const todaySchedule = useMemo(() => {
        if (facultyDetails.length === 0) return [];
        
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const schedule: any[] = [];

        facultyDetails.forEach(facultyCourse => {
            const ugKeys = facultyCourse.ugYear.map(year => `UG${year}`);

            ugKeys.forEach(ugKey => {
                const yearTimetable = (dummyTimetable as any)[ugKey]?.timetable;
                if (!yearTimetable || !yearTimetable[today]) return;
                
                const daySchedule = yearTimetable[today];

                daySchedule.forEach((slot: any) => {
                    slot.entries.forEach((entryStr: string) => {
                        const entry = parseEntry(entryStr);
                        const courseSection = facultyCourse.section === 'Common' ? entry.section : facultyCourse.section;

                        if (entry.courseAbbr === facultyCourse.courseAbbr && (entry.section === courseSection || facultyCourse.section === 'Common')) {
                             schedule.push({
                                time: slot.time,
                                course: facultyCourse.courseAbbr,
                                section: facultyCourse.section,
                                ug: ugKey,
                                room: entry.room
                            });
                        }
                    });
                });
            });
        });
        
        // Sort by time
        schedule.sort((a, b) => a.time.localeCompare(b.time));
        
        // Remove duplicates
        return schedule.filter((item, index, self) =>
            index === self.findIndex((t) => (
                t.time === item.time && t.course === item.course && t.section === item.section
            ))
        );

    }, [facultyDetails]);

    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Dashboard</CardTitle>
            <CardDescription>Welcome, {facultyDisplayName}!</CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>My Availability</CardTitle>
                    <CardDescription>Let students know if you are available for queries.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingAvailability ? <p>Loading status...</p> : (
                        <div className="flex items-center space-x-4 rounded-md border p-4">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                Your Availability Status
                                </p>
                                <p className="text-sm text-muted-foreground">
                                This status is visible to all students.
                                </p>
                            </div>
                            <Switch
                                checked={isAvailable}
                                onCheckedChange={handleAvailabilityChange}
                                disabled={!user || !facultyDisplayName || facultyDisplayName === 'Faculty Member'}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <div className="flex items-center w-full">
                        {isAvailable ? 
                            <span className="flex items-center text-sm text-green-600"><CheckCircle className="h-4 w-4 mr-2" /> You are currently available.</span> :
                            <span className="flex items-center text-sm text-red-600"><XCircle className="h-4 w-4 mr-2" /> You are currently unavailable.</span>
                        }
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>📅 Today’s Teaching Schedule</CardTitle>
                    <CardDescription>Your scheduled classes for today.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>UG</TableHead>
                                <TableHead>Room</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {todaySchedule.length > 0 ? (
                                todaySchedule.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.time}</TableCell>
                                        <TableCell>{item.course}</TableCell>
                                        <TableCell>{item.section}</TableCell>
                                        <TableCell>{item.ug}</TableCell>
                                        <TableCell>{item.room}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No classes scheduled for today 🎉
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }
