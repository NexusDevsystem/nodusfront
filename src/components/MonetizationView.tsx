import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, CreditCard, AlertCircle, Zap, Layout, Plus, Trash2, X, Check, GripVertical, ChevronDown } from 'lucide-react';
import { UserProfile, PaymentMethod } from '../types';
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';

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
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm ${method.type === 'pix' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                            {method.type === 'pix' ? <Zap size={20} /> : <CreditCard size={20} />}
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
                                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${method.type === 'pix' ? 'bg-[#32a800]/10 border-[#32a800] text-[#32a800]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            <Zap size={18} />
                                                            <span className="text-xs font-bold">PIX</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateMethod(method.id, { type: 'paypal' })}
                                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${method.type === 'paypal' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            <CreditCard size={18} />
                                                            <span className="text-xs font-bold">PAYPAL</span>
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
