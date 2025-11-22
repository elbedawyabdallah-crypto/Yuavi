'use server';
/**
 * @fileOverview Implements similarity search functionality to find all appearances of a person or object across CCTV footage.
 *
 * - similaritySearch - An exported function that takes an image and searches for similar appearances in video data.
 * - SimilaritySearchInput - The input type for the similaritySearch function.
 * - SimilaritySearchOutput - The return type for the similaritySearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimilaritySearchInputSchema = z.object({
  referenceImage: z
    .string()
    .describe(
      "A reference image of the person or object to search for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  videoDataUri: z
    .string()
    .describe(
      "A CCTV video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SimilaritySearchInput = z.infer<typeof SimilaritySearchInputSchema>;

const SimilaritySearchOutputSchema = z.object({
  results: z.array(
    z.object({
      videoName: z.string().describe('The name of the video where the match was found.'),
      timestamp: z.string().describe('The timestamp in the video where the match was found.'),
      confidence: z.number().describe('The confidence score of the match (0-1).'),
    })
  ).describe('An array of search results, each containing the video name, timestamp, and confidence score.'),
});
export type SimilaritySearchOutput = z.infer<typeof SimilaritySearchOutputSchema>;

export async function similaritySearch(input: SimilaritySearchInput): Promise<SimilaritySearchOutput> {
  return similaritySearchFlow(input);
}

const similaritySearchPrompt = ai.definePrompt({
  name: 'similaritySearchPrompt',
  input: {schema: SimilaritySearchInputSchema},
  output: {schema: SimilaritySearchOutputSchema},
  prompt: `You are an AI assistant designed to identify similar people or objects in a collection of CCTV videos based on a reference image.

Given a reference image and a video, analyze the video footage and return all instances where the person or object in the reference image appears. Consider clothing, body shape, and other visual cues to improve accuracy, especially when the face is unclear.

Reference Image: {{media url=referenceImage}}
Video: {{media url=videoDataUri}}

Return the results in the following JSON format:
{{output}}`,
});

const similaritySearchFlow = ai.defineFlow(
  {
    name: 'similaritySearchFlow',
    inputSchema: SimilaritySearchInputSchema,
    outputSchema: SimilaritySearchOutputSchema,
  },
  async input => {
    const {output} = await similaritySearchPrompt(input);
    return output!;
  }
);
