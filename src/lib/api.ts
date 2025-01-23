import { toast } from 'sonner';
import type { QuizResult } from '@/types/quiz';

// Utilisation d'une URL relative pour le proxy
const API_URL = '/api';

export async function saveQuizResultToServer(result: QuizResult): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    toast.success('Résultat sauvegardé avec succès');
  } catch (error) {
    console.error('Erreur API:', error);
    // On ne montre pas de toast d'erreur pour éviter de perturber l'expérience utilisateur
    // puisque les résultats sont toujours sauvegardés en local
  }
}

export async function fetchQuizHistory(): Promise<QuizResult[]> {
  try {
    const response = await fetch(`${API_URL}/history`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    // On retourne un tableau vide en cas d'erreur
    return [];
  }
}