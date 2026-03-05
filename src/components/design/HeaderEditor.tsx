import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { UserProfile } from '../../types';
import { Camera, Trash2, Layout, User, Scaling, UserCircle, Upload, Image as ImageIcon, Info, AlertCircle, Loader2, Check } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { compressImage } from '../../utils/imageUtils';
import { THEMES } from '../../constants';
import ImageCropperModal from '../tools/ImageCropperModal';
import { blobToDataURL } from '../../utils/imageUtils';
import Tooltip from '../Tooltip';

// Add this utility to imageUtils later or here if not there
const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
};

interface HeaderEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    updateProfile?: (updates: Partial<UserProfile>) => void;
}

const HeaderEditor: React.FC<HeaderEditorProps> = ({ profile, onChange, updateProfile }) => {
    const { t } = useTranslation();
    const [tempUsername, setTempUsername] = useState(profile.username || '');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const checkTimeout = useRef<NodeJS.Timeout | null>(null);
    const usernameOriginal = profile.username || '';

    // Cropper State
    const [cropper, setCropper] = useState<{
        isOpen: boolean;
        image: string;
        type: 'avatar' | 'banner';
        aspectRatio: number;
    }>({
        isOpen: false,
        image: '',
        type: 'avatar',
        aspectRatio: 1
    });

    const [isSavingImage, setIsSavingImage] = useState(false);

    useEffect(() => {
        setTempUsername(profile.username || '');
        setIsUsernameAvailable(true); // Reset availability when profile changes
    }, [profile.username]);

    const handleTempUsernameChange = useCallback((newUsername: string) => {
        const sanitized = newUsername.toLowerCase().replace(/[^a-z0-9._]/g, '');
        setTempUsername(sanitized);
        setIsUsernameAvailable(false); // Assume unavailable until checked

        if (sanitized === usernameOriginal) {
            setIsUsernameAvailable(true); // If it's the original, it's available
            if (checkTimeout.current) clearTimeout(checkTimeout.current);
            setIsCheckingUsername(false);
            return;
        }

        if (sanitized.length < 3) {
            if (checkTimeout.current) clearTimeout(checkTimeout.current);
            setIsCheckingUsername(false);
            return;
        }

        if (checkTimeout.current) clearTimeout(checkTimeout.current);

        setIsCheckingUsername(true);
        checkTimeout.current = setTimeout(async () => {
            try {
                const { available } = await apiClient.checkUsername(sanitized);
                setIsUsernameAvailable(available);
            } catch (error) {
                console.error('Error checking username:', error);
                setIsUsernameAvailable(false); // Assume unavailable on error
            } finally {
                setIsCheckingUsername(false);
            }
        }, 500);
    }, [usernameOriginal]);

    const handleConfirmUsernameChange = () => {
        if (isUsernameAvailable && tempUsername.length >= 3 && tempUsername !== usernameOriginal) {
            if (updateProfile) {
                updateProfile({ username: tempUsername });
            } else {
                onChange({ ...profile, username: tempUsername });
            }
        }
    };

    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];

    const handleLayoutChange = (layoutId: string) => {
        if (updateProfile) {
            updateProfile({ headerLayout: layoutId as any });
        } else {
            onChange({ ...profile, headerLayout: layoutId as any });
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const dataUrl = await fileToDataURL(e.target.files[0]);
            setCropper({
                isOpen: true,
                image: dataUrl,
                type: 'avatar',
                aspectRatio: 1
            });
            // Reset input so the same file can be selected again
            e.target.value = '';
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const dataUrl = await fileToDataURL(e.target.files[0]);
            setCropper({
                isOpen: true,
                image: dataUrl,
                type: 'banner',
                aspectRatio: 3 / 1 // Common banner ratio
            });
            // Reset input so the same file can be selected again
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsSavingImage(true);
        try {
            // Create a File from the Blob
            const filename = cropper.type === 'avatar' ? 'avatar.jpg' : 'banner.jpg';
            const file = new File([croppedBlob], filename, { type: 'image/jpeg' });

            // Upload to server
            const uploadRes = await apiClient.uploadInternalAsset(file);

            if (uploadRes.success && uploadRes.file?.url) {
                const imageUrl = uploadRes.file.url;
                if (cropper.type === 'avatar') {
                    if (updateProfile) updateProfile({ avatarUrl: imageUrl });
                    else onChange({ ...profile, avatarUrl: imageUrl });
                } else {
                    if (updateProfile) updateProfile({ customBackground: imageUrl });
                    else onChange({ ...profile, customBackground: imageUrl });
                }
            } else {
                // Fallback to base64 if upload fails
                const dataUrl = await blobToDataURL(croppedBlob);
                if (cropper.type === 'avatar') {
                    if (updateProfile) updateProfile({ avatarUrl: dataUrl });
                    else onChange({ ...profile, avatarUrl: dataUrl });
                } else {
                    if (updateProfile) updateProfile({ customBackground: dataUrl });
                    else onChange({ ...profile, customBackground: dataUrl });
                }
            }
            setCropper(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error('Error saving cropped image:', error);
        } finally {
            setIsSavingImage(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Layout Section */}
            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-6 text-black border-b-2 border-black pb-3">
                    <Layout size={20} strokeWidth={2.5} />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">{t('design.profileLayout')}</h3>
                </div>

                <div className="flex bg-[#fcfcfc] p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {[
                        { id: 'classic', label: t('design.classic'), icon: <Layout className="w-4 h-4" /> },
                        { id: 'compact', label: t('design.profile'), icon: <User className="w-4 h-4" /> },
                        { id: 'banner', label: t('design.banner'), icon: <ImageIcon className="w-4 h-4" /> },
                    ].map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleLayoutChange(option.id)}
                            className={`flex flex-col items-center justify-center gap-2 p-4 border-2 transition-all flex-1
                                ${(profile.headerLayout || 'classic') === option.id
                                    ? `border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]`
                                    : 'border-transparent bg-transparent text-black/20 hover:text-black hover:border-black/5'
                                }`}
                        >
                            {option.icon}
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{option.label}</span>
                        </button>
                    ))}
                </div>

                {/* Compatibility Warning */}
                {(profile.headerLayout === 'compact' || profile.headerLayout === 'banner') && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-[#f8f8f8] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex gap-4 items-start"
                    >
                        <div className="p-2 bg-black text-[#97cd7a] border-2 border-black shrink-0">
                            <Info size={16} strokeWidth={3} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-black uppercase tracking-widest mb-1 border-b-2 border-black inline-block">{t('design.styleNote')}</h4>
                            <p className="text-[9px] text-black/60 font-bold uppercase tracking-widest leading-relaxed">
                                {t('design.styleNoteDesc')}
                            </p>
                            <div className="mt-2">
                                <span className="text-[8px] font-black bg-black text-[#97cd7a] px-2 py-0.5 border border-black inline-block">{t('design.onlyFontsButtons')}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className={`grid grid-cols-1 ${['compact', 'banner'].includes(profile.headerLayout || 'classic') ? 'lg:grid-cols-2' : ''} gap-4 items-start mt-4`}>
                {/* Profile Picture Section */}
                <div className={`bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-full ${['compact', 'banner'].includes(profile.headerLayout || 'classic') ? 'order-1' : ''}`}>
                    <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                        <Camera size={16} strokeWidth={3} />
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.profileImage')}</h3>
                    </div>

                    <div className="flex flex-col items-center sm:flex-row gap-5">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 border border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl}
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
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="flex gap-2">
                                <label htmlFor="avatar-upload" className="w-full py-2 bg-[#97cd7a] border-2 border-black text-black cursor-pointer hover:bg-black hover:text-[#97cd7a] transition-all font-medium text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none">
                                    <Upload size={14} strokeWidth={3} /> {profile.avatarUrl ? t('common.change') : t('design.chooseImage')}
                                </label>
                                {profile.avatarUrl && (
                                    <Tooltip text={t('common.delete')} position="top">
                                        <button
                                            onClick={() => onChange({ ...profile, avatarUrl: '' })}
                                            className="px-3 py-2.5 bg-white border border-black text-black hover:text-white hover:bg-red-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                                        >
                                            <Trash2 size={16} strokeWidth={3} />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>

                            {/* Size Selector */}
                            {!['compact', 'banner'].includes(profile.headerLayout || 'classic') && (
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">{t('common.size')}</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'sm', label: t('common.small') },
                                            { id: 'md', label: t('common.medium') },
                                            { id: 'lg', label: t('common.large') },
                                        ].map((size, idx) => (
                                            <button
                                                key={size.id}
                                                onClick={() => onChange({ ...profile, avatarSize: size.id as any })}
                                                className={`px-4 py-2 text-[8px] font-medium uppercase tracking-widest transition-all ${profile.avatarSize === size.id
                                                    ? 'bg-black text-[#97cd7a]'
                                                    : 'bg-white text-black hover:bg-slate-50 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                                    }`}
                                            >
                                                {size.label}
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
                    <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-full order-2">
                        <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                            <ImageIcon size={16} strokeWidth={3} />
                            <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.profileBanner')}</h3>
                        </div>

                        <div className="flex flex-col items-center sm:flex-row gap-5">
                            <div className="relative shrink-0">
                                <div className="w-36 h-16 border border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {profile.customBackground ? (
                                        <img src={profile.customBackground}
                                            alt="Banner"
                                            className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-black">
                                            <ImageIcon size={20} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-3">
                                <div className="flex gap-2">
                                    <label htmlFor="banner-upload" className="w-full py-2 bg-[#97cd7a] border-2 border-black text-black cursor-pointer hover:bg-black hover:text-[#97cd7a] transition-all font-medium text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none">
                                        <Upload size={14} strokeWidth={3} /> {profile.customBackground ? t('common.change') : t('design.chooseBanner')}
                                    </label>
                                    {profile.customBackground && (
                                        <Tooltip text={t('common.delete')} position="top">
                                            <button
                                                onClick={() => onChange({ ...profile, customBackground: null })}
                                                className="px-3 py-2 bg-white border border-black text-black hover:text-white hover:bg-red-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                                            >
                                                <Trash2 size={16} strokeWidth={3} />
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                                <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest leading-relaxed px-1">
                                    {t('design.bannerSizeRecommendation')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Banner Color Settings — card 1 + optional gradient card 2 */}
                {profile.headerLayout === 'banner' && (() => {
                    const rawBanner = profile.bannerBlurColor || '#000000';
                    const bannerParts = rawBanner.split('|');
                    const bannerColor1 = bannerParts[0] || '#000000';
                    const bannerColor2 = bannerParts[1] || null;
                    const isGradient = !!bannerColor2;

                    const setBannerColor = (c1: string, c2: string | null) => {
                        const newVal = c2 ? `${c1}|${c2}` : c1;
                        if (updateProfile) updateProfile({ bannerBlurColor: newVal });
                        else onChange({ ...profile, bannerBlurColor: newVal });
                    };

                    return (
                        <>
                            {/* Card 1: Primary Color */}
                            <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-slide-up h-full order-3">
                                <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
                                    <div className="flex items-center gap-2 text-black">
                                        <div className="w-4 h-4 border-2 border-black bg-black shrink-0" />
                                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.bannerSettings')}</h3>
                                    </div>
                                    <Tooltip text={isGradient ? t('design.disableGradient', 'Desativar degradê') : t('design.enableGradient', 'Ativar degradê')} position="top">
                                        <button
                                            onClick={() => isGradient
                                                ? setBannerColor(bannerColor1, null)
                                                : setBannerColor(bannerColor1, bannerColor2 || '#1e3a5f')
                                            }
                                            className="flex items-center gap-2 group"
                                        >
                                            <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">
                                                {t('design.blurColorGradient')}
                                            </span>
                                            <div className={`relative w-10 h-5 border-2 border-black transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${isGradient ? 'bg-black' : 'bg-white'}`}>
                                                <div className={`absolute top-[2px] w-3 h-3 border border-black transition-all ${isGradient ? 'right-[2px] bg-[#97cd7a]' : 'left-[2px] bg-black'}`} />
                                            </div>
                                        </button>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 overflow-hidden border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-pointer" style={{ backgroundColor: bannerColor1 }}>
                                        <input type="color" value={bannerColor1} onChange={(e) => setBannerColor(e.target.value, bannerColor2)} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 opacity-0" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[8px] font-medium text-black uppercase tracking-[0.2em] mb-1.5">
                                            {isGradient ? t('design.bannerColor1') : t('design.blurColor')}
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="text" value={bannerColor1} onChange={(e) => { const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`; setBannerColor(val, bannerColor2); }} placeholder="#000000" className="flex-1 h-9 px-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] tracking-widest" />
                                            <button onClick={() => setBannerColor('#000000', bannerColor2)} className="px-2 h-9 flex items-center justify-center text-black bg-white border border-black hover:bg-black hover:text-red-400 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[9px] font-bold uppercase">{t('common.clear')}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Secondary Color — in empty column when gradient ON */}
                            {isGradient && (
                                <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-slide-up h-full order-4">
                                    <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                                        <div className="w-4 h-4 border-2 border-black bg-black shrink-0" />
                                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.bannerColor2')}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 overflow-hidden border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-pointer" style={{ backgroundColor: bannerColor2 || '#1e3a5f' }}>
                                            <input type="color" value={bannerColor2 || '#1e3a5f'} onChange={(e) => setBannerColor(bannerColor1, e.target.value)} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 opacity-0" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-medium text-black uppercase tracking-[0.2em] mb-1.5">{t('design.bannerColor2')}</label>
                                            <input type="text" value={bannerColor2 || ''} onChange={(e) => { const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`; setBannerColor(bannerColor1, val); }} placeholder="#1e3a5f" className="w-full h-9 px-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] tracking-widest" />
                                        </div>
                                    </div>
                                    <div className="mt-4 w-full h-4 border border-black/20" style={{ background: `linear-gradient(135deg, ${bannerColor1}, ${bannerColor2 || '#1e3a5f'})` }} />
                                </div>
                            )}
                        </>
                    );
                })()}

                {/* Layout Customization Section - Only for Perfil (compact) */}
                {profile.headerLayout === 'compact' && (() => {
                    // Parse customSecondaryColor: "#c1" or "#c1|#c2"
                    const raw = profile.customSecondaryColor || '#0f172a';
                    const parts = raw.split('|');
                    const color1 = parts[0] || '#0f172a';
                    const color2 = parts[1] || null;
                    const isGradient = !!color2;

                    const setColors = (c1: string, c2: string | null) => {
                        const newVal = c2 ? `${c1}|${c2}` : c1;
                        if (updateProfile) updateProfile({ customSecondaryColor: newVal });
                        else onChange({ ...profile, customSecondaryColor: newVal });
                    };

                    return (
                        <>
                            {/* Card 1: Primary Color (always visible) */}
                            <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-slide-up h-full order-3">
                                <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
                                    <div className="flex items-center gap-2 text-black">
                                        <Scaling size={16} strokeWidth={3} />
                                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.layoutSettings')}</h3>
                                    </div>
                                    {/* Gradient Toggle Switch */}
                                    <Tooltip text={isGradient ? t('design.disableGradient', 'Desativar degradê') : t('design.enableGradient', 'Ativar degradê')} position="top">
                                        <button
                                            onClick={() => isGradient
                                                ? setColors(color1, null)
                                                : setColors(color1, color2 || '#1e3a5f')
                                            }
                                            className="flex items-center gap-2 group"
                                        >
                                            <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">
                                                {t('design.blurColorGradient')}
                                            </span>
                                            <div className={`relative w-10 h-5 border-2 border-black transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${isGradient ? 'bg-black' : 'bg-white'}`}>
                                                <div className={`absolute top-[2px] w-3 h-3 border border-black transition-all ${isGradient ? 'right-[2px] bg-[#97cd7a]' : 'left-[2px] bg-black'}`} />
                                            </div>
                                        </button>
                                    </Tooltip>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div
                                        className="relative w-12 h-12 overflow-hidden border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-pointer"
                                        style={{ backgroundColor: color1 }}
                                    >
                                        <input
                                            type="color"
                                            value={color1}
                                            onChange={(e) => setColors(e.target.value, color2)}
                                            className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 opacity-0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[8px] font-medium text-black uppercase tracking-[0.2em] mb-1.5">
                                            {isGradient ? t('design.bannerColor1') : t('design.cardBackgroundColor')}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={color1}
                                                onChange={(e) => {
                                                    const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                                    setColors(val, color2);
                                                }}
                                                placeholder="#0f172a"
                                                className="flex-1 h-9 px-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] tracking-widest"
                                            />
                                            <button
                                                onClick={() => setColors('#0f172a', color2)}
                                                className="px-2 h-9 flex items-center justify-center text-black bg-white border border-black hover:bg-black hover:text-red-400 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-[9px] font-bold uppercase"
                                            >
                                                {t('common.clear')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Secondary Color — appears in the empty column when gradient is ON */}
                            {isGradient && (
                                <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-slide-up h-full order-4">
                                    <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                                        <div className="w-4 h-4 border-2 border-black bg-black shrink-0" />
                                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.bannerColor2')}</h3>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div
                                            className="relative w-12 h-12 overflow-hidden border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-pointer"
                                            style={{ backgroundColor: color2 || '#1e3a5f' }}
                                        >
                                            <input
                                                type="color"
                                                value={color2 || '#1e3a5f'}
                                                onChange={(e) => setColors(color1, e.target.value)}
                                                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 opacity-0"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-medium text-black uppercase tracking-[0.2em] mb-1.5">
                                                {t('design.bannerColor2')}
                                            </label>
                                            <input
                                                type="text"
                                                value={color2 || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                                    setColors(color1, val);
                                                }}
                                                placeholder="#1e3a5f"
                                                className="w-full h-9 px-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    {/* Gradient preview stripe */}
                                    <div
                                        className="mt-4 w-full h-4 border border-black/20 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                                        style={{ background: `linear-gradient(135deg, ${color1}, ${color2 || '#1e3a5f'})` }}
                                    />
                                </div>
                            )}
                        </>
                    );
                })()}




                {/* Title / Identity Section */}
                <div className={`bg-white p-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${['compact', 'banner'].includes(profile.headerLayout || 'classic') ? 'lg:col-span-2 order-last' : ''}`}>
                    <div className="flex items-center gap-2 mb-6 border-b border-black/20 pb-2 text-black relative">
                        <UserCircle size={18} strokeWidth={2.5} />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black">{t('design.identity')}</h3>
                        <div className="absolute bottom-0 left-0 right-0 border-b border-black"></div>
                    </div>

                    <div className="space-y-6">
                        {/* Username Section */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] px-1">
                                {t('design.username')}
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-black/30">@</div>
                                <input
                                    type="text"
                                    value={tempUsername}
                                    onChange={(e) => handleTempUsernameChange(e.target.value)}
                                    placeholder={t('design.usernamePlaceholder')}
                                    className={`w-full h-12 pl-10 pr-12 border-2 border-black bg-white focus:bg-[#fcfcfc] outline-none transition-all text-sm font-medium tracking-wide text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[1px] focus:translate-y-[1px] ${!isUsernameAvailable && tempUsername.length >= 3 ? 'border-red-400' : ''}`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isCheckingUsername && <Loader2 size={14} className="animate-spin text-black/20" />}
                                    {!isCheckingUsername && tempUsername !== profile.username && tempUsername.length >= 3 && (
                                        isUsernameAvailable ? (
                                            <Check size={16} className="text-[#97cd7a]" strokeWidth={4} />
                                        ) : (
                                            <AlertCircle size={16} className="text-red-400" strokeWidth={3} />
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Username Specific Status/Warning */}
                            <div className="px-1 min-h-[14px]">
                                {tempUsername.length > 0 && tempUsername.length < 3 && (
                                    <p className="text-[8px] font-bold text-black/30 uppercase tracking-widest">{t('design.minChars')}</p>
                                )}
                                {tempUsername !== profile.username && tempUsername.length >= 3 && !isCheckingUsername && (
                                    !isUsernameAvailable ? (
                                        <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">{t('design.usernameUnavailable')}</p>
                                    ) : (
                                        <p className="text-[8px] font-black text-[#97cd7a] uppercase tracking-widest">{t('design.usernameAvailable')}</p>
                                    )
                                )}

                                <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest leading-relaxed mt-1 italic">
                                    {t('design.usernameWarning')}
                                </p>
                            </div>

                            {/* Username Change Confirmation Button */}
                            {tempUsername !== profile.username && isUsernameAvailable && !isCheckingUsername && tempUsername.length >= 3 && (
                                <motion.button
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleConfirmUsernameChange}
                                    className="w-full py-3 bg-[#97cd7a] border-2 border-black text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Check size={14} strokeWidth={4} />
                                    {t('design.confirmUsernameChange')}
                                </motion.button>
                            )}
                        </div>

                        {/* Display Name */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] px-1">{t('design.displayName')}</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => {
                                    if (updateProfile) updateProfile({ name: e.target.value });
                                    else onChange({ ...profile, name: e.target.value });
                                }}
                                placeholder={t('design.displayNamePlaceholder')}
                                className="w-full h-12 px-4 border-2 border-black bg-white focus:bg-[#fcfcfc] outline-none transition-all text-sm font-medium tracking-wide text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[1px] focus:translate-y-[1px]"
                            />
                        </div>

                        {/* Bio / Description */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] px-1">{t('design.bio')}</label>
                            <textarea
                                value={profile.bio || ''}
                                onChange={(e) => {
                                    if (updateProfile) updateProfile({ bio: e.target.value });
                                    else onChange({ ...profile, bio: e.target.value });
                                }}
                                placeholder={t('design.bioPlaceholder')}
                                className="w-full h-28 p-4 border-2 border-black bg-white focus:bg-[#fcfcfc] outline-none transition-all text-sm font-medium tracking-wide text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[1px] focus:translate-y-[1px] resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden file inputs - REQUIRED for upload to work */}
            <input
                ref={avatarInputRef}
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
            />
            <input
                ref={bannerInputRef}
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
            />

            <ImageCropperModal
                isOpen={cropper.isOpen}
                image={cropper.image}
                aspectRatio={cropper.aspectRatio}
                title={cropper.type === 'avatar' ? t('design.cropProfile') || 'Recortar Avatar' : t('design.cropBanner') || 'Recortar Banner'}
                onClose={() => setCropper(prev => ({ ...prev, isOpen: false }))}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};

export default HeaderEditor;
