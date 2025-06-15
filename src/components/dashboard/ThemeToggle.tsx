
import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} className="text-yellow-500" />;
      case 'dark':
        return <Moon size={20} className="text-blue-400" />;
      default:
        return <Monitor size={20} className="text-slate-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50 hover:bg-slate-200 text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-700 transition-all duration-200 growave-card-hover"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="growave-glass border-slate-700/50 dark:border-slate-700/50 border-slate-300/50"
      >
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
          <Sun size={16} className="mr-2 text-yellow-500" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
          <Moon size={16} className="mr-2 text-blue-400" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
          <Monitor size={16} className="mr-2 text-slate-400" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
