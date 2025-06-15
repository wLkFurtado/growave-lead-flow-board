
export interface DateRange {
  from: Date;
  to: Date;
}

export interface UseClientDataOptions {
  dateRange?: DateRange;
  skipDateFilter?: boolean;
}

export interface ClientDataResult {
  facebookAds: any[];
  whatsappLeads: any[];
  isLoading: boolean;
  error: string | null;
  activeClient: string;
  hasData: boolean;
}
