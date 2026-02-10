import React from 'react';
import { UserProfile } from '../../types';
import { ImageIcon, Trash2, Upload, Video, Zap } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

interface WallpaperEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const WallpaperEditor: React.FC<WallpaperEditorProps> = ({ profile, onChange }) => {

    const handleCustomBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                // Compress image before saving
                const compressed = await compressImage(e.target.files[0], 1080, 0.7);
                onChange({ ...profile, customBackground: compressed, customSolidColor: null });
            } catch (error) {
                console.error(error);
                alert('Erro ao processar imagem.');
            }
        }
    };

    const isPro = profile.planType === 'monthly' || profile.planType === 'annual';
    const isFree = !profile.planType || profile.planType === 'free';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Custom Image Upload */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Imagem de Fundo</h3>
                        <p className="text-xs text-slate-400">Carregue sua própria imagem</p>
                    </div>
                </div>

                {isFree && (
                    <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3">
                        <div className="p-1 bg-amber-100 rounded-md text-amber-600 shrink-0">
                            <Zap size={14} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-800">Recurso PRO</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">Faça upgrade para usar fundos personalizados.</p>
                        </div>
                    </div>
                )}

                <div className="w-full">
                    {profile.customBackground ? (
                        <div className="relative group rounded-xl overflow-hidden border-2 border-brand-100 aspect-[16/9] shadow-sm">
                            <img src={profile.customBackground} alt="Custom Background" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                <label htmlFor="bg-upload-refresh" className="p-2 bg-white text-slate-900 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors font-medium text-xs flex items-center gap-2">
                                    <Upload size={14} /> Trocar
                                </label>
                                <button
                                    onClick={() => onChange({ ...profile, customBackground: null })}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label
                            htmlFor={isFree ? '' : "bg-upload"}
                            className={`w-full aspect-[16/9] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors ${isFree ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:border-brand-300 hover:bg-brand-50/30'}`}
                        >
                            <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                                <Upload size={24} />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-semibold text-slate-600">Carregar Imagem</span>
                                <span className="text-[10px] text-slate-400">JPG ou PNG, max 5MB</span>
                            </div>
                        </label>
                    )}
                    <input
                        type="file"
                        id="bg-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCustomBackground}
                        disabled={isFree}
                    />
                    <input
                        type="file"
                        id="bg-upload-refresh"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCustomBackground}
                        disabled={isFree}
                    />
                </div>
            </div>

            {/* Solid Color */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-md"></div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Cor Sólida / Flat</h3>
                        <p className="text-xs text-slate-400">Substitui imagem e tema</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
                            <input
                                type="color"
                                value={profile.customSolidColor || '#ffffff'}
                                onChange={(e) => onChange({ ...profile, customSolidColor: e.target.value, customBackground: null })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={profile.customSolidColor || ''}
                                onChange={(e) => onChange({ ...profile, customSolidColor: e.target.value, customBackground: null })}
                                placeholder="#ffffff"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-brand-500 outline-none uppercase"
                            />
                        </div>
                        {(profile.customSolidColor) && (
                            <button
                                onClick={() => onChange({ ...profile, customSolidColor: null })}
                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                title="Remover cor sólida"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3">
                        Nota: Definir uma cor sólida irá remover a imagem de fundo atual.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WallpaperEditor;
