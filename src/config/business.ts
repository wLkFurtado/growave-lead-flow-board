// Business rules and constants

export const BUSINESS_RULES = {
  // Minimum values for valid data
  MIN_INVESTMENT: 0.01,
  MIN_SALE_VALUE: 0.01,
  
  // ROI calculation
  MIN_INVESTMENT_FOR_ROI: 1, // R$ 1,00
  
  // Lead validation
  VALID_PHONE_MIN_LENGTH: 10,
  VALID_PHONE_MAX_LENGTH: 15,
  
  // Date ranges
  MAX_DATE_RANGE_DAYS: 365,
  DEFAULT_DATE_RANGE_DAYS: 30,
} as const;

export const LEAD_STATUSES = {
  AGENDADO: 'Agendado',
  VENDIDO: 'Vendido',
  NAO_RESPONDEU: 'Não Respondeu',
  NAO_INTERESSADO: 'Não Interessado',
  FOLLOW_UP: 'Follow Up',
  SEM_STATUS: 'sem_status',
} as const;

export const LEAD_STATUS_COLORS = {
  [LEAD_STATUSES.AGENDADO]: '#22c55e', // green
  [LEAD_STATUSES.VENDIDO]: '#10b981', // emerald
  [LEAD_STATUSES.NAO_RESPONDEU]: '#f59e0b', // amber
  [LEAD_STATUSES.NAO_INTERESSADO]: '#ef4444', // red
  [LEAD_STATUSES.FOLLOW_UP]: '#3b82f6', // blue
  [LEAD_STATUSES.SEM_STATUS]: '#6b7280', // gray
} as const;

export const CAMPAIGN_PRIORITIES = [
  'Hospital do Cabelo',
  'Simone Mendes',
] as const;

export const METRICS_CONFIG = {
  CURRENCY_SYMBOL: 'R$',
  PERCENTAGE_SYMBOL: '%',
  DECIMAL_PLACES: 2,
  LARGE_NUMBER_THRESHOLD: 1000,
} as const;

export const DEFAULT_DATE_RANGES = {
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
  CURRENT_MONTH: 'current_month',
  LAST_MONTH: 'last_month',
} as const;