
import React, { useMemo, useState } from 'react';
import { subDays } from 'date-fns';
import { MetricCard } from './MetricCard';
import { KanbanSummary } from './KanbanSummary';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from '@/types/common';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface DashboardOverviewProps {
  adsData: any[];
  leadsData: any[];
  onDateRangeChange: (range: DateRange) => void;
  dateRange: DateRange;
}

export const DashboardOverview = ({ adsData, leadsData, onDateRangeChange, dateRange }: DashboardOverviewProps) => {
  const metrics = useMemo(() => {
    console.log('📊 Calculando métricas:', {
      adsCount: adsData.length,
      leadsCount: leadsData.length,
      periode: {
        from: dateRange.from.toISOString().split('T')[0],
        to: dateRange.to.toISOString().split('T')[0]
      }
    });

    const totalInvestido = adsData.reduce((sum, ad) => sum + (ad.investimento || 0), 0);
    const totalCliques = adsData.reduce((sum, ad) => sum + (ad.cliques_no_link || 0), 0);
    const totalMensagens = adsData.reduce((sum, ad) => sum + (ad.mensagens_iniciadas || 0), 0);
    const totalAlcance = adsData.reduce((sum, ad) => sum + (ad.alcance || 0), 0);

    const leadsComTelefone = leadsData.filter(lead => lead.telefone && lead.telefone.length > 0);
    const totalLeadsTelefone = leadsComTelefone.length;

    // Cálculos corrigidos com validações
    const custoPorLeadTelefone = totalLeadsTelefone > 0 && totalInvestido > 0 
      ? totalInvestido / totalLeadsTelefone 
      : 0;
    
    const custoPorMensagemIniciada = totalMensagens > 0 && totalInvestido > 0 
      ? totalInvestido / totalMensagens 
      : 0;

    // Calcular faturamento apenas de leads com vendas válidas
    const vendasValidas = leadsData.filter(lead => 
      typeof lead.valor_venda === 'number' && 
      lead.valor_venda > 0 && 
      !isNaN(lead.valor_venda)
    );
    
    const faturamentoMes = vendasValidas.reduce((sum, lead) => sum + lead.valor_venda, 0);
    
    // ROI corrigido - só calcular se houver investimento e faturamento
    let roi = 0;
    if (totalInvestido > 0 && faturamentoMes > 0) {
      roi = ((faturamentoMes - totalInvestido) / totalInvestido) * 100;
    }

    console.log('📊 Métricas calculadas:', {
      totalInvestido,
      totalLeadsTelefone,
      custoPorLeadTelefone,
      faturamentoMes,
      vendasValidas: vendasValidas.length,
      roi
    });

    return {
      totalInvestido,
      totalCliques,
      totalMensagens,
      totalLeadsTelefone,
      totalAlcance,
      custoPorLeadTelefone,
      custoPorMensagemIniciada,
      faturamentoMes,
      roi,
      vendasValidas: vendasValidas.length
    };
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
