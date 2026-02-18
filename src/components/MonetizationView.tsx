import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, CreditCard, AlertCircle, Zap, Layout, Plus, Trash2, X, Check, GripVertical, ChevronDown } from 'lucide-react';
import { UserProfile, PaymentMethod } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { SiPaypal } from 'react-icons/si';

const PixIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        className={className}
        fill="currentColor"
    >
        <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z" /><path d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z" />
    </svg>
);

interface MonetizationViewProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

export default function MonetizationView({ profile, onChange }: MonetizationViewProps) {
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
    }, []);

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
        <div className="space-y-6 animate-fade-in pb-20 max-w-4xl mx-auto">

            {/* Header / Add Button */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Monetização</h2>

                <button
                    onClick={handleAddMethod}
                    className="ml-auto w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#32a800] hover:text-[#32a800]/80 transition-all active:scale-90 bg-transparent"
                    title="Adicionar Novo Método"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Methods List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {profile.paymentMethods?.map((method) => {
                        const isExpanded = expandedId === method.id;

                        return (
                            <motion.div
                                key={method.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`relative overflow-hidden rounded-2xl border transition-all bg-white ${isExpanded ? 'border-[#32a800] ring-1 ring-[#32a800]/10' : 'border-slate-200'}`}
                            >
                                {/* Collapsed Header (Always Visible) */}
                                <div className="flex items-center w-full min-h-[72px]">
                                    {/* Drag Handle (Visual mimic) */}
                                    <div className="w-10 md:w-12 flex items-center justify-center text-slate-300 hover:text-[#32a800] hover:bg-[#32a800]/5 self-stretch border-r border-slate-50 transition-colors cursor-grab active:cursor-grabbing">
                                        <GripVertical size={16} />
                                    </div>

                                    {/* Icon */}
                                    <div className="shrink-0 mx-4">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm ${method.type === 'pix' ? 'bg-[#32bcad]' : 'bg-[#003087]'}`}>
                                            {method.type === 'pix' ? <PixIcon size={20} /> : <SiPaypal size={20} />}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div
                                        className="flex-1 min-w-0 pr-2 py-4 cursor-pointer"
                                        onClick={() => setExpandedId(isExpanded ? null : method.id)}
                                    >
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className="font-semibold text-slate-800 truncate text-xs md:text-sm">
                                                {method.label || (method.type === 'pix' ? 'Chave Pix' : 'PayPal')}
                                            </div>
                                            <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-tighter ${method.type === 'pix'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {method.type === 'pix' ? 'PIX' : 'PAYPAL'}
                                            </span>
                                        </div>
                                        <div className="text-[10px] md:text-xs text-slate-400 truncate">
                                            {method.key || 'Configure sua chave...'}
                                        </div>
                                    </div>

                                    {/* Right Actions */}
                                    <div className="flex items-center gap-2 md:gap-6 pr-3 md:pr-6 shrink-0">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : method.id)}
                                            className={`p-1.5 md:p-2 rounded-xl transition-all ${isExpanded ? 'text-[#32a800] bg-[#32a800]/5 rotate-180' : 'text-slate-300 hover:text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                                        >
                                            <ChevronDown size={18} />
                                        </button>

                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={method.isActive !== false} // Default true
                                                onChange={(e) => handleUpdateMethod(method.id, { isActive: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-8 md:w-9 h-4 md:h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 md:after:h-4 after:w-3 md:after:w-4 after:transition-all peer-checked:bg-[#32a800]"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-slate-50/20 border-t border-slate-100"
                                        >
                                            <div className="p-6 space-y-6">
                                                {/* Type Selection */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2 block">Tipo de Método</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => handleUpdateMethod(method.id, { type: 'pix' })}
                                                            className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all ${method.type === 'pix' ? 'bg-[#32bcad]/10 border-[#32bcad] text-[#32bcad]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            <PixIcon size={18} />
                                                            <span className="text-xs font-bold leading-none">PIX</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateMethod(method.id, { type: 'paypal' })}
                                                            className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all ${method.type === 'paypal' ? 'bg-[#003087]/5 border-[#003087] text-[#003087]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            <SiPaypal size={16} />
                                                            <span className="text-xs font-bold leading-none">PAYPAL</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1 block">Rótulo / Nome</label>
                                                        <input
                                                            type="text"
                                                            value={method.label}
                                                            onChange={(e) => handleUpdateMethod(method.id, { label: e.target.value })}
                                                            placeholder="Ex: Pix Principal"
                                                            className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:border-[#32a800] outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1 block">
                                                            {method.type === 'pix' ? 'Chave Pix' : 'Link PayPal'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={method.key}
                                                            onChange={(e) => handleUpdateMethod(method.id, { key: e.target.value })}
                                                            placeholder={method.type === 'pix' ? 'CPF, Email ou Aleatória' : 'paypal.me/usuario'}
                                                            className="w-full text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:border-[#32a800] outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end pt-4 border-t border-slate-100/50">
                                                    <button
                                                        onClick={() => handleRemoveMethod(method.id)}
                                                        className="px-4 h-10 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        Excluir Método
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

                <button
                    onClick={handleAddMethod}
                    className="w-full py-4 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-[#32a800] hover:text-[#32a800] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <Plus size={16} /> Adicionar Novo Método
                </button>
            </div>
        </div>
    );
}
