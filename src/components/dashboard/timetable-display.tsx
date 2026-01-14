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

type TimetableEntry = {
  time: string;
  entries: string[];
};

type DaySchedule = TimetableEntry[];

type TimetableData = {
  [day: string]: DaySchedule;
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

const parseEntry = (entry: string) => {
    if (entry.toUpperCase() === 'BREAK' || entry.toUpperCase() === 'LUNCH' || entry.toUpperCase() === 'FACULTY MEETING') {
        return { type: entry.toUpperCase(), details: '' };
    }
    // Regex to capture course, section, and room
    const match = entry.match(/([A-Z]+)(\d*)\s*(.*)/);
    if(match) {
        const [, course, section, room] = match;
        let details = `${course}`;
        if(section) details += `-${section}`;
        if(room) details += ` (${room.trim()})`;
        return { type: 'CLASS', details };
    }
    // Fallback for formats like EDL1/G09
    const slashMatch = entry.match(/([A-Z]+)(\d*)\/(.*)/);
     if(slashMatch) {
        const [, course, section, room] = slashMatch;
        let details = `${course}`;
        if(section) details += `-${section}`;
        if(room) details += ` (${room.trim()})`;
        return { type: 'CLASS', details };
    }
    return { type: 'UNKNOWN', details: entry };
}


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
             const firstDaySchedule = timetableData.Monday || [];
             const breakEntry = firstDaySchedule.find(e => e.time === slot)?.entries[0]?.toUpperCase();
             const isBreak = breakEntry === 'BREAK';
             const isLunch = breakEntry === 'LUNCH';

             if(isBreak || isLunch) {
                return (
                    <TableRow key={slot} className="bg-muted/50">
                        <TableCell className="font-medium border">{slot}</TableCell>
                        <TableCell colSpan={6} className="text-center font-semibold text-muted-foreground border">
                           {isBreak ? 'BREAK' : 'LUNCH'}
                        </TableCell>
                    </TableRow>
                )
             }

            return (
              <TableRow key={slot}>
                <TableCell className="font-medium border">{slot}</TableCell>
                {days.map(day => {
                  const daySchedule = timetableData[day as keyof typeof timetableData] || [];
                  const entry = daySchedule.find(e => e.time === slot);
                  return (
                    <TableCell key={`${day}-${slot}`} className="border p-1 align-top h-24">
                        <div className="flex flex-wrap gap-1">
                            {entry?.entries.map((item, index) => {
                                const {type, details} = parseEntry(item);
                                if (type === 'CLASS') {
                                    return <Badge key={index} variant="secondary" className="text-xs whitespace-nowrap">{details}</Badge>
                                }
                                 if (type === 'FACULTY MEETING') {
                                    return <Badge key={index} variant="destructive" className="text-xs whitespace-nowrap">{details || type}</Badge>
                                }
                                return null;
                            })}
                        </div>
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
