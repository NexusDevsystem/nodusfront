import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    children: ReactNode;
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string; // for wrapper
    delay?: number;
}

export default function Tooltip({ children, text, position = 'bottom', className = '' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const updatePosition = () => {
        if (!wrapperRef.current || isMobile) return;
        const rect = wrapperRef.current.getBoundingClientRect();

        setCoords({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        });
    };

    useEffect(() => {
        if (isVisible && !isMobile) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            // Re-check position after a short delay in case of layout shifts
            requestAnimationFrame(updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isVisible, isMobile]);

    let transform = '';
    let tooltipLeft = coords.left;
    let tooltipTop = coords.top;

    switch (position) {
        case 'top':
            tooltipLeft = coords.left + coords.width / 2;
            tooltipTop = coords.top - 8;
            transform = 'translate(-50%, -100%)';
            break;
        case 'bottom':
            tooltipLeft = coords.left + coords.width / 2;
            tooltipTop = coords.top + coords.height + 8;
            transform = 'translate(-50%, 0)';
            break;
        case 'left':
            tooltipLeft = coords.left - 8;
            tooltipTop = coords.top + coords.height / 2;
            transform = 'translate(-100%, -50%)';
            break;
        case 'right':
            tooltipLeft = coords.left + coords.width + 8;
            tooltipTop = coords.top + coords.height / 2;
            transform = 'translate(0, -50%)';
            break;
    }

    return (
        <div
            ref={wrapperRef}
            className={`inline-flex ${className}`}
            onMouseEnter={() => !isMobile && setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => !isMobile && setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && !isMobile && createPortal(
                <div
                    style={{
                        position: 'absolute',
                        top: tooltipTop,
                        left: tooltipLeft,
                        transform: transform,
                    }}
                    className="z-[999999] px-2.5 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest whitespace-nowrap border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#1a1a1a] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                >
                    {text}
                </div>,
                document.body
            )}
        </div>
    );
}
