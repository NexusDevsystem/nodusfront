import React from 'react';
import { UserProfile } from '../../types';

interface ButtonsEditorProps {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
}

const BUTTON_ROUNDNESS = [
    {
        id: 'square',
        name: 'Quadrado',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17V7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        id: 'round',
        name: 'Arredondado',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17V11C7 8.79086 8.79086 7 11 7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        id: 'rounder',
        name: 'Muito Arred.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17V13C7 9.68629 9.68629 7 13 7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        id: 'full',
        name: 'Pílula',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17C7 11.4772 11.4772 7 17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
];

export default function ButtonsEditor({ profile, updateProfile }: ButtonsEditorProps) {
    return (
        <div className="space-y-6 pb-10">
            <section className="space-y-4">
                <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Formato</h3>
                    <p className="text-xs text-slate-500 mt-1">Ajuste o arredondamento dos cantos dos seus botões</p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {BUTTON_ROUNDNESS.map((roundness) => (
                        <div key={roundness.id} className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => updateProfile({ buttonRoundness: roundness.id as any })}
                                className={`group relative h-16 w-full flex items-center justify-center transition-all duration-200 rounded-2xl ${profile.buttonRoundness === roundness.id
                                    ? 'bg-[#f3f4f6] ring-2 ring-black ring-inset'
                                    : 'bg-[#f3f4f6] hover:bg-[#e5e7eb]'
                                    }`}
                            >
                                <div className={`${profile.buttonRoundness === roundness.id ? 'text-slate-800' : 'text-slate-500'
                                    }`}>
                                    {roundness.icon}
                                </div>
                            </button>
                            <span className={`text-[10px] font-medium ${profile.buttonRoundness === roundness.id ? 'text-black font-bold' : 'text-slate-500'
                                }`}>
                                {roundness.name}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Cores</h3>
                    <p className="text-xs text-slate-500 mt-1">Personalize a cor de fundo dos seus botões</p>
                </div>

                {profile.themeId === 'custom' ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                                <input
                                    type="color"
                                    value={profile.customButtonColor || '#000000'}
                                    onChange={(e) => updateProfile({ customButtonColor: e.target.value })}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={profile.customButtonColor || ''}
                                onChange={(e) => updateProfile({ customButtonColor: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}` })}
                                placeholder="Hex (#000000)"
                                className="flex-1 h-12 px-4 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-black outline-none transition-all text-sm font-mono uppercase font-bold"
                            />
                            {profile.customButtonColor && (
                                <button
                                    onClick={() => updateProfile({ customButtonColor: null })}
                                    className="text-xs text-red-500 font-bold hover:underline px-2"
                                >
                                    Resetar
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-800">Cores bloqueadas</p>
                            <p className="text-[10px] text-slate-500 leading-tight">Para editar a cor do botão, você precisa estar usando o tema <b>Custom</b>.</p>
                        </div>
                        <button
                            onClick={() => updateProfile({ themeId: 'custom' })}
                            className="mt-2 text-[10px] font-bold bg-black text-white px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors uppercase tracking-wider"
                        >
                            Ativar Tema Custom
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
