import React, { useState } from 'react';
import { UserProfile, LinkItem } from '../types';
import {
  Palette,
  ShoppingBag,
  DollarSign,
  BarChart2,
  Link as LinkIcon,
  Globe,
  FolderOpen,
  Layers,
  HelpCircle,
  CreditCard,
  ShieldAlert,
  X,
  User,
  LogOut,
  ChevronUp,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageToggle from './LanguageToggle';
import { imgOptimized } from '../utils/imageUtils';
import CompactOnboardingCard from './CompactOnboardingCard';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  links?: LinkItem[];
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

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userProfile, onUpdateProfile, links = [], className, onUpgradeClick, onClose }) => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const isPT = i18n.language.startsWith('pt');

  const MENU_GROUPS: MenuGroup[] = [
    {
      id: 'my-linktree',
      label: t('sidebar.myNodus'),
      groupIcon: Layers,
      items: [
        { id: 'links', label: t('sidebar.links'), icon: LinkIcon, disabled: false },
        { id: 'appearance', label: t('sidebar.design'), icon: Palette, disabled: false },
        { id: 'shop', label: t('sidebar.shop'), icon: ShoppingBag, disabled: false },
      ]
    },
    {
      id: 'connections',
      label: t('sidebar.connections'),
      groupIcon: Globe,
      items: [
        { id: 'integrations', label: t('sidebar.integrations'), icon: Globe, disabled: false },
      ]
    },
    {
      id: 'insights',
      label: t('sidebar.insights'),
      groupIcon: BarChart2,
      items: [
        { id: 'analytics', label: t('sidebar.analytics'), icon: BarChart2, disabled: false }
      ]
    },
    {
      id: 'tools',
      label: t('sidebar.tools'),
      groupIcon: Settings,
      items: [
        { id: 'files', label: t('sidebar.files'), icon: FolderOpen, disabled: false }
      ]
    }
  ];

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside className={`w-full md:w-64 shrink-0 bg-transparent md:border-r-2 border-[#1a1a1a] h-full flex flex-col select-none relative overflow-hidden ${className || ''}`}>
      
      {/* Global background and dots will show through here */}

      {/* Header Profile Area - Clean and refined - Height forced to 61px for alignment */}
      <div className="w-full relative z-10 px-8 py-2.5 border-b-2 border-[#1a1a1a] bg-transparent flex flex-col justify-center h-[61px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center group cursor-default">
            <div className="w-9 h-9 rounded-full border-2 border-[#1a1a1a] overflow-hidden shrink-0 shadow-[0_2px_0_0_#1a1a1a] bg-slate-50 transition-all group-hover:-translate-y-[0.5px] group-hover:shadow-[0_3px_0_0_#1a1a1a]">
              <img 
                src={imgOptimized.avatarMd(userProfile.avatarUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`;
                }}
              />
            </div>
            <div className="flex flex-col ml-3.5 min-w-0">
              <h3 className="font-black text-[12px] uppercase tracking-wider text-[#1a1a1a] truncate leading-none">
                {userProfile.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[#1a1a1a]/40 font-bold text-[9px] uppercase tracking-[0.1em] truncate leading-none">
                  nodus.my/{userProfile.username || userProfile.name.toLowerCase().replace(/\s/g, '')}
                </span>
              </div>
            </div>
          </div>
          
          {onClose && isMobile && (
              <button
                onClick={onClose}
                className="p-1 px-2 text-[#1a1a1a] hover:opacity-50 transition-all ml-2"
              >
                <X size={20} strokeWidth={3} />
              </button>
          )}
        </div>
      </div>

      {/* Main Navigation Area Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative z-10 w-full pt-4 pb-8">
        
        {MENU_GROUPS.map((group, gIdx) => (
          <div key={group.id} className="mb-8 last:mb-0">
            <div className="px-6 mb-2 mt-2 flex items-center gap-2.5">
              <group.groupIcon size={11} strokeWidth={2.5} className="text-[#1a1a1a]/40" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/30">{group.label}</span>
            </div>
            
            <div className="space-y-1.5">
              {group.items.map(item => {
                const isActive = activeTab === item.id;
                const isLocked = (item.id === 'earn') && (!userProfile.plan_type || userProfile.plan_type === 'free');
                const ItemIcon = item.icon;

                if (isActive) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isLocked) onUpgradeClick?.();
                        else if (!item.disabled) setActiveTab(item.id);
                      }}
                      disabled={item.disabled}
                      className={`mx-5 w-[calc(100%-40px)] flex items-center justify-between px-5 py-3.5 bg-[#fef08a] border-2 border-[#1a1a1a] rounded-xl shadow-[0_4px_0_0_#1a1a1a] active:translate-y-1 active:shadow-none transition-all group ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <ItemIcon size={18} strokeWidth={2.5} className="text-[#1a1a1a]" />
                        <span className="text-[12px] font-black uppercase tracking-wider text-[#1a1a1a] !leading-none mt-px">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLocked && <span className="bg-[#1a1a1a] text-[#fef08a] px-2 py-0.5 text-[8px] font-black rounded-sm tracking-widest leading-none">PRO</span>}
                        <div className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
                      </div>
                    </button>
                  );
                } else {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isLocked) onUpgradeClick?.();
                        else if (!item.disabled) setActiveTab(item.id);
                      }}
                      disabled={item.disabled}
                      className={`w-full flex items-center justify-between px-7 py-3 bg-transparent border-transparent text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-all group ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-4 pr-2">
                        <ItemIcon size={16} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[11.5px] font-bold uppercase tracking-wider !leading-none mt-px">{item.label}</span>
                      </div>
                      {isLocked && <span className="bg-[#1a1a1a]/10 text-[#1a1a1a] px-2 py-0.5 text-[8px] font-black rounded-sm tracking-widest leading-none">PRO</span>}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Area Area */}
      <div className="w-full bg-transparent relative z-20 border-t-2 border-[#1a1a1a] pt-4 pb-6 px-5 flex flex-col">
        
        {/* Onboarding Compact Card */}
        {!userProfile.onboardingDismissed && (
          <CompactOnboardingCard 
            profile={userProfile} 
            links={links}
            onUpdate={onUpdateProfile}
            onNavigate={(tab) => {
              if (tab === 'profile') {
                setActiveTab('appearance');
              } else {
                setActiveTab(tab);
              }
            }} 
          />
        )}

        {/* The "Mobile-style" Hidden Menu */}
        <AnimatePresence>
          {isAccountMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-white border-2 border-[#1a1a1a] shadow-[0_8px_0_0_#121212] rounded-2xl overflow-hidden z-[100] flex flex-col"
            >
              <div className="bg-[#fef08a] py-3 px-5 border-b-2 border-[#1a1a1a]">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Menu de Conta</span>
              </div>
              
              <button
                onClick={() => { setActiveTab('billing'); setIsAccountMenuOpen(false); }}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors border-b-2 border-[#1a1a1a]/5 text-[11px] font-black uppercase tracking-widest"
              >
                <CreditCard size={18} strokeWidth={2.5} />
                <span>{t('sidebar.upgrade')}</span>
              </button>

              {(userProfile?.username === 'nodus' || user?.email === 'jaoomarcos75@gmail.com') && (
                <>
                  <button
                    onClick={() => { setActiveTab('admin'); setIsAccountMenuOpen(false); }}
                    className="w-full flex items-center gap-3.5 px-5 py-4 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors border-b-2 border-[#1a1a1a]/5 text-[11px] font-black uppercase tracking-widest"
                  >
                    <ShieldAlert size={18} strokeWidth={2.5} />
                    {t('sidebar.administration')}
                  </button>
                </>
              )}

              <button
                onClick={() => { setActiveTab('support'); setIsAccountMenuOpen(false); }}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors border-b-2 border-[#1a1a1a]/5 text-[11px] font-black uppercase tracking-widest"
              >
                <HelpCircle size={18} strokeWidth={2.5} />
                {t('sidebar.support')}
              </button>

              <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#1a1a1a]/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/40">{t('sidebar.lang')}</span>
                <div className="scale-90">
                  <LanguageToggle />
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-red-600 hover:bg-red-50 transition-colors text-[11px] font-black uppercase tracking-widest"
              >
                <LogOut size={18} strokeWidth={2.5} />
                {t('sidebar.signOut')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Account Bottom Block (Trigger) Area */}
        <button
          onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
          className={`w-full flex items-center justify-between p-2.5 bg-[#fdfcf0] border-2 border-[#1a1a1a] rounded-lg shadow-[0_3px_0_0_#1a1a1a] hover:-translate-y-[0.5px] hover:shadow-[0_4px_0_0_#1a1a1a] active:translate-y-0.5 active:shadow-none transition-all group ${isAccountMenuOpen ? 'translate-y-0.5 shadow-none bg-f8f8f8' : ''}`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full border-2 border-[#1a1a1a] overflow-hidden bg-slate-50 shrink-0 shadow-[0_1.5px_0_0_#1a1a1a]">
              {user?.picture ? (
                <img src={user.picture} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/5 text-[#1a1a1a]"><User size={18} /></div>
              )}
            </div>
            <div className="flex flex-col items-start min-w-0 pr-2">
              <span className="font-black text-[12px] uppercase tracking-wide text-[#1a1a1a] truncate w-full leading-tight text-left">
                {user?.name || t('sidebar.user')}
              </span>
              <span className="font-bold text-[9px] uppercase tracking-[0.1em] text-[#1a1a1a]/40 truncate w-full text-left mt-0.5">
                {user?.email || 'email@exemplo.com'}
              </span>
            </div>
          </div>
          <div className={`mr-2 transition-transform duration-300 ${isAccountMenuOpen ? 'rotate-180 text-black' : 'text-[#1a1a1a]/30 group-hover:text-black'}`}>
            <ChevronUp size={18} strokeWidth={3} />
          </div>
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;