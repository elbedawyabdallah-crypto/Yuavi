import { config } from 'dotenv';
config();

import '@/ai/flows/case-linking.ts';
import '@/ai/flows/similarity-search.ts';
import '@/ai/flows/semantic-video-search.ts';