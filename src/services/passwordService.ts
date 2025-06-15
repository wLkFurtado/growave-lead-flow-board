
import { supabase } from '@/integrations/supabase/client';
import { ChangePasswordForm } from '@/utils/passwordValidation';

export const updatePassword = async (data: ChangePasswordForm) => {
  console.log('=== INICIANDO ALTERAÇÃO DE SENHA ===');
  console.log('Dados recebidos:', {
    currentPasswordLength: data.currentPassword.length,
    newPasswordLength: data.newPassword.length,
    confirmPasswordLength: data.confirmPassword.length,
    passwordsMatch: data.newPassword === data.confirmPassword
  });
  
  // Verificar se o usuário está autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    console.error('Usuário não autenticado ou sem email');
    throw new Error('Usuário não está autenticado. Faça login novamente.');
  }

  console.log('Usuário autenticado:', user.id, 'Email:', user.email);

  // PASSO 1: Validar a senha atual usando signInWithPassword
  console.log('=== VALIDANDO SENHA ATUAL ===');
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: data.currentPassword
  });

  if (signInError) {
    console.error('=== ERRO NA VALIDAÇÃO DA SENHA ATUAL ===');
    console.error('Erro completo:', signInError);
    console.error('Mensagem de erro:', signInError.message);
    
    if (signInError.message.includes('Invalid login credentials') || 
        signInError.message.includes('Invalid credentials')) {
      throw new Error('Senha atual incorreta. Verifique e tente novamente.');
    } else {
      throw new Error('Erro ao validar a senha atual. Tente novamente.');
    }
  }

  console.log('✅ Senha atual validada com sucesso');

  // PASSO 2: Agora que validamos a senha atual, alterar para a nova senha
  console.log('=== ALTERANDO PARA NOVA SENHA ===');
  const { error: updateError } = await supabase.auth.updateUser({
    password: data.newPassword
  });

  if (updateError) {
    console.error('=== ERRO AO ALTERAR SENHA ===');
    console.error('Erro completo:', updateError);
    console.error('Mensagem de erro:', updateError.message);
    console.error('Código de erro:', updateError.status);
    
    // Tratamento específico para diferentes tipos de erro
    if (updateError.message.includes('same as the old password') || 
        updateError.message.includes('same_password') ||
        updateError.message.includes('New password should be different')) {
      throw new Error('A nova senha deve ser diferente da sua senha atual no sistema.');
    } else if (updateError.message.includes('should be at least') || 
               updateError.message.includes('Password should be')) {
      throw new Error('A senha deve atender aos critérios de segurança (mínimo 8 caracteres).');
    } else if (updateError.message.includes('network') || 
               updateError.message.includes('fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else {
      throw new Error(updateError.message || 'Erro inesperado ao alterar a senha. Tente novamente.');
    }
  }

  console.log('=== SENHA ALTERADA COM SUCESSO ===');
};
