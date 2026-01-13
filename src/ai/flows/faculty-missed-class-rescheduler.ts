'use server';
/**
 * @fileOverview A missed class rescheduling AI agent for faculty members.
 *
 * - rescheduleMissedClass - A function that handles the missed class rescheduling process.
 * - RescheduleMissedClassInput - The input type for the rescheduleMissedClass function.
 * - RescheduleMissedClassOutput - The return type for the rescheduleMissedClass function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RescheduleMissedClassInputSchema = z.object({
  facultyId: z.string().describe('The ID of the faculty member.'),
  missedClassDateTime: z.string().describe('The date and time of the missed class.'),
  subject: z.string().describe('The subject of the missed class.'),
  enrolledStudents: z.array(z.string()).describe('The list of student IDs enrolled in the class.'),
  instituteTimetableDataUri: z
    .string()
    .describe(
      'The institute master timetable, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  roomAvailabilityDataUri: z
    .string()
    .describe(
      'The room availability data, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type RescheduleMissedClassInput = z.infer<typeof RescheduleMissedClassInputSchema>;

const RescheduleMissedClassOutputSchema = z.object({
  suggestedRescheduleDateTime: z
    .string()
    .describe('The suggested date and time for the rescheduled class.'),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggested reschedule time, considering faculty availability, student schedules, and room availability.'
    ),
});
export type RescheduleMissedClassOutput = z.infer<typeof RescheduleMissedClassOutputSchema>;

export async function rescheduleMissedClass(
  input: RescheduleMissedClassInput
): Promise<RescheduleMissedClassOutput> {
  return rescheduleMissedClassFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rescheduleMissedClassPrompt',
  input: {schema: RescheduleMissedClassInputSchema},
  output: {schema: RescheduleMissedClassOutputSchema},
  prompt: `You are an AI assistant helping faculty members reschedule missed classes.

You will be provided with the faculty ID, the date and time of the missed class, the subject, a list of enrolled student IDs, the institute timetable, and room availability data.  Your goal is to find the best alternative slot for the rescheduled class, taking into account faculty availability, student schedules, and room availability.

Faculty ID: {{{facultyId}}}
Missed Class Date/Time: {{{missedClassDateTime}}}
Subject: {{{subject}}}
Enrolled Students: {{#each enrolledStudents}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Institute Timetable: {{media url=instituteTimetableDataUri}}
Room Availability: {{media url=roomAvailabilityDataUri}}

Consider all the above information and constraints to suggest the best possible reschedule date and time. Explain your reasoning for the suggested time slot.
`,
});

const rescheduleMissedClassFlow = ai.defineFlow(
  {
    name: 'rescheduleMissedClassFlow',
    inputSchema: RescheduleMissedClassInputSchema,
    outputSchema: RescheduleMissedClassOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
