'use server';

/**
 * @fileOverview An AI assistant for students to answer their academic questions.
 *
 * - studentAIAssistant - A function that handles the student AI assistant process.
 * - StudentAIAssistantInput - The input type for the studentAIAssistant function.
 * - StudentAIAssistantOutput - The return type for the studentAIAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { campusAssistant } from './campus-assistant';

const StudentAIAssistantInputSchema = z.object({
  query: z.string().describe('The question from the student.'),
});
export type StudentAIAssistantInput = z.infer<typeof StudentAIAssistantInputSchema>;

const StudentAIAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question.'),
});
export type StudentAIAssistantOutput = z.infer<typeof StudentAIAssistantOutputSchema>;

/**
 * @deprecated Use campusAssistant instead.
 */
export async function studentAIAssistant(input: StudentAIAssistantInput): Promise<StudentAIAssistantOutput> {
  return campusAssistant(input);
}
