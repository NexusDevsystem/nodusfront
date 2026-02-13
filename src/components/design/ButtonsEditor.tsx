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
        </div>
    );
}
