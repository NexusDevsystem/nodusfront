import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MarqueeTextProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    speed?: number; // Speed in pixels per second
    gap?: number;   // Gap between text repeats
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({
    text,
    className = "",
    style = {},
    speed = 50,
    gap = 50
}) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [contentWidth, setContentWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (containerRef.current && textRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const textWidth = textRef.current.offsetWidth;

            if (textWidth > containerWidth) {
                setIsOverflowing(true);
                setContentWidth(textWidth);
            } else {
                setIsOverflowing(false);
            }
        }
    }, [text]);

    if (!isOverflowing) {
        return (
            <div ref={containerRef} className={`w-full overflow-hidden ${className}`}>
                <span ref={textRef} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {text}
                </span>
            </div>
        );
    }

    const duration = (contentWidth + gap) / speed;

    return (
        <div
            ref={containerRef}
            className={`w-full overflow-hidden relative ${className}`}
            style={{ ...style, maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)' }}
        >
            <motion.div
                className="flex whitespace-nowrap"
                animate={{ x: [0, -(contentWidth + gap)] }}
                transition={{
                    duration: duration,
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
                <span style={{ paddingRight: `${gap}px` }}>{text}</span>
                <span style={{ paddingRight: `${gap}px` }}>{text}</span>
            </motion.div>
        </div>
    );
};
