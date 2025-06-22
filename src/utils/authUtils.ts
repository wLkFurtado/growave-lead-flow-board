
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
      
      // Se for erro 406 (PGRST116), significa que não encontrou nenhum registro
      if (error.code === 'PGRST116') {
        console.log('⚠️ AuthUtils: Perfil não encontrado, criando perfil padrão');
        
        // Tentar criar um novo perfil
        const newProfile = {
          id: userId,
          email: user?.email || 'email@example.com',
          name: user?.email?.split('@')[0] || 'Usuário',
          role: 'client'
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (createError) {
          console.error('❌ AuthUtils: Erro ao criar perfil:', createError);
          throw new Error('Não foi possível criar o perfil do usuário');
        }
        
        console.log('✅ AuthUtils: Perfil criado com sucesso:', createdProfile);
        
        const profile: Profile = {
          id: createdProfile.id,
          nome_completo: createdProfile.name || user?.email?.split('@')[0] || 'Usuário',
          email: createdProfile.email,
          role: createdProfile.role || 'client',
          clientes_associados: []
        };
        
        return profile;
      }
      
      throw error;
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
    
    console.log('🔄 AuthUtils: Usando perfil fallback:', fallbackProfile);
    return fallbackProfile;
  }
};
