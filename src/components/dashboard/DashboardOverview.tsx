

import React, { useMemo, useState } from 'react';
import { subDays } from 'date-fns';
import { MetricCard } from './MetricCard';
import { KanbanSummary } from './KanbanSummary';
import { DateRangePicker } from './DateRangePicker';

interface DateRange {
  from: Date;
  to: Date;
}

interface DashboardOverviewProps {
  adsData: any[];
  leadsData: any[];
  onDateRangeChange: (range: DateRange) => void;
  dateRange: DateRange;
}

export const DashboardOverview = ({ adsData, leadsData, onDateRangeChange, dateRange }: DashboardOverviewProps) => {
  const metrics = useMemo(() => {
    const totalInvestido = adsData.reduce((sum, ad) => sum + ad.investimento, 0);
    const totalCliques = adsData.reduce((sum, ad) => sum + ad.cliques_no_link, 0);
    const totalMensagens = adsData.reduce((sum, ad) => sum + ad.mensagens_iniciadas, 0);
    const totalAlcance = adsData.reduce((sum, ad) => sum + (ad.alcance || 0), 0);

    const leadsComTelefone = leadsData.filter(lead => lead.telefone && lead.telefone.length > 0);
    const totalLeadsTelefone = leadsComTelefone.length;

    const taxaConversaoMensagens = totalCliques > 0 ? (totalMensagens / totalCliques) * 100 : 0;
    const custoPorLeadTelefone = totalLeadsTelefone > 0 ? totalInvestido / totalLeadsTelefone : 0;
    const custoPorMensagemIniciada = totalMensagens > 0 ? totalInvestido / totalMensagens : 0;

    const faturamentoMes = leadsData
      .filter(lead => typeof lead.valor_venda === 'number' && lead.valor_venda > 0)
      .reduce((sum, lead) => sum + lead.valor_venda, 0);

    return {
      totalInvestido,
      totalCliques,
      totalMensagens,
      totalLeadsTelefone,
      totalAlcance,
      taxaConversaoMensagens,
      custoPorLeadTelefone,
      custoPorMensagemIniciada,
      faturamentoMes,
    };
  }, [adsData, leadsData]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Visão Geral do Desempenho</h2>
          <p className="text-slate-400">Performance das suas campanhas no período selecionado</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-3">
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <MetricCard title="Total Investido" value={metrics.totalInvestido} unit=" R$" trend="up" />
        <MetricCard title="Alcance" value={metrics.totalAlcance} trend="up" />
        <MetricCard title="Custo por Mensagem Iniciada" value={metrics.custoPorMensagemIniciada} unit=" R$" />
        <MetricCard title="Mensagens Iniciadas" value={metrics.totalMensagens} />
        <MetricCard title="Leads com Telefone" value={metrics.totalLeadsTelefone} trend="up" />
        <MetricCard title="Taxa de Conversão" value={metrics.taxaConversaoMensagens} unit="%" />
        <MetricCard title="Custo por Lead" value={metrics.custoPorLeadTelefone} unit=" R$" />
        <MetricCard 
          title="ROI" 
          value={metrics.totalInvestido > 0 ? ((metrics.faturamentoMes - metrics.totalInvestido) / metrics.totalInvestido) * 100 : 0} 
          unit="%" 
          trend="up" 
        />
      </div>

      <KanbanSummary leadsData={leadsData} />
    </section>
  );
};

