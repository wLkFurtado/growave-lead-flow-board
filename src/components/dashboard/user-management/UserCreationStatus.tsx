
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

interface UserCreationStatusProps {
  isCreating: boolean;
  creationStep: string;
}

export const UserCreationStatus = ({ isCreating, creationStep }: UserCreationStatusProps) => {
  if (!isCreating) return null;

  return (
    <Alert className="mb-4 bg-blue-900/20 border-blue-500/50">
      <Clock className="h-4 w-4 text-blue-400 animate-spin" />
      <AlertDescription className="text-blue-300">
        <strong>Criando usuário:</strong> {creationStep}
      </AlertDescription>
    </Alert>
  );
};
