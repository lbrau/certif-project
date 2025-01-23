import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { certifications } from '@/data/certifications';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Trophy, BookOpen, Clock } from 'lucide-react';

interface CertificationSelectorProps {
  onSelect: (certificationId: string) => void;
}

export function CertificationSelector({ onSelect }: CertificationSelectorProps) {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Préparation aux Certifications</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choisissez votre certification et commencez à vous entraîner avec nos quiz interactifs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary"
              onClick={() => onSelect(cert.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">{cert.icon}</span>
                  <Badge variant="secondary" className="text-xs">
                    {cert.questions.questions.length} questions
                  </Badge>
                </div>
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  {cert.title}
                </CardTitle>
                <CardDescription className="text-base">{cert.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>{cert.questions.categories.length} catégories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>~30 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Français</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}