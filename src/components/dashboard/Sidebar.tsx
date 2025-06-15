
import React from 'react';
import { cn } from '@/lib/utils';
import { BarChart3, Kanban, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const { isAdmin, profile } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral dos dados',
      color: 'text-blue-400'
    },
    {
      id: 'kanban',
      label: 'Pipeline',
      icon: Kanban,
      description: 'Acompanhe os leads',
      color: 'text-purple-400'
    }
  ];

  // Adicionar item de usuários apenas para admins
  if (isAdmin) {
    menuItems.push({
      id: 'users',
      label: 'Usuários',
      icon: Users,
      description: 'Gerenciar usuários',
      color: 'text-orange-400'
    });
  }

  const SidebarButton = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    
    const button = (
      <button
        onClick={() => setActiveTab(item.id)}
        className={cn(
          "w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 text-left group relative overflow-hidden",
          isActive 
            ? "bg-gradient-to-r from-[#00FF88]/20 to-[#39FF14]/20 text-[#00FF88] growave-neon-border shadow-lg shadow-[#00FF88]/20" 
            : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:shadow-lg hover:shadow-slate-900/20"
        )}
      >
        {/* Animated background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-[#00FF88]/5 to-[#39FF14]/5 rounded-xl opacity-0 transition-opacity duration-300",
          isActive ? "opacity-100" : "group-hover:opacity-50"
        )}></div>
        
        <Icon 
          size={20} 
          className={cn(
            "flex-shrink-0 transition-all duration-300 relative z-10",
            isActive ? "text-[#00FF88] growave-icon-glow scale-110" : `${item.color} group-hover:scale-105`
          )} 
        />
        {!isCollapsed && (
          <div className="flex-1 relative z-10">
            <div className={cn(
              "font-medium transition-colors duration-300",
              isActive ? "text-[#00FF88]" : "group-hover:text-white"
            )}>
              {item.label}
            </div>
            <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300">
              {item.description}
            </div>
          </div>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00FF88] rounded-r-full growave-logo-glow"></div>
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent side="right" className="growave-glass border-slate-700">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full growave-glass border-r border-slate-700/50 z-50 transition-all duration-300 ease-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="h-16 border-b border-slate-700/50 flex items-center justify-between px-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 overflow-hidden bg-slate-800/30 p-1">
          <img 
            src="/lovable-uploads/1fd9c182-3972-410a-8f61-cc365fe0c0df.png" 
            alt="Logo" 
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.log('Logo failed to load, using fallback');
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-[#00FF88] to-[#39FF14] rounded-lg flex items-center justify-center text-slate-900 font-bold text-xs">L</div>';
            }}
          />
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all duration-200 growave-card-hover"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarButton key={item.id} item={item} />
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="growave-glass rounded-xl p-4 border border-slate-700/50 growave-card-hover">
            <div className="flex items-center space-x-3 mb-3">
              {profile && (
                <div className="w-8 h-8 bg-gradient-to-br from-[#00FF88] to-[#39FF14] rounded-full flex items-center justify-center text-slate-900 font-semibold text-sm">
                  {profile.nome_completo?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">
                  {profile?.nome_completo || 'Usuário'}
                </div>
                <div className="text-xs text-slate-400">
                  {isAdmin ? 'Administrador' : 'Cliente'}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 border-t border-slate-700/50 pt-2">
              GroWave Analytics v2.0
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
