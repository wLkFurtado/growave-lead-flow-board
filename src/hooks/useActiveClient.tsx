
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useActiveClient = () => {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      if (authLoading || !profile) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let clientsToShow: string[] = [];

        if (isAdmin) {
          const [fbResponse, wppResponse] = await Promise.all([
            supabase
              .from('facebook_ads')
              .select('cliente_nome')
              .not('cliente_nome', 'is', null),
            supabase
              .from('whatsapp_anuncio')
              .select('cliente_nome')
              .not('cliente_nome', 'is', null)
          ]);

          const fbClients = fbResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
          const wppClients = wppResponse.data?.map(row => row.cliente_nome).filter(Boolean) || [];
          clientsToShow = [...new Set([...fbClients, ...wppClients])].sort();

        } else {
          const { data: userClientsData, error } = await supabase
            .from('user_clients')
            .select('cliente_nome')
            .eq('user_id', profile.id);

          if (error) {
            logger.error('❌ Erro ao buscar user_clients:', error);
            throw error;
          }

          clientsToShow = userClientsData?.map(row => row.cliente_nome).filter(Boolean).sort() || [];
        }

        setAvailableClients(clientsToShow);
        
        if (clientsToShow.length > 0 && !activeClient) {
          const hospitalDoCabelo = clientsToShow.find(cliente => 
            cliente.toLowerCase().includes('hospital') && cliente.toLowerCase().includes('cabelo')
          );
          
          const clienteParaSelecionar = hospitalDoCabelo || clientsToShow[0];
          setActiveClient(clienteParaSelecionar);
        } else if (clientsToShow.length === 0) {
          setActiveClient('');
        }
        
      } catch (error) {
        logger.error('❌ Erro ao buscar clientes:', error);
        setAvailableClients([]);
        setActiveClient('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [profile, isAdmin, authLoading, activeClient]);

  const changeActiveClient = useCallback((clientName: string) => {
    if (!isAdmin && !availableClients.includes(clientName)) {
      logger.error('❌ ACESSO NEGADO: Usuário não tem permissão para cliente:', clientName);
      return;
    }
    
    setActiveClient('');
    setTimeout(() => {
      setActiveClient(clientName);
    }, 10);
  }, [isAdmin, availableClients]);

  const result = useMemo(() => ({
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    changeActiveClient
  }), [activeClient, availableClients, isLoading, authLoading, changeActiveClient]);

  return result;
};
