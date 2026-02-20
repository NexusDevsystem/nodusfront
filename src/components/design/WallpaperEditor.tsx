import React from 'react';
import { UserProfile } from '../../types';
import { ImageIcon, Trash2, Upload, Video, Zap } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

interface WallpaperEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    updateProfile?: (updates: Partial<UserProfile>) => void;
}

const WallpaperEditor: React.FC<WallpaperEditorProps> = ({ profile, onChange, updateProfile }) => {
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
                alert('Erro ao processar imagem.');
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Custom Image Upload */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <ImageIcon size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Imagem de Fundo</h3>
                </div>

                <div className="w-full">
                    {profile.customBackground ? (
                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-[16/9]">
                            <img src={profile.customBackground} alt="Custom Background" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <label htmlFor="bg-upload-refresh" className="p-2 bg-white text-slate-900 rounded-md cursor-pointer hover:bg-slate-100 transition-colors font-semibold text-xs flex items-center gap-2">
                                    <Upload size={14} /> Trocar
                                </label>
                                <button
                                    onClick={() => {
                                        if (updateProfile) updateProfile({ themeId: 'custom', customBackground: null });
                                        else onChange({ ...profile, themeId: 'custom', customBackground: null });
                                    }}
                                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label
                            htmlFor="bg-upload"
                            className={`w-full aspect-[16/9] border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer hover:border-[#32a800] hover:bg-slate-50/50`}
                        >
                            <Upload size={20} className="text-slate-400" />
                            <div className="text-center">
                                <span className="block text-xs font-semibold text-slate-600">Carregar Imagem</span>
                                <span className="text-[10px] text-slate-400">JPG, PNG ou GIF, max 5MB</span>
                            </div>
                        </label>
                    )}
                    <input
                        type="file"
                        id="bg-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCustomBackground}
                    />
                    <input
                        type="file"
                        id="bg-upload-refresh"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCustomBackground}
                    />
                </div>
            </div>

            {/* Solid Color */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-blue-400 to-purple-500"></div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Cor Sólida / Flat</h3>
                </div>

                <div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-md overflow-hidden border border-slate-200 shrink-0">
                            <input
                                type="color"
                                value={profile.customSolidColor || '#ffffff'}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (updateProfile) updateProfile({ themeId: 'custom', customSolidColor: val, customBackground: null });
                                    else onChange({ ...profile, themeId: 'custom', customSolidColor: val, customBackground: null });
                                }}
                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                            />
                        </div>
                        <input
                            type="text"
                            value={profile.customSolidColor || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (updateProfile) updateProfile({ themeId: 'custom', customSolidColor: val, customBackground: null });
                                else onChange({ ...profile, themeId: 'custom', customSolidColor: val, customBackground: null });
                            }}
                            placeholder="#FFFFFF"
                            className="flex-1 h-11 px-4 rounded-md border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-mono uppercase"
                        />
                        {(profile.customSolidColor) && (
                            <button
                                onClick={() => {
                                    if (updateProfile) updateProfile({ themeId: 'custom', customSolidColor: null });
                                    else onChange({ ...profile, themeId: 'custom', customSolidColor: null });
                                }}
                                className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-md border border-slate-200 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 italic">
                        * Definir uma cor sólida irá remover a imagem de fundo atual.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WallpaperEditor;
