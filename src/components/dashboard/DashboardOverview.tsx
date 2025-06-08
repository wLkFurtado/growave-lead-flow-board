
import React, { useMemo } from 'react';
import { MetricCard } from './MetricCard';
import { KanbanSummary } from './KanbanSummary';

interface DashboardOverviewProps {
  adsData: any[];
  leadsData: any[];
}

export const DashboardOverview = ({ adsData, leadsData }: DashboardOverviewProps) => {
  const metrics = useMemo(() => {
    const totalInvestido = adsData.reduce((sum, ad) => sum + ad.investimento, 0);
    const totalCliques = adsData.reduce((sum, ad) => sum + ad.cliques_no_link, 0);
    const totalMensagens = adsData.reduce((sum, ad) => sum + ad.mensagens_iniciadas, 0);

    const leadsComTelefone = leadsData.filter(lead => lead.telefone && lead.telefone.length > 0);
    const totalLeadsTelefone = leadsComTelefone.length;

    const taxaConversaoMensagens = totalCliques > 0 ? (totalMensagens / totalCliques) * 100 : 0;
    const custoPorLeadTelefone = totalLeadsTelefone > 0 ? totalInvestido / totalLeadsTelefone : 0;

    const faturamentoMes = leadsData
      .filter(lead => typeof lead.valor_venda === 'number' && lead.valor_venda > 0)
      .reduce((sum, lead) => sum + lead.valor_venda, 0);

    return {
      totalInvestido,
      totalCliques,
      totalMensagens,
      totalLeadsTelefone,
      taxaConversaoMensagens,
      custoPorLeadTelefone,
      faturamentoMes,
    };
  }, [adsData, leadsData]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Visão Geral do Desempenho</h2>
        <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
          Últimos 30 dias
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <MetricCard title="Total Investido" value={metrics.totalInvestido} unit=" R$" trend="up" />
        <MetricCard title="Faturamento do Mês" value={metrics.faturamentoMes} unit=" R$" trend="up" />
        <MetricCard title="Cliques no Link" value={metrics.totalCliques} />
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
