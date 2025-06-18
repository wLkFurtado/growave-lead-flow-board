
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useActiveClient } from '@/hooks/useActiveClient';
import { useClientData } from '@/hooks/useClientData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Database } from 'lucide-react';

export const AccessTestPanel = () => {
  const { profile, isAdmin } = useAuth();
  const { activeClient, availableClients } = useActiveClient();
  const { facebookAds, whatsappLeads } = useClientData({ skipDateFilter: true });

  if (!profile) return null;

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#00FF88]" />
          Controle de Acesso - Teste
        </CardTitle>
        <CardDescription className="text-slate-400">
          Verificação do controle exclusivo por cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info do usuário */}
        <div className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg">
          <User className="h-4 w-4 text-[#00FF88]" />
          <div>
            <span className="text-white font-medium">{profile.email}</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              isAdmin ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              {isAdmin ? 'ADMIN' : 'CLIENTE'}
            </span>
          </div>
        </div>

        {/* Clientes disponíveis */}
        <div className="p-3 bg-slate-700/30 rounded-lg">
          <h4 className="text-white font-medium mb-2">Clientes Disponíveis:</h4>
          {availableClients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableClients.map(cliente => (
                <span 
                  key={cliente}
                  className={`px-2 py-1 rounded text-xs ${
                    cliente === activeClient 
                      ? 'bg-[#00FF88] text-slate-900 font-medium'
                      : 'bg-slate-600 text-slate-300'
                  }`}
                >
                  {cliente}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-red-400 text-sm">Nenhum cliente associado</span>
          )}
        </div>

        {/* Dados acessíveis */}
        <div className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg">
          <Database className="h-4 w-4 text-[#00FF88]" />
          <div className="text-white">
            <span className="font-medium">Dados acessíveis para "{activeClient}":</span>
            <div className="text-sm text-slate-300 mt-1">
              Facebook Ads: {facebookAds.length} registros | 
              WhatsApp Leads: {whatsappLeads.length} registros
            </div>
          </div>
        </div>

        {/* Status de isolamento */}
        <div className="p-3 bg-slate-700/30 rounded-lg">
          <div className="text-sm text-slate-300">
            <strong className="text-white">Status do Isolamento:</strong>
            <br />
            {isAdmin ? (
              <span className="text-yellow-400">ADMIN - Pode ver todos os clientes</span>
            ) : (
              <span className="text-green-400">
                CLIENTE - Restrito a {availableClients.length} cliente(s)
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
