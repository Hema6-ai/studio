'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TimetableDisplay } from '@/components/dashboard/timetable-display';
import { dummyTimetable } from '@/lib/data';

export default function TimetablesPage() {
    return (
        <Card>
           <CardHeader>
               <CardTitle>Timetable Management</CardTitle>
               <CardDescription>View and manage class timetables.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-8">
              {Object.entries(dummyTimetable).map(([ugYear, data]) => (
               <div key={ugYear}>
                   <h2 className="text-2xl font-bold mb-4 font-headline">{data.heading}</h2>
                   <TimetableDisplay timetableData={data.timetable} />
               </div>
              ))}
           </CardContent>
        </Card>
    );
}
