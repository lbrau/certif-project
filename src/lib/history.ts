import type { QuizResult } from '@/types/quiz';

const STORAGE_KEY = 'quizHistory';

// Charge l'historique depuis le localStorage
function loadFromStorage(): QuizResult[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Sauvegarde l'historique dans le localStorage
function saveToStorage(history: QuizResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans le localStorage:', error);
  }
}

let history: QuizResult[] = loadFromStorage();

export function saveQuizResult(result: QuizResult): void {
  try {
    // Sauvegarde en local
    history = [result, ...history];
    saveToStorage(history);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du résultat:', error);
  }
}

export function getQuizHistory(): QuizResult[] {
  return history;
}