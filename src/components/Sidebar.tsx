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
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
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
    label: 'My Nodus',
    groupIcon: Layers,
    items: [
      { id: 'links', label: 'Links', icon: LinkIcon },
      { id: 'appearance', label: 'Design', icon: Palette },
      { id: 'shop', label: 'Shop', icon: ShoppingBag, disabled: false },
      { id: 'earn', label: 'Earn (Tip Jar)', icon: DollarSign, disabled: false },
    ]
  },
  {
    id: 'insights',
    label: 'Insights',
    groupIcon: BarChart2,
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart2, disabled: false },
      { id: 'audience', label: 'Audience (CRM)', icon: Users, disabled: false },
      { id: 'settings', label: 'Settings & SEO', icon: Settings, disabled: false },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userProfile }) => {
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
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto z-40 hidden md:flex flex-col select-none">

      {/* User Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
        <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shadow-sm">
          <img src={userProfile.avatarUrl} alt="User" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-bold text-slate-800 truncate">{userProfile.name}</h3>
          <p className="text-xs text-slate-500 truncate">@{userProfile.name.toLowerCase().replace(/\s/g, '')}</p>
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
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => !item.disabled && setActiveTab(item.id)}
                      disabled={item.disabled}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${activeTab === item.id
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                        ${item.disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-500' : ''}
                      `}
                    >
                      {/* We don't necessarily need the icon for sub-items to keep it clean, 
                          but can add it back if requested. Using text only for cleaner tree look similar to reference. */}
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        <div className="flex flex-col gap-2">
          <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 text-left">
            Ajuda e Suporte
          </button>
          <div className="text-[10px] text-slate-400 mt-2">
            Nodus v2.1.0 • © 2024
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;