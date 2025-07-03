// Database configuration and query settings

export const DB_CONFIG = {
  // Query timeouts
  QUERY_TIMEOUT: 30000, // 30 seconds
  
  // Pagination
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 500,
  
  // Cache settings
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 2 * 60 * 1000, // 2 minutes
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const TABLE_NAMES = {
  FACEBOOK_ADS: 'facebook_ads',
  WHATSAPP_ANUNCIO: 'whatsapp_anuncio',
  PROFILES: 'profiles',
  USER_CLIENTS: 'user_clients',
} as const;

export const QUERY_KEYS = {
  FACEBOOK_ADS: ['facebook_ads'],
  WHATSAPP_LEADS: ['whatsapp_leads'],
  USER_CLIENTS: ['user_clients'],
  ACTIVE_CLIENT: ['active_client'],
  CLIENT_DATA: ['client_data'],
} as const;

export const DATE_FORMATS = {
  DB_DATE: 'yyyy-MM-dd',
  DISPLAY_DATE: 'dd/MM/yyyy',
  DISPLAY_DATE_TIME: 'dd/MM/yyyy HH:mm',
} as const;