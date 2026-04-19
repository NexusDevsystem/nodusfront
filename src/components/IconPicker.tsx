import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X, Grid, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface IconPickerProps {
    onSelect: (iconName: string) => void;
    onClose: () => void;
    currentIcon?: string;
}

// Popular icons to show first
const POPULAR_ICONS = [
    'User', 'Link', 'ShoppingBag', 'MessageSquare', 'Instagram', 'Youtube', 'Twitter', 'Github', 
    'Music', 'Play', 'Video', 'Camera', 'Heart', 'Star', 'Zap', 'Flame', 
    'DollarSign', 'CreditCard', 'ShoppingCart', 'Ticket', 'Mail', 'Phone', 'MapPin', 'Calendar',
    'Info', 'HelpCircle', 'AlertCircle', 'ExternalLink', 'Share2', 'Globe', 'Lock', 'Unlock',
    'Home', 'Search', 'Settings', 'Bell', 'Menu', 'X', 'Plus', 'Minus',
    'ArrowRight', 'ArrowLeft', 'ChevronRight', 'ChevronLeft', 'Download', 'Upload', 'Eye', 'EyeOff',
    'Smartphone', 'Monitor', 'Laptop', 'Tablet', 'Tv', 'Headphones', 'Mic', 'Speaker',
    'Coffee', 'Utensils', 'Pizza', 'GlassWater', 'Beer', 'Wine', 'Gift', 'Flag',
    'Briefcase', 'GraduationCap', 'Book', 'FileText', 'Image', 'Folder', 'Archive', 'Trash2',
    'Sun', 'Moon', 'Cloud', 'Umbrella', 'Wind', 'Thermometer', 'Droplets', 'ZapOff'
];

export const IconPicker: React.FC<IconPickerProps> = ({ onSelect, onClose, currentIcon }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    // All lucide icons as a list of names
    const allIconNames = useMemo(() => {
        return Object.keys(LucideIcons).filter(name => 
            name !== 'createLucideIcon' && 
            typeof (LucideIcons as any)[name] === 'function' || typeof (LucideIcons as any)[name] === 'object'
        );
    }, []);

    const filteredIcons = useMemo(() => {
        if (!searchTerm) return POPULAR_ICONS;
        
        const term = searchTerm.toLowerCase();
        return allIconNames.filter(name => 
            name.toLowerCase().includes(term)
        ).slice(0, 100); // Limit results for performance
    }, [searchTerm, allIconNames]);

    const renderIcon = (name: string, size = 20) => {
        const IconComponent = (LucideIcons as any)[name];
        if (!IconComponent) return null;
        return <IconComponent size={size} strokeWidth={2.5} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg bg-white border-4 border-black rounded-2xl shadow-[0_12px_0_0_#1a1a1a] overflow-hidden flex flex-col max-h-[80vh]"
        >
            {/* Header */}
            <div className="p-6 border-b-4 border-black bg-[#ffdf00] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl shadow-[3px_3px_0_0_#fff]">
                        <Grid size={20} className="text-[#ffdf00]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-black leading-none">
                            {t('icons.title') || 'Escolher Ícone'}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1">
                            {t('icons.desc') || 'Personalize seu botão'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0_0_#1a1a1a]"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Search */}
            <div className="p-6 bg-slate-50 border-b-2 border-black/5">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors">
                        <Search size={18} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder={t('icons.searchPlaceholder') || "Buscar ícone (em inglês)..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border-2 border-black rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold uppercase tracking-widest placeholder:text-black/20 outline-none focus:ring-4 focus:ring-[#ffdf00]/10 transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.05)] focus:shadow-[0_4px_0_0_#1a1a1a]"
                        autoFocus
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 sm:grid-cols-6 gap-3">
                {!searchTerm && (
                    <div className="col-span-full mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-1">
                        <Sparkles size={12} />
                        {t('icons.popular') || 'Sugestões Populares'}
                    </div>
                )}
                
                <button
                    onClick={() => onSelect('')}
                    className={`flex flex-col items-center justify-center aspect-square border-2 rounded-xl transition-all ${!currentIcon ? 'bg-[#ffdf00] border-black shadow-[0_3px_0_0_#1a1a1a] -translate-y-0.5' : 'bg-white border-black/5 hover:border-black hover:-translate-y-0.5 shadow-[0_2px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_3px_0_0_#1a1a1a]'}`}
                >
                    <div className="opacity-20 flex flex-col items-center gap-1">
                        <X size={18} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Nenhum</span>
                    </div>
                </button>

                {filteredIcons.map((name) => {
                    const isSelected = currentIcon === name;
                    return (
                        <button
                            key={name}
                            onClick={() => onSelect(name)}
                            className={`flex items-center justify-center aspect-square border-2 rounded-xl transition-all ${isSelected ? 'bg-[#ffdf00] border-black shadow-[0_3px_0_0_#1a1a1a] -translate-y-0.5' : 'bg-white border-black/5 hover:border-black hover:-translate-y-0.5 shadow-[0_2px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_3px_0_0_#1a1a1a]'}`}
                            title={name}
                        >
                            {renderIcon(name, 22)}
                        </button>
                    );
                })}

                {filteredIcons.length === 0 && (
                    <div className="col-span-full py-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-100 border-2 border-black/5 rounded-2xl flex items-center justify-center mx-auto">
                            <Search size={32} className="text-black/10" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 italic">
                            {t('icons.noResults') || 'Nenhum ícone encontrado'}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t-4 border-black text-center">
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-black/30">
                    Lucide Icon Library • Version 2026
                </p>
            </div>
        </motion.div>
    );
};
