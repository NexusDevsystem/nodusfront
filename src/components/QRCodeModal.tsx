import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, Share, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-white border-t-4 border-x-4 border-[#1a1a1a] p-6 sm:p-10 w-full md:max-w-xl rounded-t-[40px] z-10 max-h-[90vh] overflow-y-auto custom-scrollbar-brutal"
            >

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-md group"
                >
                    <X size={24} strokeWidth={4} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="mb-10 w-full text-center">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-black">{t('profile.shareTitle')}</h3>
                        <div className="h-1.5 w-16 bg-[#ffdf00] border-2 border-black mx-auto mt-2 rounded-full"></div>
                    </div>

                    <div className="bg-white p-6 border-4 border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] mb-10 rounded-3xl" ref={canvasRef}>
                        <QRCodeCanvas
                            value={fullUrl}
                            size={window.innerWidth < 768 ? 160 : 220}
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

                    {/* Links */}
                    <div className="w-full space-y-5 mb-10">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Link Curto</label>
                                {copied && <span className="text-[9px] font-black text-green-500 uppercase">Copiado!</span>}
                            </div>
                            <div
                                onClick={() => copyToClipboard(shortUrl)}
                                className="flex items-center justify-between gap-3 bg-slate-50 border-2 border-[#1a1a1a] p-4 shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer group rounded-2xl"
                            >
                                <span className="text-sm font-black truncate text-black">{shortUrl}</span>
                                <Copy size={16} strokeWidth={3} className="text-black/30 group-hover:text-black transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black/30 px-1">URL Completa</label>
                            <div
                                onClick={() => copyToClipboard(fullUrl)}
                                className="flex items-center justify-between gap-3 bg-white border-2 border-[#1a1a1a] p-4 shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer group rounded-2xl"
                            >
                                <span className="text-[11px] font-bold truncate text-black/50 group-hover:text-black transition-colors">{fullUrl}</span>
                                <Copy size={16} strokeWidth={3} className="text-black/30 group-hover:text-black transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-3 px-6 py-5 bg-white border-2 border-[#1a1a1a] text-black shadow-[0_6px_0_0_#1a1a1a] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-y-[2px] transition-all rounded-2xl"
                        >
                            <Download size={20} strokeWidth={3} /> {t('profile.saveQR')}
                        </button>

                        <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 px-6 py-5 bg-[#ffdf00] border-2 border-[#1a1a1a] text-black shadow-[0_6px_0_0_#1a1a1a] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-y-[2px] transition-all rounded-2xl text-center"
                        >
                            <ExternalLink size={20} strokeWidth={3} /> Perfil Público
                        </a>

                        {onGenerateShareImage && (
                            <button
                                onClick={onGenerateShareImage}
                                disabled={isGeneratingImage}
                                className="sm:col-span-2 flex items-center justify-center gap-3 px-6 py-5 bg-black text-[#ffdf00] border-2 border-[#1a1a1a] shadow-[0_6px_0_0_#1a1a1a] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
                            >
                                {isGeneratingImage ? (
                                    <Loader2 className="animate-spin w-5 h-5 text-[#ffdf00]" />
                                ) : (
                                    <Share size={20} strokeWidth={3} />
                                )}
                                {isGeneratingImage ? 'Gerando...' : 'Compartilhar nos Stories'}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
