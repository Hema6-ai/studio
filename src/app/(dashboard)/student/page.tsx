'use client';
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
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { BotMessageSquare, BookCopy, FileUp } from "lucide-react";
  import { dummyTimetable } from "@/lib/data";
  import Image from "next/image";
  import Link from "next/link";
  import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
  import { collection, query, where } from "firebase/firestore";
  import { useMemo, useState } from "react";
  import { useToast } from "@/hooks/use-toast";
  import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
  import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { PlaceHolderImages } from "@/lib/placeholder-images";
  
  const parseEntry = (entry: string) => {
      const match = entry.match(/^([A-Z\d]+)-?([\w\d]+)?\s*(.*)$/);
      if(!match) return { courseAbbr: entry, section: 'Common', room: ''};
      const [, courseAbbr, section, room] = match;
      return { courseAbbrWithSection: section ? `${courseAbbr}-${section}` : courseAbbr, courseAbbr: courseAbbr, section: section || 'Common', room: room.trim() };
  }

  const ComplaintForm = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [hostel, setHostel] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hostel || !category || !description || !user || !firestore) {
            toast({ variant: 'destructive', title: "Missing Fields", description: "Please fill out all required fields."});
            return;
        }
        setIsSubmitting(true);

        let attachmentUrl = '';
        if (attachment) {
            try {
                const storage = getStorage();
                const storageRef = ref(storage, `complaints/${user.uid}/${Date.now()}-${attachment.name}`);
                const snapshot = await uploadBytes(storageRef, attachment);
                attachmentUrl = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error("File upload error:", error);
                toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload your file." });
                setIsSubmitting(false);
                return;
            }
        }
        
        const complaintsCollection = collection(firestore, 'hostelComplaints');
        addDocumentNonBlocking(complaintsCollection, {
            studentId: user.uid, // For audit purposes
            hostelName: hostel,
            category,
            description,
            attachments: attachmentUrl ? [attachmentUrl] : [],
            submittedAt: new Date().toISOString(),
            status: 'New',
            internalNotes: ''
        });

        toast({ title: "Complaint Submitted", description: "The SLC has been notified. Thank you." });
        setHostel('');
        setCategory('');
        setDescription('');
        setAttachment(null);
        setIsSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hostel">Hostel Name</Label>
                    <Select value={hostel} onValueChange={setHostel}>
                        <SelectTrigger id="hostel"><SelectValue placeholder="Select Hostel" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Boys Hostel 1">Boys Hostel 1</SelectItem>
                            <SelectItem value="Boys Hostel 2">Boys Hostel 2</SelectItem>
                             <SelectItem value="Girls Hostel 1">Girls Hostel 1</SelectItem>
                            <SelectItem value="Girls Hostel 2">Girls Hostel 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category"><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                            <SelectItem value="Water">Water</SelectItem>
                            <SelectItem value="Electricity">Electricity</SelectItem>
                            <SelectItem value="Safety">Safety</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="description">Complaint Description</Label>
                <Textarea id="description" placeholder="Please describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} required />
             </div>
             <div className="space-y-2">
                <Label htmlFor="attachment">Attach Image/File (Optional)</Label>
                <Input id="attachment" type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
             </div>
             <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
            </Button>
        </form>
    );
  }
  
  export default function StudentDashboard() {
    const firestore = useFirestore();
    const { user } = useUser();

    const studentQuery = useMemoFirebase(() => {
        if (!firestore || !user?.email) return null;
        return query(collection(firestore, 'students'), where('email', '==', user.email));
    }, [firestore, user]);
    
    const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'events'), where("status", "==", "Active")) : null, [firestore]);
    const rescheduleLogQuery = useMemoFirebase(() => firestore ? collection(firestore, 'rescheduleLog') : null, [firestore]);

    const {data: studentData, isLoading: studentLoading} = useCollection(studentQuery);
    const { data: events, isLoading: eventsLoading } = useCollection(eventsQuery);
    const { data: rescheduleLog, isLoading: loadingRescheduleLog } = useCollection(rescheduleLogQuery);
    
    const student = studentData?.[0];
    const eventPlaceholder = PlaceHolderImages.find(img => img.id === 'event-poster-placeholder');

    const studentSchedule = useMemo(() => {
        if(!student || !dummyTimetable) return [];
        
        const ugYearKey = `UG${student.ugYear}`;
        const yearTimetable = (dummyTimetable as any)[ugYearKey]?.timetable;
        if(!yearTimetable) return [];

        const enrolledCoursesSet = new Set(student.enrolledCourses.map((c: any) => {
             return c.section !== 'Common' ? `${c.courseAbbr}-${c.section}` : c.courseAbbr;
        }));
        
        const scheduleByDay: { [key: string]: any[] } = {};

        Object.keys(yearTimetable).forEach((day) => {
            scheduleByDay[day] = [];
            const daySchedule = yearTimetable[day];
            daySchedule.forEach((slot: any) => {
                const classEntries = slot.entries.map(parseEntry).filter((entry: any) => {
                    const isEnrolled = enrolledCoursesSet.has(entry.courseAbbrWithSection) || enrolledCoursesSet.has(entry.courseAbbr);
                    return isEnrolled;
                });
                
                if (classEntries.length > 0) {
                     const classInfo = {
                        time: slot.time,
                        subject: classEntries[0].courseAbbr,
                        venue: classEntries[0].room,
                     };
                     scheduleByDay[day].push(classInfo);
                }
            });
        });

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        let scheduleForToday = scheduleByDay[today] || [];
        
        if (rescheduleLog) {
            scheduleForToday = scheduleForToday.map(classInfo => {
                 const originalSlotString = `${today} ${classInfo.time}`;
                 const isRescheduled = rescheduleLog.some(log => 
                    log.subject === classInfo.subject && 
                    log.originalSlot === originalSlotString
                );
                return { ...classInfo, isRescheduled };
            });
        }
        
        return scheduleForToday;

    }, [student, rescheduleLog, dummyTimetable]);

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  
        <Card className="lg:col-span-2" id="schedule">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Here’s what your day looks like. Stay on track!</CardDescription>
          </CardHeader>
          <CardContent>
            {studentLoading ? <p>Loading schedule...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Venue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentSchedule.length > 0 ? studentSchedule.map((item, index) => (
                  <TableRow key={index} className={item.isRescheduled ? 'bg-red-100/50' : ''}>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>
                      {item.subject}
                      {item.isRescheduled && <Badge variant="destructive" className="ml-2">Rescheduled</Badge>}
                    </TableCell>
                    <TableCell>{item.venue}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">No classes scheduled for today.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
  
        <Card className="lg:col-span-2" id="feed">
          <CardHeader>
            <CardTitle>Campus Intelligence Feed</CardTitle>
            <CardDescription>The latest events and buzz around campus.</CardDescription>
          </CardHeader>
          <CardContent>
             {eventsLoading && <p>Loading events...</p>}
             {!eventsLoading && events?.length === 0 && <p className="text-muted-foreground text-center">No upcoming events.</p>}
            <Carousel opts={{ align: "start", loop: events && events.length > 1, }}>
              <CarouselContent>
                {events?.map((event: any, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/1">
                    <Card>
                      <CardHeader className="p-0 relative">
                         <Link href={event.registrationLink || '#'} target="_blank" rel="noopener noreferrer">
                            <Image
                            src={event.posterImageUrl || eventPlaceholder?.imageUrl || ''}
                            alt={event.title}
                            width={600}
                            height={400}
                            className="rounded-t-lg object-cover aspect-video"
                            data-ai-hint={eventPlaceholder?.imageHint || 'event poster'}
                            />
                         </Link>
                      </CardHeader>
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">{event.eventType}</Badge>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{new Date(event.eventDate).toLocaleDateString()} at {event.venue}</p>
                      </CardContent>
                       <CardFooter>
                           {event.registrationLink && (
                                <Button asChild className="w-full">
                                    <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                        Register Now
                                    </Link>
                                </Button>
                           )}
                        </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-ml-4" />
              <CarouselNext className="-mr-4"/>
            </Carousel>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4" id="complaints">
            <CardHeader>
                <CardTitle>Hostel Complaint Box</CardTitle>
                <CardDescription>Submit a confidential complaint about hostel issues. This form is anonymous to the SLC.</CardDescription>
            </CardHeader>
            <CardContent>
                <ComplaintForm />
            </CardContent>
        </Card>
  
      </div>
    );
  }

    