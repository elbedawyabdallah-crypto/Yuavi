'use server';

/**
 * @fileOverview Implements the semantic video search flow for the InsightWatch application.
 * Allows users to search CCTV footage using natural language queries to quickly locate specific events or objects.
 *
 * - semanticVideoSearch - A function that initiates the video search process.
 * - SemanticVideoSearchInput - The input type for the semanticVideoSearch function.
 * - SemanticVideoSearchOutput - The return type for the semanticVideoSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SemanticVideoSearchInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A CCTV video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The natural language query to search for in the video.'),
});
export type SemanticVideoSearchInput = z.infer<typeof SemanticVideoSearchInputSchema>;

const SemanticVideoSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      startTime: z.number().describe('The start time of the event in seconds.'),
      endTime: z.number().describe('The end time of the event in seconds.'),
      description: z.string().describe('A description of the event found.'),
    })
  ).describe('An array of search results.'),
});
export type SemanticVideoSearchOutput = z.infer<typeof SemanticVideoSearchOutputSchema>;

export async function semanticVideoSearch(input: SemanticVideoSearchInput): Promise<SemanticVideoSearchOutput> {
  return semanticVideoSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'semanticVideoSearchPrompt',
  input: {schema: SemanticVideoSearchInputSchema},
  output: {schema: SemanticVideoSearchOutputSchema},
  prompt: `You are an expert in analyzing CCTV footage. You will receive a video and a search query. Your goal is to identify all segments in the video that are relevant to the search query.

Video: {{media url=videoDataUri}}

Query: {{{query}}}

Return the results in the following JSON format:

{{output}}

Each result should include the start and end time of the event in seconds, and a description of the event found.`,
});

const semanticVideoSearchFlow = ai.defineFlow(
  {
    name: 'semanticVideoSearchFlow',
    inputSchema: SemanticVideoSearchInputSchema,
    outputSchema: SemanticVideoSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
