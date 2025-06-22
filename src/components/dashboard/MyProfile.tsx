
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Building, Calendar } from 'lucide-react';
import { ChangePasswordForm } from './ChangePasswordForm';
import { AccessControlSection } from './AccessControlSection';

export const MyProfile = () => {
  const { profile, user, isAdmin } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Carregando perfil...</div>
      </div>
    );
  }

  const getInitials = (nomeCompleto: string | null, email: string) => {
    if (nomeCompleto) {
      return nomeCompleto.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-transparent border-2 border-[#00FF88]/60 growave-neon-border rounded-xl p-6 growave-card-hover">
        <div className="flex items-center space-x-6">
          <Avatar className="h-20 w-20 border-4 border-[#00FF88]/30">
            <AvatarFallback className="bg-gradient-to-br from-[#00FF88] to-[#39FF14] text-slate-900 text-xl font-bold">
              {getInitials(profile.nome_completo, profile.email)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white growave-neon-text mb-2">
              {profile.nome_completo || profile.email}
            </h1>
            <div className="flex items-center space-x-3">
              <Badge 
                variant={isAdmin ? "default" : "secondary"}
                className={isAdmin 
                  ? "bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/50" 
                  : "bg-slate-700 text-slate-300 border-slate-600"
                }
              >
                {isAdmin ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Administrador
                  </>
                ) : (
                  <>
                    <Building className="w-3 h-3 mr-1" />
                    Cliente
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card className="bg-transparent border-2 border-[#00FF88]/60 growave-neon-border growave-card-hover">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-[#00FF88]" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#00FF88]/80 font-medium">Nome Completo</label>
              <div className="text-white font-semibold text-lg">
                {profile.nome_completo || 'Não informado'}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-[#00FF88]/80 font-medium flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <div className="text-white font-semibold">
                {profile.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#00FF88]/80 font-medium">Tipo de Usuário</label>
              <div className="text-white font-semibold">
                {isAdmin ? 'Administrador' : 'Cliente'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Conta */}
        <Card className="bg-transparent border-2 border-[#00FF88]/60 growave-neon-border growave-card-hover">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#00FF88]" />
              <span>Informações da Conta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#00FF88]/80 font-medium">ID do Usuário</label>
              <div className="text-white font-mono text-sm bg-slate-800/80 p-3 rounded-lg border border-[#00FF88]/20 growave-neon-border">
                {profile.id}
              </div>
            </div>

            {user?.created_at && (
              <div className="space-y-2">
                <label className="text-sm text-[#00FF88]/80 font-medium flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Membro desde</span>
                </label>
                <div className="text-white font-semibold text-lg">
                  {formatDate(user.created_at)}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-[#00FF88]/80 font-medium">Permissões</label>
              <div className="text-white font-semibold">
                {isAdmin ? 'Acesso total ao sistema' : 'Acesso aos dados do cliente'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Controle de Acesso */}
      <AccessControlSection />

      {/* Seção de Alteração de Senha */}
      <ChangePasswordForm />

      {/* Clientes Associados (se não for admin) - removido pois agora está na AccessControlSection */}
    </div>
  );
};
