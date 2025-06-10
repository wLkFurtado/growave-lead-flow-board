
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
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ AuthUtils: Erro ao buscar perfil:', error);
      throw error;
    }

    if (!data) {
      console.log('⚠️ AuthUtils: Perfil não encontrado, usando fallback admin');
      return {
        id: userId,
        nome_completo: user?.email?.split('@')[0] || 'Admin',
        email: user?.email || 'admin@email.com',
        role: 'admin',
        clientes_associados: []
      };
    }

    console.log('✅ AuthUtils: Perfil obtido:', data);
    
    // Para admin, retornar sem buscar clientes associados (eles veem todos)
    if (data.role === 'admin') {
      return {
        id: data.id,
        nome_completo: data.name || data.email,
        email: data.email,
        role: data.role,
        clientes_associados: [] // Admin vê todos os clientes, não precisa de associação
      };
    }

    // Para usuários regulares, buscar clientes da tabela user_clients
    const { data: userClientsData } = await supabase
      .from('user_clients')
      .select('cliente_nome')
      .eq('user_id', userId);

    const clientesAssociados = userClientsData?.map(item => item.cliente_nome) || [];

    return {
      id: data.id,
      nome_completo: data.name || data.email,
      email: data.email,
      role: data.role,
      clientes_associados: clientesAssociados
    };
  } catch (error) {
    console.error('❌ AuthUtils: Erro fatal, usando admin fallback:', error);
    return {
      id: userId,
      nome_completo: user?.email?.split('@')[0] || 'Admin',
      email: user?.email || 'admin@email.com',
      role: 'admin',
      clientes_associados: []
    };
  }
};
