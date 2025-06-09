
import React from 'react';
import { LayoutDashboard, Kanban, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Analytics',
      icon: LayoutDashboard,
    },
    {
      id: 'kanban',
      label: 'Pipeline',
      icon: Kanban,
    },
  ];

  return (
    <nav className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00FF88] to-[#39FF14] rounded-xl flex items-center justify-center growave-logo-glow">
                <span className="text-slate-900 font-bold text-lg">G</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-xl growave-neon-text growave-neon-glow">
                  GROWAVE
                </h2>
                <p className="text-slate-400 text-xs">Marketing Hub</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>
      
      {/* Menu */}
      <div className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00FF88]/20 to-[#39FF14]/10 text-[#00FF88] growave-neon-border shadow-xl'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className={isActive ? 'text-[#00FF88]' : ''} />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
