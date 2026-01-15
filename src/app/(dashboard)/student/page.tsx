'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import { Badge } from "@/components/ui/badge";
  import {
    BotMessageSquare,
    BookCopy,
  } from "lucide-react";
  import { dummyAnnouncements, dummyTimetable } from "@/lib/data";
  import Image from "next/image";
  import Link from "next/link";
  import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
  import { collection, query, where } from "firebase/firestore";
  import { useMemo } from "react";
  
  const parseEntry = (entry: string) => {
      const match = entry.match(/^([A-Z\d]+)-?([\w\d]+)?\s*(.*)$/);
      if(!match) return { courseAbbr: entry, section: 'Common', room: ''};
      const [, courseAbbr, section, room] = match;
      return { courseAbbrWithSection: section ? `${courseAbbr}-${section}` : courseAbbr, courseAbbr: courseAbbr, section: section || 'Common', room: room.trim() };
  }
  
  export default function StudentDashboard() {
    const firestore = useFirestore();
    const { user } = useUser();

    const studentQuery = useMemoFirebase(() => {
        if (!firestore || !user?.email) return null;
        return query(collection(firestore, 'students'), where('email', '==', user.email));
    }, [firestore, user]);

    const {data: studentData, isLoading: studentLoading} = useCollection(studentQuery);
    const student = studentData?.[0];

    const rescheduleLogQuery = useMemoFirebase(() => firestore ? collection(firestore, 'rescheduleLog') : null, [firestore]);
    const { data: rescheduleLog, isLoading: loadingRescheduleLog } = useCollection(rescheduleLogQuery);

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
                const todaysClasses = slot.entries.map(parseEntry).filter((entry: any) => {
                    const isEnrolled = enrolledCoursesSet.has(entry.courseAbbrWithSection) || enrolledCoursesSet.has(entry.courseAbbr);
                    return isEnrolled;
                });
                
                if (todaysClasses.length > 0) {
                     const classInfo = {
                        time: slot.time,
                        subject: todaysClasses[0].courseAbbr,
                        venue: todaysClasses[0].room,
                        isRescheduled: false,
                     };
                     
                     // Check if this class was rescheduled
                     const rescheduled = rescheduleLog?.find(log => log.subject === classInfo.subject && log.originalSlot === `${day} ${classInfo.time}`);
                     if(rescheduled) {
                        classInfo.isRescheduled = true;
                        // For simplicity, we just mark it. A real app might hide it and add the new one.
                        // Or change its time/venue here.
                     }

                     scheduleByDay[day].push(classInfo);
                }
            });
        });

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return scheduleByDay[today] || [];

    }, [student, rescheduleLog]);

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
                  <TableRow key={index}>
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
            <CardDescription>The latest buzz around campus. Don't miss out!</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel opts={{ align: "start", loop: true, }}>
              <CarouselContent>
                {dummyAnnouncements.map((ann, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/1">
                    <Card>
                      <CardHeader className="p-0">
                        <Image
                          src={ann.image.imageUrl}
                          alt={ann.image.description}
                          width={600}
                          height={400}
                          className="rounded-t-lg object-cover aspect-video"
                          data-ai-hint={ann.image.imageHint}
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">{ann.category}</Badge>
                        <h3 className="font-semibold">{ann.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{ann.date}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-ml-4" />
              <CarouselNext className="-mr-4"/>
            </Carousel>
          </CardContent>
        </Card>
  
      </div>
    );
  }
