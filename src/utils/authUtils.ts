
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const signIn = async (email: string, password: string) => {
  console.log('🔄 AuthUtils: Fazendo login...');
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};

export const signOut = async () => {
  console.log('🔄 AuthUtils: Fazendo logout...');
  await supabase.auth.signOut();
};

export const fetchProfile = async (userId: string, user: any): Promise<Profile> => {
  console.log('🔄 AuthUtils: Buscando perfil para userId:', userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ AuthUtils: Erro ao buscar perfil:', error);
    // Retorna perfil temporário em caso de erro
    return {
      id: userId,
      nome_completo: 'Usuário',
      email: user?.email || 'usuario@email.com',
      role: 'client',
      clientes_associados: []
    };
  }

  console.log('✅ AuthUtils: Perfil obtido:', data);

  let clientesAssociados: string[] = [];
  
  // Para usuários não-admin, buscar clientes da tabela user_clients
  if (data.role !== 'admin') {
    try {
      console.log('🔄 AuthUtils: Buscando clientes associados para usuário regular...');
      const { data: userClientsData } = await supabase
        .from('user_clients')
        .select('cliente_nome')
        .eq('user_id', userId);

      if (userClientsData) {
        clientesAssociados = userClientsData.map(item => item.cliente_nome);
        console.log('✅ AuthUtils: Clientes encontrados:', clientesAssociados);
      }
    } catch (error) {
      console.error('❌ AuthUtils: Erro ao buscar clientes do usuário:', error);
    }
  }

  return {
    id: data.id,
    nome_completo: data.name || data.email,
    email: data.email,
    role: data.role,
    clientes_associados: clientesAssociados
  };
};
