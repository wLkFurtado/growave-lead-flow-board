
import React, { useMemo, useState } from 'react';
import { subDays } from 'date-fns';
import { MetricCard } from './MetricCard';
import { KanbanSummary } from './KanbanSummary';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from '@/types/common';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { MetricsService } from '@/services/data/MetricsService';

interface DashboardOverviewProps {
  adsData: any[];
  leadsData: any[];
  onDateRangeChange: (range: DateRange) => void;
  dateRange: DateRange;
}

export const DashboardOverview = ({ adsData, leadsData, onDateRangeChange, dateRange }: DashboardOverviewProps) => {
  const metrics = useMemo(() => {
    const m = MetricsService.calculateForClient(adsData, leadsData);
    console.log('📊 Métricas (centralizadas via MetricsService):', m);
    return m;
  }, [adsData, leadsData, dateRange]);

  // Verificar inconsistências nos dados
  const dataInconsistencies = useMemo(() => {
    const fbDates = adsData.map(ad => ad.data).filter(Boolean);
    const wppDates = leadsData.map(lead => lead.data_criacao).filter(Boolean);
    
    const fbDateRange = fbDates.length > 0 ? {
      min: Math.min(...fbDates.map(d => new Date(d).getTime())),
      max: Math.max(...fbDates.map(d => new Date(d).getTime()))
    } : null;
    
    const wppDateRange = wppDates.length > 0 ? {
      min: Math.min(...wppDates.map(d => new Date(d).getTime())),
      max: Math.max(...wppDates.map(d => new Date(d).getTime()))
    } : null;

    return {
      fbDateRange,
      wppDateRange,
      hasInconsistency: fbDateRange && wppDateRange && 
        (Math.abs(fbDateRange.min - wppDateRange.min) > 86400000 || // mais de 1 dia de diferença
         Math.abs(fbDateRange.max - wppDateRange.max) > 86400000)
    };
  }, [adsData, leadsData]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Visão Geral do Desempenho</h2>
          <p className="text-slate-400 mt-1">Performance das suas campanhas no período selecionado</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-3">
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
          />
        </div>
      </div>

      {/* Alert para inconsistências de dados */}
      {dataInconsistencies.hasInconsistency && (
        <Alert className="bg-amber-900/20 border-amber-500/50 text-amber-400">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Detectamos inconsistências nas datas entre Facebook Ads e WhatsApp Leads. 
            Isso pode afetar a precisão das métricas calculadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert para vendas */}
      {metrics.vendasValidas === 0 && metrics.totalLeadsTelefone > 0 && (
        <Alert className="bg-blue-900/20 border-blue-500/50 text-blue-400">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Info:</strong> Há {metrics.totalLeadsTelefone} leads mas nenhuma venda registrada no período. 
            O ROI não pode ser calculado.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Investido" 
          value={metrics.totalInvestido} 
          unit=" R$" 
          trend="up" 
        />
        <MetricCard 
          title="Alcance" 
          value={metrics.totalAlcance} 
          trend="up" 
        />
        <MetricCard 
          title="Mensagens Iniciadas" 
          value={metrics.totalMensagens} 
        />
        <MetricCard 
          title="Custo por Mensagem Iniciada" 
          value={metrics.custoPorMensagemIniciada} 
          unit=" R$" 
        />
        <MetricCard 
          title="Leads com Telefone" 
          value={metrics.totalLeadsTelefone} 
          trend="up"
          tooltip="Contagem considerando datas com início inclusivo (>=) e fim exclusivo (< dia seguinte)."
        />
        <MetricCard 
          title="Custo por Lead" 
          value={metrics.custoPorLeadTelefone} 
          unit=" R$" 
        />
        <MetricCard 
          title="Faturamento" 
          value={metrics.faturamentoMes} 
          unit=" R$" 
          trend={metrics.faturamentoMes > 0 ? "up" : undefined}
        />
        <MetricCard 
          title="ROI" 
          value={metrics.roi} 
          unit="%" 
          trend={metrics.roi > 0 ? "up" : metrics.roi < 0 ? "down" : undefined} 
        />
      </div>

      <KanbanSummary leadsData={leadsData} />
    </section>
  );
};
