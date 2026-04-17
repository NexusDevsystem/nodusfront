import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface DesignSidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const DesignSidebar: React.FC<DesignSidebarProps> = ({ activeSection, setActiveSection }) => {
    const { t } = useTranslation();

    const DESIGN_MENU_ITEMS = [
        { id: 'header', label: t('design.header') },
        { id: 'theme', label: t('design.themes') },
        { id: 'buttons', label: t('design.buttons') },
        { id: 'wallpaper', label: t('design.wallpaper') },
        { id: 'text', label: t('design.typography') },
    ];

    return (
        <div className="w-full bg-transparent pt-4 md:pt-6 pb-6 md:pb-8 flex justify-center">
            <div className="w-full max-w-5xl px-4 flex justify-center py-2">
                {/* Desktop: Unified Bar | Mobile: Wrapped Grid for no cutting */}
                <div className="
                    flex flex-wrap md:flex-nowrap justify-center 
                    gap-2 md:gap-0 
                    md:border-2 md:border-[#1a1a1a] md:shadow-[0_4px_0_0_#1a1a1a] 
                    bg-transparent md:bg-white 
                    md:rounded-xl md:overflow-hidden md:shrink-0
                ">
                    {DESIGN_MENU_ITEMS.map((item, index) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`
                                    px-4 md:px-8 py-2.5 md:py-3 
                                    text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] md:tracking-[0.2em] 
                                    transition-all flex items-center justify-center
                                    ${isActive
                                        ? 'bg-[#ffdf00] text-black border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] md:shadow-none md:border-none md:border-r-2 md:border-[#1a1a1a]'
                                        : 'bg-white text-black/40 border-2 border-[#1a1a1a]/10 md:border-none md:border-r-2 md:border-[#1a1a1a] hover:bg-[#ffdf00]/5 hover:text-black'
                                    }
                                    rounded-xl md:rounded-none
                                    md:last:border-r-0
                                    ${index === 0 && 'md:rounded-l-[10px]'}
                                    ${index === DESIGN_MENU_ITEMS.length - 1 && 'md:rounded-r-[10px]'}
                                `}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DesignSidebar;
