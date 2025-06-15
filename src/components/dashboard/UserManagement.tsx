
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserCreationForm } from './user-management/UserCreationForm';
import { UsersList } from './user-management/UsersList';
import { useUserCreation } from '@/hooks/useUserCreation';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

interface UserClient {
  id: string;
  user_id: string;
  cliente_nome: string;
}

export const UserManagement = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userClients, setUserClients] = useState<UserClient[]>([]);
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { createUser, isCreating, creationStep } = useUserCreation(fetchData);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  async function fetchData() {
    try {
      setIsLoading(true);
      
      // Buscar perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar associações usuário-cliente
      const { data: userClientsData, error: userClientsError } = await supabase
        .from('user_clients')
        .select('*');

      if (userClientsError) throw userClientsError;

      // Buscar clientes disponíveis
      const [fbResponse, wppResponse] = await Promise.all([
        supabase.from('facebook_ads').select('cliente_nome').not('cliente_nome', 'is', null),
        supabase.from('whatsapp_anuncio').select('cliente_nome').not('cliente_nome', 'is', null)
      ]);

      const fbClients = fbResponse.data?.map(row => row.cliente_nome) || [];
      const wppClients = wppResponse.data?.map(row => row.cliente_nome) || [];
      const allClients = [...new Set([...fbClients, ...wppClients])];

      setProfiles(profilesData || []);
      setUserClients(userClientsData || []);
      setAvailableClients(allClients);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos usuários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Acesso restrito a administradores.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Formulário de criação */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#00FF88]" />
            Criar Novo Usuário
          </CardTitle>
          <CardDescription className="text-slate-400">
            Adicione novos usuários ao sistema com controle de role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserCreationForm
            availableClients={availableClients}
            onSubmit={createUser}
            isCreating={isCreating}
            creationStep={creationStep}
          />
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Usuários do Sistema</CardTitle>
          <CardDescription className="text-slate-400">
            Visualize todos os usuários cadastrados (atualizado automaticamente)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersList profiles={profiles} userClients={userClients} />
        </CardContent>
      </Card>
    </div>
  );
};
