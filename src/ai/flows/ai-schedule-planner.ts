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

const prompt = ai.definePrompt({
  name: 'schedulePlanPrompt',
  input: {schema: SchedulePlanInputSchema},
  output: {schema: SchedulePlanOutputSchema},
  prompt: `You are an expert AI schedule planning assistant for university students. Your goal is to generate a personalized and conflict-free weekly schedule by intelligently placing personal tasks into the free slots of a student's fixed institute timetable.

**CRITICAL RULES:**
1.  **Institute Timetable is UNCHANGEABLE:** You MUST treat the provided institute timetable as a set of fixed, non-negotiable appointments. You CANNOT move, delete, or schedule anything over these existing classes.
2.  **Find Free Slots:** Your primary job is to identify all the empty time slots in the student's week.
3.  **Schedule Personal Tasks:** Place the user's personal tasks into these free slots based on their duration and priority. High-priority tasks must be scheduled first.
4.  **Distribute Workload:** Avoid cramming all tasks into one or two days. Distribute them reasonably throughout the week if possible.
5.  **Handle Conflicts:** If a task cannot be scheduled because there are no available slots that fit its duration, you MUST clearly state this in the 'reasoning' output. Explain which tasks could not be scheduled and why. Do not invent time slots or ignore the constraints.

**INPUT DATA:**

*   **Student ID:** {{{studentId}}}
*   **Fixed Institute Timetable (JSON):**
    \`\`\`json
    {{{instituteTimetable}}}
    \`\`\`
*   **Personal Tasks to Schedule (JSON):**
    \`\`\`json
    {{{jsonStringify personalTasks}}}
    \`\`\`

**YOUR TASK:**

Generate a complete weekly schedule as a JSON object where keys are the days of the week. For each day, provide an array of events, including both the original institute classes and the newly scheduled personal tasks. Also, provide a clear 'reasoning' text that explains your decisions.
`,
});

const generateSchedulePlanFlow = ai.defineFlow(
  {
    name: 'generateSchedulePlanFlow',
    inputSchema: SchedulePlanInputSchema,
    outputSchema: SchedulePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
