'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type ScheduledTask = {
  taskName: string;
  day: string;
  time: string;
  isClass: boolean;
};

type TimetableData = {
  [day: string]: ScheduledTask[];
};

interface TimetableDisplayProps {
  timetableData: TimetableData;
}

const timeSlots = [
    "08:45-09:45", "09:45-10:45", 
    "10:45-11:00", // BREAK
    "11:00-12:00", "12:00-13:00",
    "13:00-14:00", // LUNCH
    "14:15-15:15", "15:15-16:15",
    "16:15-16:30", // BREAK
    "16:30-17:30",
    "17:30-18:30"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimetableDisplay({ timetableData }: TimetableDisplayProps) {

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-full border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] border">Time</TableHead>
            {days.map(day => (
              <TableHead key={day} className="border text-center">{day}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map(slot => {
             if (slot === '10:45-11:00' || slot === '16:15-16:30') {
                 return (
                    <TableRow key={slot} className="bg-muted/50">
                        <TableCell className="font-medium border">{slot}</TableCell>
                        <TableCell colSpan={6} className="text-center font-semibold text-muted-foreground border">
                           BREAK
                        </TableCell>
                    </TableRow>
                )
             }
             if (slot === '13:00-14:00') {
                  return (
                    <TableRow key={slot} className="bg-muted/50">
                        <TableCell className="font-medium border">{slot}</TableCell>
                        <TableCell colSpan={6} className="text-center font-semibold text-muted-foreground border">
                           LUNCH
                        </TableCell>
                    </TableRow>
                )
             }


            return (
              <TableRow key={slot}>
                <TableCell className="font-medium border">{slot}</TableCell>
                {days.map(day => {
                  const daySchedule = timetableData[day] || [];
                  const entry = daySchedule.find(e => e.time === slot);
                  return (
                    <TableCell key={`${day}-${slot}`} className="border p-1 align-top h-24">
                        {entry && (
                             <Badge variant={entry.isClass ? "secondary" : "default"} className={`text-xs whitespace-nowrap ${!entry.isClass && 'bg-blue-600 hover:bg-blue-700'}`}>
                                {entry.taskName}
                            </Badge>
                        )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
