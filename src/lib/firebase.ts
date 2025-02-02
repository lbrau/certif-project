import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp, addDoc } from "firebase/firestore";
import {QuizAnswer, QuizResult, QuizSession} from "@/types/quiz.ts";

const firebaseConfig = {
    apiKey: "AIzaSyCtK4LgLvhg4sgDinaet6lBqX_187XL9a8",
    authDomain: "certifier-front-end.firebaseapp.com",
    projectId: "certifier-front-end",
    storageBucket: "certifier-front-end.firebasestorage.app",
    messagingSenderId: "990844406171",
    appId: "1:990844406171:web:cf785f4adcacc58f6fb93e",
    measurementId: "G-27XQYZBVQ9",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * @param userId
 * @param quizResult
 */
export const saveQuizResult = async (userId: string, quizResult: QuizResult) => {
    try {
        const quizResultRef = doc(db, "users", userId, "quizResults", quizResult.id);
        await setDoc(quizResultRef, { ...quizResult, timestamp: Timestamp.now() }, { merge: true });
    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw error;
    }
};

/**
 * @param userId
 * @param questionId
 * @param isCorrect
 */
export const updateQuestionProgress = async (userId: string, questionId: string, isCorrect: boolean) => {
    try {
        const questionProgressRef = doc(db, "users", userId, "questionProgress", questionId);
        const docSnapshot = await getDoc(questionProgressRef);
        if (docSnapshot.exists()) {
            await setDoc(questionProgressRef, { isCorrect, timestamp: Timestamp.now() }, { merge: true });
        } else {
            console.error("Question or user does not exist.");
        }
    } catch (error) {
        console.error("Error updating question progress:", error);
        throw error;
    }
};

/**
 * @param userId
 * @param answer
 */
export const saveQuizAnswer = async (userId: string, answer: QuizAnswer) => {
    try {
        await addDoc(collection(db, "users", userId, "answers"), {
            ...answer,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Error saving answer:", error);
        throw error;
    }
};

/**
 * @param session
 */
export const saveQuizSession = async (session: QuizSession) => {
    try {
        await addDoc(collection(db, "quizSessions"), {
            ...session,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Error saving quiz session:", error);
        throw error;
    }
};

/**
 * @param userId
 */
export const getQuestionsToReview = async (userId: string) => {
    try {
        const q = query(
            collection(db, "users", userId, "questionProgress"),
            where("isCorrect", "==", false)
        );
        const querySnapshot = await getDocs(q);
        const questionsToReview: string[] = [];
        querySnapshot.forEach((doc) => {
            questionsToReview.push(doc.id);
        });
        return questionsToReview;
    } catch (error) {
        console.error("Error getting questions to review:", error);
        throw error;
    }
};
