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
  ShieldAlert,
  X,
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import Tooltip from './Tooltip';

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

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userProfile, className, onUpgradeClick, onClose }) => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const MENU_GROUPS: MenuGroup[] = [
    {
      id: 'my-linktree',
      label: t('sidebar.myNodus'),
      groupIcon: Layers,
      items: [
        { id: 'links', label: t('sidebar.links'), icon: LinkIcon },
        { id: 'appearance', label: t('sidebar.design'), icon: Palette },
        { id: 'shop', label: t('sidebar.shop'), icon: ShoppingBag, disabled: false },
        { id: 'earn', label: t('sidebar.monetize'), icon: DollarSign, disabled: false },
      ]
    },
    {
      id: 'connections',
      label: t('sidebar.connections'),
      groupIcon: Share2,
      items: [
        { id: 'integrations', label: t('sidebar.integrations'), icon: Share2 },
      ]
    },
    {
      id: 'insights',
      label: t('sidebar.insights'),
      groupIcon: BarChart2,
      items: [
        { id: 'analytics', label: t('sidebar.analytics'), icon: BarChart2, disabled: false },
      ]
    },
    {
      id: 'tools',
      label: t('sidebar.tools'),
      groupIcon: Sparkles,
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
    <aside className={`w-full md:w-64 shrink-0 bg-[#ffffff] md:border-r-2 border-black h-full flex flex-col select-none overflow-hidden relative ${className || ''}`}>
      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      {/* Profile Header - Compact & Brutalist */}
      <div className="p-5 md:p-4 border-b-2 border-black bg-white flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 md:w-10 md:h-10 border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 bg-white">
              <img src={userProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`}
                alt="Public"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`;
                }}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-xs md:text-[10px] font-bold md:font-medium text-black uppercase tracking-widest truncate leading-tight">{userProfile.name}</h3>
              <div className="flex items-center gap-1 mt-1 md:mt-0.5">
                <span className="text-[9px] md:text-[8px] font-normal text-black/50 uppercase tracking-tighter truncate leading-none">nodus.my/{userProfile.username || userProfile.name.toLowerCase().replace(/\s/g, '')}</span>
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <Tooltip text={t('common.close')} position="bottom">
              <button
                onClick={onClose}
                className="md:hidden p-2 text-black hover:bg-black/5 transition-colors"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col relative z-10 w-full h-full">

        <motion.div
          className="p-5 md:p-4 space-y-8 md:space-y-6 flex-1 w-full"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {MENU_GROUPS.map((group) => {
            const GroupIcon = group.groupIcon;

            return (
              <motion.div
                key={group.id}
                className="space-y-4 md:space-y-3"
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  show: { opacity: 1, x: 0 }
                }}
              >
                <div className="flex items-center gap-2 px-1 mb-1 opacity-40">
                  <GroupIcon size={isMobile ? 12 : 11} strokeWidth={2} />
                  <span className="text-[9px] md:text-[8px] font-bold md:font-medium uppercase tracking-[0.25em] text-black">{group.label}</span>
                </div>

                {/* Group Items */}
                <div className="space-y-2 md:space-y-1">
                  {group.items.map((item) => {
                    const isLocked = (item.id === 'earn' || item.id === 'audience') && (!userProfile.planType || userProfile.planType === 'free');
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        data-tour={item.id}
                        onClick={() => {
                          if (isLocked) {
                            onUpgradeClick?.();
                          } else if (!item.disabled) {
                            setActiveTab(item.id);
                          }
                        }}
                        disabled={item.disabled}
                        className={`
                        w-full flex items-center justify-between px-4 md:px-3 py-3.5 md:py-2.5 transition-all border-2 group relative
                        ${isActive
                            ? 'bg-[#97cd7a] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[0.5px] -translate-y-[0.5px] text-black'
                            : 'bg-transparent border-transparent text-black/60 hover:text-black hover:bg-black/5'}
                        ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}
                      `}
                      >
                        <div className="flex items-center gap-4 md:gap-3 min-w-0">
                          <div className={`shrink-0 transition-transform ${isActive ? 'text-black' : 'text-black/40 group-hover:text-black'} flex items-center justify-center`}>
                            <ItemIcon size={isMobile ? 18 : 14} strokeWidth={isMobile ? 2.5 : 2} />
                          </div>
                          <span className={`text-[11px] md:text-[9.5px] font-bold md:font-medium uppercase tracking-widest truncate whitespace-nowrap leading-none ${isActive ? 'text-black' : ''}`}>{item.label}</span>
                        </div>

                        {isLocked ? (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-[8px] md:text-[7px] bg-black text-white px-2 md:px-1.5 py-1 md:py-0.5 font-bold border border-black uppercase tracking-widest leading-none flex items-center justify-center">
                              VIP
                            </span>
                          </div>
                        ) : isActive && (
                          <div className="w-2 h-2 md:w-1.5 md:h-1.5 bg-black rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Footer Area */}
      <div className="p-5 md:p-4 border-t-2 border-black bg-white relative z-10 space-y-4 md:space-y-0">
        <div className="hidden md:flex flex-col gap-1 mb-4">
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all py-2.5 px-3 border-2 group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] ${activeTab === 'billing' ? 'border-black bg-[#97cd7a]' : 'border-black bg-white text-black hover:bg-[#ffdf00]'}`}
          >
            <CreditCard size={13} strokeWidth={3} />
            {t('sidebar.upgrade')}
          </button>

          {userProfile?.username === 'nodus' || user?.email === 'jaoomarcos75@gmail.com' ? (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-3 text-[9px] font-medium uppercase tracking-widest transition-all py-2 px-3 border-2 group ${activeTab === 'admin' ? 'border-black bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-[0.5px]' : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'}`}
            >
              <ShieldAlert size={13} strokeWidth={2} />
              {t('sidebar.administration')}
            </button>
          ) : null}

          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-3 text-[9px] font-medium uppercase tracking-widest transition-all py-2 px-3 border-2 group ${activeTab === 'support' ? 'border-black bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-[0.5px]' : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'}`}
          >
            <HelpCircle size={13} strokeWidth={2} />
            {t('sidebar.support')}
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-black/10">
            <span className="text-[8px] uppercase tracking-widest text-black/30 font-medium">{t('sidebar.language')}</span>
            <LanguageToggle />
          </div>
        </div>

        {/* Account Switcher / User Profile Mini Card */}
        <div className="relative">
          <AnimatePresence>
            {isMobile && isAccountMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-20 flex flex-col"
              >
                <button
                  onClick={() => { setActiveTab('billing'); setIsAccountMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-5 bg-[#ffdf00] text-black hover:bg-[#97cd7a] transition-colors border-b-2 border-black text-[11px] font-black uppercase tracking-widest"
                >
                  <CreditCard size={18} strokeWidth={3} />
                  <span>{t('sidebar.upgrade')}</span>
                </button>

                {(userProfile?.username === 'nodus' || user?.email === 'jaoomarcos75@gmail.com') && (
                  <button
                    onClick={() => { setActiveTab('admin'); setIsAccountMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 text-black hover:bg-black/5 transition-colors border-b-2 border-black text-[11px] font-bold uppercase tracking-widest"
                  >
                    <ShieldAlert size={18} strokeWidth={2.5} />
                    {t('sidebar.administration')}
                  </button>
                )}

                <button
                  onClick={() => { setActiveTab('support'); setIsAccountMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-4 text-black hover:bg-black/5 transition-colors border-b-2 border-black text-[11px] font-bold uppercase tracking-widest"
                >
                  <HelpCircle size={18} strokeWidth={2.5} />
                  {t('sidebar.support')}
                </button>

                <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">{t('sidebar.lang')}</span>
                  <LanguageToggle />
                </div>

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 transition-colors text-[11px] font-bold uppercase tracking-widest"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                  {t('sidebar.signOut')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            onClick={() => isMobile && setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="p-4 md:p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between group/user cursor-pointer md:cursor-default"
          >
            <div className="flex items-center gap-3 md:gap-2.5 min-w-0">
              <div className="w-10 h-10 md:w-8 md:h-8 border-2 md:border border-black overflow-hidden bg-slate-50 shrink-0">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black text-white"><User size={isMobile ? 16 : 14} /></div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] md:text-[9px] font-bold md:font-medium uppercase tracking-tight truncate text-black leading-none mb-1 md:mb-0.5">{user?.name || t('sidebar.user')}</div>
                <div className="text-[8px] md:text-[7px] font-normal uppercase tracking-tighter truncate text-black/40 leading-none">{user?.email || 'email@exemplo.com'}</div>
              </div>
            </div>

            {isMobile ? (
              <motion.div
                animate={{ rotate: isAccountMenuOpen ? 180 : 0 }}
                className="p-2 text-black/40"
              >
                <ChevronDown size={20} strokeWidth={3} />
              </motion.div>
            ) : (
              <Tooltip text={t('sidebar.signOut')} position="top">
                <button
                  onClick={(e) => { e.stopPropagation(); signOut(); }}
                  className="p-2 md:p-1 text-black/30 hover:text-red-500 transition-colors shrink-0"
                >
                  <LogOut size={isMobile ? 16 : 13} strokeWidth={isMobile ? 2.5 : 2} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;