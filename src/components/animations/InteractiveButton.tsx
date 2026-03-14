import React, { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface InteractiveButtonProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
    strength?: number; // Strength of the magnetic pull
    tiltStrength?: number; // Strength of the tilt effect
    glowStrength?: number; // Opacity of the spotlight glow
    glowColor?: string;
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
    children,
    className = '',
    style = {},
    onClick,
    strength = 15,
    tiltStrength = 10,
    glowStrength = 0.4,
    glowColor = 'rgba(255, 255, 255, 0.2)'
}) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    
    // Magnetic motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Tilt motion values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    // Spotlight position
    const spotlightX = useMotionValue(0);
    const spotlightY = useMotionValue(0);
    const spotlightOpacity = useSpring(0, { damping: 20, stiffness: 200 });

    // Smooth springs for magnetic pull
    const springX = useSpring(x, { damping: 15, stiffness: 150 });
    const springY = useSpring(y, { damping: 15, stiffness: 150 });
    
    // Smooth springs for tilt
    const springRotateX = useSpring(rotateX, { damping: 20, stiffness: 200 });
    const springRotateY = useSpring(rotateY, { damping: 20, stiffness: 200 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Update Magnetic Position
        x.set(distanceX * (strength / 100));
        y.set(distanceY * (strength / 100));

        // Update Tilt
        rotateX.set(-distanceY * (tiltStrength / 100));
        rotateY.set(distanceX * (tiltStrength / 100));

        // Update Spotlight
        spotlightX.set(e.clientX - rect.left);
        spotlightY.set(e.clientY - rect.top);
        spotlightOpacity.set(glowStrength);
    }, [x, y, rotateX, rotateY, spotlightX, spotlightY, spotlightOpacity, strength, tiltStrength, glowStrength]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
        rotateX.set(0);
        rotateY.set(0);
        spotlightOpacity.set(0);
    }, [x, y, rotateX, rotateY, spotlightOpacity]);

    const handleMouseEnter = useCallback(() => {
        spotlightOpacity.set(glowStrength);
    }, [spotlightOpacity, glowStrength]);

    return (
        <motion.div
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                ...style,
                x: springX,
                y: springY,
                rotateX: springRotateX,
                rotateY: springRotateY,
                perspective: 1000,
                transformStyle: 'preserve-3d',
            }}
            className={`relative group touch-none cursor-pointer cursor-target ${className}`}
        >
            {/* Background Spotlight Glow */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
                style={{
                    borderRadius: style.borderRadius || 'inherit',
                }}
            >
                <motion.div
                    className="absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-3xl mix-blend-soft-light"
                    style={{
                        left: spotlightX,
                        top: spotlightY,
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                        opacity: spotlightOpacity,
                    }}
                />
            </motion.div>

            {/* Content Layer with subtle push out */}
            <div 
                className="relative z-10 w-full h-full"
                style={{ transform: 'translateZ(10px)' }}
            >
                {children}
            </div>

            {/* Subtle Reflection Ray */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
                <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[25deg] group-hover:left-[150%] transition-all duration-1000 ease-in-out" />
            </div>
        </motion.div>
    );
};

export default InteractiveButton;
