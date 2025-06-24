
import React, { useState, useMemo } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from '@/types/common';

interface AdAnalysisTableProps {
  adsData: any[];
  leadsData: any[];
  onDateRangeChange: (range: DateRange) => void;
  dateRange: DateRange;
}

export const AdAnalysisTable = ({ adsData, leadsData, onDateRangeChange, dateRange }: AdAnalysisTableProps) => {
  const [filterCampaign, setFilterCampaign] = useState('');

  console.log('📊 AdAnalysisTable: Dados recebidos:', {
    adsCount: adsData.length,
    leadsCount: leadsData.length,
    periodo: {
      from: dateRange.from.toISOString().split('T')[0],
      to: dateRange.to?.toISOString().split('T')[0]
    }
  });

  // Filtrar dados do Facebook Ads pelo período selecionado
  const filteredAdsData = useMemo(() => {
    const fromDate = dateRange.from.toISOString().split('T')[0];
    const toDate = (dateRange.to || dateRange.from).toISOString().split('T')[0];
    
    const filtered = adsData.filter(ad => {
      if (!ad.data) return false;
      
      const adDate = new Date(ad.data).toISOString().split('T')[0];
      return adDate >= fromDate && adDate <= toDate;
    });
    
    console.log('📅 AdAnalysisTable: Filtro Facebook Ads aplicado:', {
      periodo: `${fromDate} até ${toDate}`,
      totalOriginal: adsData.length,
      totalFiltrado: filtered.length,
      datasEncontradas: filtered.map(ad => ad.data).slice(0, 5)
    });
    
    return filtered;
  }, [adsData, dateRange]);

  // Filtrar dados do WhatsApp pelo período selecionado
  const filteredLeadsData = useMemo(() => {
    const fromDate = dateRange.from.toISOString().split('T')[0];
    const toDate = (dateRange.to || dateRange.from).toISOString().split('T')[0];
    
    const filtered = leadsData.filter(lead => {
      if (!lead.data_criacao) return false;
      
      const leadDate = new Date(lead.data_criacao).toISOString().split('T')[0];
      return leadDate >= fromDate && leadDate <= toDate;
    });
    
    console.log('📅 AdAnalysisTable: Filtro WhatsApp Leads aplicado:', {
      periodo: `${fromDate} até ${toDate}`,
      totalOriginal: leadsData.length,
      totalFiltrado: filtered.length,
      datasEncontradas: filtered.map(lead => lead.data_criacao).slice(0, 5)
    });
    
    return filtered;
  }, [leadsData, dateRange]);

  const adsMap = useMemo(() => {
    return filteredAdsData.reduce((acc, ad) => {
      acc[ad.source_id] = ad;
      return acc;
    }, {});
  }, [filteredAdsData]);

  const uniqueCampaigns = useMemo(() => {
    const campaigns = new Set(filteredAdsData.map(ad => ad.campanha));
    return ['', ...Array.from(campaigns)].sort();
  }, [filteredAdsData]);

  const processedLeadsForTable = useMemo(() => {
    return filteredLeadsData
      .filter(lead => lead.telefone && lead.telefone.length > 0)
      .map(lead => {
        const ad = adsMap[lead.source_id];
        return {
          ...lead,
          data: ad ? ad.data : lead.data_criacao || 'N/A',
          campanha: ad ? ad.campanha : lead.nome_campanha || 'N/A',
          conjunto_anuncio: ad ? ad.conjunto_anuncio : lead.nome_conjunto || 'N/A',
          anuncio: ad ? ad.anuncio : lead.nome_anuncio || 'N/A',
          link_anuncio: lead.source_url || null,
        };
      })
      .filter(lead => {
        const campaignMatch = filterCampaign ? lead.campanha === filterCampaign : true;
        return campaignMatch;
      });
  }, [filteredLeadsData, adsMap, filterCampaign]);

  console.log('📊 AdAnalysisTable: Dados processados:', {
    leadsProcessados: processedLeadsForTable.length,
    campanhasUnicas: uniqueCampaigns.length - 1, // -1 para remover opção vazia
    campanhaFiltrada: filterCampaign || 'Todas'
  });

  return (
    <section className="bg-slate-800/30 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Análise de Leads por Anúncio</h2>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white">Filtrar por Campanha:</label>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 min-w-[200px]"
            >
              {uniqueCampaigns.map(campaign => (
                <option key={campaign} value={campaign}>
                  {campaign === '' ? 'Todas as Campanhas' : campaign}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Informações sobre os dados filtrados */}
        <div className="mt-4 text-sm text-slate-400">
          <span>
            Exibindo {processedLeadsForTable.length} leads com telefone • 
            {filteredAdsData.length} anúncios no período • 
            Período: {dateRange.from.toISOString().split('T')[0]} até {(dateRange.to || dateRange.from).toISOString().split('T')[0]}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Campanha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Conjunto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Anúncio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Link</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {processedLeadsForTable.length > 0 ? (
              processedLeadsForTable.map((lead, index) => (
                <tr key={lead.id || index} className="hover:bg-slate-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.data}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{lead.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.campanha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.conjunto_anuncio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.anuncio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {lead.link_anuncio ? (
                      <a 
                        href={lead.link_anuncio} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 font-medium"
                      >
                        Abrir Anúncio
                      </a>
                    ) : (
                      <span className="text-slate-500 text-sm">Link indisponível</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-400">
                  {filteredAdsData.length === 0 && filteredLeadsData.length === 0 
                    ? 'Nenhum dado encontrado para o período selecionado.'
                    : 'Nenhum lead encontrado com os filtros selecionados.'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
