'use server';

/**
 * @fileOverview An AI assistant for CampusOS users to answer their academic questions using real-time data.
 *
 * - campusAssistant - A function that handles the student AI assistant process.
 * - CampusAssistantInput - The input type for the campusAssistant function.
 * - CampusAssistantOutput - The return type for the campusAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as tools from '@/ai/tools';

const CampusAssistantInputSchema = z.object({
  query: z.string().describe('The question from the user.'),
  // We can add userId and role here to pass to tools if needed for authorization
});
export type CampusAssistantInput = z.infer<typeof CampusAssistantInputSchema>;

const CampusAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question.'),
});
export type CampusAssistantOutput = z.infer<typeof CampusAssistantOutputSchema>;

export async function campusAssistant(input: CampusAssistantInput): Promise<CampusAssistantOutput> {
  return campusAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'campusAssistantPrompt',
  input: {schema: CampusAssistantInputSchema},
  output: {schema: CampusAssistantOutputSchema},
  tools: [
      tools.getStudentSchedule,
      tools.getMedicalLeaveStatus,
      tools.listFacultyByCourse,
      tools.getPendingDirectorApprovals,
  ],
  prompt: `You are a helpful AI assistant for the CampusOS university platform. Your goal is to answer user questions about their academic life.
  You have access to tools that can query real-time data from the university's Firestore database.
  Use the tools whenever necessary to answer questions about schedules, statuses, faculty, or pending tasks.
  If you are asked a question for which you don't have a tool or the information, politely state that you cannot answer that.
  Be concise and helpful in your responses.

Question: {{{query}}}`,
});

const campusAssistantFlow = ai.defineFlow(
  {
    name: 'campusAssistantFlow',
    inputSchema: CampusAssistantInputSchema,
    outputSchema: CampusAssistantOutputSchema,
  },
  async input => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output();

    if (!output) {
      return { answer: "I'm sorry, I wasn't able to generate a response. Please try again." };
    }
    
    return output;
  }
);
