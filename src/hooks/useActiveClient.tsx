
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useActiveClient = () => {
  const { profile, isAdmin, isLoading: authLoading } = useAuth();
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔄 useActiveClient: Hook iniciado', {
    authLoading,
    profile: !!profile,
    isAdmin,
    activeClient
  });

  useEffect(() => {
    const fetchClients = async () => {
      console.log('🔄 useActiveClient: Buscando clientes...');
      
      if (authLoading || !profile) {
        console.log('⏳ useActiveClient: Aguardando auth ou sem perfil');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let clientsToShow: string[] = [];

        if (isAdmin) {
          console.log('👑 ADMIN: Buscando TODOS os clientes únicos');
          
          // Admin vê todos os clientes únicos das tabelas de dados
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
          
          console.log('👑 ADMIN: Todos os clientes encontrados:', clientsToShow);

        } else {
          console.log('👤 CLIENTE: Buscando APENAS clientes associados na user_clients');
          
          // Cliente vê APENAS os clientes da tabela user_clients
          const { data: userClientsData, error } = await supabase
            .from('user_clients')
            .select('cliente_nome')
            .eq('user_id', profile.id);

          if (error) {
            console.error('❌ Erro ao buscar user_clients:', error);
            throw error;
          }

          clientsToShow = userClientsData?.map(row => row.cliente_nome).filter(Boolean).sort() || [];
          
          console.log('👤 CLIENTE: Clientes permitidos:', {
            userId: profile.id,
            clientesAssociados: clientsToShow,
            totalClientes: clientsToShow.length
          });
        }

        setAvailableClients(clientsToShow);
        
        // Selecionar primeiro cliente automaticamente se houver
        if (clientsToShow.length > 0 && !activeClient) {
          // Priorizar "Hospital do Cabelo" se existir
          const hospitalDoCabelo = clientsToShow.find(cliente => 
            cliente.toLowerCase().includes('hospital') && cliente.toLowerCase().includes('cabelo')
          );
          
          const clienteParaSelecionar = hospitalDoCabelo || clientsToShow[0];
          console.log('✅ useActiveClient: Selecionando cliente automaticamente:', clienteParaSelecionar);
          setActiveClient(clienteParaSelecionar);
        } else if (clientsToShow.length === 0) {
          console.log('⚠️ useActiveClient: Nenhum cliente disponível para este usuário');
          setActiveClient('');
        }
        
      } catch (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        setAvailableClients([]);
        setActiveClient('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [profile, isAdmin, authLoading]);

  const changeActiveClient = (clientName: string) => {
    console.log('🔄 useActiveClient: MUDANDO CLIENTE:', {
      de: activeClient,
      para: clientName,
      timestamp: new Date().toISOString()
    });
    
    // Verificar se o usuário tem permissão
    if (!isAdmin && !availableClients.includes(clientName)) {
      console.error('❌ ACESSO NEGADO: Usuário não tem permissão para cliente:', clientName);
      console.error('❌ Clientes permitidos:', availableClients);
      return;
    }
    
    setActiveClient(clientName);
    console.log('✅ useActiveClient: Cliente alterado para:', clientName);
  };

    console.log('📊 useActiveClient: Estado final:', {
      activeClient: activeClient,
      availableClients: availableClients,
      totalClientes: availableClients.length,
      isLoading: isLoading || authLoading,
      isAdmin,
      userId: profile?.id
    });

  return {
    activeClient,
    availableClients,
    isLoading: isLoading || authLoading,
    changeActiveClient
  };
};
