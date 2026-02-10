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
    { id: 'colors', label: 'Cores', icon: Palette },
];

const DesignSidebar: React.FC<DesignSidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Design</h2>
                <p className="text-xs text-slate-400 mt-1">Personalize sua aparência</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {DESIGN_MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
