import React from 'react';
import { LayoutDashboard, Users, Phone, KanbanSquare, UserCircle } from 'lucide-react';

interface MobileSidebarNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAdmin: boolean;
  onClose?: () => void;
}

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'contacts', label: 'Contatos', icon: Phone },
  { key: 'kanban', label: 'Kanban', icon: KanbanSquare },
  { key: 'profile', label: 'Meu Perfil', icon: UserCircle },
] as const;

export const MobileSidebarNav: React.FC<MobileSidebarNavProps> = ({ activeTab, onSelectTab, isAdmin, onClose }) => {
  return (
    <nav className="py-2">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <li key={item.key}>
              <button
                onClick={() => { onSelectTab(item.key); onClose?.(); }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
                  ${isActive ? 'bg-muted text-primary' : 'hover:bg-muted/50'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
        {isAdmin && (
          <li>
            <button
              onClick={() => { onSelectTab('users'); onClose?.(); }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
                ${activeTab === 'users' ? 'bg-muted text-primary' : 'hover:bg-muted/50'}`}
            >
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};
