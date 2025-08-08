
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { LeadCard } from './LeadCard';

interface DraggableLeadCardProps {
  dragId: string;
  lead: any;
  disabled?: boolean;
}

export const DraggableLeadCard: React.FC<DraggableLeadCardProps> = ({ dragId, lead, disabled }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: dragId,
    data: { lead }
  });

  // Casting to any to reuse existing LeadCard without altering its types
  const leadForCard = lead as any;

  return (
    <div ref={setNodeRef} {...(!disabled ? listeners : {})} {...(!disabled ? attributes : {})} className={disabled ? 'opacity-60' : 'cursor-move'}>
      <LeadCard lead={leadForCard} />
    </div>
  );
};
