import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crop, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCroppedImg } from '../../utils/imageUtils';

interface ImageCropperModalProps {
    isOpen: boolean;
    image: string;
    aspectRatio: number; // e.g., 1 for square, 1140/300 for banner
    title: string;
    onClose: () => void;
    onCropComplete: (croppedImage: Blob) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    image,
    aspectRatio,
    title,
    onClose,
    onCropComplete,
}) => {
    const { t } = useTranslation();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = (crop: { x: number, y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropAreaComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleConfirm = async () => {
        if (!croppedAreaPixels || !image) return;

        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b-4 border-black flex items-center justify-between bg-[#ffdf00]">
                            <div className="flex items-center gap-3">
                                <Crop size={24} strokeWidth={3} className="text-black" />
                                <h2 className="text-xl font-black uppercase tracking-widest text-black">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Cropper Container */}
                        <div className="relative h-[400px] bg-slate-100 border-b-4 border-black">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={onCropChange}
                                onZoomChange={onZoomChange}
                                onCropComplete={onCropAreaComplete}
                                cropShape={aspectRatio === 1 ? 'round' : 'rect'}
                                showGrid={true}
                            />
                        </div>

                        {/* Controls */}
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-6">
                                <ZoomOut size={20} className="text-black/30" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-3 bg-slate-200 rounded-none appearance-none cursor-pointer accent-black border-2 border-black"
                                />
                                <ZoomIn size={20} className="text-black/30" />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 border-2 border-black font-black uppercase tracking-widest text-black/40 hover:text-black hover:bg-slate-50 transition-all text-sm"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isProcessing}
                                    className="flex-1 py-4 bg-[#97cd7a] border-2 border-black font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:bg-black active:text-[#97cd7a] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={18} strokeWidth={3} />
                                            {t('common.confirm')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="px-6 pb-6 text-center">
                            <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">
                                {t('design.cropInstructions') || 'Arraste a imagem para posicionar e use o controle deslizante para ajustar o zoom.'}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ImageCropperModal;
