// Business logic types and interfaces

export interface ClientMetrics {
  totalInvestido: number;
  totalCliques: number;
  totalMensagens: number;
  totalLeadsTelefone: number;
  totalAlcance: number;
  custoPorLeadTelefone: number;
  custoPorMensagemIniciada: number;
  faturamentoMes: number;
  roi: number;
  vendasValidas: number;
}

export interface DataStats {
  facebook: {
    total: number;
    withInvestment: number;
    totalInvestment: number;
    campaigns: string[];
  };
  whatsapp: {
    total: number;
    withSales: number;
    totalRevenue: number;
    statusDistribution: Record<string, number>;
  };
  totalRecords: number;
}

export interface FilterOptions {
  dateRange?: DateRange;
  activeClient?: string;
  skipDateFilter?: boolean;
}

export interface DateRange {
  from: Date;
  to?: Date;
}

export interface ValidationResult {
  hasData: boolean;
  totalRecords: number;
  facebookStats: DataStats['facebook'];
  whatsappStats: DataStats['whatsapp'];
}

export type LeadStatus = 
  | 'Agendado'
  | 'Vendido'
  | 'Não Respondeu'
  | 'Não Interessado'
  | 'Follow Up'
  | 'sem_status'
  | null;

export type UserRole = 'admin' | 'client';

export interface Campaign {
  name: string;
  totalInvestment: number;
  totalLeads: number;
  totalSales: number;
  costPerLead: number;
  roi: number;
}