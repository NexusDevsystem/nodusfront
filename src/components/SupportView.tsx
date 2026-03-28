import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

interface SupportViewProps {
    userProfile?: UserProfile;
}

const SupportView: React.FC<SupportViewProps> = ({ userProfile }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const FAQS = useMemo<FAQItem[]>(() => [
        { id: '1', category: 'financeiro', question: t('support.faqs.q1'), answer: t('support.faqs.a1') },
        { id: '2', category: 'financeiro', question: t('support.faqs.q2'), answer: t('support.faqs.a2') },
        { id: '3', category: 'personalizacao', question: t('support.faqs.q3'), answer: t('support.faqs.a3') },
        { id: '4', category: 'conta', question: t('support.faqs.q4'), answer: t('support.faqs.a4') },
        { id: '5', category: 'links', question: t('support.faqs.q5'), answer: t('support.faqs.a5') },
        { id: '6', category: 'conta', question: t('support.faqs.q6'), answer: t('support.faqs.a6') }
    ], [t]);

    const CATEGORIES = useMemo(() => [
        { id: 'financeiro', label: t('support.categories.financeiro') },
        { id: 'personalizacao', label: t('support.categories.personalizacao') },
        { id: 'conta', label: t('support.categories.conta') },
        { id: 'feedback', label: t('support.categories.feedback') },
        { id: 'outros', label: t('support.categories.outros') }
    ], [t]);

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
        <div className="pb-20 animate-fade-in">
            {/* Header - Brutalist */}
            <div className="border-b-2 border-[#1a1a1a] pb-6 mb-8 pt-8">
                <h1 className="text-xl font-black text-black uppercase tracking-widest">{t('support.title')}</h1>
                <p className="text-[10px] text-black font-black uppercase tracking-widest mt-1 opacity-60">{t('support.subtitle')}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-12">

                {/* Left Column - Navigation / Categories */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={14} strokeWidth={3} />
                        <input
                            type="text"
                            placeholder={t('support.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-white border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] text-[10px] font-black uppercase tracking-widest focus:outline-none focus:translate-y-[1px] focus:shadow-none transition-all placeholder:text-black/20"
                        />
                    </div>

                    {/* Categories List */}
                    <div>
                        <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 px-1">{t('support.topics')}</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`w-full text-left px-4 py-2.5 border-2 border-[#1a1a1a] text-[10px] font-black uppercase tracking-widest transition-all ${!activeCategory ? 'bg-[#1a1a1a] text-[#97cd7a] shadow-none translate-y-[1px]' : 'bg-white text-black shadow-[0_2px_0_0_#1a1a1a] hover:bg-[#97cd7a]'}`}
                            >
                                {t('support.all')}
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-4 py-2.5 border-2 border-[#1a1a1a] text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-[#1a1a1a] text-[#97cd7a] shadow-none translate-y-[1px]' : 'bg-white text-black shadow-[0_2px_0_0_#1a1a1a] hover:bg-[#97cd7a]'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact Links - Brutalist */}
                    <div className="pt-6 border-t border-[#1a1a1a] border-dashed">
                        <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 px-1">{t('support.directContact')}</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-white border border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a]">
                                <p className="text-[8px] font-black text-black/40 uppercase tracking-widest mb-1">E-mail</p>
                                <a href="mailto:nexusdevsystem@gmail.com" className="text-[9px] font-black text-black hover:text-[#32a800] uppercase tracking-widest flex items-center gap-1 group truncate">
                                    nexusdevsystem@gmail.com
                                    <ExternalLink size={10} className="shrink-0" strokeWidth={3} />
                                </a>
                            </div>

                            <div
                                className={`p-3 border border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] transition-all ${!userProfile?.plan_type || userProfile.plan_type === 'free' ? 'bg-slate-50 opacity-100 cursor-pointer group' : 'bg-white'}`}
                                onClick={() => {
                                    if (!userProfile?.plan_type || userProfile.plan_type === 'free') {
                                        window.dispatchEvent(new CustomEvent('open-billing-modal'));
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[8px] font-black text-black/40 uppercase tracking-widest">WhatsApp</p>
                                    {(!userProfile?.plan_type || userProfile.plan_type === 'free') && (
                                        <div className="flex items-center gap-1 bg-[#1a1a1a] px-1.5 py-0.5 -mt-1 -mr-1">
                                            <Lock size={8} className="text-[#97cd7a]" strokeWidth={3} />
                                            <span className="text-[7px] font-black text-[#97cd7a] uppercase tracking-tighter">PREMIUM</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${!userProfile?.plan_type || userProfile.plan_type === 'free' ? 'text-black/30' : 'text-black hover:text-[#32a800] cursor-pointer'}`}>
                                    {!userProfile?.plan_type || userProfile.plan_type === 'free' ? (
                                        <>{t('support.prioritySupport')}</>
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
                                <h2 className="text-lg font-black text-black uppercase tracking-widest">{t('support.feedbackTitle')}</h2>
                                <p className="text-[10px] text-black font-bold uppercase tracking-widest mt-2 opacity-60 leading-relaxed">
                                    {t('support.feedbackSubtitle')}
                                </p>
                            </div>

                            <div className="bg-white p-6 border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a]">
                                {isSubmitted ? (
                                    <div className="text-center py-8">
                                        <div className="text-black font-black uppercase tracking-widest mb-2">{t('support.feedbackSent')}</div>
                                        <p className="text-[10px] text-black font-bold uppercase tracking-widest opacity-60">{t('support.feedbackSentDesc')}</p>
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="mt-6 text-[10px] font-black text-black underline underline-offset-4 uppercase tracking-widest hover:text-[#32a800]"
                                        >
                                            {t('support.sendAnotherFeedback')}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3 px-1">{t('support.yourMessage')}</label>
                                            <textarea
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                rows={6}
                                                className="w-full px-4 py-4 bg-white border border-[#1a1a1a] text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:bg-slate-50 transition-colors resize-none shadow-[0_2px_0_0_#1a1a1a] placeholder:text-black/10"
                                                placeholder={t('support.messagePlaceholder')}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-8 py-3 bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a]  border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] text-[10px] font-black uppercase tracking-widest hover:translate-y-[1px] hover:shadow-none transition-all"
                                            >
                                                {t('support.sendFeedbackButton')}
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
                                    {searchQuery ? t('support.resultsFor', { query: searchQuery }) : (
                                        activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label : t('support.faqTitle')
                                    )}
                                </h2>
                            </div>

                            <div className="border-t-2 border-[#1a1a1a]">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map(faq => (
                                        <div key={faq.id} className="border-b border-[#1a1a1a]">
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className="w-full flex items-start justify-between py-5 text-left group hover:bg-[#97cd7a]/10 transition-colors px-2"
                                            >
                                                <span className={`text-[11px] font-black uppercase tracking-widest pr-8 ${expandedFaq === faq.id ? 'text-black' : 'text-black opacity-70 group-hover:opacity-100'}`}>
                                                    {faq.question}
                                                </span>
                                                <div className={`shrink-0 border border-[#1a1a1a] p-0.5 transition-all ${expandedFaq === faq.id ? 'bg-[#1a1a1a] text-[#97cd7a]' : 'bg-white text-black'}`}>
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
                                        {t('support.noResults')}
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
