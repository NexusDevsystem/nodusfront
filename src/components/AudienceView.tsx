import React, { useEffect, useState } from 'react';
import { Users, Download, Trash2, Mail, Calendar, Search, UserCheck } from 'lucide-react';
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
        if (!confirm('Tem certeza que deseja remover este inscrito?')) return;

        try {
            await apiClient.deleteLead(id);
            setLeads(leads.filter(l => l.id !== id));
        } catch (error) {
            console.error('Failed to delete lead:', error);
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Data,Email,Perfil\n"
            + leads.map(l => `${new Date(l.date).toLocaleDateString()},${l.email},${l.profileName || 'Nodus'}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `nodus_audiencia_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = leads.filter(l => l.email.toLowerCase().includes(search.toLowerCase()));

    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-slate-100 border-t-[#32a800] rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Carregando audiência...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in w-full pb-20 max-w-4xl mx-auto">
            {/* Standard Header Card */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Users size={18} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Audiência (CRM)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {leads.length} {leads.length === 1 ? 'Inscrito' : 'Inscritos'}
                        </span>
                        <button
                            onClick={handleExport}
                            disabled={leads.length === 0}
                            className="flex items-center gap-2 px-3 py-1 border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <Download size={12} />
                            Exportar CSV
                        </button>
                    </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                    Gerencie os e-mails capturados através do formulário de newsletter no seu perfil.
                </p>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {/* Search Toolbar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/20">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="BUSCAR INSCRITO POR E-MAIL..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-100 bg-white focus:border-[#32a800] outline-none transition-all text-[10px] font-bold uppercase tracking-wider text-slate-600 placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {filteredLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-200">
                            <UserCheck size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum inscrito encontrado</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredLeads.map((lead) => (
                            <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#32a800] transition-colors shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-slate-800 truncate">{lead.email}</div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                                            <Calendar size={10} className="text-slate-300" />
                                            Inscrito em {new Date(lead.date).toLocaleDateString('pt-BR')} às {new Date(lead.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(lead.id)}
                                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                        title="Remover Inscrito"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Tip */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <Users size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    DICA: Use o link do seu perfil em redes sociais para aumentar sua base de inscritos. Você pode exportar a lista a qualquer momento para usar em ferramentas de e-mail marketing.
                </p>
            </div>
        </div>
    );
}
