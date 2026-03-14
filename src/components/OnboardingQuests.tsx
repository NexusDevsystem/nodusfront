import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ChevronDown, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface Quest {
    id: string;
    label: string;
    completed: boolean;
    onClick: () => void;
}

interface OnboardingQuestsProps {
    quests: Quest[];
    progress: number;
}

export default function OnboardingQuests({ quests, progress }: OnboardingQuestsProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const isAllComplete = progress === 100;

    React.useEffect(() => {
        if (isAllComplete && isOpen) {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                setIsOpen(false);
                setDismissed(true);
            }, 3000);
        }
    }, [isAllComplete, isOpen]);

    if (dismissed || isAllComplete) return null;

    const completedCount = quests.filter(q => q.completed).length;

    // SVG Circle setup
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <>
            {/* Sidebar Card */}
            <div className="mx-5 md:mx-4 mt-6 md:mt-4 bg-white border-2 border-[#1a1a1a] rounded-[24px] p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] relative overflow-hidden group">
                <div className="flex flex-col gap-4 relative z-10">

                    {/* Progress Circle & Text */}
                    <div className="flex items-center justify-center gap-3.5 w-full">
                        <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="5 5 54 54">
                                <circle cx="32" cy="32" r={radius} className="stroke-[#f0f0f0]" strokeWidth="6" fill="none" />
                                <circle
                                    cx="32" cy="32" r={radius} className="stroke-[#97cd7a] transition-all duration-1000 ease-out"
                                    strokeWidth="6" fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pt-0.5">
                                <span className="text-[11px] font-black tracking-tighter text-[#8cae79] leading-none mb-[1px]">{Math.round(progress)}%</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center flex-1 -mt-0.5">
                            <h3 className="text-[13px] font-bold text-black leading-none mb-1 tracking-tight">
                                {t('quests.title', 'Checklist de Inicialização')}
                            </h3>
                            <span className="text-[11px] font-medium text-black/60 leading-none tracking-tight">
                                {completedCount} {t('quests.of', 'de')} {quests.length} {t('quests.complete', 'concluídas')}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-full bg-black text-[#97cd7a] border-2 border-[#1a1a1a] py-2.5 rounded-full text-[12px] font-bold tracking-tight shadow-[2px_2px_0px_0px_rgba(151,205,122,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(151,205,122,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        {t('quests.finishSetup', 'Terminar configuração')}
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 md:bg-black/60 md:backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="relative bg-white border-2 border-[#1a1a1a] rounded-[32px] shadow-[4px_4px_0px_0px_#1a1a1a] w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 pb-4 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-[18px] font-bold tracking-tight text-black m-0">
                                        {t('quests.title', 'Checklist de Inicialização')}
                                    </h3>
                                    <span className="bg-[#97cd7a] text-black border-2 border-[#1a1a1a] text-[12px] font-bold px-3 py-1 rounded-full tracking-tighter">
                                        {completedCount}/{quests.length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center bg-transparent border-2 border-transparent transition-all rounded-full text-black hover:bg-black/5"
                                >
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Progress Bar in Modal */}
                            <div className="px-6 pb-6 bg-white shrink-0">
                                <div className="w-full h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-[#97cd7a] rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Quest List */}
                            <div className="flex flex-col overflow-y-auto px-2 pb-4">
                                {quests.map((quest) => (
                                    <button
                                        key={quest.id}
                                        onClick={() => {
                                            if (!quest.completed) {
                                                quest.onClick();
                                                setIsOpen(false);
                                            }
                                        }}
                                        disabled={quest.completed}
                                        className={`flex flex-col p-4 text-left transition-all rounded-[16px] group hover:bg-[#f9f9f9] mx-2
                                            ${quest.completed ? 'opacity-60 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="shrink-0 flex items-center justify-center">
                                                {quest.completed ? (
                                                    <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center">
                                                        <CheckCircle2 size={30} className="text-[#97cd7a] fill-[#97cd7a]/20" strokeWidth={2} />
                                                    </div>
                                                ) : (
                                                    <div className="w-[30px] h-[30px] rounded-full border-[2.5px] border-[#e0e0e0] group-hover:border-[#97cd7a] transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 flex justify-between items-center pr-2">
                                                <span className={`text-[15px] font-medium tracking-tight ${quest.completed ? 'line-through text-black/50' : 'text-black'}`}>
                                                    {quest.label}
                                                </span>
                                                <ChevronDown size={20} className="text-black/30 group-hover:text-black/60 transition-colors" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
