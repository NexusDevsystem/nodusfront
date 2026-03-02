import React from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';

interface TourGuideProps {
    run: boolean;
    steps: Step[];
    onFinish?: () => void;
    onStepChange?: (index: number) => void;
    stepIndex?: number;
}

export default function TourGuide({ run, steps, onFinish, onStepChange, stepIndex }: TourGuideProps) {
    const { t } = useTranslation();

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
            scrollToFirstStep
            showProgress
            showSkipButton
            disableOverlayClose
            disableCloseOnEsc
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
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                },
                tooltip: {
                    border: '4px solid #000',
                    borderRadius: '0',
                    boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
                    padding: '20px',
                    fontFamily: 'inherit',
                    width: window.innerWidth < 768 ? '300px' : '380px',
                    maxWidth: '90vw',
                    marginTop: window.innerWidth < 768 ? '-100px' : '0'
                },
                tooltipTitle: {
                    textTransform: 'uppercase',
                    fontWeight: 900,
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    letterSpacing: '0.1em',
                    marginBottom: '8px'
                },
                tooltipContent: {
                    fontSize: window.innerWidth < 768 ? '11px' : '12px',
                    lineHeight: '1.5',
                    marginBottom: '16px'
                },
                buttonNext: {
                    backgroundColor: '#97cd7a',
                    color: '#000',
                    borderRadius: '0',
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                    padding: '8px 24px',
                    textTransform: 'uppercase',
                    fontWeight: 900,
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    outline: 'none',
                },
                buttonBack: {
                    color: '#000',
                    marginRight: '14px',
                    textTransform: 'uppercase',
                    fontWeight: 900,
                    fontSize: '11px',
                    outline: 'none',
                },
                buttonSkip: {
                    color: '#000',
                    textTransform: 'uppercase',
                    fontWeight: 900,
                    fontSize: '10px',
                    outline: 'none',
                    opacity: 0.6
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
