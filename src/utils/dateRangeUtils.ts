
import { subMonths } from 'date-fns';
import { DateRange } from '@/types/clientData';

export const getEffectiveDateRange = (
  dateRange?: DateRange,
  skipDateFilter: boolean = false
): DateRange | null => {
  if (skipDateFilter) {
    return null;
  }
  
  if (dateRange) {
    return dateRange;
  }
  
  // Default to 12 months if no range specified
  return {
    from: subMonths(new Date(), 12),
    to: new Date()
  };
};

export const formatDateForQuery = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
