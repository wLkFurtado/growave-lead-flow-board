// Component prop interfaces

import { ReactNode } from 'react';
import { DateRange, ClientMetrics } from './business';
import { FacebookAd, WhatsAppLead } from './database';

export interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down';
  className?: string;
  icon?: ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  formatter?: (value: any, row: T) => ReactNode;
  className?: string;
}

export interface DashboardOverviewProps {
  adsData: FacebookAd[];
  leadsData: WhatsAppLead[];
  onDateRangeChange: (range: DateRange) => void;
  dateRange: DateRange;
  metrics?: ClientMetrics;
}

export interface FilterBarProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  activeClient: string;
  availableClients: string[];
  onClientChange: (client: string) => void;
  isLoading?: boolean;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingStateProps {
  type?: 'skeleton' | 'spinner';
  className?: string;
  message?: string;
}

export interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}