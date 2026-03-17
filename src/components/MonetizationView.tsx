import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Wallet, CreditCard, AlertCircle, Zap, Layout, Plus, Trash2, X, Check, GripVertical, ChevronDown, Trash } from 'lucide-react';
import { UserProfile, PaymentMethod } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { SiPaypal } from 'react-icons/si';


interface MonetizationViewProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

export default function MonetizationView({ profile, onChange }: MonetizationViewProps) {
    const { t } = useTranslation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Legacy Migration logic
    useEffect(() => {
        if (profile.supportKey && profile.supportType && (!profile.paymentMethods || profile.paymentMethods.length === 0)) {
            const migratedMethod: PaymentMethod = {
                id: Date.now().toString(),
                type: profile.supportType as 'pix' | 'paypal',
                key: profile.supportKey,
                label: profile.supportType === 'pix' ? 'Meu Pix Principal' : 'Meu PayPal',
                isActive: true
            };
            onChange({
                ...profile,
                paymentMethods: [migratedMethod],
                supportKey: undefined,
                supportType: undefined
            });
        }
    }, [profile, onChange]);

    const handleAddMethod = () => {
        const newMethod: PaymentMethod = {
            id: Date.now().toString(),
            type: 'pix', // Default
            key: '',
            label: 'Novo Método',
            isActive: true
        };

        const currentMethods = profile.paymentMethods || [];
        onChange({
            ...profile,
            paymentMethods: [newMethod, ...currentMethods]
        });

        // Auto-expand the new item
        setExpandedId(newMethod.id);
    };

    const handleUpdateMethod = (id: string, updates: Partial<PaymentMethod>) => {
        const currentMethods = profile.paymentMethods || [];
        onChange({
            ...profile,
            paymentMethods: currentMethods.map(m => m.id === id ? { ...m, ...updates } : m)
        });
    };

    const handleRemoveMethod = (id: string) => {
        const currentMethods = profile.paymentMethods || [];
        onChange({
            ...profile,
            paymentMethods: currentMethods.filter(m => m.id !== id)
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-4xl mx-auto">

            {/* Header Content - Action Card */}
            <div className="bg-[#ffdf00] border-4 border-[#1a1a1a] p-8 shadow-[0_8px_0_0_#1a1a1a] rounded-3xl">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-[900] text-black uppercase tracking-tighter leading-none mb-2">{t('monetization.title')}</h2>
                        <div className="h-1.5 w-12 bg-black"></div>
                    </div>
                    <button
                        onClick={handleAddMethod}
                        className="w-14 h-14 flex items-center justify-center bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a]  border-2 border-[#1a1a1a] hover:translate-y-[2px] hover:shadow-none shadow-[0_4px_0_0_rgba(26,26,26,0.3)] transition-all shrink-0 rounded-xl"
                        title="Adicionar Novo"
                    >
                        <Plus size={32} strokeWidth={4} />
                    </button>
                </div>
                <p className="mt-6 text-[10px] font-black text-black/60 uppercase tracking-widest leading-tight max-w-xl">
                    {t('monetization.subtitle').toUpperCase()}
                </p>
            </div>

            {/* Methods List */}
            <div className="space-y-6">
                <AnimatePresence>
                    {profile.paymentMethods?.map((method) => {
                        const isExpanded = expandedId === method.id;

                        return (
                            <motion.div
                                key={method.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`
                                    bg-white border-4 border-[#1a1a1a] transition-all relative overflow-hidden rounded-2xl
                                    ${isExpanded ? 'shadow-[0_8px_0_0_#1a1a1a]' : 'shadow-[0_4px_0_0_#1a1a1a]'}
                                `}
                            >
                                {/* Header */}
                                <div className="flex items-center w-full min-h-[80px]">
                                    <div
                                        className={`w-20 self-stretch flex items-center justify-center border-r-4 border-[#1a1a1a] ${method.type === 'pix' ? 'bg-[#32bcad]' : 'bg-[#003087]'} text-white`}
                                    >
                                        {method.type === 'pix' ? <img src="/icons/pix-svgrepo-com.svg" className="w-8 h-8 invert brightness-0" alt="Pix" /> : <SiPaypal size={28} />}
                                    </div>

                                    <div
                                        className="flex-1 px-6 py-4 cursor-pointer select-none"
                                        onClick={() => setExpandedId(isExpanded ? null : method.id)}
                                    >
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-sm font-[900] text-black uppercase tracking-widest truncate">
                                                {method.label || (method.type === 'pix' ? t('monetization.pixKey') : 'PayPal')}
                                            </h3>
                                            {!method.isActive && (
                                                <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 border border-[#1a1a1a] uppercase tracking-widest">
                                                    {t('common.inactive')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest truncate">
                                            {method.key || t('monetization.pendingConfig')}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pr-6">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={method.isActive !== false}
                                                onChange={(e) => handleUpdateMethod(method.id, { isActive: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-12 h-6 border-2 border-[#1a1a1a] bg-white rounded-full transition-all duration-300 peer-checked:bg-[#97cd7a] shadow-[0_3px_0_0_#1a1a1a] peer-active:shadow-none peer-active:translate-y-[0.5px] after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-2 after:border-[#1a1a1a] after:w-4 after:h-4 after:rounded-full after:transition-all peer-checked:after:translate-x-6"></div>
                                        </label>

                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : method.id)}
                                            className={`w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center transition-all rounded-lg ${isExpanded ? 'bg-[#ffdf00] text-black rotate-180' : 'bg-white text-black hover:bg-[#ffdf00]/5'}`}
                                        >
                                            <ChevronDown size={24} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="border-t-4 border-[#1a1a1a] bg-slate-50"
                                        >
                                            <div className="p-8 space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {/* Selection */}
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-[900] text-black uppercase tracking-widest block">{t('monetization.methodType')}</label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <button
                                                                onClick={() => handleUpdateMethod(method.id, { type: 'pix' })}
                                                                className={`flex flex-col items-center justify-center gap-3 p-6 border-2 border-[#1a1a1a] transition-all rounded-xl ${method.type === 'pix' ? 'bg-[#32bcad] text-white shadow-[0_4px_0_0_#1a1a1a]' : 'bg-white text-black hover:bg-[#ffdf00]/5'}`}
                                                            >
                                                                <img src="/icons/pix-svgrepo-com.svg" className={`w-6 h-6 ${method.type === 'pix' ? 'invert brightness-0' : ''}`} alt="Pix" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">PIX</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateMethod(method.id, { type: 'paypal' })}
                                                                className={`flex flex-col items-center justify-center gap-3 p-6 border-2 border-[#1a1a1a] transition-all rounded-xl ${method.type === 'paypal' ? 'bg-[#003087] text-white shadow-[0_4px_0_0_#1a1a1a]' : 'bg-white text-black hover:bg-[#ffdf00]/5'}`}
                                                            >
                                                                <SiPaypal size={24} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">PAYPAL</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-[10px] font-[900] text-black uppercase tracking-widest block mb-2">{t('monetization.customName')}</label>
                                                            <input
                                                                type="text"
                                                                value={method.label}
                                                                onChange={(e) => handleUpdateMethod(method.id, { label: e.target.value })}
                                                                placeholder={t('monetization.customNamePlaceholder')}
                                                                className="w-full bg-white border-2 border-[#1a1a1a] p-3 text-xs font-bold uppercase tracking-widest outline-none focus:bg-[#ffdf00] shadow-[0_4px_0_0_rgba(26,26,26,0.1)] transition-all rounded-xl"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-[900] text-black uppercase tracking-widest block mb-2">
                                                                {method.type === 'pix' ? t('monetization.pixKey') : t('monetization.paypalEmail')}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={method.key}
                                                                onChange={(e) => handleUpdateMethod(method.id, { key: e.target.value })}
                                                                placeholder={method.type === 'pix' ? t('monetization.pixKeyPlaceholder') : t('monetization.paypalPlaceholder')}
                                                                className="w-full bg-white border-2 border-[#1a1a1a] p-3 text-xs font-bold uppercase tracking-widest outline-none focus:bg-[#ffdf00] shadow-[0_4px_0_0_rgba(26,26,26,0.1)] transition-all rounded-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-8 border-t-2 border-[#1a1a1a]/10">
                                                    <div className="text-[10px] font-bold text-black/30 uppercase tracking-widest italic flex items-center gap-2">
                                                        <AlertCircle size={14} />
                                                        {t('monetization.verifyDetails')}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveMethod(method.id)}
                                                        className="px-6 py-3 bg-red-500 text-white border-2 border-[#1a1a1a] text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_4px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none flex items-center gap-2 rounded-xl"
                                                    >
                                                        <Trash2 size={14} strokeWidth={3} />
                                                        {t('monetization.removeMethod')}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {(!profile.paymentMethods || profile.paymentMethods.length === 0) && (
                    <div className="p-12 border-4 border-dashed border-[#1a1a1a]/20 flex flex-col items-center justify-center text-center rounded-3xl">
                        <Wallet size={48} className="text-black/10 mb-4" />
                        <h3 className="text-sm font-black text-black/40 uppercase tracking-widest">{t('monetization.noMethodConfigured')}</h3>
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-2">{t('monetization.noMethodConfiguredDesc')}</p>
                        <button
                            onClick={handleAddMethod}
                            className="mt-6 px-8 py-4 bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a] text-[#ffdf00] border-2 border-[#1a1a1a] text-xs font-black uppercase tracking-widest shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:shadow-none transition-all rounded-xl"
                        >
                            {t('monetization.setupNow')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
