
import React from 'react';
import { cn } from '@/lib/utils';
import { BarChart3, Kanban, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const { isAdmin } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral dos dados'
    },
    {
      id: 'kanban',
      label: 'Pipeline',
      icon: Kanban,
      description: 'Acompanhe os leads'
    }
  ];

  // Adicionar item de usuários apenas para admins
  if (isAdmin) {
    menuItems.push({
      id: 'users',
      label: 'Usuários',
      icon: Users,
      description: 'Gerenciar usuários'
    });
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-slate-900/90 backdrop-blur-xl border-r border-slate-700 z-50 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="h-16 border-b border-slate-700 flex items-center justify-between px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00FF88] to-[#39FF14] rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-white growave-neon-text">GroWave</span>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group",
                isActive 
                  ? "bg-gradient-to-r from-[#00FF88]/20 to-[#39FF14]/20 text-[#00FF88] growave-neon-border" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-[#00FF88] growave-icon-glow" : ""
                )} 
              />
              {!isCollapsed && (
                <div className="flex-1">
                  <div className={cn(
                    "font-medium",
                    isActive ? "text-[#00FF88]" : "group-hover:text-white"
                  )}>
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-400">
                    {item.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400 mb-2">GroWave Analytics</div>
            <div className="text-xs text-slate-500">
              {isAdmin ? 'Conta Administrador' : 'Dashboard de Marketing'}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
