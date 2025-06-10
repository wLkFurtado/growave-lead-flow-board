
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

    console.log('✅ AuthUtils: Resposta da busca de perfil:', { data, error });

    if (error) {
      console.error('❌ AuthUtils: Erro ao buscar perfil:', error);
      // Retornar perfil admin padrão em caso de erro
      return {
        id: userId,
        nome_completo: user?.email?.split('@')[0] || 'Admin',
        email: user?.email || 'admin@email.com',
        role: 'admin',
        clientes_associados: []
      };
    }

    if (!data) {
      console.log('⚠️ AuthUtils: Perfil não encontrado, criando perfil admin padrão');
      return {
        id: userId,
        nome_completo: user?.email?.split('@')[0] || 'Admin',
        email: user?.email || 'admin@email.com',
        role: 'admin',
        clientes_associados: []
      };
    }

    console.log('✅ AuthUtils: Perfil encontrado:', data);
    
    return {
      id: data.id,
      nome_completo: data.name || data.email,
      email: data.email,
      role: data.role || 'admin',
      clientes_associados: []
    };
  } catch (error) {
    console.error('❌ AuthUtils: Erro fatal ao buscar perfil:', error);
    return {
      id: userId,
      nome_completo: user?.email?.split('@')[0] || 'Admin',
      email: user?.email || 'admin@email.com',
      role: 'admin',
      clientes_associados: []
    };
  }
};
