import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Joyride, { Step, CallBackProps, STATUS, TooltipRenderProps } from '@list-labs/react-joyride';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface TourGuideProps {
    run: boolean;
    steps: Step[];
    onFinish?: () => void;
    onStepChange?: (index: number) => void;
    stepIndex?: number;
}

export default function TourGuide({ run, steps, onFinish, onStepChange, stepIndex }: TourGuideProps) {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const MobileTooltip = ({
        index,
        step,
        backProps,
        primaryProps,
        skipProps,
        tooltipProps,
        isLastStep,
    }: TooltipRenderProps) => {
        const content = (
            <AnimatePresence>
                <motion.div
                    {...tooltipProps}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 w-full bg-white border-t-4 border-[#1a1a1a] p-6 pb-12 z-[1000002] rounded-none shadow-[0_10px_0_0_#1a1a1a] flex flex-col font-sans"
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        top: 'auto',
                        right: 'auto',
                        width: '100%',
                        transform: 'none',
                        maxWidth: 'none',
                        boxSizing: 'border-box'
                    }}
                >
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-[#1a1a1a] text-[#97cd7a] text-[9px] font-black px-2 py-1 uppercase tracking-widest border-l-4 border-[#97cd7a]">
                                PASSO {index + 1}
                            </span>
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-black mb-2 leading-tight">
                            {step.title || t('tour.stepTitle', 'Instrução')}
                        </h3>
                        <div className="text-[12px] font-medium leading-relaxed uppercase tracking-widest text-black/70">
                            {step.content}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-1 shrink-0">
                        <button {...skipProps} className="text-[10px] font-black text-black/20 hover:text-black uppercase tracking-widest transition-colors py-2">
                            {t('common.skip', 'Pular')}
                        </button>
                        <div className="flex items-center gap-3">
                            {index > 0 && (
                                <button {...backProps} className="text-[10px] font-black text-black/60 hover:text-black uppercase tracking-widest transition-colors py-2 px-3">
                                    {t('common.back', 'Voltar')}
                                </button>
                            )}
                            <button {...primaryProps} className="bg-[#1a1a1a] text-[#97cd7a] border-2 border-[#1a1a1a] px-6 py-4 font-black text-[11px] uppercase tracking-widest shadow-[0_4px_0_0_rgba(151,205,122,0.3)] hover:translate-y-[1px] hover:shadow-none transition-all">
                                {isLastStep ? t('common.finish', 'Concluir') : t('common.next', 'Próximo')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );

        return createPortal(content, document.body);
    };

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, index } = data;

        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            if (onFinish) onFinish();
        }

        if (type === 'step:after' && onStepChange) {
            onStepChange(index + 1);
        }
    };

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            run={run}
            steps={steps}
            stepIndex={stepIndex}
            scrollToFirstStep={!isMobile}
            showProgress
            showSkipButton
            disableOverlayClose
            disableCloseOnEsc
            tooltipComponent={isMobile ? MobileTooltip : undefined}
            floaterProps={{
                disableAnimation: true
            }}
            styles={{
                options: {
                    arrowColor: '#fff',
                    backgroundColor: '#fff',
                    overlayColor: 'rgba(0,0,0,0.85)',
                    primaryColor: '#97cd7a',
                    textColor: '#000',
                    zIndex: 1000000,
                },
                overlay: {
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    mixBlendMode: 'hard-light',
                },
                spotlight: {
                    backgroundColor: 'transparent',
                    borderRadius: '0',
                },
            }}
            locale={{
                back: t('common.back', 'Voltar'),
                close: t('common.close', 'Fechar'),
                last: t('common.finish', 'Concluir'),
                next: t('common.next', 'Próximo'),
                skip: t('common.skip', 'Pular'),
            }}
        />
    );
}
