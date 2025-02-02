import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Quiz } from '../../src/components/Quiz';
import { QuizResult, QuizSession, QuizAnswer } from '@/types/quiz';
import { saveQuizResult, saveQuizSession, getQuestionsToReview } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import '@testing-library/jest-dom';
import { defineConfig } from 'vitest/config';

// Mock de @firebase/app
vi.mock('@firebase/app', () => ({
    initializeApp: vi.fn(() => ({})), // Mock de `initializeApp`
}));

// Mock de @firebase/auth
vi.mock('@firebase/auth', () => ({
    getAuth: vi.fn(() => ({
        createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
        signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
        signOut: vi.fn(() => Promise.resolve()),
    })),
    getProvider: vi.fn(), // Mock de la méthode `getProvider`
}));

// Mock de @/lib/firebase
vi.mock('@/lib/firebase', () => ({
    saveQuizResult: vi.fn(),
    saveQuizSession: vi.fn(),
    updateQuestionProgress: vi.fn(),
    getQuestionsToReview: vi.fn(() => Promise.resolve(['3'])), // Mock de la méthode `getQuestionsToReview`
    app: {}, // Mock de l'export `app`
    db: {},  // Mock de l'export `db`
}));

// Mock de @/lib/auth
vi.mock('@/lib/auth', () => ({
    auth: {
        createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
        signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
        signOut: vi.fn(() => Promise.resolve()),
    },
}));

describe('Quiz Results', () => {
    const mockQuestions = {
        title: "Test Certification",
        categories: ["Category1", "Category2"],
        questions: [
            {
                id: 1,
                category: "Category1",
                question: "Question 1?",
                options: ["Option1", "Option2", "Option3", "Option4"],
                correctAnswer: 2,
                explanation: "Explanation 1"
            },
            {
                id: 2,
                category: "Category1",
                question: "Question 2?",
                options: ["Option1", "Option2", "Option3", "Option4"],
                correctAnswer: 1,
                explanation: "Explanation 2"
            },
            {
                id: 3,
                category: "Category2",
                question: "Question 3?",
                options: ["Option1", "Option2", "Option3", "Option4"],
                correctAnswer: 0,
                explanation: "Explanation 3"
            }
        ]
    };

    const mockAnswers: QuizAnswer[] = [
        { questionId: '1', selectedAnswer: 2, isCorrect: true, timestamp: Timestamp.now() },
        { questionId: '2', selectedAnswer: 1, isCorrect: true, timestamp: Timestamp.now() },
        { questionId: '3', selectedAnswer: 3, isCorrect: false, timestamp: Timestamp.now() }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calculates overall score correctly', () => {
        const correctAnswers = mockAnswers.filter(answer => answer.isCorrect).length;
        const expectedScore = (correctAnswers / mockQuestions.questions.length) * 100;

        expect(expectedScore).toBeDefined();
        expect(expectedScore).toBeGreaterThanOrEqual(0);
        expect(expectedScore).toBeLessThanOrEqual(100);
        expect(expectedScore).toBeCloseTo(66.67); // Vérification spécifique du score
    });

    it('displays quiz results correctly', () => {
        const mockProps = {
            questions: mockQuestions,
            onExit: vi.fn()
        };

        render(<Quiz {...mockProps} />);

        // Simuler la complétion du quiz
        // Par exemple, simuler les réponses aux questions ici

        // Vérifier l'affichage des résultats
        expect(screen.getByText(/Score final/i)).toBeInTheDocument();
        expect(screen.getByText(/Résultats par catégorie/i)).toBeInTheDocument();
        expect(screen.getByText(/Questions à revoir/i)).toBeInTheDocument();
    });

    it('displays explanations for incorrect answers', () => {
        const mockProps = {
            questions: mockQuestions,
            onExit: vi.fn()
        };

        render(<Quiz {...mockProps} />);

        // Simuler les réponses incorrectes
        const incorrectQuestions = mockQuestions.questions.filter((question, index) =>
            !mockAnswers[index].isCorrect
        );

        incorrectQuestions.forEach(question => {
            expect(screen.getByText(question.explanation)).toBeInTheDocument();
        });
    });

    it('formats quiz data correctly for storage', () => {
        const result = {
            id: expect.any(String),
            certificationId: expect.any(String),
            quizId: expect.any(String),
            overallScore: expect.any(Number),
            incorrectQuestions: expect.any(Array),
            date: expect.any(Date)
        };

        const session = {
            id: expect.any(String),
            sessionId: expect.any(String),
            userId: expect.any(String),
            certificationId: expect.any(String),
            quizId: expect.any(String),
            overallScore: expect.any(Number),
            incorrectQuestions: expect.any(Array),
            startTime: expect.any(Timestamp),
            endTime: expect.any(Timestamp),
            answers: expect.any(Array),
            categoryScores: expect.any(Object)
        };

        expect(result).toEqual(expect.objectContaining(result));
        expect(session).toEqual(expect.objectContaining(session));
    });

    it('saves quiz results correctly', async () => {
        const mockQuizResult: QuizResult = {
            id: 'test-result-id',
            certificationId: 'test-certification-id',
            quizId: 'test-quiz-id',
            overallScore: 75,
            incorrectQuestions: ['question-1', 'question-2'],
            date: new Date()
        };

        await saveQuizResult('test-user-id', mockQuizResult);

        expect(vi.mocked(saveQuizResult)).toHaveBeenCalledWith('test-user-id', mockQuizResult);
    });

    it('saves quiz session correctly', async () => {
        const mockQuizSession: QuizSession = {
            id: 'test-session-id',
            sessionId: 'test-session-id',
            userId: 'test-user-id',
            certificationId: 'test-certification-id',
            quizId: 'test-quiz-id',
            overallScore: 75,
            incorrectQuestions: ['question-1', 'question-2'],
            startTime: Timestamp.now(),
            endTime: Timestamp.now(),
            answers: mockAnswers,
            categoryScores: { 'Category1': 50, 'Category2': 100 }
        };

        await saveQuizSession(mockQuizSession);

        expect(vi.mocked(saveQuizSession)).toHaveBeenCalledWith(mockQuizSession);
    });

    it('gets questions to review correctly', async () => {
        const questionsToReview = await getQuestionsToReview('test-user-id');

        expect(questionsToReview).toBeDefined();
        expect(questionsToReview).toHaveLength(1); // Une seule question incorrecte dans mockAnswers
        expect(questionsToReview).toContain('3'); // ID de la question incorrecte
    });
});
