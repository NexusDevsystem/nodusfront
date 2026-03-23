import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File as FileIcon, Trash2, Copy, Check, X, Loader2, Image as ImageIcon, FileText, Download, ExternalLink } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { compressImage } from '../../utils/imageUtils';
import { UserProfile } from '../../types';

interface FileItem {
    filename: string;
    url: string;
    size: number;
    uploadedAt: string;
}

interface FileManagerProps {
    userProfile?: UserProfile;
}

const FileManager: React.FC<FileManagerProps> = ({ userProfile }) => {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch files
    const fetchFiles = async () => {
        try {
            const data = await apiClient.listFiles();
            if (data.success) {
                setFiles(data.files);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchFiles();
        }
    }, [token]);

    // Handle File Upload
    const handleFileUpload = async (file: File) => {
        const isFree = !userProfile?.planType || userProfile.planType === 'free';
        if (isFree && files.length >= 2) {
            window.dispatchEvent(new CustomEvent('open-billing-modal'));
            return;
        }

        setIsUploading(true);
        try {
            let fileToUpload = file;
            
            // Compress if image (except GIF)
            if (file.type.startsWith('image/') && !file.type.includes('gif')) {
                try {
                    const compressedBase64 = await compressImage(file, 1200, 0.7);
                    const response = await fetch(compressedBase64);
                    const blob = await response.blob();
                    fileToUpload = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
                } catch (err) {
                    console.warn('Compression failed, using original file', err);
                }
            }

            const data = await apiClient.uploadFile(fileToUpload);

            if (data.success) {
                fetchFiles(); // Refresh list
            } else {
                alert(data.message || t('files.uploadError'));
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error.message || t('files.uploadError'));
        } finally {
            setIsUploading(false);
        }
    };

    const [deletingFilename, setDeletingFilename] = useState<string | null>(null);

    // Handle Delete
    const handleDelete = async (filename: string, confirmed = false) => {
        if (!confirmed) {
            setDeletingFilename(filename);
            return;
        }

        try {
            const data = await apiClient.deleteFile(filename);

            if (data.success) {
                setFiles(prev => prev.filter(f => f.filename !== filename));
            } else {
                alert(data.message || t('files.deleteError'));
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setDeletingFilename(null);
        }
    };

    // Copy Link
    const copyLink = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Format Bytes
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // Get Icon by extension
    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <ImageIcon size={24} className="text-purple-500" />;
        if (['pdf'].includes(ext || '')) return <FileText size={24} className="text-red-500" />;
        return <FileIcon size={24} className="text-slate-400" />;
    };

    // Drag & Drop Handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full animate-fade-in pb-20">
            {/* Minimalist Brutalist Header Area is handled by EditorPage, so we start with content */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* 1. Upload Section */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="bg-white p-6 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 border-b border-[#1a1a1a] pb-2">
                            <Upload size={16} strokeWidth={3} className="text-black" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black">{t('files.uploadTitle')}</h3>
                        </div>

                        <div
                            className={`border-2 border-dashed p-6 text-center transition-all relative flex flex-col items-center gap-4 rounded-xl ${dragActive ? 'border-[#1a1a1a] bg-[#97cd7a]/20' : 'border-[#1a1a1a]/20 bg-slate-50 hover:bg-white hover:border-[#1a1a1a]/40'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className={`w-12 h-12 flex items-center justify-center border-2 border-[#1a1a1a] ${dragActive || isUploading ? 'bg-black text-[#97cd7a]' : 'bg-white text-black'} shadow-[0_3px_0_0_#1a1a1a] transition-colors rounded-lg`}>
                                {isUploading ? <Loader2 size={24} className="animate-spin" strokeWidth={3} /> : <Upload size={24} strokeWidth={3} />}
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-black leading-tight">
                                    {isUploading ? t('files.processing') : (dragActive ? t('files.dropReady') : t('files.dragOrClick'))}
                                </h3>
                                <p className="text-[8px] font-bold text-black/40 uppercase tracking-tighter">{t('files.allowedFormats')}</p>
                            </div>

                            {!isUploading && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#97cd7a] hover:text-black transition-all shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[1px] rounded-xl"
                                >
                                    {t('files.openFiles')}
                                </button>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                                accept="image/*,application/pdf"
                            />
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-[#ffdf00] p-4 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] rounded-2xl">
                        <div className="flex gap-3">
                            <FileText size={16} strokeWidth={3} className="shrink-0" />
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-widest mb-1">{t('files.proTip')}</h4>
                                <p className="text-[8px] font-bold uppercase leading-relaxed text-black/60">{t('files.proTipDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Files List Section */}
                <div className="xl:col-span-2">
                    <div className="bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] overflow-hidden flex flex-col min-h-[400px] rounded-2xl">
                        <div className="p-4 border-b-2 border-[#1a1a1a] flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <FileIcon size={16} strokeWidth={3} />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-black">{t('files.yourFiles')} <span className="opacity-30 ml-1">({files.length})</span></h3>
                            </div>
                            {isLoading && <Loader2 size={12} className="animate-spin text-black" strokeWidth={3} />}
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-hide">
                            {isLoading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="animate-spin text-black/20" size={32} strokeWidth={3} />
                                </div>
                            ) : files.length === 0 ? (
                                <div className="p-20 text-center space-y-4">
                                    <div className="w-16 h-16 border-2 border-[#1a1a1a]/10 mx-auto flex items-center justify-center rotate-3">
                                        <FileIcon size={32} className="text-black/10" strokeWidth={3} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">{t('files.emptyFiles')}</p>
                                </div>
                            ) : (
                                <div className="divide-y-2 divide-black">
                                    <AnimatePresence mode="popLayout">
                                        {files.map((file) => (
                                            <motion.div
                                                key={file.filename}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-slate-50 transition-colors group relative"
                                            >
                                                {/* File Icon / Preview Container */}
                                                <div className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-[#1a1a1a] bg-white flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#1a1a1a] group-hover:bg-[#97cd7a] transition-colors overflow-hidden rounded-lg">
                                                    {file.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                        <img src={file.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                                    ) : getFileIcon(file.filename)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-black truncate">{file.filename}</h4>
                                                    <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                                                        <span className="text-[7px] sm:text-[8px] font-black text-black/40 uppercase tracking-widest bg-black/5 px-1 py-0.5">{formatBytes(file.size)}</span>
                                                        <span className="text-[7px] sm:text-[8px] font-bold text-black/30 uppercase leading-none">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {deletingFilename === file.filename ? (
                                                        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-300">
                                                                <button
                                                                    onClick={() => handleDelete(file.filename, true)}
                                                                    className="w-8 h-8 flex items-center justify-center bg-red-600 text-white border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[1px] rounded-lg"
                                                                >
                                                                    <Check size={14} strokeWidth={4} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeletingFilename(null)}
                                                                    className="w-8 h-8 flex items-center justify-center bg-white text-black border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[1px] rounded-lg"
                                                                >
                                                                    <X size={14} strokeWidth={4} />
                                                                </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                                <button
                                                                    onClick={() => copyLink(file.url, file.filename)}
                                                                    className={`w-8 h-8 flex items-center justify-center border-2 border-[#1a1a1a] transition-all ${copiedId === file.filename
                                                                        ? 'bg-[#97cd7a] shadow-none translate-y-[1px]'
                                                                        : 'bg-white hover:bg-[#ffdf00] hover:text-white shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[1px] rounded-lg'
                                                                        }`}
                                                                >
                                                                    {copiedId === file.filename ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={3} />}
                                                                </button>

                                                                <a
                                                                    href={file.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-8 h-8 flex items-center justify-center border-2 border-[#1a1a1a] bg-white hover:bg-[#ffdf00] transition-all shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[1px] rounded-lg"
                                                                >
                                                                    <ExternalLink size={14} strokeWidth={3} />
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDelete(file.filename)}
                                                                    className="w-8 h-8 flex items-center justify-center border-2 border-[#1a1a1a] bg-white hover:bg-red-400 transition-all shadow-[0_3px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[1px] rounded-lg"
                                                                >
                                                                    <Trash2 size={14} strokeWidth={3} />
                                                                </button>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-3 bg-black text-white flex justify-between items-center px-4">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60">{t('files.storageTitle')}</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                                        const isFree = !userProfile?.planType || userProfile.planType === 'free';
                                        const limit = isFree ? 2 : 8;
                                        const isFilled = i <= files.length;
                                        const isAvailable = i <= limit;

                                        if (!isAvailable && isFree) return null;

                                        return (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-3 border border-white/20 ${isFilled ? 'bg-[#97cd7a]' : 'bg-white/10'}`}
                                            />
                                        );
                                    })}
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileManager;
