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
  Settings,
  LogOut,
  ExternalLink,
  HelpCircle,
  CreditCard,
  CalendarDays,
  ReceiptText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  className?: string;
  onUpgradeClick?: () => void;
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
      {
        id: 'audience',
        label: 'Audiência (CRM)',
        icon: Users,
        disabled: false
      },
      { id: 'settings', label: 'Configurações & SEO', icon: Settings, disabled: false },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userProfile, className, onUpgradeClick }) => {
  const { user, signOut } = useAuth();

  // State to track which groups are expanded
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'my-linktree': true,
    'insights': true
  });

  const toggleMenu = (groupId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col select-none ${className || ''}`}>

      {/* Public Profile Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Página Pública</span>
          <div className="w-2 h-2 rounded-full bg-[#acc8a2] animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm shrink-0">
            <img src={userProfile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nodus'} alt="Public" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-800 truncate leading-none mb-1">{userProfile.name}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="truncate">noduscc/{userProfile.username || userProfile.name.toLowerCase().replace(/\s/g, '')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
        {MENU_GROUPS.map((group) => {
          const isOpen = openMenus[group.id];
          const GroupIcon = group.groupIcon;

          return (
            <div key={group.id} className="mb-1">
              {/* Group Header */}
              <button
                onClick={() => toggleMenu(group.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                  hover:bg-slate-100 group
                  ${isOpen ? 'text-slate-800' : 'text-slate-500'}
                `}
              >
                <div className="flex items-center gap-3">
                  <GroupIcon size={18} className="opacity-70" />
                  <span className="text-sm font-semibold">{group.label}</span>
                </div>
                {isOpen ? (
                  <ChevronDown size={14} className="text-slate-400" />
                ) : (
                  <ChevronRight size={14} className="text-slate-400" />
                )}
              </button>

              {/* Group Items (Collapsible) */}
              {isOpen && (
                <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-0.5 animate-fade-in">
                  {group.items.map((item) => {
                    const isLocked = (item.id === 'earn' || item.id === 'audience') && (userProfile.planType === 'free' || !userProfile.planType);
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
                              w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group
                              ${activeTab === item.id
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                              ${item.disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}
                              ${isLocked ? 'cursor-not-allowed' : ''}
                            `}
                      >
                        <span className="truncate">{item.label}</span>
                        {isLocked && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-md font-bold">PRO</span>
                            <Zap size={12} className="text-brand-400" />
                          </div>
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

      {/* Logged-in Account Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">



        {/* Subscription Info Card removed from here as per user request */}


        <div className="flex flex-col gap-1 px-1 mb-4">
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 text-[11px] font-bold transition-colors py-2 px-1 w-fit ${activeTab === 'billing' ? 'text-brand-600' : 'text-slate-500 hover:text-brand-600'}`}
          >
            <CreditCard size={14} className="opacity-70" />
            Faturamento
          </button>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-100 shadow-sm group/account relative transition-all duration-300 hover:border-brand-100 hover:shadow-md">
          <div className="w-10 h-10 rounded-full border border-slate-100 overflow-hidden shadow-inner shrink-0">
            <img src={user?.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nodus'} alt="Account" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 overflow-hidden pr-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Conta Logada</p>
            <h3 className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.name || 'Usuário'}</h3>
            <p className="text-[10px] text-slate-500 truncate leading-none">{user?.email || 'email@exemplo.com'}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/account:opacity-100"
            title="Sair da Conta"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;