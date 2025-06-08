
import React, { useState, useMemo } from 'react';

interface AdAnalysisTableProps {
  adsData: any[];
  leadsData: any[];
}

export const AdAnalysisTable = ({ adsData, leadsData }: AdAnalysisTableProps) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('');

  const adsMap = useMemo(() => {
    return adsData.reduce((acc, ad) => {
      acc[ad.id] = ad;
      return acc;
    }, {});
  }, [adsData]);

  const uniqueCampaigns = useMemo(() => {
    const campaigns = new Set(adsData.map(ad => ad.campanha));
    return ['', ...Array.from(campaigns)].sort();
  }, [adsData]);

  const processedLeadsForTable = useMemo(() => {
    return leadsData
      .filter(lead => lead.telefone && lead.telefone.length > 0)
      .map(lead => {
        const ad = adsMap[lead.facebook_ad_id];
        return {
          ...lead,
          data: ad ? ad.data : 'N/A',
          campanha: ad ? ad.campanha : 'N/A',
          conjunto_anuncio: ad ? ad.conjunto_anuncio : 'N/A',
          anuncio: ad ? ad.anuncio : 'N/A',
          link_anuncio: ad ? ad.link_anuncio : '#',
        };
      })
      .filter(lead => {
        const dateMatch = filterDate ? lead.data === filterDate : true;
        const campaignMatch = filterCampaign ? lead.campanha === filterCampaign : true;
        return dateMatch && campaignMatch;
      });
  }, [leadsData, adsMap, filterDate, filterCampaign]);

  return (
    <section className="bg-slate-800/30 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Análise de Leads por Anúncio</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        />
        <select
          value={filterCampaign}
          onChange={(e) => setFilterCampaign(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        >
          {uniqueCampaigns.map(campaign => (
            <option key={campaign} value={campaign}>
              {campaign === '' ? 'Todas as Campanhas' : campaign}
            </option>
          ))}
        </select>
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
              processedLeadsForTable.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.data}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{lead.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.campanha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.conjunto_anuncio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.anuncio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a 
                      href={lead.link_anuncio} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 font-medium"
                    >
                      Abrir Link
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-400">
                  Nenhum lead encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
