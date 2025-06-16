
import React from 'react';
import { UserManagement } from './UserManagement';
import { EmptyState } from './LoadingStates';

interface UsersTabContentProps {
  isAdmin: boolean;
}

export const UsersTabContent = ({ isAdmin }: UsersTabContentProps) => {
  if (!isAdmin) {
    return (
      <EmptyState
        title="Acesso Restrito"
        description="Apenas administradores podem acessar o gerenciamento de usuários."
      />
    );
  }

  return <UserManagement />;
};
