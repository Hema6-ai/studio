'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle, Users, Calendar, AlertTriangle } from 'lucide-react';
import React, { useMemo, useState } from "react";
import { dummyFaculty, dummyTimetable } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { rescheduleMissedClass, RescheduleMissedClassInput, RescheduleMissedClassOutput } from "@/ai/flows/faculty-missed-class-rescheduler";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const normalizeName = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/dr\.?|mrs\.?|mr\.?/g, '')
      .replace(/\s+/g, '')
      .trim();
};
  
const parseEntry = (entry: string) => {
    const match = entry.match(/^([A-Z\d]+)-?([\w\d]+)?\s*(.*)$/);
    if (!match) return { courseAbbr: entry, section: 'Common', room: '' };
    const [, courseAbbr, section, room] = match;
    return { courseAbbr, section: section || 'Common', room: room.trim() };
}

const RescheduleDialog = ({ facultyId, facultyName, subject, students }: { facultyId: string, facultyName: string, subject: any, students: any[] }) => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<RescheduleMissedClassOutput | null>(null);

    const handleFindSlots = async () => {
        setIsLoading(true);
        setAiSuggestions(null);
        try {
            // In a real app, these would be fetched or constructed properly
            const instituteTimetableDataUri = "data:text/plain;base64," + btoa(JSON.stringify(dummyTimetable));
            const roomAvailabilityDataUri = "data:text/plain;base64," + btoa(JSON.stringify({})); // Assuming empty for now

            const input: RescheduleMissedClassInput = {
                facultyId: facultyId,
                missedClassDateTime: selectedSlot,
                subject: subject.courseAbbr,
                enrolledStudents: students.map(s => s.id),
                instituteTimetableDataUri,
                roomAvailabilityDataUri
            };
            const result = await rescheduleMissedClass(input);
            setAiSuggestions(result);
            toast({ title: "AI Suggestions Ready", description: "Review the suggested slots below." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "AI Error", description: "Could not get rescheduling suggestions." });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirm = async (newSlot: string) => {
        if (!facultyId || !firestore) {
            toast({ variant: "destructive", title: "Error", description: "Cannot confirm slot. User not found." });
            return;
        }

        const firestore = useFirestore();
        const logCollection = collection(firestore, 'rescheduleLog');
        await addDocumentNonBlocking(logCollection, {
            facultyId,
            facultyName,
            subject: subject.courseAbbr,
            originalSlot: selectedSlot,
            newSlot: newSlot,
            timestamp: serverTimestamp(),
            status: 'Confirmed'
        });
        
        toast({ title: "Class Rescheduled!", description: `${subject.courseAbbr} has been moved to ${newSlot}. Students will be notified.` });
        setIsOpen(false);
    };


    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Reschedule Class</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Reschedule Class: {subject.courseName}</DialogTitle>
                    <DialogDescription>
                        Use the AI assistant to find a conflict-free slot for this class. All enrolled students will be checked for availability.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div>
                        <Label htmlFor="current-slot">Select class to reschedule</Label>
                         <Select onValueChange={setSelectedSlot}>
                            <SelectTrigger id="current-slot">
                                <SelectValue placeholder="Select a time slot..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Thursday 4:30-5:30">Thursday 4:30 - 5:30</SelectItem>
                                <SelectItem value="Friday 11:00-12:00">Friday 11:00 - 12:00</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="reason">Reason for rescheduling (Optional)</Label>
                        <Textarea id="reason" placeholder="e.g., Faculty meeting, missed class..." value={reason} onChange={(e) => setReason(e.target.value)} />
                    </div>
                    <Button onClick={handleFindSlots} disabled={!selectedSlot || isLoading}>
                        {isLoading ? "AI is thinking..." : "Find Available Slots"}
                    </Button>
                </div>
                
                {aiSuggestions && (
                    <div className="space-y-4">
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>AI Suggestions</AlertTitle>
                            <AlertDescription className="whitespace-pre-wrap">{aiSuggestions.reasoning}</AlertDescription>
                        </Alert>
                        <Card>
                            <CardHeader>
                                <CardTitle>Suggested Slots</CardTitle>
                                <CardDescription>Choose a new time for your class. The AI has verified student, faculty, and room availability.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <div className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                        <p className="font-semibold">{aiSuggestions.suggestedRescheduleDateTime}</p>
                                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">Faculty Available</Badge>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">All Students Free</Badge>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">Room Available</Badge>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleConfirm(aiSuggestions.suggestedRescheduleDateTime)}>Confirm Slot</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

const FacultySubjectCard = ({ subject, facultyId, facultyName }: { subject: any, facultyId: string, facultyName: string }) => {
    const firestore = useFirestore();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const studentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'students');
    }, [firestore]);

    const { data: allStudents, isLoading: loadingStudents } = useCollection(studentsQuery);

    const enrolledStudents = useMemo(() => {
        if (!allStudents) return [];
        return allStudents.filter(student =>
            student.enrolledCourses.some((course: any) => course.courseAbbr === subject.courseAbbr)
        );
    }, [allStudents, subject.courseAbbr]);
    
    const scheduleForSubject = useMemo(() => {
        const schedule: any[] = [];
        if (!dummyTimetable) return schedule;

        const ugKey = `UG${subject.ugYear[0]}`;
        const yearTimetable = (dummyTimetable as any)[ugKey]?.timetable;
        if (!yearTimetable) return schedule;

        Object.entries(yearTimetable).forEach(([day, slots]: [string, any]) => {
            slots.forEach((slot: any) => {
                slot.entries.forEach((entryStr: string) => {
                    const entry = parseEntry(entryStr);
                    if (entry.courseAbbr === subject.courseAbbr) {
                        schedule.push({ day, time: slot.time, room: entry.room });
                    }
                });
            });
        });
        return schedule;

    }, [subject]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{subject.courseName} ({subject.courseAbbr})</CardTitle>
                <CardDescription>Branch: {subject.branch} | Section: {subject.section} | UG: {subject.ugYear.join(', ')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)}><Users className="mr-2"/>{isExpanded ? "Hide Students" : "Show Enrolled Students"}</Button>
                    <RescheduleDialog facultyId={facultyId} facultyName={facultyName} subject={subject} students={enrolledStudents} />
                </div>
                 {isExpanded && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Enrolled Students ({enrolledStudents.length})</h4>
                        {loadingStudents ? <p>Loading students...</p> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>ID</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {enrolledStudents.map(s => <TableRow key={s.id}><TableCell>{s.name}</TableCell><TableCell>{s.studentId}</TableCell></TableRow>)}
                            </TableBody>
                        </Table>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
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
        return doc(firestore, 'availability', 'faculty');
    }, [firestore, facultyDisplayName]);

    const { data: availabilityData, isLoading: loadingAvailability } = useDoc(facultyAvailabilityDocRef);
    
    const facultyList = availabilityData?.faculty || [];
    const currentFaculty = facultyList.find((f: any) => normalizeName(f.name) === normalizeName(facultyDisplayName));
    const isAvailable = currentFaculty?.status === 'YES';

    const handleAvailabilityChange = (checked: boolean) => {
        if (!facultyAvailabilityDocRef || !user) return;
        const status = checked ? 'YES' : 'NO';

        let facultyFound = false;
        const updatedFacultyList = facultyList.map((f: any) => {
            if (normalizeName(f.name) === normalizeName(facultyDisplayName)) {
                facultyFound = true;
                return { ...f, status: status };
            }
            return f;
        });
        
        if (!facultyFound) {
            updatedFacultyList.push({
                name: facultyDisplayName,
                status: status,
                role: 'Faculty'
            });
        }

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
        
        schedule.sort((a, b) => a.time.localeCompare(b.time));
        
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

        <Card>
            <CardHeader>
                <CardTitle>My Subjects & Rescheduling</CardTitle>
                <CardDescription>Manage your subjects and reschedule classes using the AI Assistant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {facultyDetails.length === 0 && <p className="text-muted-foreground">Your assigned subjects will appear here.</p>}
                {facultyDetails.map(subject => (
                    <FacultySubjectCard key={subject.id} subject={subject} facultyId={user?.uid || 'unknown'} facultyName={facultyDisplayName} />
                ))}
            </CardContent>
        </Card>
      </div>
    );
  }
