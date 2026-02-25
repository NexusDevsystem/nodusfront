import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';

interface DesignSidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const DESIGN_MENU_ITEMS = [
    { id: 'header', label: 'Cabeçalho' },
    { id: 'theme', label: 'Tema' },
    { id: 'buttons', label: 'Botões' },
    { id: 'wallpaper', label: 'Papel de Parede' },
    { id: 'text', label: 'Texto' },
];

const DesignSidebar: React.FC<DesignSidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <div className="w-full bg-white border-b-4 border-black sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                    {DESIGN_MENU_ITEMS.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`py-4 px-1 text-xs font-medium uppercase tracking-widest transition-all relative whitespace-nowrap ${isActive
                                    ? 'text-black'
                                    : 'text-black/50 hover:text-black'
                                    }`}
                            >
                                {item.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarActiveTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-black"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DesignSidebar;
