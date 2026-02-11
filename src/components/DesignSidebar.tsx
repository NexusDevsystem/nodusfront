import React from 'react';
import { UserProfile } from '../types';
import {
    Layout,
    Palette,
    Type,
    MousePointer2,
    Image as ImageIcon,
    Monitor
} from 'lucide-react';

interface DesignSidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const DESIGN_MENU_ITEMS = [
    { id: 'header', label: 'Cabeçalho', icon: Layout },
    { id: 'theme', label: 'Tema', icon: Monitor },
    { id: 'wallpaper', label: 'Papel de Parede', icon: ImageIcon },
    { id: 'text', label: 'Texto', icon: Type },
    { id: 'buttons', label: 'Botões', icon: MousePointer2 },
];

const DesignSidebar: React.FC<DesignSidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 h-auto md:h-full flex flex-col shrink-0">
            <div className="hidden md:block p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Design</h2>
                <p className="text-xs text-slate-400 mt-1">Personalize sua aparência</p>
            </div>

            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto p-2 md:p-4 gap-2 md:gap-0 md:space-y-1 scrollbar-hide">
                {DESIGN_MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 md:w-full ${isActive
                                ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100'
                                }`}
                        >
                            <Icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DesignSidebar;
