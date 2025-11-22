// src/ai/flows/case-linking.ts
'use server';
/**
 * @fileOverview A flow to identify links between different cases based on similar people or objects detected in the videos.
 *
 * - linkCases - A function that handles the case linking process.
 * - LinkCasesInput - The input type for the linkCases function.
 * - LinkCasesOutput - The return type for the linkCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CaseDetailsSchema = z.object({
  caseId: z.string().describe('The unique identifier for the case.'),
  caseName: z.string().describe('The name or title of the case.'),
  timestamp: z.string().describe('The ISO 8601 timestamp when the case was created or occurred.'),
  place: z.string().describe('The location where the case events took place.'),
  description: z.string().describe('A description of the case details.'),
  relevantObjects: z.array(z.string()).describe('List of relevant objects detected in the case.'),
  relevantPeople: z.array(z.string()).describe('List of relevant people detected in the case.'),
  videoSegments: z.array(z.string()).describe('List of video segment identifiers related to the case.'),
});

const LinkCasesInputSchema = z.object({
  newCase: CaseDetailsSchema.describe('Details of the new case to be linked.'),
  pastCases: z.array(CaseDetailsSchema).describe('Details of past cases to compare against.'),
});

export type LinkCasesInput = z.infer<typeof LinkCasesInputSchema>;

const CaseLinkSchema = z.object({
  linkedCaseId: z.string().describe('The ID of the linked case.'),
  reason: z.string().describe('The reason for linking the cases, including specific objects or people in common.'),
});

const LinkCasesOutputSchema = z.object({
  links: z.array(CaseLinkSchema).describe('An array of case links identified by the system.'),
});

export type LinkCasesOutput = z.infer<typeof LinkCasesOutputSchema>;

export async function linkCases(input: LinkCasesInput): Promise<LinkCasesOutput> {
  return linkCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'linkCasesPrompt',
  input: {schema: LinkCasesInputSchema},
  output: {schema: LinkCasesOutputSchema},
  prompt: `You are an expert security analyst tasked with identifying links between different security cases based on video footage analysis.

  You are given a new case and a list of past cases. Your goal is to identify any potential links between the new case and the past cases based on similar objects or people detected in the videos.

  New Case Details:
  Case ID: {{{newCase.caseId}}}
  Case Name: {{{newCase.caseName}}}
  Timestamp: {{{newCase.timestamp}}}
  Location: {{{newCase.place}}}
  Description: {{{newCase.description}}}
  Relevant Objects: {{#each newCase.relevantObjects}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Relevant People: {{#each newCase.relevantPeople}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Video Segments: {{#each newCase.videoSegments}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Past Cases:
  {{#each pastCases}}
  Case ID: {{{caseId}}}
  Case Name: {{{caseName}}}
  Timestamp: {{{timestamp}}}
  Location: {{{place}}}
  Description: {{{description}}}
  Relevant Objects: {{#each relevantObjects}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Relevant People: {{#each relevantPeople}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Video Segments: {{#each videoSegments}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{/each}}

  Identify any links between the new case and the past cases. Provide the Case ID of the linked case and a detailed reason for the link, including specific objects or people in common.
  If there are no links, return an empty array for links.

  Example Output:
  {
    "links": [
      {
        "linkedCaseId": "case032",
        "reason": "This bag appears in case 032 and today’s case 041."
      },
      {
        "linkedCaseId": "case015",
        "reason": "This person appeared last week in camera 3, case 015."
      }
    ]
  }
  `,
});

const linkCasesFlow = ai.defineFlow(
  {
    name: 'linkCasesFlow',
    inputSchema: LinkCasesInputSchema,
    outputSchema: LinkCasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
