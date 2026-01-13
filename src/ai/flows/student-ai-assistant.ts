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

const StudentAIAssistantInputSchema = z.object({
  query: z.string().describe('The question from the student.'),
});
export type StudentAIAssistantInput = z.infer<typeof StudentAIAssistantInputSchema>;

const StudentAIAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question.'),
});
export type StudentAIAssistantOutput = z.infer<typeof StudentAIAssistantOutputSchema>;

export async function studentAIAssistant(input: StudentAIAssistantInput): Promise<StudentAIAssistantOutput> {
  return studentAIAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studentAIAssistantPrompt',
  input: {schema: StudentAIAssistantInputSchema},
  output: {schema: StudentAIAssistantOutputSchema},
  prompt: `You are a helpful AI assistant for university students. Your goal is to answer their academic questions to the best of your ability.\n\nQuestion: {{{query}}}`,
});

const studentAIAssistantFlow = ai.defineFlow(
  {
    name: 'studentAIAssistantFlow',
    inputSchema: StudentAIAssistantInputSchema,
    outputSchema: StudentAIAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
