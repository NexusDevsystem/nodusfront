import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
    url: string;
    profileName: string;
    onClose: () => void;
}

export default function QRCodeModal({ url, profileName, onClose }: QRCodeModalProps) {
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

    const handleCopyLink = () => {
        const shortUrl = url.replace(/^https?:\/\/(www\.)?/, '');
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 w-full max-w-[400px] relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black hover:bg-black hover:text-[#ffdf00] transition-all p-1 border-2 border-transparent hover:border-black"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="mb-6 w-full">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">{t('profile.shareTitle')}</h3>
                        <div className="h-1 w-12 bg-black mt-1"></div>
                    </div>

                    <div className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8" ref={canvasRef}>
                        <QRCodeCanvas
                            value={url.startsWith('http') ? url : `https://${url}`}
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

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                            onClick={handleCopyLink}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-black font-black uppercase tracking-widest text-[10px] transition-all ${copied ? 'bg-[#97cd7a]' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'}`}
                        >
                            {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                            {copied ? t('common.copied') : t('profile.copyLink')}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white border-2 border-black font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                            <Download size={16} strokeWidth={3} /> {t('profile.saveQR')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
