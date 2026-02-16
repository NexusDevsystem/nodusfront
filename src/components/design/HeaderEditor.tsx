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
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Layout Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <Layout size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Layout do Perfil</h3>
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
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-md border transition-all ${(profile.headerLayout || 'classic') === layout.id
                                ? 'border-[#32a800] bg-slate-50 text-slate-900'
                                : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                }`}
                        >
                            <layout.icon size={20} />
                            <span className="text-[11px] font-medium">{layout.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile Picture Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <Camera size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Imagem de Perfil</h3>
                </div>

                <div className="flex flex-col items-center sm:flex-row gap-8">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
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
                                    <Camera size={24} />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 p-2 bg-[#32a800] text-white rounded-full shadow-sm hover:scale-105 transition-transform"
                        >
                            <Camera size={14} />
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
                                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Escolher Imagem
                            </button>
                            {profile.avatarUrl && (
                                <button
                                    onClick={() => onChange({ ...profile, avatarUrl: '' })}
                                    className="px-3 py-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        {/* Size Selector */}
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tamanho</span>
                            <div className="flex bg-slate-50 p-1 rounded-md border border-slate-100 flex-1">
                                {[
                                    { id: 'sm', label: 'P' },
                                    { id: 'md', label: 'M' },
                                    { id: 'lg', label: 'G' },
                                ].map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => onChange({ ...profile, avatarSize: size.id as any })}
                                        className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${(profile.avatarSize || 'md') === size.id
                                            ? 'bg-white text-[#32a800] shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
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
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <User size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Identidade</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Nome de Exibição</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => onChange({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-md border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-medium"
                            placeholder="@seuusuario"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Bio / Descrição</label>
                        <textarea
                            value={profile.bio || ''}
                            onChange={(e) => onChange({ ...profile, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-md border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-medium resize-none"
                            placeholder="Conte um pouco sobre você..."
                        />
                    </div>
                </div>
            </div>
        </div >
    );
};

export default HeaderEditor;
