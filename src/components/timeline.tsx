'use client';

import Image from 'next/image';
import type { SimilarityResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface TimelineProps {
  results: SimilarityResult[];
}

export default function Timeline({ results }: TimelineProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <Video className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Appearances Found</h3>
        <p className="mt-2 text-sm text-muted-foreground">The similarity search did not return any results.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-border after:left-0">
            {results.map((result, index) => (
              <div key={index} className="relative grid grid-cols-[auto_1fr] items-start gap-4 pb-8">
                <div className="absolute left-[-24px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <Video className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="col-start-2">
                  <time className="text-sm font-medium leading-none text-muted-foreground">{result.timestamp}</time>
                  <h3 className="mt-1 text-lg font-semibold">{result.videoName}</h3>
                  <div className="mt-2 flex items-start space-x-4">
                    <Image
                      src={result.imageUrl}
                      alt={`Appearance at ${result.timestamp}`}
                      width={100}
                      height={100}
                      data-ai-hint={result.imageHint}
                      className="rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        A person or object with high similarity was detected.
                      </p>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
