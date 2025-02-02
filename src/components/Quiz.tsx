import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radar } from 'react-chartjs-2';
import { saveQuizAnswer, saveQuizSession, updateQuestionProgress } from "../lib/firebase.ts";
import { Timestamp } from 'firebase/firestore';
import { auth } from '../lib/auth';
import { saveQuizResult } from "@/lib/firebase";
import { v4 as uuidv4 } from 'uuid';
import type {QuizResult, QuizSession} from '@/types/quiz';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import {
  Trophy,
  Timer,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle
} from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface QuizProps {
  questions: {
    title: string;
    categories: string[];
    questions: {
      id: number;
      category: string;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }[];
  };
  onExit: () => void;
}

// Fonction de mélange Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Quiz({ questions: quizData, onExit }: QuizProps) {
  const [user] = useState(auth.currentUser);
  const [shuffledQuestions] = useState(() =>
    shuffleArray(quizData.questions)
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(quizData.questions.length).fill(null)
  );

  const [timeSpent, setTimeSpent] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const isAnswered = selectedAnswer !== null;

  const handleAnswerSelect = async (index: number) => {
    if (isAnswered) return;
    if (!user) return;

    setSelectedAnswer(index);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
    const isCorrect = index === currentQuestion.correctAnswer;

    try {
      await Promise.all([
        updateQuestionProgress(
            user.uid,
            String(currentQuestion.id),
            isCorrect
        ),
        saveQuizAnswer(user.uid, {
          questionId: currentQuestion.id.toString(),
          selectedAnswer: index,
          isCorrect,
          timestamp: Timestamp.now()
        })
      ]);
    } catch (error) {
      console.error("error during saving :", error);
    }
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;

    // Vérifie si la réponse est correcte
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // 🔥 Mise à jour de la question dans Firebase
    updateQuestionProgress(user?.uid || "user123", currentQuestion.id.toString(), isCorrect);

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      const result = createQuizResult();
      await saveQuizResult(user?.uid || "user123", result);
      setQuizCompleted(true);
    }
  };

  const calculateCategoryScores = () => {
    const scores: Record<string, { correct: number; total: number }> = {};

    quizData.categories.forEach(category => {
      scores[category] = { correct: 0, total: 0 };
    });

    shuffledQuestions.forEach((question, index) => {
      const answer = answers[index];
      if (answer !== null) {
        scores[question.category].total++;
        if (answer === question.correctAnswer) {
          scores[question.category].correct++;
        }
      }
    });

    return scores;
  };

  const getOverallScore = () => {
    const totalAnswered = answers.filter(a => a !== null).length;
    if (totalAnswered === 0) return 0;

    const correctAnswers = shuffledQuestions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    return (correctAnswers / totalAnswered) * 100;
  };

  const getIncorrectQuestions = () => {
    return shuffledQuestions.filter((question, index) => {
      const answer = answers[index];
      return answer !== null && answer !== question.correctAnswer;
    }).map(question => ({
      ...question,
      selectedAnswer: answers[shuffledQuestions.findIndex(q => q.id === question.id)] as number
    }));
  };

  const getRadarData = (categoryScores: Record<string, { correct: number; total: number }>) => {
    return {
      labels: Object.keys(categoryScores),
      datasets: [
        {
          label: 'Score par catégorie (%)',
          data: Object.values(categoryScores).map(
            score => score.total > 0 ? (score.correct / score.total) * 100 : 0
          ),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 0.8)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        },
      ],
    };
  };

  const getChartOptions = () => {
    return {
      scales: {
        r: {
          min: 0,
          max: 100,
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          angleLines: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.9)',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.9)',
            backdropColor: 'transparent',
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.9)',
          },
        },
      },
    };
  };

  const createQuizResult = (): QuizResult => {
    return {
      id: uuidv4(),
      quizId: uuidv4(),
      certificationId: quizData.title,
      overallScore: getOverallScore(),
      incorrectQuestions: getIncorrectQuestions().map(q => q.id.toString()),
      date: new Date()
    };
  };

