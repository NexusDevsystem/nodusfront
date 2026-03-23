import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES } from '../constants';
import { Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeSelectorProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    onChange: (profile: UserProfile) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profile, onChange }) => {
    const { t } = useTranslation();

    const handleThemeSelect = (themeId: string) => {
        const theme = THEMES.find(t => t.id === themeId);
        const isClassic = (profile.headerLayout || 'classic') === 'classic';

        const updates: Partial<UserProfile> = {
            ...profile,
            themeId,
            fontFamily: theme?.fontFamily || "'Inter', sans-serif",
            buttonRoundness: null,
            fontWeight: null,
            fontItalic: false,
            fontSize: null
        };

        if (themeId !== 'custom') {
            updates.customBackground = null;
            updates.customSolidColor = null;
            updates.customSecondaryColor = null;
            updates.customTextColor = null;
            updates.customButtonColor = null;
            updates.customButtonTextColor = null;
            updates.customCollectionTextColor = null;
        }

        onChange(updates as UserProfile);
    };

    const renderThemeCard = (theme: typeof THEMES[0]) => {
        const isSelected = profile.themeId === theme.id && !profile.customBackground;
        const isLocked = theme.isPro && (!profile.planType || profile.planType === 'free');
        const isActive = isSelected;
        const buttonVisuals = theme.buttonClass.replace(/\b(w-full|flex|items-center|justify-between|py-\d+|px-\d+|gap-\d+)\b/g, '').trim();

        return (
            <motion.div
                layout
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-2 group cursor-pointer relative cursor-target"
                onClick={() => handleThemeSelect(theme.id)}
            >
                <div className={`relative aspect-[3/4] w-full border-2 transition-all duration-300 rounded-md overflow-hidden ${isActive ? 'border-black bg-[#ffdf00] shadow-[0_4px_0_0_#1a1a1a] -translate-y-1' : 'border-black/10 hover:border-black/30 bg-white'}`}>
                    <div className={`absolute inset-0 ${theme.backgroundClass}`} style={{ backgroundColor: theme.solidColor }} />
                    <div className="absolute inset-0 p-4 flex flex-col items-center justify-center gap-4">
                        <div className="flex-1 flex items-center justify-center w-full">
                            <div className={`${theme.textClass} text-4xl font-bold opacity-90`} style={{ fontFamily: theme.fontFamily }}>Aa</div>
                        </div>
                        <div className="w-full h-10 flex items-center justify-center">
                            <div className={`h-8 w-16 ${buttonVisuals} flex items-center justify-center shadow-sm`}>
                                <div className="w-6 h-1 bg-current opacity-20 rounded-full" />
                            </div>
                        </div>
                    </div>
                    {isActive && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#97cd7a] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_0_#1a1a1a] z-10 rounded-md">
                            <Check size={14} strokeWidth={4} />
                        </div>
                    )}
                    {theme.isPro && (
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 pointer-events-none">
                            <div className="px-1.5 py-0.5 bg-black text-white text-[8px] font-black border-2 border-black uppercase tracking-tighter shadow-[0_2px_0_0_#ffdf00] rounded-sm">
                                Pro
                            </div>
                            {isLocked && isSelected && (
                                <motion.span 
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="text-[7px] font-black bg-[#ffdf00] text-black px-1.5 py-0.5 border-2 border-black uppercase tracking-widest rounded-sm"
                                >
                                    Preview
                                </motion.span>
                            )}
                        </div>
                    )}
                </div>
                <span className={`text-[10px] font-black text-center truncate px-1 transition-colors uppercase tracking-[0.2em] mt-1 ${isActive ? 'text-black' : 'text-black/60 group-hover:text-black'}`}>{theme.name}</span>
            </motion.div>
        );
    };

    const renderThemesContent = () => {
        // Separate Free themes (special section)
        const freeThemes = THEMES.filter(t => !t.isPro && t.id !== 'custom');
        
        // Group ALL themes by category dynamically to ensure NONE are missed
        const categorizedThemes = THEMES.filter(t => t.id !== 'custom');
        const categoriesMap = new Map<string, typeof THEMES>();
        
        categorizedThemes.forEach(theme => {
            const cat = theme.category || 'other';
            if (!categoriesMap.has(cat)) {
                categoriesMap.set(cat, []);
            }
            categoriesMap.get(cat)!.push(theme);
        });

        // Sort categories to have a consistent order
        const sortedCategoryIds = Array.from(categoriesMap.keys()).sort();

        return (
            <div className="space-y-16">
                {/* Free Themes Section */}
                {freeThemes.length > 0 && (
                    <div className="space-y-8">
                        <h3 className="text-sm font-black text-[#97cd7a] uppercase tracking-[0.4em] flex items-center gap-4">
                            <Zap size={20} className="fill-[#97cd7a] stroke-[#97cd7a]" strokeWidth={3} />
                            {t('design.exploreFree')}
                        </h3>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                            {freeThemes.map(renderThemeCard)}
                        </div>
                    </div>
                )}

                {/* All other Categories dynamically */}
                {sortedCategoryIds.map(catId => {
                    const themes = categoriesMap.get(catId)!;
                    return (
                        <div key={catId} className="space-y-8">
                            <h3 className="text-sm font-black text-black/60 uppercase tracking-[0.4em] flex items-center gap-4">
                                <div className="w-2 h-8 bg-black/20 rounded-full" />
                                {t(`design.categories.${catId}`) || catId.toUpperCase()}
                            </h3>
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                                {themes.map(renderThemeCard)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[0_4px_0_0_#1a1a1a] rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffdf00] opacity-5 -mr-32 -mt-32 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col gap-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-[#ffdf00] rounded-full shadow-[0_1.5px_0_0_#1a1a1a]" />
                            <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter leading-none">{t('design.themes')}</h2>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 ml-6">{t('design.chooseThemeDesc')}</p>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-slate-50 border-2 border-black rounded-md shadow-[0_4px_0_0_#1a1a1a]">
                        <div className="flex items-center gap-2">
                            <Zap size={16} className={profile.enableBlur ? 'text-black fill-[#ffdf00]' : 'text-black/10'} strokeWidth={3} />
                            <span className="text-[10px] text-black font-black uppercase tracking-widest">{t('design.blurFade')}</span>
                        </div>
                        <button
                            onClick={() => onChange({ ...profile, enableBlur: !profile.enableBlur })}
                            className={`relative w-12 h-6 border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] rounded-full transition-all active:shadow-none active:translate-y-[0.5px] ${profile.enableBlur ? 'bg-[#97cd7a]' : 'bg-white'}`}
                        >
                            <div className={`absolute top-[3px] w-4 h-4 border-2 border-[#1a1a1a] bg-white rounded-full transition-all ${profile.enableBlur ? 'left-[24px]' : 'left-[4px]'}`} />
                        </button>
                    </div>
                </div>

                <div className="w-full">
                    {renderThemesContent()}
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;
