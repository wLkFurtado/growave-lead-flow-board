
import React from 'react';
import { ChevronDown, Building2, Lock, AlertTriangle } from 'lucide-react';
import { useActiveClient } from '@/hooks/useActiveClient';
import { useAuth } from '@/hooks/useAuth';

export const ClientSelector = () => {
  const { activeClient, availableClients, isLoading, changeActiveClient } = useActiveClient();
  const { isAdmin, profile } = useAuth();

  console.log('=== ClientSelector Render ===');
  console.log('activeClient:', `"${activeClient}"`);
  console.log('availableClients:', availableClients);
  console.log('isLoading:', isLoading);
  console.log('isAdmin:', isAdmin);
  console.log('profile:', profile?.email);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
        <Building2 size={16} className="text-slate-400" />
        <span className="text-slate-400 text-sm">Carregando clientes...</span>
      </div>
    );
  }

  if (!activeClient && availableClients.length === 0) {
    return (
      <div className="flex items-center space-x-2 bg-red-800/50 rounded-lg px-4 py-2 border border-red-700">
        <AlertTriangle size={16} className="text-red-400" />
        <span className="text-red-400 text-sm">
          {isAdmin ? 'Nenhum cliente encontrado no sistema' : 'Você não tem clientes associados'}
        </span>
      </div>
    );
  }

  const handleClientChange = (clientName: string) => {
    console.log('🔄 ClientSelector: INICIANDO MUDANÇA DE CLIENTE:', {
      de: `"${activeClient}"`,
      para: `"${clientName}"`,
      timestamp: new Date().toISOString()
    });
    changeActiveClient(clientName);
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-700 hover:border-[#00FF88]/50 transition-all duration-200 min-w-48">
        <Building2 size={16} className="text-[#00FF88]" />
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          <span className="text-white text-sm font-medium truncate">
            {activeClient || 'Selecionar Cliente'}
          </span>
          {!isAdmin && (
            <div className="flex-shrink-0" title={`Acesso restrito a ${availableClients.length} cliente(s)`}>
              <Lock size={12} className="text-slate-400" />
            </div>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0" />
      </button>
      
      <div className="absolute top-full left-0 mt-2 w-full min-w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
          {/* Header com info de acesso */}
          <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">
            {isAdmin ? (
              <span>👑 Admin - Todos os clientes ({availableClients.length})</span>
            ) : (
              <span>🔒 Seus clientes ({availableClients.length})</span>
            )}
          </div>
          
          {availableClients.length > 0 ? (
            availableClients.map((client) => (
              <button
                key={client}
                onClick={() => handleClientChange(client)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 flex items-center justify-between ${
                  client === activeClient
                    ? 'bg-[#00FF88]/20 text-[#00FF88] font-medium'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="truncate">{client}</span>
                {client === activeClient && (
                  <span className="flex-shrink-0 ml-2 text-xs text-[#00FF88]">✓</span>
                )}
                {!isAdmin && (
                  <div className="flex-shrink-0 ml-2" title="Cliente associado à sua conta">
                    <Lock size={10} className="text-slate-500" />
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-slate-400 text-sm text-center">
              {isAdmin ? 'Nenhum cliente no sistema' : 'Nenhum cliente associado'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
