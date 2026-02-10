import React from 'react';

interface InfiniteMarqueeProps {
    text: string;
    bgColor?: string;
    textColor?: string;
    speed?: number; // Duration in seconds
    direction?: 'left' | 'right';
    className?: string;
}

export default function InfiniteMarquee({
    text,
    bgColor = 'bg-[#ffdf00]',
    textColor = 'text-[#002776]',
    speed = 20,
    direction = 'left',
    className = ''
}: InfiniteMarqueeProps) {

    // Create an array of copies to ensure seamless scrolling
    const content = Array(10).fill(text);

    return (
        <div className={`w-full overflow-hidden whitespace-nowrap py-3 sm:py-4 border-y-2 border-black ${bgColor} ${className}`}>
            <div
                className={`inline-block animate-marquee`}
                style={{
                    animationDuration: `${speed}s`,
                    animationDirection: direction === 'right' ? 'reverse' : 'normal'
                }}
            >
                {content.map((item, index) => (
                    <span key={index} className={`inline-block mx-4 text-xl sm:text-2xl font-black uppercase tracking-widest ${textColor} flex items-center gap-4`}>
                        {item}
                        {/* Decorative Icon between texts (e.g., a small diamond or star) */}
                        <span className="text-sm">★</span>
                    </span>
                ))}
            </div>
            {/* Duplicate for seamless effect (absolute positioning might be needed for perfect CSS marquee, but inline-block usually works if width is enough) */}
            {/* Actually, for a pure CSS marquee, we often need two identical sets animating. 
                Let's use a simpler structure: A flex container moving. 
            */}
        </div>
    );
}
