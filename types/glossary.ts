export interface GlossaryTerm {
  term: string;
  abbreviation?: string | null;
  previousTerm?: string | null;
  description: string;
  learnMoreUrl?: string;
  category: string;
} 