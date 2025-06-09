
import React from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { useActiveClient } from '@/hooks/useActiveClient';

export const ClientSelector = () => {
  const { activeClient, availableClients, isLoading, changeActiveClient } = useActiveClient();

  console.log('=== ClientSelector Render ===');
  console.log('activeClient:', activeClient);
  console.log('availableClients:', availableClients);
  console.log('isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
        <Building2 size={16} className="text-slate-400" />
        <span className="text-slate-400 text-sm">Carregando...</span>
      </div>
    );
  }

  if (!activeClient && availableClients.length === 0) {
    return (
      <div className="flex items-center space-x-2 bg-red-800/50 rounded-lg px-4 py-2 border border-red-700">
        <Building2 size={16} className="text-red-400" />
        <span className="text-red-400 text-sm">Nenhum cliente encontrado</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-700 hover:border-[#00FF88]/50 transition-all duration-200">
        <Building2 size={16} className="text-[#00FF88]" />
        <span className="text-white text-sm font-medium">
          {activeClient || 'Selecionar Cliente'}
        </span>
        <ChevronDown size={14} className="text-slate-400 group-hover:text-white transition-colors" />
      </button>
      
      <div className="absolute top-full left-0 mt-2 w-full min-w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2 space-y-1">
          {availableClients.map((client) => (
            <button
              key={client}
              onClick={() => changeActiveClient(client)}
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
    </div>
  );
};
