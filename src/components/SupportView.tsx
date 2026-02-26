import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Lock
} from 'lucide-react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const FAQS: FAQItem[] = [
    {
        id: '1',
        category: 'financeiro',
        question: 'Como faço o upgrade para o plano Pro?',
        answer: 'Você pode fazer o upgrade acessando a aba "Faturamento" na barra lateral e clicando em "Fazer Upgrade". Aceitamos cartões de crédito via Stripe.'
    },
    {
        id: '2',
        category: 'financeiro',
        question: 'Posso cancelar minha assinatura a qualquer momento?',
        answer: 'Sim, você pode cancelar sua assinatura a qualquer momento através do painel de cobrança. O acesso Pro continuará ativo até o fim do período pago.'
    },
    {
        id: '3',
        category: 'personalizacao',
        question: 'Como altero o tema do meu perfil?',
        answer: 'Vá até a aba "Design" no menu lateral ou superior. Lá você encontrará opções para alterar temas, cores, fontes e estilo dos botões.'
    },
    {
        id: '4',
        category: 'conta',
        question: 'Como altero minha senha?',
        answer: 'Atualmente, a alteração de senha é feita através do link "Esqueci minha senha" na tela de login. Estamos implementando uma área de configurações de conta mais completa.'
    },
    {
        id: '5',
        category: 'links',
        question: 'Posso colocar links de redes sociais?',
        answer: 'Sim! Na aba "Links", use a opção "Adicionar Ícones Sociais" para incluir links para Instagram, TikTok, WhatsApp e muito mais.'
    },
    {
        id: '6',
        category: 'conta',
        question: 'Como solicitar a verificação do perfil?',
        answer: 'O selo de verificação é destinado a figuras públicas, marcas e criadores de conteúdo relevantes. Para solicitar uma análise, entre em contato com nosso suporte via WhatsApp ou E-mail enviando links de suas outras redes sociais.'
    }
];

// Simplified categories - Text only
const CATEGORIES = [
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'personalizacao', label: 'Design' },
    { id: 'conta', label: 'Conta' },
    { id: 'feedback', label: 'Feedback & Bugs' },
    { id: 'outros', label: 'Geral' }
];

interface SupportViewProps {
    userProfile?: UserProfile;
}

