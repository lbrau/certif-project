import { ThemeProvider } from 'next-themes';
import { QuizApp } from './components/QuizApp';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from './components/ThemeToggle';
import { ClipboardList } from 'lucide-react';
import { Button } from './components/ui/button';
import { useState } from 'react';
import { QuizHistory } from './components/QuizHistory';

export default function App() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <div className="min-h-screen bg-background flex justify-center">
        <div className="container mx-auto p-4">
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHistory(true)}
              title="Historique"
              className="relative"
            >
              <ClipboardList className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
              <span className="sr-only">Historique</span>
            </Button>
            <ThemeToggle />
          </div>
          {showHistory ? (
            <QuizHistory onClose={() => setShowHistory(false)} />
          ) : (
            <QuizApp />
          )}
        </div>
        <Toaster position="top-center" richColors closeButton />
      </div>
    </ThemeProvider>
  );
}