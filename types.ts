export type BloomLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';

export interface QuestionData {
  id: string;
  question: string;
  answer: string;
  marks: number;
  level: BloomLevel;
}

export interface SimilarityPair {
  q1Id: string;
  q2Id: string;
  q1Text: string;
  q2Text: string;
  score: number;
}

export interface ReviewResult {
  questionId: string;
  isTaxonomyCorrect: boolean;
  isAnswerSufficient: boolean;
  isWithinContext: boolean;
  remark: string;
  contextRemark: string;
  suggestedQuestion: string;
  suggestedAnswer: string;
  suggestedLevel: BloomLevel;
  suggestedMarks: number;
  status: 'valid' | 'warning' | 'error';
}

export interface AppState {
  questions: QuestionData[];
  context: string;
  reviews: Record<string, ReviewResult>;
  similarPairs: SimilarityPair[];
  similarityThreshold: number;
  isProcessing: boolean;
  error: string | null;
}