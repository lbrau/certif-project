import { useState } from 'react';
import { CertificationSelector } from './CertificationSelector';
import Quiz from './Quiz';
import { certifications } from '@/data/certifications';

export function QuizApp() {
  const [selectedCertification, setSelectedCertification] = useState<string | null>(null);

  const certification = selectedCertification 
    ? certifications.find(c => c.id === selectedCertification)
    : null;

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