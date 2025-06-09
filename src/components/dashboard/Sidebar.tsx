
import React from 'react';
import { LayoutDashboard, Kanban } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Principal',
      icon: LayoutDashboard,
    },
    {
      id: 'kanban',
      label: 'Jornada do Lead',
      icon: Kanban,
    },
  ];

  return (
    <nav className="w-64 bg-slate-900/90 backdrop-blur-lg border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00FF88] to-[#39FF14] rounded-lg flex items-center justify-center growave-logo-glow">
            <span className="text-slate-900 font-bold text-sm">G</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg growave-neon-text growave-neon-glow">
              GROWAVE
            </h2>
            <p className="text-slate-400 text-xs">Marketing Analytics</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00FF88]/20 to-[#39FF14]/10 text-[#00FF88] growave-neon-border shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-[#00FF88]' : ''} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
