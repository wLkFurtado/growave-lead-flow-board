
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
  console.log('🔄 AuthUtils: Buscando perfil do usuário no banco:', userId);
  
  try {
    // Buscar perfil da tabela profiles
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ AuthUtils: Erro ao buscar perfil:', error);
      // Se não encontrar o perfil, criar um padrão baseado no email
      const fallbackProfile: Profile = {
        id: userId,
        nome_completo: user?.email?.split('@')[0] || 'Usuário',
        email: user?.email || 'email@example.com',
        role: 'client', // Padrão é client, não admin
        clientes_associados: []
      };
      return fallbackProfile;
    }

    const profile: Profile = {
      id: profileData.id,
      nome_completo: profileData.name || user?.email?.split('@')[0] || 'Usuário',
      email: profileData.email,
      role: profileData.role || 'client',
      clientes_associados: []
    };

    console.log('✅ AuthUtils: Perfil encontrado no banco:', profile);
    return profile;
  } catch (error) {
    console.error('❌ AuthUtils: Erro inesperado ao buscar perfil:', error);
    
    // Fallback em caso de erro
    const fallbackProfile: Profile = {
      id: userId,
      nome_completo: user?.email?.split('@')[0] || 'Usuário',
      email: user?.email || 'email@example.com',
      role: 'client',
      clientes_associados: []
    };
    
    return fallbackProfile;
  }
};
