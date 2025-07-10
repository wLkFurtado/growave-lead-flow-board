import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ClientContextType {
  activeClient: string;
  availableClients: string[];
  isLoading: boolean;
  changeActiveClient: (clientName: string) => void;
  hasPermission: (clientName: string) => boolean;
}

const ClientContext = createContext<ClientContextType | null>(null);

interface ClientProviderProps {
  children: ReactNode;
}

const CLIENT_STORAGE_KEY = 'lovable-active-client';

export function ClientProvider({ children }: ClientProviderProps) {
  const { profile: userProfile, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeClient, setActiveClient] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar cliente do localStorage
  const loadStoredClient = useCallback(() => {
    try {
      return localStorage.getItem(CLIENT_STORAGE_KEY) || '';
    } catch (error) {
      console.error('Erro ao carregar cliente do localStorage:', error);
      return '';
    }
  }, []);

  // Salvar cliente no localStorage
  const saveClientToStorage = useCallback((clientName: string) => {
    try {
      if (clientName) {
        localStorage.setItem(CLIENT_STORAGE_KEY, clientName);
      } else {
        localStorage.removeItem(CLIENT_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente no localStorage:', error);
    }
  }, []);

  // Verificar se usuário tem permissão para acessar cliente
  const hasPermission = useCallback((clientName: string) => {
    if (!clientName || !userProfile) return false;
    if (isAdmin) return true;
    return availableClients.includes(clientName);
  }, [userProfile, isAdmin, availableClients]);

  // Buscar clientes disponíveis
  const fetchAvailableClients = useCallback(async () => {
    if (!userProfile) {
      setAvailableClients([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 ClientContext: Buscando clientes disponíveis...');

      let clients: string[] = [];

      if (isAdmin) {
        // Admin vê todos os clientes
        const [fbResult, waResult] = await Promise.all([
          supabase.from('facebook_ads').select('cliente_nome').not('cliente_nome', 'is', null),
          supabase.from('whatsapp_anuncio').select('cliente_nome').not('cliente_nome', 'is', null)
        ]);

        const fbClients = fbResult.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        const waClients = waResult.data?.map(row => row.cliente_nome).filter(Boolean) || [];
        
        clients = Array.from(new Set([...fbClients, ...waClients])).sort();
      } else {
        // Usuário regular vê apenas seus clientes
        const { data: userClients, error } = await supabase
          .from('user_clients')
          .select('cliente_nome')
          .eq('user_id', userProfile.id);

        if (error) {
          console.error('❌ ClientContext: Erro ao buscar clientes do usuário:', error);
          throw error;
        }

        clients = userClients?.map(row => row.cliente_nome).filter(Boolean) || [];
      }

      console.log('✅ ClientContext: Clientes encontrados:', clients);
      setAvailableClients(clients);

      // Auto-selecionar cliente
      const storedClient = loadStoredClient();
      let clientToSelect = '';

      if (storedClient && clients.includes(storedClient)) {
        clientToSelect = storedClient;
      } else if (clients.length > 0) {
        // Priorizar "Hospital do Cabelo" se existir
        clientToSelect = clients.find(c => c.toLowerCase().includes('hospital')) || clients[0];
      }

      if (clientToSelect) {
        setActiveClient(clientToSelect);
        saveClientToStorage(clientToSelect);
        console.log('🎯 ClientContext: Cliente selecionado:', clientToSelect);
      }

    } catch (error) {
      console.error('❌ ClientContext: Erro ao buscar clientes:', error);
      setAvailableClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, isAdmin, loadStoredClient, saveClientToStorage]);

  // Mudar cliente ativo
  const changeActiveClient = useCallback((clientName: string) => {
    console.log('🔄 ClientContext: Mudando cliente para:', clientName);
    
    if (!hasPermission(clientName)) {
      console.error('❌ ClientContext: Sem permissão para acessar cliente:', clientName);
      return;
    }

    // Invalidar cache das queries relacionadas ao cliente anterior
    queryClient.invalidateQueries({ queryKey: ['facebook-ads'] });
    queryClient.invalidateQueries({ queryKey: ['whatsapp-leads'] });
    queryClient.invalidateQueries({ queryKey: ['client-data'] });

    // Limpar cliente atual momentaneamente para forçar re-render
    setActiveClient('');
    
    // Definir novo cliente após pequeno delay
    setTimeout(() => {
      setActiveClient(clientName);
      saveClientToStorage(clientName);
      console.log('✅ ClientContext: Cliente alterado para:', clientName);
    }, 50);
  }, [hasPermission, queryClient, saveClientToStorage]);

  // Efeito para buscar clientes quando usuário carrega
  useEffect(() => {
    if (userProfile) {
      fetchAvailableClients();
    } else {
      setActiveClient('');
      setAvailableClients([]);
      setIsLoading(false);
    }
  }, [userProfile, fetchAvailableClients]);

  const value: ClientContextType = {
    activeClient,
    availableClients,
    isLoading,
    changeActiveClient,
    hasPermission
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext deve ser usado dentro de ClientProvider');
  }
  return context;
}