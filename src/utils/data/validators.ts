// Data validation utilities

import { FacebookAd, WhatsAppLead } from '@/types/database';
import { DateRange } from '@/types/business';
import { BUSINESS_RULES } from '@/config/business';

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  const numericPhone = phone.replace(/\D/g, '');
  return numericPhone.length >= BUSINESS_RULES.VALID_PHONE_MIN_LENGTH && 
         numericPhone.length <= BUSINESS_RULES.VALID_PHONE_MAX_LENGTH;
};

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateInvestment = (investment: number | null): boolean => {
  if (investment === null || investment === undefined) return false;
  return investment >= BUSINESS_RULES.MIN_INVESTMENT;
};

export const validateSaleValue = (value: number | null): boolean => {
  if (value === null || value === undefined) return false;
  return value >= BUSINESS_RULES.MIN_SALE_VALUE;
};

export const validateDateRange = (dateRange: DateRange): boolean => {
  if (!dateRange.from) return false;
  
  const to = dateRange.to || dateRange.from;
  const diffTime = Math.abs(to.getTime() - dateRange.from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= BUSINESS_RULES.MAX_DATE_RANGE_DAYS;
};

export const validateFacebookAd = (ad: FacebookAd): string[] => {
  const errors: string[] = [];
  
  if (!ad.campanha) errors.push('Campanha é obrigatória');
  if (!ad.conjunto_anuncio) errors.push('Conjunto de anúncio é obrigatório');
  if (!ad.data) errors.push('Data é obrigatória');
  if (!ad.id_data) errors.push('ID de dados é obrigatório');
  
  return errors;
};

export const validateWhatsAppLead = (lead: WhatsAppLead): string[] => {
  const errors: string[] = [];
  
  if (!lead.telefone) {
    errors.push('Telefone é obrigatório');
  } else if (!validatePhoneNumber(lead.telefone)) {
    errors.push('Telefone inválido');
  }
  
  if (!lead.data_criacao) errors.push('Data de criação é obrigatória');
  
  if (lead.email && !validateEmail(lead.email)) {
    errors.push('Email inválido');
  }
  
  return errors;
};

export const validateClientName = (clientName: string): boolean => {
  return clientName && clientName.trim().length > 0;
};

export const isDataFresh = (timestamp: number, maxAgeMs: number = 5 * 60 * 1000): boolean => {
  return Date.now() - timestamp < maxAgeMs;
};

export const sanitizeString = (str: string | null): string => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
};

export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const isWithinDateRange = (date: Date, range: DateRange): boolean => {
  const targetDate = new Date(date);
  const startDate = new Date(range.from);
  const endDate = new Date(range.to || range.from);
  
  return targetDate >= startDate && targetDate <= endDate;
};