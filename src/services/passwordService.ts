
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
  if (!user) {
    console.error('Usuário não autenticado');
    throw new Error('Usuário não está autenticado. Faça login novamente.');
  }

  console.log('Usuário autenticado:', user.id);
  console.log('Enviando solicitação para Supabase...');
  
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword
  });

  if (error) {
    console.error('=== ERRO DO SUPABASE ===');
    console.error('Erro completo:', error);
    console.error('Mensagem de erro:', error.message);
    console.error('Código de erro:', error.status);
    
    // Tratamento específico para diferentes tipos de erro
    if (error.message.includes('same as the old password') || 
        error.message.includes('same_password') ||
        error.message.includes('New password should be different')) {
      throw new Error('A nova senha deve ser diferente da sua senha atual no sistema.');
    } else if (error.message.includes('should be at least') || 
               error.message.includes('Password should be')) {
      throw new Error('A senha deve atender aos critérios de segurança (mínimo 8 caracteres).');
    } else if (error.message.includes('Invalid credentials') || 
               error.message.includes('Invalid login')) {
      throw new Error('Senha atual incorreta. Verifique e tente novamente.');
    } else if (error.message.includes('network') || 
               error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else {
      throw new Error(error.message || 'Erro inesperado ao alterar a senha. Tente novamente.');
    }
  }

  console.log('=== SENHA ALTERADA COM SUCESSO ===');
};
