import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy } from 'lucide-react';

interface QRCodeModalProps {
    url: string;
    profileName: string;
    onClose: () => void;
}

export default function QRCodeModal({ url, profileName, onClose }: QRCodeModalProps) {
    const canvasRef = useRef<HTMLDivElement>(null);

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
        alert('Link copiado!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm relative shadow-2xl m-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center pt-8">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6" ref={canvasRef}>
                        <QRCodeCanvas
                            value={url.startsWith('http') ? url : `https://${url}`}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                            imageSettings={{
                                src: "/icons/logo_icone.png",
                                x: undefined,
                                y: undefined,
                                height: 50,
                                width: 50,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                        >
                            <Copy size={18} /> Copiar Link
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm"
                        >
                            <Download size={18} /> Salvar QR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
