import { UserProfile } from '../../types';
import { THEMES } from '../../constants';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';

interface ButtonsEditorProps {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
}



export default function ButtonsEditor({ profile, updateProfile }: ButtonsEditorProps) {
    const { t } = useTranslation();
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    return (
        <div className="space-y-6 pb-10">
            <section className="space-y-4">
                <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-black uppercase tracking-widest">{t('design.format')}</h3>
                    <p className="text-xs font-normal uppercase tracking-widest text-black/70 mt-1">{t('design.buttonRoundnessDesc')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                        { id: 'square', name: t('design.square'), icon: <path d="M7 17V7H17" />, rounded: 'rounded-none' },
                        { id: 'round', name: t('design.rounded'), icon: <path d="M7 17V11C7 8.79086 8.79086 7 11 7H17" />, rounded: 'rounded-lg' },
                        { id: 'rounder', name: t('design.veryRounded'), icon: <path d="M7 17V13C7 9.68629 9.68629 7 13 7H17" />, rounded: 'rounded-2xl' },
                        { id: 'full', name: t('design.pill'), icon: <path d="M7 17C7 11.4772 11.4772 7 17 7" />, rounded: 'rounded-full' },
                    ].map((roundness) => (
                        <div key={roundness.id} className="flex flex-col w-full">
                            <button
                                onClick={() => updateProfile({ buttonRoundness: roundness.id as any })}
                                className={`group relative h-12 sm:h-10 w-full flex items-center justify-start sm:justify-center px-5 sm:px-0 gap-4 sm:gap-0 transition-all border-2 border-[#1a1a1a] cursor-target ${roundness.rounded} ${profile.buttonRoundness === roundness.id
                                    ? 'bg-[#97cd7a] shadow-[0_3px_0_0_#1a1a1a] sm:shadow-[0_2px_0_0_#1a1a1a] -translate-y-[0.5px]'
                                    : 'bg-white shadow-[0_2px_0_0_#1a1a1a] sm:shadow-[0_1px_0_0_#1a1a1a] hover:shadow-none hover:bg-slate-50 text-black/40 hover:text-black'
                                    }`}
                            >
                                <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    {roundness.icon}
                                </svg>
                                <span className={`sm:hidden text-[10px] font-black uppercase tracking-widest ${profile.buttonRoundness === roundness.id ? 'text-black' : 'text-black/40'}`}>
                                    {roundness.name}
                                </span>
                            </button>
                            <span className={`hidden sm:block text-[8px] text-center font-medium uppercase tracking-widest mt-1.5 ${profile.buttonRoundness === roundness.id ? 'text-black' : 'text-black/40'}`}>
                                {roundness.name}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-between p-4 border-2 border-[#1a1a1a] bg-[#fdfcf0] shadow-[0_2px_0_0_#1a1a1a]">
                    <div className="flex flex-col px-1">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#1a1a1a]">Sombra</span>
                        <span className="text-[9px] font-normal uppercase tracking-widest text-black/60 mt-1 w-full max-w-[220px] leading-tight">Aplica as sombras sólidas e espessas aos botões do seu perfil.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer cursor-target shrink-0 pr-1">
                        <input
                            type="checkbox"
                            checked={!!profile.buttonShadow}
                            onChange={(e) => updateProfile({ buttonShadow: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-white peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#1a1a1a] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#97cd7a] border-2 border-[#1a1a1a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"></div>
                    </label>
                </div>
            </section>

        </div>
    );
}
