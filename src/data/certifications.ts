import certificationsData from './certifications.json';
import awsQuestions from './aws-questions.json';
import nodeQuestions from './node-questions.json';
import mlQuestions from './ml-questions.json';
import azureQuestions from './azure-questions.json';

const questionsMap = {
  'aws-questions.json': awsQuestions,
  'node-questions.json': nodeQuestions,
  'ml-questions.json': mlQuestions,
  'azure-questions.json': azureQuestions,
};

export interface Certification {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: typeof awsQuestions;
}

export const certifications: Certification[] = certificationsData.certifications.map(
  (cert) => ({
    ...cert,
    questions: questionsMap[cert.questionsFile as keyof typeof questionsMap],
  })
);