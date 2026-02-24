import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  LayoutGrid,
  Palette,
  ShoppingBag,
  DollarSign,
  Users,
  BarChart2,
  Calendar,
  MessageCircle,
  Link as LinkIcon,
  Zap,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  LogOut,
  ExternalLink,
  HelpCircle,
  CreditCard,
  CalendarDays,
  ReceiptText,
  User,
  FolderOpen,
  ChevronsLeft,
  ShieldAlert
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  className?: string;
  onUpgradeClick?: () => void;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  disabled?: boolean;
}

interface MenuGroup {
  id: string;
  label: string;
  groupIcon: any;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'my-linktree',
    label: 'Meu Nodus',
    groupIcon: Layers,
    items: [
      { id: 'links', label: 'Links', icon: LinkIcon },
      { id: 'appearance', label: 'Design', icon: Palette },
      { id: 'shop', label: 'Loja', icon: ShoppingBag, disabled: false },
      { id: 'earn', label: 'Monetizar (Caixinha)', icon: DollarSign, disabled: false },
    ]
  },
  {
    id: 'insights',
    label: 'Insights',
    groupIcon: BarChart2,
    items: [
      {
        id: 'analytics',
        label: 'Estatísticas',
        icon: BarChart2,
        disabled: false
      },
    ]
  },
  {
    id: 'tools',
    label: 'Ferramentas',
    groupIcon: Sparkles,
    items: [
      {
        id: 'files',
        label: 'Arquivos',
        icon: FolderOpen,
        disabled: false
      }
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userProfile, className, onUpgradeClick, onClose }) => {
  const { user, signOut } = useAuth();

  // State to track which groups are expanded
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'my-linktree': true,
    'insights': true,
    'tools': true
  });

  const toggleMenu = (groupId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <aside className={`w-64 shrink-0 bg-[#ffffff] border-r-2 border-black h-full flex flex-col select-none overflow-hidden relative ${className || ''}`}>
      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      {/* Profile Header - Compact & Brutalist */}
      <div className="p-4 border-b-2 border-black bg-white flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 bg-white">
            <img
              src={userProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`}
              alt="Public"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`;
              }}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-[10px] font-black text-black uppercase tracking-widest truncate leading-tight">{userProfile.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[8px] font-bold text-black/50 uppercase tracking-tighter truncate leading-none">nodus.my/{userProfile.username || userProfile.name.toLowerCase().replace(/\s/g, '')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2 relative z-10">
        {MENU_GROUPS.map((group) => {
          const isOpen = openMenus[group.id];

          const GroupIcon = group.groupIcon;

          return (
            <div key={group.id} className="mb-4">
              {/* Group Header */}
              <button
                onClick={() => toggleMenu(group.id)}
                className="w-full flex items-center justify-between py-2.5 px-1 border-b-[1.5px] border-black/10 mb-2 group hover:border-black transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-black/5 group-hover:bg-black group-hover:text-[#97cd7a] transition-colors rounded-sm">
                    <GroupIcon size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/60 group-hover:text-black transition-colors">{group.label}</span>
                </div>
                <ChevronDown size={12} className={`text-black/40 group-hover:text-black transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} strokeWidth={3} />
              </button>

              {/* Group Items */}
              {isOpen && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isLocked = (item.id === 'earn' || item.id === 'audience') && (userProfile.planType === 'free' || !userProfile.planType);
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isLocked) {
                            onUpgradeClick?.();
                          } else if (!item.disabled) {
                            setActiveTab(item.id);
                          }
                        }}
                        disabled={item.disabled}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 transition-all border-2 mb-1 group relative
                          ${isActive
                            ? 'bg-[#97cd7a] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[0.5px] -translate-y-[0.5px] text-black'
                            : 'bg-transparent border-transparent text-black/50 hover:text-black hover:border-black/20 hover:bg-black/5'}
                          ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`transition-transform group-hover:scale-110 ${isActive ? 'text-black' : 'text-black/40 group-hover:text-black'}`}>
                            <ItemIcon size={14} strokeWidth={3} />
                          </div>
                          <span className={`text-[9.5px] font-black uppercase tracking-widest ${isActive ? 'text-black' : ''}`}>{item.label}</span>
                        </div>

                        {isLocked ? (
                          <div className="flex items-center gap-1.5 min-w-fit">
                            <span className="text-[7px] bg-black text-[#97cd7a] px-1.5 py-0.5 font-black uppercase tracking-widest">VIP</span>
                          </div>
                        ) : isActive && (
                          <div className="w-1.5 h-1.5 bg-black rounded-full shadow-[0px_0px_4px_rgba(0,0,0,0.2)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t-2 border-black bg-white relative z-10">
        <div className="flex flex-col gap-1 mb-4">
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all py-2 px-3 border-2 group ${activeTab === 'billing' ? 'border-black bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-[0.5px]' : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'}`}
          >
            <CreditCard size={13} strokeWidth={3} />
            Upgrade & Planos
          </button>

          {userProfile?.username === 'nodus' || user?.email === 'jaoomarcos75@gmail.com' ? (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all py-2 px-3 border-2 group ${activeTab === 'admin' ? 'border-black bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-[0.5px]' : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'}`}
            >
              <ShieldAlert size={13} strokeWidth={3} />
              Administração
            </button>
          ) : null}

          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all py-2 px-3 border-2 group ${activeTab === 'support' ? 'border-black bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-[0.5px]' : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'}`}
          >
            <HelpCircle size={13} strokeWidth={3} />
            Suporte
          </button>
        </div>

        {/* Account Switcher / User Profile Mini Card */}
        <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group/user">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 border border-black overflow-hidden bg-slate-50 shrink-0">
              {user?.picture ? (
                <img src={user.picture} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black text-white"><User size={14} /></div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase tracking-tight truncate text-black leading-none mb-0.5">{user?.name || 'Usuário'}</div>
              <div className="text-[7px] font-bold uppercase tracking-tighter truncate text-black/40 leading-none">{user?.email || 'email@exemplo.com'}</div>
            </div>
          </div>
          <button onClick={() => signOut()} className="p-1 text-black/30 hover:text-red-500 transition-colors shrink-0">
            <LogOut size={13} strokeWidth={3} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;