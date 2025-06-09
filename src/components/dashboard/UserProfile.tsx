
import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { User, Settings, LogOut, Building } from 'lucide-react';

export const UserProfile = () => {
  // Mock data - will be replaced with real data from Supabase
  const user = {
    name: 'João Silva',
    email: 'joao@growave.com',
    company: 'Growave Marketing',
    role: 'Administrador',
    initials: 'JS'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-3 hover:bg-slate-700/50 rounded-lg px-3 py-2 transition-colors">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-slate-400">{user.company}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-emerald-500 text-white text-sm font-medium">
            {user.initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-slate-800 border-slate-700 text-white"
      >
        <DropdownMenuLabel className="pb-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="flex items-center space-x-1 text-xs text-emerald-400">
              <Building className="h-3 w-3" />
              <span>{user.company}</span>
            </div>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 hover:text-white">
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 hover:text-white">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
