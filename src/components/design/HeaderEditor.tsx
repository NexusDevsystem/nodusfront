import React, { useRef } from 'react';
import { UserProfile } from '../../types';
import { Camera, Trash2, Upload, Layout, UserCircle, AlignLeft, User, Scaling } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

interface HeaderEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const HeaderEditor: React.FC<HeaderEditorProps> = ({ profile, onChange }) => {
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressed = await compressImage(e.target.files[0], 500, 0.8);
                onChange({ ...profile, avatarUrl: compressed });
            } catch (error) {
                console.error('Error processing image:', error);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Layout Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                        <Layout size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Layout do Perfil</h3>
                        <p className="text-xs text-slate-400">Como seu topo será exibido</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'classic', label: 'Clássico', icon: UserCircle },
                        { id: 'hero', label: 'Hero', icon: User },
                        { id: 'compact', label: 'Compacto', icon: AlignLeft },
                    ].map((layout) => (
                        <button
                            key={layout.id}
                            onClick={() => onChange({ ...profile, headerLayout: layout.id as any })}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${(profile.headerLayout || 'classic') === layout.id
                                ? 'border-brand-600 bg-brand-50/50 text-brand-700'
                                : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                }`}
                        >
                            <layout.icon size={24} />
                            <span className="text-xs font-bold">{layout.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile Picture Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Imagem de Perfil</h3>

                <div className="flex flex-col items-center sm:flex-row gap-6 mb-6">
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50">
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Nodus'}`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Camera size={32} />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-transform hover:scale-105 active:scale-95"
                        >
                            <Camera size={16} />
                        </button>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                                Escolher Imagem
                            </button>
                            {profile.avatarUrl && (
                                <button
                                    onClick={() => onChange({ ...profile, avatarUrl: '' })}
                                    className="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        {/* Size Selector */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tamanho</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {[
                                    { id: 'sm', label: 'P' },
                                    { id: 'md', label: 'M' },
                                    { id: 'lg', label: 'G' },
                                ].map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => onChange({ ...profile, avatarSize: size.id as any })}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${(profile.avatarSize || 'md') === size.id
                                            ? 'bg-white text-brand-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title / Identity Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Identidade</h3>

                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome de Exibição / Título</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => onChange({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium"
                            placeholder="@seuusuario"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio / Descrição</label>
                        <textarea
                            value={profile.bio || ''}
                            onChange={(e) => onChange({ ...profile, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none font-medium"
                            placeholder="Conte um pouco sobre você..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderEditor;
