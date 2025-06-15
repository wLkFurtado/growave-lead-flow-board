
import React from 'react';
import { ChevronDown, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useActiveClient } from '@/hooks/useActiveClient';

export const ClientSelector = () => {
  const { activeClient, availableClients, isLoading, changeActiveClient } = useActiveClient();

  console.log('=== ClientSelector Render ===');
  console.log('activeClient:', `"${activeClient}"`);
  console.log('availableClients:', availableClients);
  console.log('isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
        <Loader2 size={16} className="text-[#00FF88] animate-spin" />
        <span className="text-slate-300 text-sm">Carregando clientes...</span>
      </div>
    );
  }

  if (!activeClient && availableClients.length === 0) {
    return (
      <div className="flex items-center space-x-2 bg-amber-800/50 rounded-lg px-4 py-2 border border-amber-700">
        <AlertCircle size={16} className="text-amber-400" />
        <span className="text-amber-400 text-sm">Configurando acesso...</span>
      </div>
    );
  }

  if (!activeClient) {
    return (
      <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
        <Building2 size={16} className="text-slate-400" />
        <span className="text-slate-400 text-sm">Selecionar Cliente</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-700 hover:border-[#00FF88]/50 transition-all duration-200 min-w-48">
        <Building2 size={16} className="text-[#00FF88]" />
        <span className="text-white text-sm font-medium truncate">
          {activeClient}
        </span>
        {availableClients.length > 1 && (
          <ChevronDown size={14} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0" />
        )}
      </button>
      
      {availableClients.length > 1 && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
            {availableClients.map((client) => (
              <button
                key={client}
                onClick={() => {
                  console.log('ClientSelector: Selecionando cliente:', `"${client}"`);
                  changeActiveClient(client);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                  client === activeClient
                    ? 'bg-[#00FF88]/20 text-[#00FF88] font-medium'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {client}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
