import { Timestamp } from 'firebase/firestore';

export interface QuizResult {
  id: string;
  certificationId: string;
  quizId: string;
  date?: Date;
  score?: number;
  overallScore: number;
  incorrectQuestions: string[];
  timestamp?: Date
}

export interface CategoryScores {
  [key: string]: {
    correct: number;
    total: number;
  };
}

export interface IncorrectQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number;
  explanation: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timestamp: Timestamp;
}

export interface QuizSession extends QuizResult {
  sessionId: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  answers: QuizAnswer[];
  categoryScores: CategoryScores;
}

// interface QuizSession {
//   sessionId: string;
//   userId: string;
//   quizId: string;
//   questions: string[];
//   currentQuestionIndex: number;
//   score: number;
//   timestamp: Timestamp;
// }
