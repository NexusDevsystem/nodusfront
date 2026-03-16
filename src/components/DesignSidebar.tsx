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
        <div className="w-full bg-white/90 backdrop-blur-lg sticky top-0 z-[50] py-3 md:py-5 border-b-2 border-black/5">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto scrollbar-hide py-2">
                    {DESIGN_MENU_ITEMS.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`px-4 md:px-5 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] transition-all relative whitespace-nowrap flex items-center justify-center min-h-[38px] md:min-h-[44px] group rounded-xl overflow-visible cursor-target ${isActive
                                    ? 'text-black'
                                    : 'text-black/50 hover:text-black'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="designActiveTab"
                                        className="absolute inset-0 bg-[#97cd7a] border-2 border-black rounded-xl -z-10 shadow-[0_3px_0_0_#000]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {!isActive && (
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-black/5 rounded-xl -z-10 transition-all bg-black/0 group-hover:bg-black/[0.02]" />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DesignSidebar;
