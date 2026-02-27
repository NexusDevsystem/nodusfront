import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../../types';
import { Camera, Trash2, Layout, User, Scaling, UserCircle, Upload, Image as ImageIcon, Info, AlertCircle, Loader2, Check } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { compressImage } from '../../utils/imageUtils';
import { THEMES } from '../../constants';

interface HeaderEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    updateProfile?: (updates: Partial<UserProfile>) => void;
}

const HeaderEditor: React.FC<HeaderEditorProps> = ({ profile, onChange, updateProfile }) => {
    const [localUsername, setLocalUsername] = React.useState(profile.username || '');
    const [isChecking, setIsChecking] = React.useState(false);
    const [usernameError, setUsernameError] = React.useState<string | null>(null);
    const [usernameSuccess, setUsernameSuccess] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const checkTimeout = useRef<NodeJS.Timeout | null>(null);
    const usernameOriginal = profile.username || '';

    const handleUsernameChange = (newUsername: string) => {
        const sanitized = newUsername.toLowerCase().replace(/[^a-z0-9._]/g, '');
        setLocalUsername(sanitized);
        setUsernameError(null);
        setUsernameSuccess(false);
        setShowConfirm(false);

        if (sanitized === usernameOriginal) return;

        if (sanitized.length < 3) {
            setUsernameError('Mínimo 3 caracteres');
            return;
        }

        // Debounce check
        if (checkTimeout.current) clearTimeout(checkTimeout.current);

        setIsChecking(true);
        checkTimeout.current = setTimeout(async () => {
            try {
                const { available } = await apiClient.checkUsername(sanitized);
                if (!available) {
                    setUsernameError('Nome de usuário indisponível');
                } else {
                    setUsernameSuccess(true);
                }
            } catch (error) {
                console.error('Error checking username:', error);
            } finally {
                setIsChecking(false);
            }
        }, 500);
    };

    const confirmUsernameChange = () => {
        onChange({ ...profile, username: localUsername });
        setUsernameSuccess(false);
        setShowConfirm(false);
    };

    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];

    const handleLayoutChange = (layoutId: string) => {
        console.log(`🎯 [HeaderEditor] Layout click: ${layoutId}`);
        if (updateProfile) {
            updateProfile({ headerLayout: layoutId as any });
        } else {
            onChange({ ...profile, headerLayout: layoutId as any });
        }
    };

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

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressed = await compressImage(e.target.files[0], 1200, 0.7);
                onChange({ ...profile, customBackground: compressed });
            } catch (error) {
                console.error('Error processing image:', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Layout Section */}
            <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-4 text-black border-b border-black pb-2">
                    <Layout size={16} strokeWidth={3} />
                    <h3 className="text-xs font-medium uppercase tracking-widest text-black">Layout do Perfil</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'classic', label: 'Clássico', icon: UserCircle, color: 'bg-[#85e1e1]' },
                        { id: 'compact', label: 'Perfil', icon: User, color: 'bg-[#97cd7a]' },
                        { id: 'banner', label: 'Banner', icon: Camera, color: 'bg-[#ffdf00]' },
                    ].map((layout) => (
                        <button
                            key={layout.id}
                            onClick={() => handleLayoutChange(layout.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 border-2 transition-all ${(profile.headerLayout || 'classic') === layout.id
                                ? `border-black ${layout.color} text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]`
                                : 'border-slate-100 bg-white text-black/30 hover:border-black hover:text-black hover:bg-slate-50'
                                }`}
                        >
                            <layout.icon size={20} strokeWidth={3} />
                            <span className="text-[8px] font-medium uppercase tracking-widest">{layout.label}</span>
                        </button>
                    ))}
                </div>

                {/* Compatibility Warning */}
                {(profile.headerLayout === 'compact' || profile.headerLayout === 'banner') && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-[#f8f8f8] border border-black flex gap-3 items-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="p-1.5 bg-white border border-black text-black shrink-0">
                            <Info size={14} strokeWidth={3} />
                        </div>
                        <div>
                            <h4 className="text-[9px] font-medium text-black uppercase tracking-widest mb-1 border-b border-black inline-block">Nota de Estilo</h4>
                            <p className="text-[9px] text-black font-normal uppercase tracking-widest leading-relaxed">
                                Nos modos <span className="font-medium bg-white px-1 border border-black">Perfil</span> e <span className="font-medium bg-white px-1 border border-black">Banner</span>, fundos e animações são pausados para focar em sua foto.
                                <br />
                                <span className="mt-1.5 block text-[8px] bg-black text-[#97cd7a] px-1.5 py-0.5 border border-black inline-block">Apenas fontes e botões permanecem.</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Layout Customization Section - Only for Perfil (compact) */}
            {profile.headerLayout === 'compact' && (
                <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-slide-up mt-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                        <Scaling size={16} strokeWidth={3} />
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">Ajustes do Layout</h3>
                    </div>

                    <div className="flex flex-col">
                        <h4 className="text-[9px] font-medium text-black uppercase tracking-[0.2em] mb-2 px-1">Cor do Fundo do Card</h4>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-10 h-10 overflow-hidden border border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                    <input
                                        type="color"
                                        value={profile.customSecondaryColor || (currentTheme.id.includes('dark') || currentTheme.id.includes('black') ? '#0f172a' : '#ffffff')}
                                        onChange={(e) => onChange({ ...profile, customSecondaryColor: e.target.value })}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-none p-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={profile.customSecondaryColor || ''}
                                    onChange={(e) => onChange({ ...profile, customSecondaryColor: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}` })}
                                    placeholder="HEX"
                                    className="flex-1 h-10 px-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-widest"
                                />
                            </div>
                            {profile.customSecondaryColor && (
                                <button
                                    onClick={() => onChange({ ...profile, customSecondaryColor: null })}
                                    className="text-[9px] text-black border border-black bg-white px-3 h-10 font-medium uppercase tracking-widest shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-black hover:text-white transition-all w-full sm:w-auto"
                                >
                                    Limpar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Customization Section - Only for Banner Mode */}
            {profile.headerLayout === 'banner' && (
                <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-slide-up mt-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                        <Scaling size={16} strokeWidth={3} />
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">Ajustes do Banner</h3>
                    </div>

                    <div className="flex flex-col">
                        <h4 className="text-[9px] font-medium text-black uppercase tracking-[0.2em] mb-2 px-1">Cor do Desfoque (Fundo)</h4>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-10 h-10 overflow-hidden border border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                                    <input
                                        type="color"
                                        value={profile.bannerBlurColor || '#000000'}
                                        onChange={(e) => onChange({ ...profile, bannerBlurColor: e.target.value })}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-none p-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={profile.bannerBlurColor || ''}
                                    onChange={(e) => onChange({ ...profile, bannerBlurColor: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}` })}
                                    placeholder="#000000"
                                    className="flex-1 h-10 px-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-widest"
                                />
                            </div>
                            {profile.bannerBlurColor && (
                                <button
                                    onClick={() => onChange({ ...profile, bannerBlurColor: null })}
                                    className="text-[9px] text-black border border-black bg-white px-3 h-10 font-medium uppercase tracking-widest shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-black hover:text-white transition-all w-full sm:w-auto"
                                >
                                    Limpar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={`grid grid-cols-1 ${['compact', 'banner'].includes(profile.headerLayout || 'classic') ? 'lg:grid-cols-2' : ''} gap-4 items-start mt-4`}>
                {/* Profile Picture Section */}
                <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-full">
                    <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                        <Camera size={16} strokeWidth={3} />
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">Imagem de Perfil</h3>
                    </div>

                    <div className="flex flex-col items-center sm:flex-row gap-5">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 border border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
                                    <div className="w-full h-full flex items-center justify-center text-black">
                                        <Camera size={24} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 p-2 bg-[#97cd7a] text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all"
                            >
                                <Camera size={14} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="flex-1 px-4 py-2.5 border border-black bg-white text-black text-[9px] font-medium uppercase tracking-widest hover:bg-black hover:text-[#97cd7a] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                                >
                                    Escolher Imagem
                                </button>
                                {profile.avatarUrl && (
                                    <button
                                        onClick={() => onChange({ ...profile, avatarUrl: '' })}
                                        className="px-3 py-2.5 bg-white border border-black text-black hover:text-white hover:bg-red-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                                    >
                                        <Trash2 size={16} strokeWidth={3} />
                                    </button>
                                )}
                            </div>

                            {/* Size Selector */}
                            {!['compact', 'banner'].includes(profile.headerLayout || 'classic') && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <h4 className="text-[9px] font-medium text-black uppercase tracking-[0.2em]">Tamanho</h4>
                                    <div className="flex bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {['sm', 'md', 'lg'].map((size, idx) => (
                                            <button
                                                key={size}
                                                onClick={() => onChange({ ...profile, avatarSize: size as any })}
                                                className={`px-4 py-2 text-[8px] font-medium uppercase tracking-widest transition-all ${profile.avatarSize === size
                                                    ? 'bg-black text-[#97cd7a]'
                                                    : 'bg-white text-black hover:bg-slate-50'
                                                    } ${idx !== 0 ? 'border-l border-black' : ''}`}
                                            >
                                                {size === 'sm' ? 'Pequeno' : size === 'md' ? 'Médio' : 'Grande'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Banner Upload for Profile Layout */}
                {profile.headerLayout === 'compact' && (
                    <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-full">
                        <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                            <ImageIcon size={16} strokeWidth={3} />
                            <h3 className="text-xs font-medium uppercase tracking-widest text-black">Banner do Perfil</h3>
                        </div>

                        <div className="flex flex-col items-center sm:flex-row gap-5">
                            <div className="relative shrink-0">
                                <div className="w-36 h-16 border border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {profile.customBackground ? (
                                        <img
                                            src={profile.customBackground}
                                            alt="Banner"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-black">
                                            <ImageIcon size={20} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-2 bg-[#97cd7a] text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all"
                                >
                                    <Camera size={14} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="flex-1 w-full space-y-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="flex-1 px-4 py-2 border border-black bg-white text-black text-[9px] font-medium uppercase tracking-widest hover:bg-black hover:text-[#97cd7a] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                                    >
                                        Escolher Banner
                                    </button>
                                    {profile.customBackground && (
                                        <button
                                            onClick={() => onChange({ ...profile, customBackground: null })}
                                            className="px-3 py-2 bg-white border border-black text-black hover:text-white hover:bg-red-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                                        >
                                            <Trash2 size={16} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Title / Identity Section */}
                <div className={`bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${profile.headerLayout === 'compact' ? 'lg:col-span-2' : ''}`}>
                    <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                        <User size={16} strokeWidth={3} />
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">Identidade</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-medium text-black uppercase tracking-[0.2em] mb-2 px-1 flex justify-between items-center">
                                <span>Nome de Usuário (@)</span>
                                {profile.usernameUpdatedAt && (
                                    <span className="text-[7px] text-black/40 normal-case font-normal">
                                        Última alteração: {new Date(profile.usernameUpdatedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-black/30">@</div>
                                <input
                                    type="text"
                                    value={localUsername}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    className={`w-full pl-7 pr-3 py-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[11px] font-medium text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30 ${usernameError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    placeholder={usernameOriginal || 'seu_usuario'}
                                />
                                {isChecking && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 size={14} className="animate-spin text-black/40" />
                                    </div>
                                )}
                                {usernameSuccess && !isChecking && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                            {usernameError && (
                                <p className="text-[8px] font-medium text-red-500 uppercase tracking-widest mt-1.5 px-1 flex items-center gap-1">
                                    <AlertCircle size={10} /> {usernameError}
                                </p>
                            )}

                            {usernameSuccess && localUsername !== usernameOriginal && !isChecking && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 p-3 bg-[#97cd7a]/10 border border-[#97cd7a] border-dashed"
                                >
                                    <p className="text-[9px] font-medium text-black uppercase mb-3 flex items-center gap-2">
                                        <Check size={12} className="text-[#3c6d25]" /> Username disponível!
                                    </p>
                                    <button
                                        onClick={confirmUsernameChange}
                                        className="w-full py-2 bg-[#97cd7a] text-black text-[9px] font-medium uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                    >
                                        Confirmar Troca de @
                                    </button>
                                </motion.div>
                            )}

                            <p className="text-[7px] font-medium text-black/50 uppercase tracking-widest mt-2 px-1 border-t border-black/5 pt-2 italic">
                                * Se você mudar seu @, só poderá mudar novamente após <span className="text-black">7 dias</span>.
                            </p>
                        </div>
                        <div>
                            <label className="block text-[9px] font-medium text-black uppercase tracking-[0.2em] mb-2 px-1">Nome de Exibição</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => onChange({ ...profile, name: e.target.value })}
                                className="w-full px-3 py-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[11px] font-medium text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30"
                                placeholder="Seu Nome Visível"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-medium text-black uppercase tracking-[0.2em] mb-2 px-1">Bio / Descrição</label>
                            <textarea
                                value={profile.bio || ''}
                                onChange={(e) => onChange({ ...profile, bio: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[11px] font-normal text-black resize-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30"
                                placeholder="Conte um pouco sobre você..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden file inputs - REQUIRED for upload to work */}
            <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
            />
            <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
            />
        </div>
    );
};

export default HeaderEditor;
