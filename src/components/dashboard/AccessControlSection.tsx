
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useActiveClient } from '@/hooks/useActiveClient';
import { useClientData } from '@/hooks/useClientData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, Building, CheckCircle, AlertCircle } from 'lucide-react';

export const AccessControlSection = () => {
  const { profile, isAdmin } = useAuth();
  const { activeClient, availableClients, isLoading: clientLoading } = useActiveClient();
  const { facebookAds, whatsappLeads, isLoading: dataLoading } = useClientData({ skipDateFilter: true });

  // Não renderizar se não há perfil
  if (!profile) {
    return (
      <Card className="bg-transparent border-2 border-red-500/60 growave-neon-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Erro ao carregar informações de acesso</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (clientLoading) {
    return (
      <Card className="bg-transparent border-2 border-[#00FF88]/60 growave-neon-border">
        <CardHeader>
          <CardTitle className="text-white">Controle de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400">Carregando informações de acesso...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent border-2 border-[#00FF88]/60 growave-neon-border growave-card-hover">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-[#00FF88]" />
          <span>Controle de Acesso</span>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Suas permissões e dados acessíveis no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status de Permissão */}
        <div className="flex items-center justify-between p-4 bg-slate-800/80 rounded-lg border border-[#00FF88]/20 growave-neon-border">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-[#00FF88]" />
            <div>
              <div className="text-white font-medium">Nível de Acesso</div>
              <div className="text-sm text-slate-400">
                {isAdmin ? 'Administrador com acesso total' : 'Cliente com acesso restrito'}
              </div>
            </div>
          </div>
          <Badge 
            variant={isAdmin ? "default" : "secondary"}
            className={isAdmin 
              ? "bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/50" 
              : "bg-slate-700 text-slate-300 border-slate-600"
            }
          >
            {isAdmin ? 'ADMIN' : 'CLIENTE'}
          </Badge>
        </div>

        {/* Clientes Disponíveis */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-[#00FF88]" />
            <h4 className="text-white font-medium">
              {isAdmin ? 'Todos os Clientes no Sistema' : 'Clientes Associados'}
            </h4>
          </div>
          
          {availableClients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableClients.map(cliente => (
                <div 
                  key={cliente}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    cliente === activeClient 
                      ? 'bg-[#00FF88]/10 border-[#00FF88]/50 text-[#00FF88]'
                      : 'bg-slate-800/50 border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {cliente === activeClient && <CheckCircle className="w-4 h-4" />}
                    <span className="font-medium">{cliente}</span>
                  </div>
                  {cliente === activeClient && (
                    <div className="text-xs mt-1 opacity-80">
                      Cliente ativo atual
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <div className="text-red-400 font-medium">Nenhum cliente associado</div>
              <div className="text-red-300 text-sm mt-1">
                Entre em contato com o administrador para solicitar acesso
              </div>
            </div>
          )}
        </div>

        {/* Dados Acessíveis */}
        {activeClient && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#00FF88]" />
              <h4 className="text-white font-medium">
                Dados Acessíveis para "{activeClient}"
              </h4>
            </div>
            
            {dataLoading ? (
              <div className="text-slate-400">Carregando dados...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                  <div className="text-[#00FF88] font-semibold text-lg">
                    {facebookAds.length}
                  </div>
                  <div className="text-slate-300 text-sm">
                    Registros Facebook Ads
                  </div>
                </div>
                
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                  <div className="text-[#00FF88] font-semibold text-lg">
                    {whatsappLeads.length}
                  </div>
                  <div className="text-slate-300 text-sm">
                    Leads WhatsApp
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resumo do Isolamento */}
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-300">
            <strong className="text-white">Política de Isolamento:</strong>
            <br />
            {isAdmin ? (
              <span className="text-yellow-400">
                Como administrador, você pode visualizar dados de todos os clientes no sistema
              </span>
            ) : (
              <span className="text-green-400">
                Seus dados estão isolados e você só pode acessar informações dos clientes aos quais foi associado
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
