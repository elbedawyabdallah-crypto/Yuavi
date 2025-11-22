import type { CaseDetails } from './types';

export const pastCases: CaseDetails[] = [
  {
    caseId: 'case032',
    description: 'Shoplifting incident at the main entrance. Suspect wearing a black hoodie and carrying a distinctive red backpack.',
    relevantObjects: ['red backpack', 'black hoodie'],
    relevantPeople: ['unidentified male, approx. 6ft tall'],
  },
  {
    caseId: 'case015',
    description: 'Unauthorized access to a restricted area (Camera 3). A person with a blue jacket was seen near the server room.',
    relevantObjects: ['blue jacket'],
    relevantPeople: ['unidentified person'],
  },
  {
    caseId: 'case040',
    description: 'A silver sedan was reported driving erratically in the parking lot.',
    relevantObjects: ['silver sedan'],
    relevantPeople: [],
  },
];
