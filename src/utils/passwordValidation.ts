
import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Nova senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Nova senha e confirmação não coincidem",
  path: ["confirmPassword"]
});
// Removida a validação currentPassword !== newPassword que causava conflito

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
