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

    const updatePosition = () => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();

        setCoords({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        });
    };

    useEffect(() => {
        if (isVisible) {
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
    }, [isVisible]);

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
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && createPortal(
                <div
                    style={{
                        position: 'absolute',
                        top: tooltipTop,
                        left: tooltipLeft,
                        transform: transform,
                    }}
                    className="z-[999999] px-2.5 py-1.5 bg-white text-black text-[9px] font-black uppercase tracking-widest whitespace-nowrap border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                >
                    {text}
                </div>,
                document.body
            )}
        </div>
    );
}
