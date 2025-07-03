// Data formatting utilities

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { METRICS_CONFIG } from '@/config/business';
import { DATE_FORMATS } from '@/config/database';

export const formatCurrency = (value: number): string => {
  if (value === 0) return `${METRICS_CONFIG.CURRENCY_SYMBOL} 0,00`;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: METRICS_CONFIG.DECIMAL_PLACES,
    maximumFractionDigits: METRICS_CONFIG.DECIMAL_PLACES,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  if (value >= METRICS_CONFIG.LARGE_NUMBER_THRESHOLD) {
    return new Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  }
  
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(METRICS_CONFIG.DECIMAL_PLACES)}${METRICS_CONFIG.PERCENTAGE_SYMBOL}`;
};

export const formatDate = (date: Date | string, formatType: keyof typeof DATE_FORMATS = 'DISPLAY_DATE'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatString = DATE_FORMATS[formatType];
  
  return format(dateObj, formatString, { locale: ptBR });
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const numericPhone = phone.replace(/\D/g, '');
  
  // Format based on length
  if (numericPhone.length === 11) {
    // Mobile: (11) 99999-9999
    return numericPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numericPhone.length === 10) {
    // Landline: (11) 9999-9999
    return numericPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone; // Return original if doesn't match expected patterns
};

export const formatStatus = (status: string | null): string => {
  if (!status || status === 'sem_status') return 'Sem Status';
  return status;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};