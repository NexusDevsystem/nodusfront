import React, { useEffect, useState } from 'react';
import { Users, Download, Trash2, Mail, Calendar, Search } from 'lucide-react';
import { NewsletterLead } from '../types';
import { apiClient } from '../services/apiClient';

export default function AudienceView() {
    const [leads, setLeads] = useState<NewsletterLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadLeads = async () => {
            try {
                setIsLoading(true);
                const data = await apiClient.getMyLeads();
                setLeads(data);
            } catch (error) {
                console.error('Failed to load leads:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadLeads();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este lead?')) return;

        try {
            await apiClient.deleteLead(id);
            setLeads(leads.filter(l => l.id !== id));
        } catch (error) {
            console.error('Failed to delete lead:', error);
            alert('Erro ao excluir lead. Tente novamente.');
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Email,Profile\n"
            + leads.map(l => `${new Date(l.date).toLocaleDateString()},${l.email},${l.profileName || 'Nodus'}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `nodus_leads_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = leads.filter(l => l.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* Header */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Users className="text-brand-600" size={24} />
                        Audiência
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {leads.length} inscritos na sua newsletter
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={leads.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Download size={16} />
                    Exportar CSV
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar e-mail..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border-none text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>

                {filteredLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} className="opacity-50" />
                        </div>
                        <p className="font-medium">Nenhum lead encontrado.</p>
                        {leads.length === 0 && <p className="text-sm opacity-70 mt-1">Divulgue seu perfil para conseguir inscritos!</p>}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filteredLeads.map((lead) => (
                            <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-800">{lead.email}</div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Calendar size={10} />
                                            {new Date(lead.date).toLocaleDateString()} às {new Date(lead.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(lead.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remover"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