//   const handleQuizSubmit = async (userId: string, quizId: string, score: number, incorrectQuestions: string[]) => {
//     try {
//         const result: QuizResult = {
//           id: uuidv4(),
//           quizId: quizId,
//           certificationId: "certificationId",
//           overallScore: score,
//           incorrectQuestions: getIncorrectQuestions().map(q => q.id.toString()),
//           date: new Date(),
//           timestamp: Timestamp.now().toDate()
//         };
//
//         await saveQuizResult(userId, result);
//         for (const questionId of incorrectQuestions) {
//             await updateQuestionProgress(userId, questionId, false);
//         }
//
//         console.log("Quiz results and question progress updated successfully!");
//     } catch (error) {
//         console.error("Error handling quiz submission:", error);
//     }
// };

  const handleQuizComplete = async () => {
    console.log("handleQuizComplete called"); // Ajoutez un log pour le débogage
    if (!user || quizCompleted) return;

    const sessionData: QuizSession = {
      id: uuidv4(),
      certificationId: quizData.title,
      overallScore: getOverallScore(),
      incorrectQuestions: getIncorrectQuestions().map(q => q.id.toString()),
      sessionId: uuidv4(),
      userId: user.uid,
      quizId: quizData.title,
      startTime: Timestamp.fromDate(new Date(Date.now() - timeSpent * 1000)),
      endTime: Timestamp.now(),
      answers: shuffledQuestions.map((q, i) => ({
        questionId: q.id.toString(),
        selectedAnswer: answers[i] || -1,
        isCorrect: answers[i] === q.correctAnswer,
        timestamp: Timestamp.now()
      })),
      score: getOverallScore(),
      categoryScores: calculateCategoryScores()
    };

    await saveQuizSession(sessionData);
    setQuizCompleted(true);
  };

  if (quizCompleted) {
    const overallScore = getOverallScore();
    const incorrectQuestions = getIncorrectQuestions();
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    const categoryScores = calculateCategoryScores();

    if (!quizCompleted) {
      //handleQuizSubmit(user?.uid || "user123", quizData.title, overallScore, incorrectQuestions.map(q => q.id.toString()));
      handleQuizComplete();
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto space-y-8 py-8 px-4"
      >
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit} className="gap-2">
            <Home className="h-4 w-4" />
            Accueil
          </Button>
          <h1 className="text-2xl font-bold">{quizData.title}</h1>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {overallScore >= 70 ? (
                  <Trophy className="h-16 w-16 text-yellow-500" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-blue-500" />
                )}
              </div>
              <CardTitle className="text-3xl mb-2">
                {overallScore >= 70 ? 'Félicitations !' : 'Continuez vos efforts !'}
              </CardTitle>
              <CardDescription className="text-lg">
                Score final: {overallScore.toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={overallScore} className="h-3" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résultats par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Radar data={getRadarData(categoryScores)} options={getChartOptions()} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions à revoir</CardTitle>
              <CardDescription>
                {incorrectQuestions.length} question{incorrectQuestions.length > 1 ? 's' : ''} à améliorer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {incorrectQuestions.map((q, index) => (
                  <div key={q.id} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-sm px-2 py-1 rounded bg-muted">
                        {index + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <p className="font-medium">{q.question}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-4 w-4" />
                            <p>Votre réponse : {q.options[q.selectedAnswer]}</p>
                          </div>
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 className="h-4 w-4" />
                            <p>Bonne réponse : {q.options[q.correctAnswer]}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {incorrectQuestions.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">Parfait ! Toutes les réponses sont correctes !</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={onExit} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Button>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Recommencer le quiz
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto space-y-8 py-8 px-4"
    >
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onExit} className="gap-2">
          <Home className="h-4 w-4" />
          Accueil
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            Question {currentQuestionIndex + 1}/{shuffledQuestions.length}
          </Badge>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <Progress
        value={(currentQuestionIndex / shuffledQuestions.length) * 100}
        className="h-2"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-4">{currentQuestion.category}</Badge>
              <CardTitle className="text-xl">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      variant={
                        selectedAnswer === null
                          ? "outline"
                          : selectedAnswer === index
                          ? index === currentQuestion.correctAnswer
                            ? "default"
                            : "destructive"
                          : "outline"
                      }
                      className={`w-full justify-start text-left h-auto py-4 px-6 ${
                        isAnswered && index === currentQuestion.correctAnswer
                          ? "ring-2 ring-green-500"
                          : ""
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-mono">{String.fromCharCode(65 + index)}.</span>
                        <span className="flex-1">{option}</span>
                        {isAnswered && (
                          index === currentQuestion.correctAnswer ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : index === selectedAnswer ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : null
                        )}
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </CardContent>
              </Card>

              <Button
                onClick={handleNextQuestion}
                className="w-full gap-2"
                size="lg"
              >
                {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                  <>
                    Question suivante
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Voir les résultats
                    <Trophy className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default Quiz;
