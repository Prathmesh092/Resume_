'use server';

/**
 * @fileOverview Implements the smart job matching flow using AI.
 *
 * - smartJobMatching - A function that matches users to job openings based on resume skills and experience.
 * - SmartJobMatchingInput - The input type for the smartJobMatching function.
 * - SmartJobMatchingOutput - The return type for the smartJobMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartJobMatchingInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content extracted from the user\u0027s resume.'),
  jobDescription: z.string().describe('The description of the job opening.'),
});
export type SmartJobMatchingInput = z.infer<typeof SmartJobMatchingInputSchema>;

const SmartJobMatchingOutputSchema = z.object({
  matchScore: z
    .number()
    .describe(
      'A score indicating the relevance of the job opening to the resume (0-100).'
    ),
  justification: z
    .string()
    .describe('A brief explanation of why the job is a good or bad match.'),
});
export type SmartJobMatchingOutput = z.infer<typeof SmartJobMatchingOutputSchema>;

export async function smartJobMatching(input: SmartJobMatchingInput): Promise<SmartJobMatchingOutput> {
  return smartJobMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartJobMatchingPrompt',
  input: {schema: SmartJobMatchingInputSchema},
  output: {schema: SmartJobMatchingOutputSchema},
  prompt: `You are an AI job matching expert. Given a resume and a job description, determine how well the job matches the applicant.

  Provide a matchScore from 0 to 100, and a short justification for the score.

  Resume:
  \u003cresume\u003e\n  {{resumeText}}
  \u003c/resume\u003e

  Job Description:
  \u003cjob_description\u003e\n  {{jobDescription}}
  \u003c/job_description\u003e`,
});

const smartJobMatchingFlow = ai.defineFlow(
  {
    name: 'smartJobMatchingFlow',
    inputSchema: SmartJobMatchingInputSchema,
    outputSchema: SmartJobMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
