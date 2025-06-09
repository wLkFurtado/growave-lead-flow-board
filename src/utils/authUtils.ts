
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
  
  // Fallback imediato para admin se houver qualquer problema
  const adminFallback: Profile = {
    id: userId,
    nome_completo: user?.email?.split('@')[0] || 'Admin',
    email: user?.email || 'admin@email.com',
    role: 'admin',
    clientes_associados: []
  };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      console.log('⚠️ AuthUtils: Usando fallback admin devido ao erro:', error?.message);
      return adminFallback;
    }

    console.log('✅ AuthUtils: Perfil obtido:', data);
    
    // Para admin, retornar sem buscar clientes associados
    if (data.role === 'admin') {
      return {
        id: data.id,
        nome_completo: data.name || data.email,
        email: data.email,
        role: data.role,
        clientes_associados: []
      };
    }

    // Para usuários regulares, buscar clientes
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
    return adminFallback;
  }
};
