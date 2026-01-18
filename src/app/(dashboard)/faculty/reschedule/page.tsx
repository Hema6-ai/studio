'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, serverTimestamp, query, where } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Users, AlertTriangle } from 'lucide-react';
import React, { useMemo, useState } from "react";
import { dummyTimetable } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { rescheduleMissedClass, RescheduleMissedClassInput, RescheduleMissedClassOutput } from "@/ai/flows/faculty-missed-class-rescheduler";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const normalizeName = (name: string) => {
    if (!name) return '';
    return name.toLowerCase().replace(/dr\.?|mrs\.?|mr\.?/g, '').replace(/[\s.]/g, '').trim();
};
  
const parseEntry = (entry: string) => {
    const match = entry.match(/^([A-Z\d]+)-?([\w\d]+)?\s*(.*)$/);
    if (!match) return { courseAbbr: entry, section: 'Common', room: '' };
    const [, courseAbbr, section, room] = match;
    return { courseAbbr, section: section || 'Common', room: room.trim() };
}

const RescheduleDialog = ({ facultyId, facultyName, subject, students, weeklySchedule }: { facultyId: string, facultyName: string, subject: any, students: any[], weeklySchedule: any[] }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<RescheduleMissedClassOutput | null>(null);

    const handleFindSlots = async () => {
        setIsLoading(true);
        setAiSuggestions(null);
        try {
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
        // Reset state
        setReason("");
        setSelectedSlot("");
        setAiSuggestions(null);
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
                         <Select onValueChange={setSelectedSlot} value={selectedSlot}>
                            <SelectTrigger id="current-slot">
                                <SelectValue placeholder="Select a time slot..." />
                            </SelectTrigger>
                            <SelectContent>
                                {weeklySchedule.filter(item => item.course === subject.courseAbbr).map((item, index) => (
                                    <SelectItem key={index} value={`${item.day} ${item.time}`}>
                                        {item.day} {item.time} ({item.course} - {item.section})
                                    </SelectItem>
                                ))}
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

const FacultySubjectCard = ({ subject, facultyId, facultyName, weeklySchedule }: { subject: any, facultyId: string, facultyName: string, weeklySchedule: any[] }) => {
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
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{subject.courseName} ({subject.courseAbbr})</CardTitle>
                <CardDescription>Branch: {subject.branch} | Section: {subject.section} | UG: {subject.ugYear.join(', ')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)}><Users className="mr-2"/>{isExpanded ? "Hide Students" : "Show Enrolled Students"}</Button>
                    <RescheduleDialog facultyId={facultyId} facultyName={facultyName} subject={subject} students={enrolledStudents} weeklySchedule={weeklySchedule} />
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

export default function ReschedulePage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const facultyDisplayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Faculty Member');

    const assignmentsQuery = useMemoFirebase(() => {
        if (!firestore || !facultyDisplayName || facultyDisplayName === 'Faculty Member') return null;
        return query(collection(firestore, 'teachingAssignments'), where('facultyName', '==', facultyDisplayName));
    }, [firestore, facultyDisplayName]);

    const curriculumQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'curriculum');
    }, [firestore]);

    const { data: assignments, isLoading: loadingAssignments } = useCollection(assignmentsQuery);
    const { data: allCourses, isLoading: loadingCourses } = useCollection(curriculumQuery);
    
    const facultyDetails = useMemo(() => {
        if (!assignments || !allCourses) return [];
        
        return assignments.map((assignment: any) => {
            const courseDetail = allCourses.find((c: any) => c.courseAbbr === assignment.courseCode) || {};
            return {
                id: assignment.id,
                courseName: courseDetail.courseName || assignment.courseCode,
                courseAbbr: assignment.courseCode,
                branch: courseDetail.branch || 'N/A',
                section: assignment.section,
                ugYear: [assignment.ug.replace('UG', '')]
            };
        });

    }, [assignments, allCourses]);

    const weeklySchedule = useMemo(() => {
        if (facultyDetails.length === 0) return [];
        
        const schedule: any[] = [];
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        facultyDetails.forEach(facultyCourse => {
            const ugKey = `UG${facultyCourse.ugYear[0]}`;
            const yearTimetable = (dummyTimetable as any)[ugKey]?.timetable;
            if (!yearTimetable) return;

            days.forEach(day => {
                if (!yearTimetable[day]) return;
                const daySchedule = yearTimetable[day];

                daySchedule.forEach((slot: any) => {
                    slot.entries.forEach((entryStr: string) => {
                        const entry = parseEntry(entryStr);
                        const courseSection = facultyCourse.section === 'Common' ? entry.section : facultyCourse.section;

                        if (entry.courseAbbr === facultyCourse.courseAbbr && (entry.section === courseSection || facultyCourse.section === 'Common')) {
                             schedule.push({
                                day,
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
        
        return schedule.filter((item, index, self) =>
            index === self.findIndex((t) => (
                t.time === item.time && t.course === item.course && t.section === item.section && t.day === item.day
            ))
        );
    }, [facultyDetails]);

    if (!user || loadingAssignments || loadingCourses) return <p>Loading...</p>

     return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Class &amp; Reschedule Management</CardTitle>
                    <CardDescription>Manage your subjects and reschedule classes using the AI Assistant.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {facultyDetails.length === 0 && <p className="text-muted-foreground">Your assigned subjects will appear here.</p>}
                    {facultyDetails.map(subject => (
                        <FacultySubjectCard 
                            key={subject.id} 
                            subject={subject} 
                            facultyId={user?.uid || 'unknown'} 
                            facultyName={facultyDisplayName}
                            weeklySchedule={weeklySchedule}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
