import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File as FileIcon, Trash2, Copy, Check, X, Loader2, Image as ImageIcon, FileText, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface FileItem {
    filename: string;
    url: string;
    size: number;
    uploadedAt: string;
}

const FileManager: React.FC = () => {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
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
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                fetchFiles(); // Refresh list
            } else {
                alert(data.message || 'Erro ao enviar arquivo');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro ao enviar arquivo');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle Delete
    const handleDelete = async (filename: string) => {
        if (!confirm('Tem certeza que deseja excluir este arquivo? O link deixará de funcionar.')) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${filename}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setFiles(prev => prev.filter(f => f.filename !== filename));
            } else {
                alert(data.message || 'Erro ao excluir');
            }
        } catch (error) {
            console.error('Delete error:', error);
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
        <div className="max-w-4xl mx-auto p-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Gerenciador de Arquivos</h1>
                <p className="text-slate-500">Hospede arquivos (PDFs, Imagens, Cardápios) e gere links diretos para usar no seu perfil.</p>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all mb-10 ${dragActive ? 'border-[#32a800] bg-green-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${dragActive ? 'bg-[#32a800] text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {isUploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700">
                            {isUploading ? 'Enviando arquivo...' : (dragActive ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para enviar')}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">PDF, PNG, JPG até 10MB</p>
                    </div>
                    {!isUploading && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors"
                        >
                            Selecionar Arquivo
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

            {/* Files List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Seus Arquivos ({files.length})</h3>
                </div>

                {isLoading ? (
                    <div className="p-10 flex justify-center">
                        <Loader2 className="animate-spin text-slate-400" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                        <FileIcon size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Nenhum arquivo enviado ainda.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        <AnimatePresence>
                            {files.map((file) => (
                                <motion.div
                                    key={file.filename}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                        {getFileIcon(file.filename)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-slate-800 truncate mb-0.5">{file.filename}</h4>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span>{formatBytes(file.size)}</span>
                                            <span>•</span>
                                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyLink(file.url, file.filename)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${copiedId === file.filename
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {copiedId === file.filename ? <Check size={14} /> : <Copy size={14} />}
                                            {copiedId === file.filename ? 'Copiado!' : 'Copiar Link'}
                                        </button>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                            title="Abrir"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(file.filename)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileManager;
