
import React from 'react';

interface LeadCardProps {
  lead: {
    id: number;
    nome: string;
    telefone: string;
    origem?: string;
    valor_venda?: number;
  };
}

export const LeadCard = ({ lead }: LeadCardProps) => {
  return (
    <div className="bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-slate-500">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white text-sm">{lead.nome}</h4>
        {lead.origem && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            lead.origem === 'Facebook Ads' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {lead.origem}
          </span>
        )}
      </div>
      
      <p className="text-slate-300 text-sm mb-2">{lead.telefone}</p>
      
      {lead.valor_venda && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-md p-2 mt-3">
          <p className="text-emerald-400 font-bold text-sm">
            R$ {lead.valor_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}
    </div>
  );
};
