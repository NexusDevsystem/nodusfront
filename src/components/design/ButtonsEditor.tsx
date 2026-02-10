import React from 'react';
import { UserProfile } from '../../types';
import { MousePointer2 } from 'lucide-react';

interface ButtonsEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const ButtonsEditor: React.FC<ButtonsEditorProps> = ({ profile, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                        <MousePointer2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Estilo dos Botões</h3>
                        <p className="text-xs text-slate-400">Formato dos links</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Rounded Option */}
                    <button
                        onClick={() => onChange({ ...profile, buttonStyle: 'rounded' })}
                        className={`group relative p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${(profile.buttonStyle || 'rounded') === 'rounded'
                            ? 'border-brand-600 bg-brand-50/50'
                            : 'border-slate-100 hover:border-slate-300'
                            }`}
                    >
                        <div className={`w-14 h-10 bg-slate-200 border border-slate-300 rounded-full flex items-center justify-center ${(profile.buttonStyle || 'rounded') === 'rounded' ? 'bg-brand-200 border-brand-300' : ''}`}>
                            <div className="w-6 h-1 bg-slate-400/50 rounded-full"></div>
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block">Redondo</span>
                            <span className="text-xs text-slate-400">Bordas totalmente arredondadas</span>
                        </div>
                        {(profile.buttonStyle || 'rounded') === 'rounded' && (
                            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white"></div>
                        )}
                    </button>

                    {/* Soft Rect Option */}
                    <button
                        onClick={() => onChange({ ...profile, buttonStyle: 'soft-rect' })}
                        className={`group relative p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${profile.buttonStyle === 'soft-rect'
                            ? 'border-brand-600 bg-brand-50/50'
                            : 'border-slate-100 hover:border-slate-300'
                            }`}
                    >
                        <div className={`w-14 h-10 bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center ${(profile.buttonStyle) === 'soft-rect' ? 'bg-brand-200 border-brand-300' : ''}`}>
                            <div className="w-6 h-1 bg-slate-400/50 rounded-sm"></div>
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block">Quadrado Suave</span>
                            <span className="text-xs text-slate-400">Bordas levemente arredondadas</span>
                        </div>
                        {profile.buttonStyle === 'soft-rect' && (
                            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white"></div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ButtonsEditor;
