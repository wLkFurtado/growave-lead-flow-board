
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
  droppableId: string;
  className?: string;
  children: React.ReactNode;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({ droppableId, className, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      className={`${className || ''} ${isOver ? 'ring-2 ring-primary/70' : ''}`}
    >
      {children}
    </div>
  );
};
