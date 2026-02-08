import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LinkItem } from '../types';
import { SOCIAL_NETWORKS } from '../constants';
import {
    Mail, Globe, Plus, X, ChevronRight, Search, ChevronLeft, Link as LinkIcon
} from 'lucide-react';
import { integrationService } from '../services/integrationService';


interface SocialLinksEditorProps {
    links: LinkItem[];
    onChange: (links: LinkItem[] | ((prev: LinkItem[]) => LinkItem[])) => void;
}



const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ links, onChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState<typeof SOCIAL_NETWORKS[0] | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    const activeSocialLinks = links.filter(l => l.layout === 'social');

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setSelectedNetwork(null);
        setInputValue('');
        setSearchQuery('');
    };

    const handleNetworkSelect = (network: typeof SOCIAL_NETWORKS[0]) => {
        setSelectedNetwork(network);
        setInputValue('');
    };

    const handleAddLink = () => {
        if (!selectedNetwork || !inputValue.trim()) return;

        let finalUrl = inputValue.trim();

        // Auto-implement URL if it's just a username/number
        if (!finalUrl.startsWith('http') && !finalUrl.startsWith('mailto:')) {
            const cleanValue = inputValue.replace(/^@/, '');
            finalUrl = `${selectedNetwork.baseUrl}${cleanValue} `;
        }

        const newLink: LinkItem = {
            id: Date.now().toString(),
            title: selectedNetwork.name,
            url: finalUrl,
            isActive: true,
            clicks: 0,
            layout: 'social'
        };

        // @ts-ignore
        onChange((prev: LinkItem[]) => [...prev, newLink]);
        setIsModalOpen(false);
    };

    const handleRemoveLink = (id: string) => {
        // @ts-ignore
        onChange((prev: LinkItem[]) => prev.filter(l => l.id !== id));
    };

    const filteredNetworks = SOCIAL_NETWORKS.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Redes Sociais</h3>
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 px-4 py-2 rounded-full transition-colors text-xs font-bold"
                    >
                        <Plus size={14} strokeWidth={3} /> Adicionar
                    </button>
                </div>

                {/* List of Added Socials */}
                {activeSocialLinks.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                        Nenhuma rede social adicionada
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {activeSocialLinks.map(link => {
                            const network = SOCIAL_NETWORKS.find(n => link.title === n.name) || SOCIAL_NETWORKS[0];
                            const Icon = network.icon || Globe;

                            return (
                                <div key={link.id} className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600 hover:shadow-sm transition-all">
                                    <Icon size={24} />
                                    <button
                                        onClick={() => handleRemoveLink(link.id)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal - Modern List Style */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div
                        ref={popoverRef}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[600px] overflow-hidden animate-fade-in flex flex-col"
                    >

                        {/* Modal Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
                            <div className="w-8">
                                {selectedNetwork && (
                                    <button onClick={() => setSelectedNetwork(null)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                                        <ChevronLeft size={20} className="text-slate-600" />
                                    </button>
                                )}
                            </div>
                            <h3 className="font-bold text-base text-slate-800 flex-1 text-center">
                                {selectedNetwork ? `Adicionar ${selectedNetwork.name}` : 'Add social icon'}
                            </h3>
                            <div className="w-8 flex justify-end">
                                <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto w-full">
                            {!selectedNetwork ? (
                                <div className="p-2">
                                    {/* Search Bar */}
                                    <div className="relative mb-2 px-2">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 text-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-slate-200 font-medium placeholder:text-slate-500 text-sm"
                                            autoFocus
                                        />
                                    </div>

                                    {/* List */}
                                    <div className="space-y-0.5">
                                        {filteredNetworks.map(network => (
                                            <button
                                                key={network.id}
                                                onClick={() => handleNetworkSelect(network)}
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group text-left rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <network.icon size={20} className="text-black" />
                                                    <span className="font-semibold text-slate-800 text-sm">{network.name}</span>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                            </button>
                                        ))}
                                        {filteredNetworks.length === 0 && (
                                            <div className="text-center py-10 text-slate-400">
                                                Nenhuma app encontrada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // Input Step
                                <div className="p-6 pt-10 flex flex-col items-center">

                                    <div className="mb-8 p-4 bg-slate-50 rounded-full border border-slate-100">
                                        <selectedNetwork.icon size={48} className="text-slate-900 stroke-[1.5]" />
                                    </div>

                                    <div className="w-full max-w-sm space-y-6">
                                        {selectedNetwork.id === 'youtube' && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const url = await integrationService.getYouTubeAuthUrl();
                                                        window.location.href = url;
                                                    } catch (error) {
                                                        console.error('Failed to get auth url', error);
                                                        alert('Erro ao iniciar conexão. Verifique o console.');
                                                    }
                                                }}
                                                className="w-full py-3 rounded-full font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center justify-center gap-2 mb-4"
                                            >
                                                <selectedNetwork.icon size={18} />
                                                Conectar Conta Oficial
                                            </button>
                                        )}

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                                                {selectedNetwork.name} Username / URL
                                            </label>
                                            <div className="relative">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="w-full px-4 py-3 text-center rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-slate-300 font-medium"
                                                    placeholder={selectedNetwork.placeholder}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAddLink}
                                            disabled={!inputValue.trim()}
                                            className="w-full py-3.5 rounded-full font-bold text-white bg-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            Adicionar Link Manualmente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SocialLinksEditor;
