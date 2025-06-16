
import React from 'react';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { EmptyStateManager } from './EmptyStateManager';

interface KanbanTabContentProps {
  hasWhatsappData: boolean;
  activeClient: string | null;
  whatsappLeads: any[];
}

export const KanbanTabContent = ({
  hasWhatsappData,
  activeClient,
  whatsappLeads
}: KanbanTabContentProps) => {
  if (!hasWhatsappData && activeClient) {
    return (
      <EmptyStateManager
        type="kanban-no-data"
        activeClient={activeClient}
      />
    );
  }

  if (!activeClient) {
    return <EmptyStateManager type="kanban-no-client" />;
  }

  return <LeadKanbanBoard leadsData={whatsappLeads} />;
};
