import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Eye, Bug } from 'lucide-react';

interface DebugOverlayProps {
  activeClient: string;
  isPageVisible: boolean;
}

export const DebugOverlay = ({ activeClient, isPageVisible }: DebugOverlayProps) => {
  const queryClient = useQueryClient();
  const [lastRefetch, setLastRefetch] = useState<Date>();
  const [isVisible, setIsVisible] = useState(false);

  const handleForceRefetch = () => {
    if (activeClient) {
      console.log('🔄 DEBUG: Forçando refetch manual para:', activeClient);
      
      queryClient.invalidateQueries({ 
        queryKey: ['facebook-ads', activeClient],
        refetchType: 'all'
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['whatsapp-leads', activeClient],
        refetchType: 'all'
      });
      
      setLastRefetch(new Date());
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-slate-800/90 border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        <Bug className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-slate-900/95 border-slate-700 text-slate-300 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug Panel
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Cliente Ativo:</span>
            <span className="font-mono bg-slate-800 px-2 py-1 rounded">
              {activeClient || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Página Visível:</span>
            <div className="flex items-center gap-1">
              <Eye className={`w-3 h-3 ${isPageVisible ? 'text-green-400' : 'text-red-400'}`} />
              <span className={isPageVisible ? 'text-green-400' : 'text-red-400'}>
                {isPageVisible ? 'Sim' : 'Não'}
              </span>
            </div>
          </div>
          
          {lastRefetch && (
            <div className="flex items-center justify-between">
              <span>Último Refetch:</span>
              <span className="font-mono text-xs">
                {lastRefetch.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleForceRefetch}
          disabled={!activeClient}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Forçar Atualização
        </Button>
        
        <p className="text-slate-500 text-[10px] leading-tight">
          Use este painel para monitorar e forçar atualizações dos dados quando a UI não responder.
        </p>
      </CardContent>
    </Card>
  );
};