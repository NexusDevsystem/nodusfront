import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
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
        answer: 'Você pode fazer o upgrade acessando a aba "Faturamento" na barra lateral e clicando em "Fazer Upgrade". Aceitamos cartões de crédito e Pix.'
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

const SupportView: React.FC = () => {
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
        <div className="max-w-5xl mx-auto pb-20 px-6 font-sans">
            {/* Header - Corporate / Clean */}
            <div className="border-b border-slate-200 pb-8 mb-8 pt-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Central de Ajuda</h1>
                <p className="text-slate-500 text-sm">Documentação e suporte para usuários.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-12">

                {/* Left Column - Navigation / Categories */}
                <div className="w-full md:w-64 shrink-0 space-y-8">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                        />
                    </div>

                    {/* Categories List */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tópicos</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!activeCategory ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Todos
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeCategory === cat.id ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact Links - Corporate Style */}
                    <div className="pt-8 border-t border-slate-200">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contato Direto</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="font-semibold text-slate-900 mb-1">Suporte via Email</p>
                                <a href="mailto:nexusdevsystem@gmail.com" className="text-slate-600 hover:text-slate-900 flex items-center gap-1 group">
                                    nexusdevsystem@gmail.com
                                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>

                            <div>
                                <p className="font-semibold text-slate-900 mb-1">Atendimento WhatsApp</p>
                                <a href="https://wa.me/559180519442" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 flex items-center gap-1 group">
                                    (91) 8051-9442
                                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Content */}
                <div className="flex-1 min-w-0">
                    {activeCategory === 'feedback' ? (
                        <div className="animate-fade-in">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-slate-900">Feedback & Report de Bugs</h2>
                                <p className="text-slate-500 text-sm mt-2">Sua opinião é fundamental para melhorarmos o Nodus. Caso tenha encontrado um erro ou queira sugerir uma funcionalidade, utilize o campo abaixo.</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                {isSubmitted ? (
                                    <div className="text-center py-8">
                                        <div className="text-slate-900 font-bold mb-2">Obrigado pelo seu feedback!</div>
                                        <p className="text-slate-500 text-sm">Nossa equipe analisará seu relato em breve.</p>
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="mt-6 text-sm font-semibold text-slate-900 underline underline-offset-4"
                                        >
                                            Enviar outro relato
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Relato</label>
                                            <textarea
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                rows={6}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-400 transition-colors resize-none"
                                                placeholder="Descreva o problema ou sugestão com o máximo de detalhes possível..."
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors"
                                            >
                                                Enviar Relato
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {searchQuery ? `Resultados para "${searchQuery}"` : (
                                        activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label : 'Perguntas Frequentes'
                                    )}
                                </h2>
                            </div>

                            <div className="border-t border-slate-200">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map(faq => (
                                        <div key={faq.id} className="border-b border-slate-200">
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className="w-full flex items-start justify-between py-4 text-left group hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-md"
                                            >
                                                <span className={`text-sm font-medium pr-8 ${expandedFaq === faq.id ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                    {faq.question}
                                                </span>
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-slate-400 mt-0.5 shrink-0 transition-transform duration-200 ${expandedFaq === faq.id ? 'rotate-180 text-slate-600' : ''}`}
                                                />
                                            </button>
                                            <AnimatePresence>
                                                {expandedFaq === faq.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.15, ease: "easeInOut" }}
                                                    >
                                                        <div className="pb-4 pr-12 pl-0 text-sm text-slate-600 leading-relaxed">
                                                            {faq.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-500 text-sm">
                                        Nenhum tópico encontrado.
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
