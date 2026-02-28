import { useTranslation } from 'react-i18next';
import { UserProfile } from '../../types';
import { ImageIcon, Trash2, Upload, Video, Zap } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

interface WallpaperEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    updateProfile?: (updates: Partial<UserProfile>) => void;
}

const WallpaperEditor: React.FC<WallpaperEditorProps> = ({ profile, onChange, updateProfile }) => {
    const { t } = useTranslation();
    const handleCustomBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                // Compress image before saving
                const compressed = await compressImage(e.target.files[0], 1080, 0.7);
                if (updateProfile) {
                    updateProfile({ themeId: 'custom', customBackground: compressed, customSolidColor: null });
                } else {
                    onChange({ ...profile, themeId: 'custom', customBackground: compressed, customSolidColor: null });
                }
            } catch (error) {
                console.error(error);
                alert(t('design.errorProcessingImage'));
            }
        }
    };

    return (
        <div className="space-y-4 animate-fade-in pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start mt-4">
                {/* Custom Image Upload */}
                <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-full">
                    <div className="flex items-center gap-2 mb-4 text-black border-b border-black pb-2">
                        <ImageIcon size={16} strokeWidth={3} />
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.backgroundImage')}</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="relative group overflow-hidden border border-black w-full h-24 bg-[#f8f8f8] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {profile.customBackground ? (
                                <>
                                    <img src={profile.customBackground} alt="Custom Background" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <button
                                            onClick={() => {
                                                if (updateProfile) updateProfile({ themeId: 'custom', customBackground: null });
                                                else onChange({ ...profile, themeId: 'custom', customBackground: null });
                                            }}
                                            className="p-2 bg-white border border-black text-black hover:bg-red-400 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
                                        >
                                            <Trash2 size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-20">
                                    <ImageIcon size={20} strokeWidth={3} />
                                    <span className="text-[8px] font-medium uppercase tracking-widest">{t('design.noImage')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="bg-upload" className="w-full py-2 bg-[#97cd7a] border-2 border-black text-black cursor-pointer hover:bg-black hover:text-[#97cd7a] transition-all font-medium text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none">
                                <Upload size={14} strokeWidth={3} /> {profile.customBackground ? t('design.changeImage') : t('design.uploadImage')}
                            </label>
                            <p className="text-[8px] font-normal text-black/50 uppercase tracking-widest text-center px-2">
                                {t('design.imageTypes')}
                            </p>
                        </div>
                    </div>

                    <input
                        type="file"
                        id="bg-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCustomBackground}
                    />
                </div>

                {/* Solid Color */}
                <div className="bg-white p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-full">
                    <div className="flex items-center gap-2 mb-4 border-b border-black pb-2 text-black">
                        <div className="w-4 h-4 border border-black bg-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"></div>
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.solidColorTitle')}</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 overflow-hidden border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white ring-1 ring-black/5 hover:scale-105 transition-transform cursor-pointer">
                                <input
                                    type="color"
                                    value={profile.customSolidColor || '#ffffff'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (updateProfile) updateProfile({ themeId: 'custom', customSolidColor: val, customBackground: null });
                                        else onChange({ ...profile, themeId: 'custom', customSolidColor: val, customBackground: null });
                                    }}
                                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[8px] font-medium text-black uppercase tracking-[0.2em] mb-1.5 px-0.5">{t('design.hexCode')}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={profile.customSolidColor || ''}
                                        onChange={(e) => {
                                            const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                            if (updateProfile) updateProfile({ themeId: 'custom', customSolidColor: val, customBackground: null });
                                            else onChange({ ...profile, themeId: 'custom', customSolidColor: val, customBackground: null });
                                        }}
                                        placeholder="#FFFFFF"
                                        className="w-full h-8 px-3 border border-black bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[10px] font-medium uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] tracking-widest placeholder:text-black/20"
                                    />
                                    {profile.customSolidColor && (
                                        <button
                                            onClick={() => {
                                                if (updateProfile) updateProfile({ themeId: 'custom', customSolidColor: null });
                                                else onChange({ ...profile, themeId: 'custom', customSolidColor: null });
                                            }}
                                            className="px-2 h-8 flex items-center justify-center text-black bg-white border border-black hover:bg-black hover:text-red-400 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            <Trash2 size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-2.5 bg-[#f8f8f8] border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-[8px] font-normal text-black/60 uppercase tracking-[0.15em] leading-tight">
                                <Zap size={10} className="inline-block mr-1 text-black" fill="currentColor" />
                                {t('design.colorRemovesBackground')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WallpaperEditor;
