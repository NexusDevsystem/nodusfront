import React from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES } from '../constants';
import { Zap, Check, Trash2, Paintbrush } from 'lucide-react';
import ProfileRenderer from './ProfileRenderer';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface ThemeSelectorProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    onChange: (profile: UserProfile) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profile, links, products, onChange }) => {
    const [activeCategory, setActiveCategory] = React.useState<'all' | 'solid' | 'pro' | 'music'>('all');

    const handleThemeSelect = (themeId: string) => {
        onChange({ ...profile, themeId, customBackground: null, customSolidColor: null });
    };

    const categories = [
        { id: 'all', label: 'Todos' },
        { id: 'solid', label: 'Cores Sólidas' },
        { id: 'music', label: 'Música' },
        { id: 'creative', label: 'Criativo' },
        { id: 'kawaii', label: 'Kawaii' },
        { id: 'pro', label: 'Temas Pro' }
    ] as const;

    return (
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 p-6 md:p-10 shadow-sm">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Temas</h2>
                        <p className="text-xs text-slate-500 mt-1">Escolha uma identidade visual</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blur Fade</span>
                        <button
                            onClick={() => onChange({ ...profile, enableBlur: !profile.enableBlur })}
                            className={`relative w-10 h-5 rounded-full transition-colors ${profile.enableBlur ? 'bg-[#32a800]' : 'bg-slate-200'}`}
                        >
                            <motion.div
                                animate={{ x: profile.enableBlur ? 20 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
                {/* Custom Theme Card */}
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                    onClick={() => onChange({ ...profile, themeId: 'custom', customBackground: profile.customBackground || null, customSolidColor: profile.customSolidColor || null })}
                >
                    <div
                        className={`relative aspect-[4/5] w-full rounded-xl border-2 transition-all flex flex-col items-center justify-center ${profile.themeId === 'custom' ? 'border-[#32a800] ring-2 ring-[#32a800]/20' : 'border-slate-200 group-hover:border-slate-300'}`}
                        style={{ backgroundColor: profile.customSolidColor || '#f8fafc' }}
                    >
                        {profile.customBackground ? (
                            <img src={profile.customBackground} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <Paintbrush
                                className={profile.customSolidColor ? 'mix-blend-difference' : 'text-slate-400 group-hover:text-slate-500'}
                                size={20}
                                strokeWidth={1.5}
                                style={{ color: profile.customSolidColor ? '#fff' : undefined }}
                            />
                        )}

                        {profile.themeId === 'custom' && (
                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10">
                                <div className="w-6 h-6 rounded-full bg-[#32a800] flex items-center justify-center text-white shadow-lg border-2 border-white">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                            </div>
                        )}
                    </div>
                    <span className={`text-[10px] font-bold ${profile.themeId === 'custom' ? 'text-[#32a800]' : 'text-slate-500'}`}>Custom</span>
                </motion.div>

                {THEMES.filter(theme => theme.id !== 'animated-nodus-official' || profile.username === 'noduscc').map((theme) => {
                    const isSelected = profile.themeId === theme.id && !profile.customBackground;

                    return (
                        <motion.div
                            layout
                            key={theme.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-1.5 group cursor-pointer"
                            onClick={() => handleThemeSelect(theme.id)}
                        >
                            <div className={`relative aspect-[4/5] w-full rounded-xl border overflow-hidden transition-all ${isSelected ? 'border-[#32a800] ring-2 ring-[#32a800]/20 border-2' : 'border-slate-100 group-hover:border-slate-200'}`}>
                                {/* Theme Preview */}
                                <div className="absolute inset-0 z-0 pointer-events-none origin-top-left scale-[0.3] w-[333%] h-[333%]">
                                    <ProfileRenderer
                                        profile={{ ...profile, themeId: theme.id, customBackground: null, customSolidColor: null }}
                                        links={links}
                                        products={products}
                                        isPreview={false}
                                        isStatic={true}
                                    />
                                </div>

                                {/* Aa Text & Button Preview Overlay */}
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-2 pointer-events-none">
                                    <div className="w-full flex justify-end">
                                        {theme.isPro && (
                                            <div className="w-4 h-4 rounded-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                                                <Zap size={8} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-lg font-bold mt-1" style={{ color: theme.textClass.includes('white') ? '#fff' : '#000' }}>
                                        Aa
                                    </span>

                                    <div className={`w-full h-2.5 mt-auto rounded-md shadow-sm border border-white/10 ${theme.buttonClass.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('border-')).join(' ')} opacity-90`} />
                                </div>

                                {isSelected && (
                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-20">
                                        <div className="w-6 h-6 rounded-full bg-[#32a800] flex items-center justify-center text-white shadow-lg border-2 border-white">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold truncate w-full text-center ${isSelected ? 'text-[#32a800]' : 'text-slate-500'}`}>
                                {theme.name}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Custom Color Picker Section */}
            {profile.themeId === 'custom' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 pt-8 border-t border-slate-100"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Paintbrush size={16} className="text-[#32a800]" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cor de Fundo Personalizada</h3>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                            <input
                                type="color"
                                value={profile.customSolidColor || '#ffffff'}
                                onChange={(e) => onChange({ ...profile, customSolidColor: e.target.value, customBackground: null })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={profile.customSolidColor || ''}
                                onChange={(e) => onChange({ ...profile, customSolidColor: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`, customBackground: null })}
                                placeholder="#FFFFFF"
                                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-mono uppercase font-bold"
                            />
                        </div>
                        {profile.customSolidColor && (
                            <button
                                onClick={() => onChange({ ...profile, customSolidColor: null })}
                                className="h-12 w-12 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-xl border border-slate-100 hover:bg-red-50 transition-all active:scale-95"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-6 gap-2 mt-4">
                        {['#000000', '#FFFFFF', '#6366f1', '#ec4899', '#f59e0b', '#10b981'].map((color) => (
                            <button
                                key={color}
                                onClick={() => onChange({ ...profile, customSolidColor: color, customBackground: null })}
                                className="h-8 rounded-lg border border-slate-100 transition-transform hover:scale-105 active:scale-95"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    <p className="text-[10px] text-slate-400 mt-4 italic">
                        * Escolha uma cor para o fundo do seu perfil. Isso substituirá temas com imagens.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default ThemeSelector;
