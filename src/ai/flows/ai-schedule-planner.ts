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

const SchedulePlanInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  planType: z.enum(['day', 'month', 'semester', 'year']).describe('The type of schedule plan to generate.'),
  enrolledSubjects: z.array(z.string()).describe('The list of enrolled subjects.'),
  instituteTimetable: z.string().describe('The institute master timetable.'),
  roomAvailability: z.string().describe('The room availability information.'),
  personalEvents: z.string().optional().describe('The student\'s personal events.'),
});
export type SchedulePlanInput = z.infer<typeof SchedulePlanInputSchema>;

const SchedulePlanOutputSchema = z.object({
  schedule: z.string().describe('The generated schedule plan.'),
});
export type SchedulePlanOutput = z.infer<typeof SchedulePlanOutputSchema>;

export async function generateSchedulePlan(input: SchedulePlanInput): Promise<SchedulePlanOutput> {
  return generateSchedulePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'schedulePlanPrompt',
  input: {schema: SchedulePlanInputSchema},
  output: {schema: SchedulePlanOutputSchema},
  prompt: `You are an AI schedule planning assistant for university students. Your goal is to generate a personalized and conflict-free schedule plan based on the student's inputs.

  Student ID: {{{studentId}}}
  Plan Type: {{{planType}}}
  Enrolled Subjects: {{#each enrolledSubjects}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Institute Timetable: {{{instituteTimetable}}}
  Room Availability: {{{roomAvailability}}}
  Personal Events: {{{personalEvents}}}

  Please generate a detailed and conflict-free schedule plan, taking into account all the provided information. The schedule should be optimized for effective study and should avoid any clashes.
  Please be comprehensive and make sure that schedule is displayed in a readable way and does not contain any mistakes.
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