const SupportView: React.FC<SupportViewProps> = ({ userProfile }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const filteredFaqs = FAQS.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory ? faq.category === activeCategory : true;

        return matchesSearch && matchesCategory;
    });

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackText.trim()) return;

        // Simulating submission
        setIsSubmitted(true);
        setFeedbackText('');
        setTimeout(() => setIsSubmitted(false), 5000);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 px-6 animate-fade-in">
            {/* Header - Brutalist */}
            <div className="border-b-2 border-black pb-6 mb-8 pt-8">
                <h1 className="text-xl font-black text-black uppercase tracking-widest">Central de Ajuda</h1>
                <p className="text-[10px] text-black font-black uppercase tracking-widest mt-1 opacity-60">Documentação e suporte para usuários.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-12">

                {/* Left Column - Navigation / Categories */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={14} strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="BUSCAR TÓPICO..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase tracking-widest focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all placeholder:text-black/20"
                        />
                    </div>

                    {/* Categories List */}
                    <div>
                        <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 px-1">Tópicos</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`w-full text-left px-4 py-2.5 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all ${!activeCategory ? 'bg-black text-[#97cd7a] shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#97cd7a]'}`}
                            >
                                TODOS
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-4 py-2.5 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-black text-[#97cd7a] shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#97cd7a]'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact Links - Brutalist */}
                    <div className="pt-6 border-t border-black border-dashed">
                        <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 px-1">Contato Direto</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-[8px] font-black text-black/40 uppercase tracking-widest mb-1">E-mail</p>
                                <a href="mailto:nexusdevsystem@gmail.com" className="text-[9px] font-black text-black hover:text-[#32a800] uppercase tracking-widest flex items-center gap-1 group truncate">
                                    nexusdevsystem@gmail.com
                                    <ExternalLink size={10} className="shrink-0" strokeWidth={3} />
                                </a>
                            </div>

                            <div
                                className={`p-3 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${!userProfile?.planType || userProfile.planType === 'free' ? 'bg-slate-50 opacity-100 cursor-pointer group' : 'bg-white'}`}
                                onClick={() => {
                                    if (!userProfile?.planType || userProfile.planType === 'free') {
                                        window.dispatchEvent(new CustomEvent('open-billing-modal'));
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[8px] font-black text-black/40 uppercase tracking-widest">WhatsApp</p>
                                    {(!userProfile?.planType || userProfile.planType === 'free') && (
                                        <div className="flex items-center gap-1 bg-black px-1.5 py-0.5 -mt-1 -mr-1">
                                            <Lock size={8} className="text-[#97cd7a]" strokeWidth={3} />
                                            <span className="text-[7px] font-black text-[#97cd7a] uppercase tracking-tighter">PREMIUM</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${!userProfile?.planType || userProfile.planType === 'free' ? 'text-black/30' : 'text-black hover:text-[#32a800] cursor-pointer'}`}>
                                    {!userProfile?.planType || userProfile.planType === 'free' ? (
                                        <>SUPORTE PRIORITÁRIO</>
                                    ) : (
                                        <a href="https://wa.me/559180519442" target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                            (91) 8051-9442
                                            <ExternalLink size={10} className="shrink-0" strokeWidth={3} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Content */}
                <div className="flex-1 min-w-0">
                    {activeCategory === 'feedback' ? (
                        <div className="animate-fade-in">
                            <div className="mb-6">
                                <h2 className="text-lg font-black text-black uppercase tracking-widest">Feedback & Relatos</h2>
                                <p className="text-[10px] text-black font-bold uppercase tracking-widest mt-2 opacity-60 leading-relaxed">
                                    SUA OPINIÃO É FUNDAMENTAL. CASO TENHA ENCONTRADO UM ERRO OU QUEIRA SUGERIR ALGO, USE O CAMPO ABAIXO.
                                </p>
                            </div>

                            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {isSubmitted ? (
                                    <div className="text-center py-8">
                                        <div className="text-black font-black uppercase tracking-widest mb-2">RELATO ENVIADO!</div>
                                        <p className="text-[10px] text-black font-bold uppercase tracking-widest opacity-60">ANALISAREMOS SEU RELATO EM BREVE.</p>
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="mt-6 text-[10px] font-black text-black underline underline-offset-4 uppercase tracking-widest hover:text-[#32a800]"
                                        >
                                            ENVIAR OUTRO RELATO
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3 px-1">Sua Mensagem</label>
                                            <textarea
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                rows={6}
                                                className="w-full px-4 py-4 bg-white border border-black text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:bg-slate-50 transition-colors resize-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/10"
                                                placeholder="DESCREVA O PROBLEMA OU SUGESTÃO COM DETALHES..."
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-8 py-3 bg-black text-[#97cd7a] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase tracking-widest hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                            >
                                                ENVIAR RELATO
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="mb-6">
                                <h2 className="text-lg font-black text-black uppercase tracking-widest px-1">
                                    {searchQuery ? `RESULTADOS: "${searchQuery}"` : (
                                        activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'FAQ / PERGUNTAS'
                                    )}
                                </h2>
                            </div>

                            <div className="border-t-2 border-black">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map(faq => (
                                        <div key={faq.id} className="border-b border-black">
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className="w-full flex items-start justify-between py-5 text-left group hover:bg-[#97cd7a]/10 transition-colors px-2"
                                            >
                                                <span className={`text-[11px] font-black uppercase tracking-widest pr-8 ${expandedFaq === faq.id ? 'text-black' : 'text-black opacity-70 group-hover:opacity-100'}`}>
                                                    {faq.question}
                                                </span>
                                                <div className={`shrink-0 border border-black p-0.5 transition-all ${expandedFaq === faq.id ? 'bg-black text-[#97cd7a]' : 'bg-white text-black'}`}>
                                                    <ChevronDown
                                                        size={14}
                                                        strokeWidth={4}
                                                        className={`transition-transform duration-200 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </button>
                                            <AnimatePresence>
                                                {expandedFaq === faq.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.15, ease: "easeInOut" }}
                                                    >
                                                        <div className="pb-6 pr-12 pl-2 text-[10px] font-bold text-black opacity-60 uppercase tracking-widest leading-relaxed">
                                                            {faq.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-[10px] font-black text-black/30 uppercase tracking-widest">
                                        NENHUM TÓPICO ENCONTRADO.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SupportView;
