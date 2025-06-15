
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Shield, Building, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

interface UserClient {
  id: string;
  user_id: string;
  cliente_nome: string;
}

export const UserManagement = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userClients, setUserClients] = useState<UserClient[]>([]);
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar associações usuário-cliente
      const { data: userClientsData, error: userClientsError } = await supabase
        .from('user_clients')
        .select('*');

      if (userClientsError) throw userClientsError;

      // Buscar clientes disponíveis
      const [fbResponse, wppResponse] = await Promise.all([
        supabase.from('facebook_ads').select('cliente_nome').not('cliente_nome', 'is', null),
        supabase.from('whatsapp_anuncio').select('cliente_nome').not('cliente_nome', 'is', null)
      ]);

      const fbClients = fbResponse.data?.map(row => row.cliente_nome) || [];
      const wppClients = wppResponse.data?.map(row => row.cliente_nome) || [];
      const allClients = [...new Set([...fbClients, ...wppClients])];

      setProfiles(profilesData || []);
      setUserClients(userClientsData || []);
      setAvailableClients(allClients);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos usuários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreationStep('Criando conta do usuário...');

    try {
      console.log('Iniciando criação de usuário com role:', role);
      
      // Passo 1: Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email,
            role: role // Crucial: passar o role nos metadados
          }
        }
      });

      if (authError) {
        console.error('Erro no signup:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      console.log('✅ Usuário criado no Auth, ID:', authData.user.id, 'Role enviado:', role);
      setCreationStep('Configurando perfil do usuário...');

      // Passo 2: Aguardar o trigger criar o perfil (com delay maior)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Passo 3: Verificar se o perfil foi criado corretamente
      setCreationStep('Verificando perfil criado...');
      const { data: profileCheck, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('📋 Perfil encontrado:', profileCheck);

      if (profileCheckError || !profileCheck) {
        console.warn('⚠️ Perfil não encontrado, tentando criar manualmente...');
        
        // Criar perfil manualmente se o trigger falhou
        const { data: manualProfile, error: manualError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            name: name || email,
            role: role
          })
          .select()
          .single();

        if (manualError) {
          console.error('❌ Erro ao criar perfil manualmente:', manualError);
          throw manualError;
        }

        console.log('✅ Perfil criado manualmente:', manualProfile);
      } else {
        // Verificar se o role está correto
        if (profileCheck.role !== role) {
          console.log(`🔄 Role incorreto (${profileCheck.role}), corrigindo para ${role}...`);
          setCreationStep('Corrigindo role do usuário...');
          
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', authData.user.id)
            .select();

          if (updateError) {
            console.error('❌ Erro ao corrigir role:', updateError);
            toast({
              title: "Aviso",
              description: `Usuário criado, mas role pode estar incorreto. Verifique na lista.`,
              variant: "default"
            });
          } else {
            console.log('✅ Role corrigido com sucesso:', updateData);
          }
        } else {
          console.log('✅ Role está correto:', profileCheck.role);
        }
      }

      // Passo 4: Associar clientes se for um cliente
      if (role === 'client' && selectedClients.length > 0) {
        setCreationStep('Associando clientes...');
        
        const clientAssociations = selectedClients.map(clientName => ({
          user_id: authData.user.id,
          cliente_nome: clientName
        }));

        const { error: clientsError } = await supabase
          .from('user_clients')
          .insert(clientAssociations);

        if (clientsError) {
          console.error('Erro ao associar clientes:', clientsError);
          toast({
            title: "Aviso",
            description: "Usuário criado, mas houve erro ao associar clientes.",
            variant: "default"
          });
        } else {
          console.log('✅ Clientes associados com sucesso');
        }
      }

      setCreationStep('Finalizando...');

      toast({
        title: "Sucesso",
        description: `Usuário ${email} criado com sucesso como ${role}!`,
      });

      // Limpar formulário
      setEmail('');
      setPassword('');
      setName('');
      setRole('client');
      setSelectedClients([]);
      
      // Recarregar dados com delay maior para garantir consistência
      setTimeout(() => {
        console.log('🔄 Recarregando dados...');
        fetchData();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error);
      
      let errorMessage = "Erro ao criar usuário";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado no sistema";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Email inválido";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Senha deve ter pelo menos 6 caracteres";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setCreationStep('');
    }
  };

  const getUserClients = (userId: string) => {
    return userClients.filter(uc => uc.user_id === userId).map(uc => uc.cliente_nome);
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Acesso restrito a administradores.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Formulário de criação */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#00FF88]" />
            Criar Novo Usuário
          </CardTitle>
          <CardDescription className="text-slate-400">
            Adicione novos usuários ao sistema com controle de role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status da criação */}
          {isCreating && (
            <Alert className="mb-4 bg-blue-900/20 border-blue-500/50">
              <Clock className="h-4 w-4 text-blue-400 animate-spin" />
              <AlertDescription className="text-blue-300">
                <strong>Criando usuário:</strong> {creationStep}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Nome do usuário"
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">Tipo de Usuário *</Label>
                <Select 
                  value={role} 
                  onValueChange={(value: 'admin' | 'client') => setRole(value)}
                  disabled={isCreating}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {role === 'client' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Clientes Associados</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableClients.map(client => (
                    <label key={client} className="flex items-center space-x-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClients([...selectedClients, client]);
                          } else {
                            setSelectedClients(selectedClients.filter(c => c !== client));
                          }
                        }}
                        className="rounded"
                        disabled={isCreating}
                      />
                      <span className="text-sm">{client}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isCreating}
              className="bg-gradient-to-r from-[#00FF88] to-[#39FF14] text-slate-900 font-bold hover:from-[#00FF88]/90 hover:to-[#39FF14]/90"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  Criando...
                </div>
              ) : (
                'Criar Usuário'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Usuários do Sistema</CardTitle>
          <CardDescription className="text-slate-400">
            Visualize todos os usuários cadastrados (atualizado automaticamente)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Usuário</TableHead>
                <TableHead className="text-slate-300">Tipo</TableHead>
                <TableHead className="text-slate-300">Clientes</TableHead>
                <TableHead className="text-slate-300">Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map(profile => (
                <TableRow key={profile.id} className="border-slate-700">
                  <TableCell className="text-white">
                    <div>
                      <div className="font-medium">{profile.name || profile.email}</div>
                      {profile.name && (
                        <div className="text-sm text-slate-400">{profile.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={profile.role === 'admin' ? 'default' : 'secondary'}
                      className={profile.role === 'admin' 
                        ? 'bg-[#00FF88] text-slate-900' 
                        : 'bg-slate-600 text-white'
                      }
                    >
                      {profile.role === 'admin' ? (
                        <><Shield className="w-3 h-3 mr-1" />Admin</>
                      ) : (
                        <><Building className="w-3 h-3 mr-1" />Cliente</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {profile.role === 'admin' ? (
                      <span className="text-[#00FF88]">Todos os clientes</span>
                    ) : (
                      <div className="space-y-1">
                        {getUserClients(profile.id).map(client => (
                          <Badge key={client} variant="outline" className="text-xs">
                            {client}
                          </Badge>
                        ))}
                        {getUserClients(profile.id).length === 0 && (
                          <span className="text-red-400 text-sm">Nenhum cliente</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {profiles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">Nenhum usuário encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
