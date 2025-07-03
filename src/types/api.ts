// API response and request types

import { FacebookAd, WhatsAppLead } from './database';
import { DateRange } from './business';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DataFetchOptions {
  activeClient: string;
  dateRange?: DateRange;
  skipDateFilter?: boolean;
  enabled?: boolean;
}

export interface FacebookAdsResponse extends ApiResponse<FacebookAd[]> {}
export interface WhatsAppLeadsResponse extends ApiResponse<WhatsAppLead[]> {}

export interface QueryOptions {
  retries?: number;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

export interface ErrorResponse {
  message: string;
  code?: string | number;
  details?: any;
}