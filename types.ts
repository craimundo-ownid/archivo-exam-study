export interface Question {
  id: number;
  term: string;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0 for A, 1 for B, etc.
}

export interface QuizState {
  userName?: string;
  currentQuestionIndex: number;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
  isFinished: boolean;
  history: number[]; // Array of question IDs in order of presentation
  elapsedTime: number; // Time in seconds
  isPaused: boolean;
}

export interface QuizResult {
  id: string;
  timestamp: number;
  userName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  duration: number; // Time in seconds
}

export enum StorageKeys {
  QUIZ_STATE = 'archival_quiz_state_v1',
  QUIZ_HISTORY = 'archival_quiz_history_v1'
}