import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { UserProfile } from '../../types';
import { Camera, Trash2, Layout, User, Scaling, UserCircle, Upload, Image as ImageIcon, Info, AlertCircle, Loader2, Check, Lock, Zap, Clock, X, RefreshCw } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { compressImage } from '../../utils/imageUtils';
import { THEMES } from '../../constants';
import ImageCropperModal from '../tools/ImageCropperModal';
import { blobToDataURL } from '../../utils/imageUtils';
import VerificationRequestModal from '../VerificationRequestModal';

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

    const [isVerifModalOpen, setIsVerifModalOpen] = useState(false);
    const [verifRequest, setVerifRequest] = useState<any>(null);
    const [verifLoaded, setVerifLoaded] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const checkTimeout = useRef<NodeJS.Timeout | null>(null);
    const usernameOriginal = profile.username || '';


    const [isSavingImage, setIsSavingImage] = useState(false);
    const [isAvatarTypeModalOpen, setIsAvatarTypeModalOpen] = useState(false);
    const [uploadType, setUploadType] = useState<'static' | 'animated'>('static');

    const loadVerifStatus = useCallback(async () => {
        if (profile.isVerified) return;
        try {
            const data = await apiClient.getMyVerificationRequest();
            setVerifRequest(data);
            setVerifLoaded(true);
        } catch (err) {
            setVerifLoaded(true);
        }
    }, [profile.isVerified]);

    useEffect(() => {
        loadVerifStatus();
    }, [loadVerifStatus]);

    useEffect(() => {
        const handleRefresh = () => loadVerifStatus();
        window.addEventListener('verification-request-submitted', handleRefresh);
        return () => window.removeEventListener('verification-request-submitted', handleRefresh);
    }, [loadVerifStatus]);

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
        // Update the profile locally to allow "Live Preview"
        // This follows the same pattern as themes/fonts: preview anywhere, but only saves for PRO plan.
        if (updateProfile) {
            updateProfile({ headerLayout: layoutId as any });
        } else {
            onChange({ ...profile, headerLayout: layoutId as any });
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsSavingImage(true);
            try {
                let uploadFile: File;

                // Handle Animated GIF (No compression to preserve animation)
                if (uploadType === 'animated') {
                    if (file.type !== 'image/gif') {
                        alert('Por favor, selecione um arquivo GIF para a opção animada.');
                        setIsSavingImage(false);
                        return;
                    }
                    uploadFile = file;
                } else {
                    // Compress standard images
                    const compressedDataUrl = await compressImage(file, 800, 0.8);
                    const response = await fetch(compressedDataUrl);
                    const blob = await response.blob();
                    uploadFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                }

                const uploadRes = await apiClient.uploadInternalAsset(uploadFile);
                if (uploadRes.success && uploadRes.file?.url) {
                    const imageUrl = uploadRes.file.url;
                    if (updateProfile) updateProfile({ avatarUrl: imageUrl });
                    else onChange({ ...profile, avatarUrl: imageUrl });
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
            } finally {
                setIsSavingImage(false);
                e.target.value = '';
                setIsAvatarTypeModalOpen(false);
            }
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsSavingImage(true);
            try {
                // Direct upload for banner too
                const compressedDataUrl = await compressImage(file, 1200, 0.8);
                const response = await fetch(compressedDataUrl);
                const blob = await response.blob();
                const uploadFile = new File([blob], 'banner.jpg', { type: 'image/jpeg' });

                const uploadRes = await apiClient.uploadInternalAsset(uploadFile);
                if (uploadRes.success && uploadRes.file?.url) {
                    const imageUrl = uploadRes.file.url;
                    if (updateProfile) updateProfile({ customBackground: imageUrl });
                    else onChange({ ...profile, customBackground: imageUrl });
                }
            } catch (error) {
                console.error('Error uploading banner:', error);
            } finally {
                setIsSavingImage(false);
                e.target.value = '';
            }
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsSavingImage(true);
            try {
                // Compress logo preserving transparency (format png)
                const compressedDataUrl = await compressImage(file, 800, 1, 'image/png');
                const response = await fetch(compressedDataUrl);
                const blob = await response.blob();
                const uploadFile = new File([blob], 'logo.png', { type: 'image/png' });

                const uploadRes = await apiClient.uploadInternalAsset(uploadFile);
                if (uploadRes.success && uploadRes.file?.url) {
                    const imageUrl = uploadRes.file.url;
                    if (updateProfile) updateProfile({ logoUrl: imageUrl });
                    else onChange({ ...profile, logoUrl: imageUrl });
                }
            } catch (error) {
                console.error('Error uploading logo:', error);
            } finally {
                setIsSavingImage(false);
                e.target.value = '';
            }
        }
    };


    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 items-start`}>
                {/* Header Layout Section */}
                <div className="bg-white p-6 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-md h-full">
                    <div className="flex items-center gap-2 mb-6 text-[#1a1a1a] border-b-2 border-[#1a1a1a]/10 pb-3">
                        <Layout size={20} strokeWidth={2.5} />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">{t('design.profileLayout')}</h3>
                    </div>

                    <div className="flex bg-[#fdfcf0] p-1.5 border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] rounded-md">
                        {[
                            { id: 'classic', label: t('design.classic'), icon: <Layout className="w-4 h-4" /> },
                            { id: 'compact', label: t('design.banner'), icon: <ImageIcon className="w-4 h-4" />, premium: true },
                            { id: 'banner', label: t('design.profile'), icon: <User className="w-4 h-4" />, premium: true },
                        ].map((option) => {
                            const isFree = !profile.plan_type || profile.plan_type === 'free';
                            const isLocked = option.premium && isFree;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleLayoutChange(option.id)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 border-2 transition-all flex-1 rounded-lg cursor-target relative overflow-hidden
                                        ${(profile.headerLayout || 'classic') === option.id
                                            ? `border-[#1a1a1a] bg-white text-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] -translate-y-[1px]`
                                            : 'border-transparent bg-transparent text-[#1a1a1a]/20 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/5'
                                        }`}
                                >
                                    {option.premium && (
                                        <div className="absolute top-1.5 right-1.5">
                                            <Zap size={14} strokeWidth={2} className="text-[#ffdf00]" fill="#ffdf00" />
                                        </div>
                                    )}
                                    {option.icon}
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Compatibility Warning */}
                    {(profile.headerLayout === 'compact' || profile.headerLayout === 'banner') && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-[#fdfcf0] border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] flex gap-4 items-start rounded-md"
                        >
                            <div className="p-2 bg-[#1a1a1a] text-[#97cd7a] border-2 border-[#1a1a1a] shrink-0 rounded-lg">
                                <Info size={16} strokeWidth={3} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-widest mb-1 border-b-2 border-[#1a1a1a]/10 inline-block">{t('design.styleNote')}</h4>
                                <p className="text-[9px] text-[#1a1a1a]/60 font-bold uppercase tracking-widest leading-relaxed">
                                    {t('design.styleNoteDesc')}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Profile Picture Section */}
                <div className={`bg-white p-4 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] h-full rounded-md`}>
                    <div className="flex items-center gap-2 mb-4 border-b border-[#1a1a1a]/10 pb-2 text-[#1a1a1a]">
                        <Camera size={16} strokeWidth={3} />
                        <h3 className="text-xs font-medium uppercase tracking-widest">{t('design.profileImage')}</h3>
                    </div>

                    <div className="flex flex-col items-center sm:flex-row gap-5">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 border border-[#1a1a1a] bg-white shadow-[0_3px_0_0_#1a1a1a] rounded-full overflow-hidden">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover rounded-full"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Nodus'}`;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]">
                                        <Camera size={24} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsAvatarTypeModalOpen(true)}
                                    className="w-full py-2 bg-[#97cd7a] border-2 border-[#1a1a1a] text-[#1a1a1a] cursor-pointer hover:bg-[#86b86c] transition-all font-medium text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none rounded-md"
                                >
                                    <Upload size={14} strokeWidth={3} /> {profile.avatarUrl ? t('common.change') : t('design.chooseImage')}
                                </button>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={handleAvatarUpload}
                                    accept={uploadType === 'animated' ? 'image/gif' : 'image/*'}
                                    className="hidden"
                                    id="avatar-upload"
                                />
                                {profile.avatarUrl && (
                                        <button
                                            onClick={() => onChange({ ...profile, avatarUrl: '' })}
                                            className="px-3 py-2.5 bg-white border border-[#1a1a1a] text-[#1a1a1a] hover:text-white hover:bg-red-400 transition-all shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none rounded-md"
                                        >
                                            <Trash2 size={16} strokeWidth={3} />
                                        </button>
                                )}
                            </div>

                            {/* Size Selector */}
                            {!['compact', 'banner'].includes(profile.headerLayout || 'classic') && (
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-[9px] font-black text-[#1a1a1a]/30 uppercase tracking-[0.2em] mb-1">{t('common.size')}</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'sm', label: t('common.small') },
                                            { id: 'md', label: t('common.medium') },
                                            { id: 'lg', label: t('common.large') },
                                        ].map((size, idx) => (
                                            <button
                                                key={size.id}
                                                onClick={() => onChange({ ...profile, avatarSize: size.id as any })}
                                                className={`px-4 py-2 text-[8px] font-medium uppercase tracking-widest transition-all rounded-md ${profile.avatarSize === size.id
                                                    ? 'bg-[#1a1a1a] text-[#97cd7a]'
                                                    : 'bg-white text-[#1a1a1a] hover:bg-slate-50 border border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a]'
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
            </div>

            <div className={`grid grid-cols-1 ${['compact', 'banner'].includes(profile.headerLayout || 'classic') ? 'lg:grid-cols-2' : ''} gap-4 items-start mt-4`}>

                {/* Banner Upload for Profile Layout */}
                {profile.headerLayout === 'compact' && (
                    <div className="bg-white p-4 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] h-full order-2 rounded-md">
                        <div className="flex items-center gap-2 mb-4 border-b border-[#1a1a1a]/10 pb-2 text-[#1a1a1a]">
                            <ImageIcon size={16} strokeWidth={3} />
                            <h3 className="text-xs font-medium uppercase tracking-widest">{t('design.profileBanner')}</h3>
                        </div>

                        <div className="flex flex-col items-center sm:flex-row gap-5">
                            <div className="relative shrink-0">
                                <div className="w-36 h-16 border border-[#1a1a1a] bg-white shadow-[0_3px_0_0_#1a1a1a] rounded-md overflow-hidden">
                                    {profile.customBackground ? (
                                        <img src={profile.customBackground}
                                            alt="Banner"
                                            className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]">
                                            <ImageIcon size={20} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-3">
                                <div className="flex gap-2">
                                    <label htmlFor="banner-upload" className="w-full py-2 bg-[#97cd7a] border-2 border-[#1a1a1a] text-[#1a1a1a] cursor-pointer hover:bg-[#97cd7a] hover:text-[#97cd7a] transition-all font-medium text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none rounded-md">
                                        <Upload size={14} strokeWidth={3} /> {profile.customBackground ? t('common.change') : t('design.chooseBanner')}
                                    </label>
                                    {profile.customBackground && (
                                        <button
                                            onClick={() => onChange({ ...profile, customBackground: null })}
                                            className="px-3 py-2 bg-white border border-[#1a1a1a] text-[#1a1a1a] hover:text-white hover:bg-red-400 transition-all shadow-[0_2px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none rounded-md"
                                        >
                                            <Trash2 size={16} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[8px] font-bold text-[#1a1a1a]/40 uppercase tracking-widest leading-relaxed px-1">
                                    {t('design.bannerSizeRecommendation')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Banner Color Settings — card 1 + optional gradient card 2 */}
                {profile.headerLayout === 'banner' && (() => {
                    const rawBanner = profile.bannerBlurColor || '#1a1a1a';
                    const bannerParts = rawBanner.split('|');
                    const bannerColor1 = bannerParts[0] || '#1a1a1a';
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
                            <div className="bg-white p-4 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] animate-slide-up h-full order-3 rounded-md">
                                <div className="flex items-center justify-between mb-4 border-b border-[#1a1a1a]/10 pb-2">
                                    <div className="flex items-center gap-2 text-[#1a1a1a]">
                                        <div className="w-4 h-4 border-2 border-[#1a1a1a] bg-[#1a1a1a] shrink-0 rounded-md" />
                                        <h3 className="text-xs font-medium uppercase tracking-widest">{t('design.bannerSettings')}</h3>
                                    </div>
                                        <button
                                            onClick={() => isGradient
                                                ? setBannerColor(bannerColor1, null)
                                                : setBannerColor(bannerColor1, bannerColor2 || '#1e3a5f')
                                            }
                                            className="flex items-center gap-2 group"
                                        >
                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#1a1a1a]/40 group-hover:text-[#1a1a1a] transition-colors">
                                                {t('design.blurColorGradient')}
                                            </span>
                                            <div className={`relative w-10 h-5 border-2 border-[#1a1a1a] transition-all shadow-[0_2px_0_0_#1a1a1a] rounded-md ${isGradient ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                                                <div className={`absolute top-[2px] w-3 h-3 border border-[#1a1a1a] transition-all rounded-sm ${isGradient ? 'right-[2px] bg-[#97cd7a]' : 'left-[2px] bg-[#1a1a1a]'}`} />
                                            </div>
                                        </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 overflow-hidden border-2 border-[#1a1a1a] shrink-0 shadow-[0_3px_0_0_#1a1a1a] transition-transform cursor-pointer rounded-md" style={{ backgroundColor: bannerColor1 }}>
                                        <input type="color" value={bannerColor1} onChange={(e) => setBannerColor(e.target.value, bannerColor2)} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 opacity-0" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[8px] font-medium text-[#1a1a1a] uppercase tracking-[0.2em] mb-1.5">
                                            {isGradient ? t('design.bannerColor1') : t('design.blurColor')}
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="text" value={bannerColor1} onChange={(e) => { const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`; setBannerColor(val, bannerColor2); }} placeholder="#1a1a1a" className="flex-1 h-9 px-3 border border-[#1a1a1a] bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] tracking-widest rounded-md" />
                                            <button onClick={() => setBannerColor('#1a1a1a', bannerColor2)} className="px-2 h-9 flex items-center justify-center text-[#1a1a1a] bg-white border border-[#1a1a1a] hover:bg-[#97cd7a] hover:text-red-400 transition-all shadow-[0_2px_0_0_#1a1a1a] text-[9px] font-bold uppercase rounded-md">{t('common.clear')}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Secondary Color — in empty column when gradient ON */}
                            {isGradient && (
                                <div className="bg-white p-4 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] animate-slide-up h-full order-4 rounded-md">
                                    <div className="flex items-center gap-2 mb-4 border-b border-[#1a1a1a]/10 pb-2 text-[#1a1a1a]">
                                        <div className="w-4 h-4 border-2 border-[#1a1a1a] bg-[#1a1a1a] shrink-0 rounded-md" />
                                        <h3 className="text-xs font-medium uppercase tracking-widest">{t('design.bannerColor2')}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 overflow-hidden border-2 border-[#1a1a1a] shrink-0 shadow-[0_3px_0_0_#1a1a1a] transition-transform cursor-pointer rounded-md" style={{ backgroundColor: bannerColor2 || '#1e3a5f' }}>
                                            <input type="color" value={bannerColor2 || '#1e3a5f'} onChange={(e) => setBannerColor(bannerColor1, e.target.value)} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 opacity-0" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-medium text-[#1a1a1a] uppercase tracking-[0.2em] mb-1.5">{t('design.bannerColor2')}</label>
                                            <input type="text" value={bannerColor2 || ''} onChange={(e) => { const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`; setBannerColor(bannerColor1, val); }} placeholder="#1e3a5f" className="w-full h-9 px-3 border border-[#1a1a1a] bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] tracking-widest rounded-md" />
                                        </div>
                                    </div>
                                    <div className="mt-4 w-full h-4 border border-[#1a1a1a]/20 rounded-sm" style={{ background: `linear-gradient(135deg, ${bannerColor1}, ${bannerColor2 || '#1e3a5f'})` }} />
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
                            <div className="bg-white p-4 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] animate-slide-up h-full order-3 rounded-md">
                                <div className="flex items-center justify-between mb-4 border-b border-[#1a1a1a]/10 pb-2">
                                    <div className="flex items-center gap-2 text-[#1a1a1a]">
                                        <Scaling size={16} strokeWidth={3} />
                                        <h3 className="text-xs font-medium uppercase tracking-widest">{t('design.layoutSettings')}</h3>
                                    </div>
                                    {/* Gradient Toggle Switch */}
                                        <button
                                            onClick={() => isGradient
                                                ? setColors(color1, null)
                                                : setColors(color1, color2 || '#1e3a5f')
                                            }
                                            className="flex items-center gap-2 group"
                                        >
                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#1a1a1a]/40 group-hover:text-[#1a1a1a] transition-colors">
                                                {t('design.blurColorGradient')}
                                            </span>
                                            <div className={`relative w-10 h-5 border-2 border-[#1a1a1a] transition-all shadow-[0_2px_0_0_#1a1a1a] rounded-md ${isGradient ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                                                <div className={`absolute top-[2px] w-3 h-3 border border-[#1a1a1a] transition-all rounded-sm ${isGradient ? 'right-[2px] bg-[#97cd7a]' : 'left-[2px] bg-[#1a1a1a]'}`} />
                                            </div>
                                        </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div
                                        className="relative w-12 h-12 overflow-hidden border-2 border-[#1a1a1a] shrink-0 shadow-[0_3px_0_0_#1a1a1a] transition-transform cursor-pointer rounded-md"
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
                                        <label className="block text-[8px] font-medium text-[#1a1a1a] uppercase tracking-[0.2em] mb-1.5">
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
                                                className="flex-1 h-9 px-3 border border-[#1a1a1a] bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] tracking-widest rounded-md"
                                            />
                                            <button
                                                onClick={() => setColors('#0f172a', color2)}
                                                className="px-2 h-9 flex items-center justify-center text-[#1a1a1a] bg-white border border-[#1a1a1a] hover:bg-[#97cd7a] hover:text-red-400 transition-all shadow-[0_2px_0_0_#1a1a1a] text-[9px] font-bold uppercase rounded-md"
                                            >
                                                {t('common.clear')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Secondary Color — appears in the empty column when gradient is ON */}
                            {/* Card 2: Secondary Color — appears in the empty column when gradient is ON */}
                            {isGradient && (
                                <div className="bg-white p-4 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] animate-slide-up h-full order-4 rounded-md">
                                    <div className="flex items-center gap-2 mb-4 border-b border-[#1a1a1a]/10 pb-2 text-[#1a1a1a]">
                                        <div className="w-4 h-4 border-2 border-[#1a1a1a] bg-[#1a1a1a] shrink-0 rounded-md" />
                                        <h3 className="text-xs font-medium uppercase tracking-widest">{t('design.bannerColor2')}</h3>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div
                                            className="relative w-12 h-12 overflow-hidden border-2 border-[#1a1a1a] shrink-0 shadow-[0_3px_0_0_#1a1a1a] transition-transform cursor-pointer rounded-md"
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
                                            <label className="block text-[8px] font-medium text-[#1a1a1a] uppercase tracking-[0.2em] mb-1.5">
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
                                                className="w-full h-9 px-3 border border-[#1a1a1a] bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] tracking-widest rounded-md"
                                            />
                                        </div>
                                    </div>

                                    {/* Gradient preview stripe */}
                                    <div
                                        className="mt-4 w-full h-4 border border-[#1a1a1a]/20 shadow-[0_2px_0_0_rgba(26,26,26,0.3)] rounded-sm"
                                        style={{ background: `linear-gradient(135deg, ${color1}, ${color2 || '#1e3a5f'})` }}
                                    />
                                </div>
                            )}
                        </>
                    );
                })()}




                {/* Title / Identity Section */}
                <div className={`bg-white p-6 border-2 border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] rounded-md ${['compact', 'banner'].includes(profile.headerLayout || 'classic') ? 'lg:col-span-2 order-last' : ''}`}>
                    <div className="flex items-center gap-2 mb-6 border-b border-[#1a1a1a]/10 pb-2 text-[#1a1a1a] relative">
                        <UserCircle size={18} strokeWidth={2.5} />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">{t('design.identity')}</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Username Section */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-[#1a1a1a] uppercase tracking-[0.2em] px-1">
                                {t('design.username')}
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#1a1a1a]/30">@</div>
                                <input
                                    type="text"
                                    value={tempUsername}
                                    onChange={(e) => handleTempUsernameChange(e.target.value)}
                                    placeholder={t('design.usernamePlaceholder')}
                                    className={`w-full h-12 pl-10 pr-12 border-2 border-[#1a1a1a] bg-white focus:bg-[#fcfcfc] outline-none transition-all text-sm font-medium tracking-wide text-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] focus:shadow-none focus:translate-y-[2px] rounded-md ${!isUsernameAvailable && tempUsername.length >= 3 ? 'border-red-400' : ''}`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isCheckingUsername && <Loader2 size={14} className="animate-spin text-[#1a1a1a]/20" />}
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
                                    <p className="text-[8px] font-bold text-[#1a1a1a]/30 uppercase tracking-widest">{t('design.minChars')}</p>
                                )}
                                {tempUsername !== profile.username && tempUsername.length >= 3 && !isCheckingUsername && (
                                    !isUsernameAvailable ? (
                                        <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">{t('design.usernameUnavailable')}</p>
                                    ) : (
                                        <p className="text-[8px] font-black text-[#97cd7a] uppercase tracking-widest">{t('design.usernameAvailable')}</p>
                                    )
                                )}

                                <p className="text-[8px] font-bold text-[#1a1a1a]/40 uppercase tracking-widest leading-relaxed mt-1 italic">
                                    {t('design.usernameWarning')}
                                </p>
                            </div>

                            {/* Username Change Confirmation Button */}
                            {tempUsername !== profile.username && isUsernameAvailable && !isCheckingUsername && tempUsername.length >= 3 && (
                                <motion.button
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleConfirmUsernameChange}
                                    className="w-full py-3 bg-[#97cd7a] border-2 border-[#1a1a1a] text-[#1a1a1a] font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_6px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 active:scale-95 rounded-md"
                                >
                                    <Check size={14} strokeWidth={4} />
                                    {t('design.confirmUsernameChange')}
                                </motion.button>
                            )}
                        </div>

                        {/* Display Name / Logo */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-black text-[#1a1a1a] uppercase tracking-[0.2em] px-1">{t('design.displayName')}</label>
                                <div className="flex bg-[#fdfcf0] p-1 border-2 border-[#1a1a1a] rounded-md gap-1">
                                    <button 
                                        onClick={() => {
                                            if (updateProfile) updateProfile({ headerStyle: 'text' });
                                            else onChange({ ...profile, headerStyle: 'text' });
                                        }} 
                                        className={`text-[8px] font-black uppercase px-2 py-1 rounded-sm transition-all ${profile.headerStyle !== 'logo' ? 'bg-[#1a1a1a] text-[#97cd7a] shadow-[0_2px_0_0_rgba(0,0,0,0.2)]' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'}`}
                                    >
                                        Texto
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const isFree = !profile.plan_type || profile.plan_type === 'free';
                                            if (isFree) {
                                                window.dispatchEvent(new CustomEvent('open-billing-modal'));
                                                return;
                                            }
                                            if (updateProfile) updateProfile({ headerStyle: 'logo' });
                                            else onChange({ ...profile, headerStyle: 'logo' });
                                        }} 
                                        className={`text-[8px] font-black uppercase px-2 py-1 rounded-sm transition-all flex items-center gap-1.5 ${profile.headerStyle === 'logo' ? 'bg-[#1a1a1a] text-[#97cd7a] shadow-[0_2px_0_0_rgba(0,0,0,0.2)]' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'}`}
                                    >
                                        {(!profile.plan_type || profile.plan_type === 'free') && <Lock size={10} strokeWidth={3} className="text-[#1a1a1a]/40" />}
                                        Imagem
                                    </button>
                                </div>
                            </div>
                            
                            {profile.headerStyle === 'logo' ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 p-2.5 bg-[#fdfcf0] border-2 border-[#1a1a1a] rounded-md shadow-[0_3px_0_0_#1a1a1a]">
                                        <AlertCircle size={14} strokeWidth={3} className="text-[#1a1a1a] shrink-0" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#1a1a1a]">
                                            Tamanho recomendado: 995x276 pixels
                                        </span>
                                    </div>
                                    <div className="w-full h-16 border-2 border-[#1a1a1a] bg-white shadow-[0_4px_0_0_#1a1a1a] flex items-center justify-center overflow-hidden rounded-md relative group">
                                        {profile.logoUrl ? (
                                            <div className="w-full h-full p-2 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZWVlIi8+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlZWUiLz4KPC9zdmc+')]">
                                                <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="text-[10px] uppercase font-black tracking-widest text-[#1a1a1a]/30">
                                                Sem Imagem
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => logoInputRef.current?.click()}
                                            className="flex-1 py-2 bg-[#97cd7a] border-2 border-[#1a1a1a] text-[#1a1a1a] cursor-pointer hover:bg-[#86b86c] transition-all font-medium text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none rounded-md"
                                        >
                                            <Upload size={14} strokeWidth={3} /> {profile.logoUrl ? t('common.change') : t('design.chooseImage')}
                                        </button>
                                        {profile.logoUrl && (
                                            <button
                                                onClick={() => {
                                                    if (updateProfile) updateProfile({ logoUrl: '' });
                                                    else onChange({ ...profile, logoUrl: '' });
                                                }}
                                                className="px-3 py-2 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] hover:text-white hover:bg-red-400 transition-all shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none rounded-md"
                                            >
                                                <Trash2 size={16} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[8px] font-bold text-[#1a1a1a]/40 uppercase tracking-widest leading-relaxed">
                                        Recomendado: PNG Transparente com formato horizontal.
                                    </p>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => {
                                        if (updateProfile) updateProfile({ name: e.target.value });
                                        else onChange({ ...profile, name: e.target.value });
                                    }}
                                    placeholder={t('design.displayNamePlaceholder')}
                                    className="w-full h-12 px-4 border-2 border-[#1a1a1a] bg-white focus:bg-[#fcfcfc] outline-none transition-all text-sm font-medium tracking-wide text-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] focus:shadow-none focus:translate-y-[2px] rounded-md"
                                />
                            )}
                        </div>

                        {/* Bio / Description */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-[#1a1a1a] uppercase tracking-[0.2em] px-1">{t('design.bio')}</label>
                            <textarea
                                value={profile.bio || ''}
                                onChange={(e) => {
                                    if (updateProfile) updateProfile({ bio: e.target.value });
                                    else onChange({ ...profile, bio: e.target.value });
                                }}
                                placeholder={t('design.bioPlaceholder')}
                                className="w-full h-28 p-4 border-2 border-[#1a1a1a] bg-white focus:bg-[#fcfcfc] outline-none transition-all text-sm font-medium tracking-wide text-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] focus:shadow-none focus:translate-y-[2px] resize-none rounded-md"
                            />
                        </div>

                        {/* Verification Status */}
                        <div className="pt-4 border-t-2 border-[#1a1a1a]/5 mt-2">
                             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-[#fdfcf0] border-2 border-[#1a1a1a] rounded-xl shadow-[0_4px_0_0_#1a1a1a]">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] shrink-0 transition-colors ${
                                        profile.isVerified ? 'bg-[#97cd7a]' :
                                        verifRequest?.status === 'pending' ? 'bg-[#ffdf00]' :
                                        verifRequest?.status === 'rejected' ? 'bg-red-50 text-red-400' :
                                        'bg-white text-black/20'
                                    }`}>
                                        {profile.isVerified ? (
                                            <img src="/icons/icons8-verificado-48.png" className="w-7 h-7 object-contain" alt="Verified" />
                                        ) : verifRequest?.status === 'pending' ? (
                                            <Clock size={22} strokeWidth={3} className="text-black" />
                                        ) : verifRequest?.status === 'rejected' ? (
                                            <XCircle size={22} strokeWidth={3} />
                                        ) : (
                                            <Check size={24} strokeWidth={4} />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-black">Status de Verificação</h4>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 mt-0.5">
                                            {profile.isVerified ? 'Perfil Verificado Oficial' :
                                             verifRequest?.status === 'pending' ? 'Pedido enviado (Em Aguardo)' :
                                             verifRequest?.status === 'rejected' ? 'Solicitação reprovada' :
                                             'Selo não solicitado'}
                                        </p>
                                    </div>
                                </div>
                                
                                {!profile.isVerified && (
                                    <button
                                        onClick={() => {
                                            const isFree = !profile.plan_type || profile.plan_type === 'free';
                                            if (isFree) {
                                                window.dispatchEvent(new CustomEvent('open-billing-modal'));
                                            } else {
                                                setIsVerifModalOpen(true);
                                            }
                                        }}
                                        className={`w-full sm:w-auto px-6 py-3 border-2 border-[#1a1a1a] text-black text-[10px] font-black uppercase tracking-widest shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none transition-all rounded-lg active:scale-95 flex items-center justify-center gap-2 ${
                                            verifRequest?.status === 'pending' ? 'bg-[#ffdf00]/50' : 'bg-[#ffdf00]'
                                        }`}
                                    >
                                        <Zap size={14} fill="currentColor" />
                                        {verifRequest?.status === 'pending' ? 'Pedido Enviado (Em Aguardo)' :
                                         verifRequest?.status === 'rejected' ? 'Solicitar Novamente' :
                                         'Solicitar Verificado'}
                                    </button>
                                )}
                            </div>
                            <p className="text-[8px] font-bold text-black/30 uppercase tracking-tighter mt-3 px-1 leading-relaxed">
                                * A verificação ajuda a dar credibilidade ao seu perfil. Disponível para assinantes Mensais ou Anuais.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar Type Selection Modal */}
            {isAvatarTypeModalOpen && createPortal(
                <div className="fixed inset-0 z-[999999] flex items-end justify-center sm:items-center">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAvatarTypeModalOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white border-t-4 sm:border-4 border-black p-8 sm:max-w-md w-full relative z-10 rounded-t-[40px] sm:rounded-3xl max-h-[90vh] overflow-y-auto"
                    >
                        <button 
                            onClick={() => setIsAvatarTypeModalOpen(false)}
                            className="absolute top-6 right-6 w-9 h-9 bg-white border-4 border-black flex items-center justify-center shadow-[0_3px_0_0_#000] hover:translate-y-[1px] hover:shadow-none transition-all rounded-lg active:scale-95 z-20"
                        >
                            <X size={20} strokeWidth={4} className="text-black" />
                        </button>

                        <div className="text-center mb-10 mt-4">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Escolha o Estilo</h3>
                            <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest mt-1">Como será sua nova foto de perfil?</p>
                        </div>

                        <div className="space-y-4 pb-4">
                            <button
                                onClick={() => {
                                    setUploadType('static');
                                    setTimeout(() => avatarInputRef.current?.click(), 100);
                                }}
                                className="w-full p-5 border-4 border-black bg-white hover:bg-slate-50 flex items-center gap-5 transition-all group shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none rounded-2xl"
                            >
                                <div className="w-14 h-14 bg-blue-100 border-2 border-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ImageIcon size={28} className="text-blue-600" />
                                </div>
                                <div className="text-left flex-1">
                                    <span className="block text-base font-black uppercase tracking-tighter">Imagem Estática</span>
                                    <span className="block text-[10px] font-bold text-black/40 uppercase">Formatos JPEG, PNG, WEBP</span>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    const isPro = profile.plan_type && profile.plan_type !== 'free';
                                    if (!isPro) {
                                        setIsAvatarTypeModalOpen(false);
                                        window.dispatchEvent(new CustomEvent('open-billing-modal'));
                                        return;
                                    }
                                    setUploadType('animated');
                                    setTimeout(() => avatarInputRef.current?.click(), 100);
                                }}
                                className="w-full p-5 border-4 border-black bg-white hover:bg-slate-50 flex items-center gap-5 transition-all group shadow-[0_3px_0_0_#000] active:translate-y-1 active:shadow-none relative overflow-hidden rounded-2xl"
                            >
                                {(!profile.plan_type || profile.plan_type === 'free') && (
                                    <div className="absolute top-3 right-3">
                                        <Zap size={16} fill="#ffdf00" className="text-[#ffdf00]" />
                                    </div>
                                )}
                                <div className="w-14 h-14 bg-yellow-50 border-2 border-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw size={28} className="text-[#ffdf00]" />
                                    </motion.div>
                                </div>
                                <div className="text-left flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="block text-base font-black uppercase tracking-tighter">Avatar Animado</span>
                                        <span className="px-1.5 py-0.5 bg-[#ffdf00] text-black text-[9px] font-black rounded-sm border border-black shadow-[2px_2px_0_0_#000]">PRO</span>
                                    </div>
                                    <span className="block text-[10px] font-bold text-black/40 uppercase tracking-tight">Use GIFs para dar vida ao perfil</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}

            {/* Verification Request Modal */}
            <VerificationRequestModal
                isOpen={isVerifModalOpen}
                onClose={() => {
                    setIsVerifModalOpen(false);
                    // Reload status after modal closes
                    apiClient.getMyVerificationRequest()
                        .then(data => setVerifRequest(data))
                        .catch(() => {});
                }}
                profile={profile}
            />

            {/* Banner Upload */}
            <input
                ref={bannerInputRef}
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
            />

            {/* Logo Upload */}
            <input
                ref={logoInputRef}
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
            />

        </div>
    );
};

export default HeaderEditor;
