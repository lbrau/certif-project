import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { QuizResult } from '@/types/quiz';
import { getQuizHistory } from '@/lib/history';

// Enregistrement des composants Chart.js nécessaires
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface QuizHistoryProps {
  onClose: () => void;
}

export function QuizHistory({ onClose }: QuizHistoryProps) {
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    setQuizHistory(getQuizHistory());
  }, []);

  const analyzePerformance = (scores: QuizResult['categoryScores']) => {
    const strongServices = [];
    const weakServices = [];

    for (const [service, score] of Object.entries(scores)) {
      const percentage = (score.correct / score.total) * 100;
      if (percentage >= 70) {
        strongServices.push(service);
      } else {
        weakServices.push(service);
      }
    }

    return { strongServices, weakServices };
  };

  const getRadarData = (categoryScores: QuizResult['categoryScores']) => {
    return {
      labels: Object.keys(categoryScores),
      datasets: [
        {
          label: 'Score par catégorie',
          data: Object.values(categoryScores).map(
            (score) => (score.correct / score.total) * 100
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto py-8">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">
              Historique des Quiz
            </CardTitle>
            <Button variant="outline" onClick={onClose} className="bg-white dark:bg-slate-800">
              Fermer
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-6">
                {quizHistory.map((quiz) => {
                  const { strongServices, weakServices } = analyzePerformance(quiz.categoryScores);
                  
                  return (
                    <Card key={quiz.id} className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                              Quiz du {format(new Date(quiz.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                            </h3>
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                              Score global: {quiz.overallScore.toFixed(1)}%
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <TrendingUp className="h-5 w-5" />
                              <h4 className="font-medium">Points forts</h4>
                            </div>
                            <ul className="pl-4 space-y-1">
                              {strongServices.map(service => (
                                <li key={service} className="text-slate-600 dark:text-slate-300">
                                  {service} ({(quiz.categoryScores[service].correct / quiz.categoryScores[service].total * 100).toFixed(0)}%)
                                </li>
                              ))}
                              {strongServices.length === 0 && (
                                <li className="text-slate-500 dark:text-slate-400 italic">Aucun service &gt; 70%</li>
                              )}
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                              <TrendingDown className="h-5 w-5" />
                              <h4 className="font-medium">Points à améliorer</h4>
                            </div>
                            <ul className="pl-4 space-y-1">
                              {weakServices.map(service => (
                                <li key={service} className="text-slate-600 dark:text-slate-300">
                                  {service} ({(quiz.categoryScores[service].correct / quiz.categoryScores[service].total * 100).toFixed(0)}%)
                                </li>
                              ))}
                              {weakServices.length === 0 && (
                                <li className="text-slate-500 dark:text-slate-400 italic">Aucun service &lt; 70%</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        <div className="lg:col-span-2 h-[300px] p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <Radar data={getRadarData(quiz.categoryScores)} options={getChartOptions()} />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default QuizHistory;