import React from 'react';
import { UserProfile } from '../../types';
import { FONTS } from '../../constants';
import { Type } from 'lucide-react';

interface TypographyEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const TypographyEditor: React.FC<TypographyEditorProps> = ({ profile, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                        <Type size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Tipografia</h3>
                        <p className="text-xs text-slate-400">Escolha a fonte do seu perfil</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {FONTS.map((font) => (
                        <button
                            key={font.name}
                            onClick={() => onChange({ ...profile, fontFamily: font.family })}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left hover:bg-slate-50 ${profile.fontFamily === font.family
                                    ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                                    : 'border-slate-100 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xl bg-white w-10 h-10 rounded-lg border border-slate-100 flex items-center justify-center font-bold text-slate-700" style={{ fontFamily: font.family }}>Aa</span>
                                <div>
                                    <span className="font-bold text-slate-800 block">{font.name}</span>
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{font.type}</span>
                                </div>
                            </div>
                            {profile.fontFamily === font.family && (
                                <div className="w-3 h-3 rounded-full bg-brand-600 shadow-sm ring-2 ring-white"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TypographyEditor;
