import React, { useState } from 'react';
import { Settings, Search, Shield, Save } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

export default function SettingsView({ profile, onChange }: SettingsViewProps) {
    const [status, setStatus] = useState<'idle' | 'saving'>('idle');

    const handleChange = (field: keyof UserProfile, value: string | boolean) => {
        onChange({ ...profile, [field]: value });
        // Auto-save logic is handled by parent, but we simulate a saved state for UX
        setStatus('saving');
        setTimeout(() => setStatus('idle'), 500);
    };

    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* Header */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Settings className="text-[#1a2517]" size={24} />
                    Configurações
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Gerencie detalhes da conta e otimização para buscadores.
                </p>
            </div>

            {/* Features Section (Newsletter) */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#acc8a2]/10 flex items-center justify-center">
                            <Save className="text-[#acc8a2]" size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Recursos Extras</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Widgets & Conversão</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/80">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800">Inscrição de Newsletter</span>
                            <span className="text-xs text-slate-500 font-medium">Capture e-mails dos seus visitantes diretamente no seu perfil.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!profile.showNewsletter}
                                onChange={(e) => handleChange('showNewsletter', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#acc8a2]"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <Search className="text-blue-600" size={20} />
                    <h3 className="font-bold text-lg text-slate-800">SEO (Search Engine Optimization)</h3>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Título da Página
                        </label>
                        <input
                            type="text"
                            value={profile.seoTitle || ''}
                            onChange={(e) => handleChange('seoTitle', e.target.value)}
                            placeholder={`${profile.name} | Link in Bio`}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:ring-1 focus:ring-[#acc8a2] focus:border-[#acc8a2] outline-none transition-all"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Como seu perfil aparecerá na aba do navegador.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Meta Description
                        </label>
                        <textarea
                            value={profile.seoDescription || ''}
                            onChange={(e) => handleChange('seoDescription', e.target.value)}
                            rows={3}
                            placeholder="Confira meus links, vídeos e playlists mais recentes..."
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:ring-1 focus:ring-[#acc8a2] focus:border-[#acc8a2] outline-none transition-all resize-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Breve descrição para o Google e redes sociais.</p>
                    </div>

                    {/* Preview (Simulated Google Result) */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 mt-2">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <span className="text-xs text-slate-500 mb-1 block">PREVIEW GOOGLE</span>
                            <div className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">
                                {profile.seoTitle || `Nodus | ${profile.name}`}
                            </div>
                            <div className="text-[#1a2517] text-sm truncate mb-1">
                                nodus.cc/{profile.username || profile.name.toLowerCase().replace(/\s/g, '')}
                            </div>
                            <div className="text-[#545454] text-sm line-clamp-2">
                                {profile.seoDescription || `Acesse os links e conteúdos exclusivos de ${profile.name}. Acompanhe novidades, vídeos e muito mais.`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS (Pro) */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded">PRO</div>
                    <h3 className="font-bold text-lg text-slate-800">Custom CSS</h3>
                </div>
                <div className="p-6">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        CSS Personalizado
                    </label>
                    <textarea
                        value={profile.customCSS || ''}
                        onChange={(e) => handleChange('customCSS', e.target.value)}
                        rows={6}
                        placeholder=".profile-container { background: #000; }"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-900 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-[#acc8a2] focus:border-transparent outline-none transition-all resize-y"
                    />
                    <p className="text-[10px] text-slate-400 mt-2">
                        Use com cuidado. O CSS será injetado diretamente na página do seu perfil.
                    </p>
                </div>
            </div>

            {/* Account Section (Simulated) */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden opacity-80">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <Shield className="text-blue-600" size={20} />
                    <h3 className="font-bold text-lg text-slate-800">Conta & Segurança</h3>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            E-mail de Cadastro
                        </label>
                        <input
                            type="email"
                            value={profile.email || 'usuario@exemplo.com'}
                            disabled
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                            Alterar Senha
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors ml-auto">
                            Excluir Conta
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-slate-400 pb-8 mt-8">
                Nodus ID: {Date.now().toString(36).toUpperCase()}
            </div>
        </div>
    );
}
