import React from 'react';
import { UserProfile } from '../../types';

interface ButtonsEditorProps {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
}



export default function ButtonsEditor({ profile, updateProfile }: ButtonsEditorProps) {
    return (
        <div className="space-y-6 pb-10">
            <section className="space-y-4">
                <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-black uppercase tracking-widest">Formato</h3>
                    <p className="text-xs font-normal uppercase tracking-widest text-black/70 mt-1">Ajuste o arredondamento dos cantos dos seus botões</p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {[
                        { id: 'square', name: 'QUADRADO', icon: <path d="M7 17V7H17" />, rounded: 'rounded-none' },
                        { id: 'round', name: 'ARREDONDADO', icon: <path d="M7 17V11C7 8.79086 8.79086 7 11 7H17" />, rounded: 'rounded-lg' },
                        { id: 'rounder', name: 'MUITO ARRED.', icon: <path d="M7 17V13C7 9.68629 9.68629 7 13 7H17" />, rounded: 'rounded-2xl' },
                        { id: 'full', name: 'PÍLULA', icon: <path d="M7 17C7 11.4772 11.4772 7 17 7" />, rounded: 'rounded-full' },
                    ].map((roundness) => (
                        <div key={roundness.id} className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => updateProfile({ buttonRoundness: roundness.id as any })}
                                className={`group relative h-10 w-full flex items-center justify-center transition-all border-2 border-black ${roundness.rounded} ${profile.buttonRoundness === roundness.id
                                    ? 'bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[0.5px] -translate-y-[0.5px]'
                                    : 'bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:bg-slate-50 text-black/40 hover:text-black'
                                    }`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    {roundness.icon}
                                </svg>
                            </button>
                            <span className={`text-[8px] text-center font-medium uppercase tracking-widest mt-1 ${profile.buttonRoundness === roundness.id ? 'text-black' : 'text-black/40'}`}>
                                {roundness.name}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4 pt-6 mt-6 border-t-2 border-black border-dashed">
                <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-black uppercase tracking-widest">Cores</h3>
                    <p className="text-xs font-normal uppercase tracking-widest text-black/70 mt-1">Personalize a cor de fundo dos seus botões</p>
                </div>

                {profile.themeId === 'custom' ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-10 h-10 overflow-hidden border border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                    <input
                                        type="color"
                                        value={profile.customButtonColor || '#000000'}
                                        onChange={(e) => updateProfile({ customButtonColor: e.target.value })}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-none p-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={profile.customButtonColor || ''}
                                    onChange={(e) => updateProfile({ customButtonColor: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}` })}
                                    placeholder="Hex (#000000)"
                                    className="flex-1 h-10 px-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-sm font-medium uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-widest"
                                />
                            </div>
                            {profile.customButtonColor && (
                                <button
                                    onClick={() => updateProfile({ customButtonColor: null })}
                                    className="text-[10px] text-black border border-black bg-white px-3 h-10 font-medium uppercase tracking-widest shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none hover:bg-black hover:text-[#97cd7a] transition-all w-full sm:w-auto"
                                >
                                    Resetar
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#f8f8f8] border border-black p-5 flex flex-col items-center text-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-10 h-10 bg-white border border-black text-black flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-widest text-black/80">Cores Bloqueadas</p>
                            <p className="text-[9px] font-normal uppercase tracking-[0.2em] text-black/50 leading-relaxed max-w-xs mx-auto">Para editar a cor do botão, use o tema <span className="text-black font-medium bg-white px-1 border border-black">CUSTOM</span>.</p>
                        </div>
                        <button
                            onClick={() => updateProfile({ themeId: 'custom' })}
                            className="mt-1 text-[9px] font-medium bg-black border border-black text-[#97cd7a] px-5 py-2.5 uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all hover:bg-black hover:text-white"
                        >
                            Ativar Tema Custom
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
