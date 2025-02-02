import { useState, useEffect } from 'react';
import { CertificationSelector } from './CertificationSelector';
import Quiz from './Quiz';
import { Auth } from './ui/Auth';
import { certifications } from '@/data/certifications';
import { auth } from '../lib/auth';
import { onAuthStateChanged } from 'firebase/auth';

export function QuizApp() {
  const [selectedCertification, setSelectedCertification] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // État pour l'utilisateur

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const certification = selectedCertification
    ? certifications.find(c => c.id === selectedCertification)
    : null;

  if (!user) {
    return <Auth />;
  }

  if (!selectedCertification || !certification) {
    return <CertificationSelector onSelect={setSelectedCertification} />;
  }

  return (
    <Quiz
      questions={certification.questions}
      onExit={() => setSelectedCertification(null)}
    />
  );
}
