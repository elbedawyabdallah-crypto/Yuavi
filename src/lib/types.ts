export type SemanticSearchResult = {
  startTime: number;
  endTime: number;
  description: string;
};

export type SimilarityResult = {
  videoName: string;
  timestamp: string;
  confidence: number;
  imageUrl: string;
  imageHint: string;
};

export type CaseDetails = {
  caseId: string;
  description: string;
  relevantObjects: string[];
  relevantPeople: string[];
  videoSegments?: string[];
};

export type CaseLink = {
  linkedCaseId: string;
  reason: string;
};
