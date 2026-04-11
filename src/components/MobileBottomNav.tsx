import React from 'react';
import { Plus, Palette, ShoppingBag, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

export default function MobileBottomNav({ activeTab, setActiveTab, isSheetOpen, openSheet, closeSheet }: Props) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'links', icon: Plus, label: 'Add' },
    { id: 'appearance', icon: Palette, label: 'Design' },
    { id: 'shop', icon: ShoppingBag, label: 'Loja' },
    { id: 'extras', icon: LayoutGrid, label: 'Extras' },
  ];

  const handlePress = (id: string) => {
    setActiveTab(id);
    openSheet();
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center items-center pointer-events-none md:hidden px-4">
      <div className="bg-[#fdfcf0] rounded-2xl p-1.5 flex items-center gap-1.5 shadow-[0_6px_0_0_#000] border-[3px] border-black pointer-events-auto relative overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && isSheetOpen;
          
          return (
            <button
              key={item.id}
              onClick={() => handlePress(item.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[70px] h-[58px] rounded-xl transition-all relative
                ${isActive ? 'text-black' : 'text-black/40 active:translate-y-[1px]'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-[#ffdf00] border-2 border-black rounded-xl shadow-[0_2px_0_0_#000] z-0"
                  transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                />
              )}
              
              <motion.div 
                className="z-10 flex flex-col items-center justify-center gap-1"
                animate={isActive ? { scale: 1.1, translateY: -2 } : { scale: 1, translateY: 0 }}
              >
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-black' : 'text-black/40'}`}>
                  {item.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
