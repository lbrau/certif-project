export interface QuizResult {
  id: string;
  certificationId: string;
  date: string;
  categoryScores: CategoryScores;
  overallScore: number;
  incorrectQuestions: IncorrectQuestion[];
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