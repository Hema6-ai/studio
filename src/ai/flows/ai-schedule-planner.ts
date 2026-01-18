'use server';

/**
 * @fileOverview A Genkit flow for generating personalized schedule plans for students.
 *
 * - generateSchedulePlan - A function that generates a personalized schedule plan.
 * - SchedulePlanInput - The input type for the generateSchedulePlan function.
 * - SchedulePlanOutput - The return type for the generateSchedulePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import academicConfig from '@/lib/academic_config.json';

const PersonalTaskSchema = z.object({
  name: z.string().describe('The name of the personal task or study goal.'),
  duration: z.number().describe('The duration of the task in hours.'),
  priority: z.enum(['Low', 'Medium', 'High']).describe('The priority of the task.'),
  preferredDays: z.array(z.string()).optional().describe('Optional preferred days for the task (e.g., ["Monday", "Wednesday"]).'),
});

const SchedulePlanInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  instituteTimetable: z.string().describe('The student\'s fixed weekly institute timetable in a structured format (e.g., JSON string). This is non-negotiable.'),
  personalTasks: z.array(PersonalTaskSchema).describe('An array of personal tasks and study goals to be scheduled.'),
});
export type SchedulePlanInput = z.infer<typeof SchedulePlanInputSchema>;


const ScheduledTaskSchema = z.object({
  taskName: z.string(),
  day: z.string(),
  time: z.string(),
  isClass: z.boolean(),
});

const SchedulePlanOutputSchema = z.object({
  schedule: z.record(z.array(ScheduledTaskSchema)).describe('The generated schedule plan, with days of the week as keys. Each day has an array of scheduled tasks or classes.'),
  reasoning: z.string().describe('An explanation of how the schedule was constructed, including how priorities were handled and why any tasks could not be scheduled.'),
});
export type SchedulePlanOutput = z.infer<typeof SchedulePlanOutputSchema>;

export async function generateSchedulePlan(input: SchedulePlanInput): Promise<SchedulePlanOutput> {
  return generateSchedulePlanFlow(input);
}


// This is the new implementation, replacing the prompt-based one.
const generateSchedulePlanFlow = ai.defineFlow(
  {
    name: 'generateSchedulePlanFlow',
    inputSchema: SchedulePlanInputSchema,
    outputSchema: SchedulePlanOutputSchema,
  },
  async (input) => {
    try {
        const instituteTimetable = JSON.parse(input.instituteTimetable);
        const personalTasks = input.personalTasks;

        // 1. Initialize schedule grid
        const dayMap: { [key: string]: string } = {
            MON: "Monday", TUE: "Tuesday", WED: "Wednesday",
            THU: "Thursday", FRI: "Friday", SAT: "Saturday"
        };
        const weekDays = academicConfig.workingDays.map(d => dayMap[d]).filter(Boolean);
        const timeSlots = academicConfig.timeSlots.map(slot => `${slot.start}-${slot.end}`);
        
        // Create a deep copy to work with
        const schedule: SchedulePlanOutput['schedule'] = JSON.parse(JSON.stringify(instituteTimetable));
        weekDays.forEach(day => {
            if (!schedule[day]) {
                schedule[day] = [];
            }
        });

        const isSlotOccupied = (day: string, time: string): boolean => {
            return schedule[day]?.some(task => task.time === time) ?? false;
        };

        // 2. Sort personal tasks by priority
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        const sortedTasks = [...personalTasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        const unscheduledTasks: string[] = [];
        const scheduledTasks: string[] = [];
        
        // 3. Schedule tasks greedily
        for (const task of sortedTasks) {
            let isTaskScheduled = false;
            const taskDuration = Math.ceil(task.duration);

            for (const day of weekDays) {
                if (isTaskScheduled) break;
                for (let i = 0; i <= timeSlots.length - taskDuration; i++) {
                    const potentialSlots = timeSlots.slice(i, i + taskDuration);
                    const isBlockFree = potentialSlots.every(slot => !isSlotOccupied(day, slot));
                    
                    let isContinuous = true;
                    for (let j = 0; j < potentialSlots.length - 1; j++) {
                        const currentSlotEnd = potentialSlots[j].split('-')[1];
                        const nextSlotStart = potentialSlots[j+1].split('-')[0];
                        if (currentSlotEnd !== nextSlotStart) {
                            isContinuous = false;
                            break;
                        }
                    }
                    
                    if (isBlockFree && isContinuous) {
                        for (const slot of potentialSlots) {
                            schedule[day].push({
                                taskName: task.name,
                                time: slot,
                                isClass: false,
                                day: day,
                            });
                        }
                        scheduledTasks.push(`'${task.name}' (${task.duration}h, ${task.priority} priority)`);
                        isTaskScheduled = true;
                        break; 
                    }
                }
            }
            if (!isTaskScheduled) {
                unscheduledTasks.push(`'${task.name}' (${task.duration}h)`);
            }
        }

        // 4. Sort final schedule by time for display
        for (const day in schedule) {
            schedule[day].sort((a, b) => a.time.localeCompare(b.time));
        }

        // 5. Generate reasoning
        let reasoning = "The AI schedule was generated based on the following logic:\n\n";
        reasoning += "1. Your institute classes were treated as fixed, unchangeable appointments.\n";
        reasoning += "2. Your personal tasks were sorted by priority (High > Medium > Low).\n";
        reasoning += "3. The scheduler then found the first available free time blocks to fit each task, starting with the highest priority ones.\n\n";

        if (scheduledTasks.length > 0) {
            reasoning += `Successfully scheduled the following tasks: ${scheduledTasks.join(', ')}.\n`;
        } else if (personalTasks.length > 0) {
            reasoning += "No personal tasks were able to be scheduled.\n";
        }

        if (unscheduledTasks.length > 0) {
            reasoning += `\nThe following tasks could not be scheduled due to a lack of contiguous free time: ${unscheduledTasks.join(', ')}. You may need to break them into smaller tasks or free up more time.`;
        } else if (personalTasks.length > 0) {
            reasoning += "\nAll tasks were successfully scheduled!";
        } else {
             reasoning += "No personal tasks were provided to schedule.";
        }

        return { schedule, reasoning };
    } catch (e: any) {
        console.error("Error in generateSchedulePlanFlow:", e);
        const reasoning = `An unexpected error occurred while generating the schedule: ${e.message}. Please check your inputs and try again.`;
        return { schedule: JSON.parse(input.instituteTimetable), reasoning };
    }
  }
);
