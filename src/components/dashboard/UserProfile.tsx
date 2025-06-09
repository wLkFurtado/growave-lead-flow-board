
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { User, Settings, LogOut, Building, ChevronDown, Shield } from 'lucide-react';

export const UserProfile = () => {
  const { profile, signOut, isAdmin } = useAuth();

  if (!profile) return null;

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-3 hover:bg-slate-800/50 rounded-xl px-3 py-2 transition-all duration-200 group">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white group-hover:text-[#00FF88] transition-colors">
            {profile.name || profile.email}
          </p>
          <div className="flex items-center space-x-1">
            {isAdmin && <Shield size={12} className="text-[#00FF88]" />}
            <p className="text-xs text-slate-400">
              {isAdmin ? 'Administrador' : 'Cliente'}
            </p>
          </div>
        </div>
        <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-[#00FF88]/50 transition-all duration-200">
          <AvatarFallback className="bg-gradient-to-br from-[#00FF88] to-[#39FF14] text-slate-900 text-sm font-bold">
            {getInitials(profile.name, profile.email)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown size={16} className="text-slate-400 group-hover:text-[#00FF88] transition-colors" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-slate-800/95 backdrop-blur-xl border-slate-700 text-white growave-neon-border shadow-2xl"
      >
        <DropdownMenuLabel className="pb-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">{profile.name || profile.email}</p>
            <p className="text-xs text-slate-400">{profile.email}</p>
            <div className="flex items-center space-x-1 text-xs text-[#00FF88]">
              {isAdmin ? <Shield className="h-3 w-3" /> : <Building className="h-3 w-3" />}
              <span>{isAdmin ? 'Administrador' : 'Cliente'}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700/50 hover:text-[#00FF88] focus:text-[#00FF88] transition-colors">
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700/50 hover:text-[#00FF88] focus:text-[#00FF88] transition-colors">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-400 hover:bg-red-900/20 hover:text-red-300 focus:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
