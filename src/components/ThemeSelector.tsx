import React from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES } from '../constants';
import { ImageIcon, Trash2, Check, Zap } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';
import ProfileRenderer from './ProfileRenderer';

interface ThemeSelectorProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    onChange: (profile: UserProfile) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profile, links, products, onChange }) => {
    const handleThemeSelect = (themeId: string) => {
        onChange({ ...profile, themeId, customBackground: null });
    };

    const handleCustomBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressed = await compressImage(e.target.files[0], 800, 0.7);
                onChange({ ...profile, customBackground: compressed });
            } catch (error) {
                console.error(error);
                alert('Erro ao processar imagem.');
            }
        }
    };

    const removeCustomBackground = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange({ ...profile, customBackground: null });
    };

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Temas</h2>
                    <p className="text-sm text-slate-400 mt-1">Selecione um estilo para aplicar ao seu perfil</p>
                </div>
                <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100 uppercase tracking-[0.1em]">
                    {THEMES.length} Estilos
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">

                {/* Custom Theme Card Container */}
                <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Personalizado</span>

                    <div
                        className={`relative group rounded-[2rem] overflow-hidden aspect-[9/16] border-2 transition-all duration-300 flex flex-col ${profile.customBackground
                            ? 'border-brand-500 shadow-xl ring-4 ring-brand-50'
                            : 'border-dashed border-slate-200 hover:border-brand-300 hover:bg-slate-50/50'
                            }`}
                    >
                        <input
                            type="file"
                            id="bg-upload-theme-final-3"
                            className="hidden"
                            accept="image/*"
                            onChange={handleCustomBackground}
                        />

                        {profile.customBackground ? (
                            <div className="w-full h-full relative">
                                {/* Real Renderer with Custom Bg - Fixed Scaling */}
                                <div className="absolute inset-0 z-0 pointer-events-none origin-top flex justify-center bg-white">
                                    <div className="w-[200%] h-[200%] scale-[0.5] origin-top shrink-0">
                                        <ProfileRenderer
                                            profile={profile}
                                            links={links}
                                            products={products}
                                            isPreview={false}
                                        />
                                    </div>
                                </div>

                                {/* Selected Badge */}
                                <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                    <Check size={20} strokeWidth={3} />
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-4 z-30 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => document.getElementById('bg-upload-theme-final-3')?.click()}
                                        className="px-6 py-2 bg-white text-slate-900 text-xs font-bold rounded-full hover:bg-slate-50 transition-colors shadow-xl"
                                    >
                                        ALTERAR
                                    </button>
                                    <button
                                        onClick={removeCustomBackground}
                                        className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-xl"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full relative">
                                <button
                                    onClick={() => {
                                        if (profile.planType === 'free' || !profile.planType) {
                                            // Handle pro prompt if needed, but for now just disable
                                            return;
                                        }
                                        document.getElementById('bg-upload-theme-final-3')?.click();
                                    }}
                                    disabled={profile.planType === 'free' || !profile.planType}
                                    className={`w-full h-full flex flex-col items-center justify-center gap-4 transition-colors p-6 ${profile.planType === 'free' || !profile.planType ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-all duration-300 border border-slate-100">
                                        <ImageIcon size={32} />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xs font-bold text-slate-600 uppercase tracking-tight">Fundo Próprio</span>
                                    </div>
                                </button>
                                {(profile.planType === 'free' || !profile.planType) && (
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
                                        <div className="bg-brand-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-brand-500/20">
                                            <Zap size={10} fill="currentColor" />
                                            PRO
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Standard Themes */}
                {THEMES.map((theme) => {
                    const isSelected = profile.themeId === theme.id && !profile.customBackground;

                    return (
                        <div key={theme.id} className="flex flex-col gap-3 group">
                            <span className={`text-[11px] font-bold uppercase tracking-widest px-1 transition-colors ${isSelected ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                                }`}>
                                {theme.name}
                            </span>

                            <button
                                onClick={() => {
                                    if (theme.isPro && (profile.planType === 'free' || !profile.planType)) {
                                        return;
                                    }
                                    handleThemeSelect(theme.id);
                                }}
                                className={`relative rounded-[2rem] overflow-hidden aspect-[9/16] border-2 transition-all duration-300 ${isSelected
                                    ? 'border-brand-600 shadow-2xl ring-4 ring-brand-50 z-10'
                                    : 'border-slate-100 hover:border-brand-200 hover:shadow-lg'
                                    } ${theme.isPro && (profile.planType === 'free' || !profile.planType) ? 'cursor-not-allowed grayscale-[0.5] opacity-80' : ''}`}
                            >
                                {/* Profile Preview - Fixed Scaling to fill entire card */}
                                <div className="absolute inset-0 z-0 pointer-events-none origin-top flex justify-center bg-white">
                                    <div className="w-[200%] h-[200%] scale-[0.5] origin-top shrink-0">
                                        <ProfileRenderer
                                            profile={{ ...profile, themeId: theme.id, customBackground: null, customSolidColor: null }}
                                            links={links}
                                            products={products}
                                            isPreview={false}
                                        />
                                    </div>
                                </div>

                                {/* Pro Badge */}
                                {theme.isPro && (profile.planType === 'free' || !profile.planType) && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
                                        <div className="bg-brand-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                                            <Zap size={10} fill="currentColor" />
                                            PRO
                                        </div>
                                    </div>
                                )}

                                {/* Selected Badge */}
                                {isSelected && (
                                    <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg animate-fade-in">
                                        <Check size={20} strokeWidth={3} />
                                    </div>
                                )}

                                {/* Selection Overlay */}
                                {isSelected && <div className="absolute inset-0 border-[3px] border-brand-600/20 rounded-[2rem] pointer-events-none"></div>}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ThemeSelector;
