import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, Share, Loader2 } from 'lucide-react';

interface QRCodeModalProps {
    url: string;
    profileName: string;
    onClose: () => void;
    onGenerateShareImage?: () => void;
    isGeneratingImage?: boolean;
}

export default function QRCodeModal({ url, profileName, onClose, onGenerateShareImage, isGeneratingImage }: QRCodeModalProps) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const handleDownload = () => {
        const canvas = canvasRef.current?.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `nodus-qr-${profileName}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const shortUrl = url.replace(/^https?:\/\/(www\.)?/, '');
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 md:bg-black/60 md:backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white border-4 border-[#1a1a1a] shadow-[0_12px_0_0_#1a1a1a] p-6 sm:p-8 w-full max-w-[400px] relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black hover:bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a] hover:text-[#ffdf00] transition-all p-1 border-2 border-transparent hover:border-[#1a1a1a]"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="mb-6 w-full">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">{t('profile.shareTitle')}</h3>
                        <div className="h-1 w-12 bg-black mt-1"></div>
                    </div>

                    <div className="bg-white p-6 border-4 border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] mb-8" ref={canvasRef}>
                        <QRCodeCanvas
                            value={fullUrl}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                            imageSettings={{
                                src: "/favicon.png",
                                x: undefined,
                                y: undefined,
                                height: 50,
                                width: 50,
                                excavate: true,
                            }}
                        />
                    </div>

                    {/* Link Visualization */}
                    <div className="w-full space-y-4 mb-8">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-1">Link Encurtado</label>
                            <div
                                onClick={() => copyToClipboard(shortUrl)}
                                className="flex items-center justify-between gap-3 bg-white border-2 border-[#1a1a1a] p-3 shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer group"
                            >
                                <span className="text-xs font-bold truncate text-black">{shortUrl}</span>
                                <Copy size={14} strokeWidth={3} className="text-black/20 group-hover:text-black transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40 px-1">Link Completo</label>
                            <div
                                onClick={() => copyToClipboard(fullUrl)}
                                className="flex items-center justify-between gap-3 bg-white border-2 border-[#1a1a1a] p-3 shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer group"
                            >
                                <span className="text-[10px] font-bold truncate text-black/60 group-hover:text-black transition-colors">{fullUrl}</span>
                                <Copy size={14} strokeWidth={3} className="text-black/20 group-hover:text-black transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-3">
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a] font-black uppercase tracking-widest text-[10px] hover:shadow-none hover:translate-y-[2px] transition-all"
                        >
                            <Download size={16} strokeWidth={3} /> {t('profile.saveQR')}
                        </button>

                        {onGenerateShareImage && (
                            <button
                                onClick={onGenerateShareImage}
                                disabled={isGeneratingImage}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ffdf00] border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a] font-black uppercase tracking-widest text-[10px] hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingImage ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    <Share size={16} strokeWidth={3} />
                                )}
                                {isGeneratingImage ? 'Gerando...' : 'Gerar Cartão Social'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
