import React, { useRef, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface InteractiveButtonProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
    strength?: number; // Strength of the magnetic pull (removed but kept for prop compat)
    tiltStrength?: number; // Strength of the tilt effect
    glowColor?: string; // Color for the hover glow effect
    clipPath?: string; // HEX or polygon clip-path
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
    children,
    className = '',
    style = {},
    onClick,
    tiltStrength = 4,
    glowColor,
    clipPath,
    strength = 12
}) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    
    // Movement (Magnetic) motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Tilt motion values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    // Smooth springs for magnetic movement
    const springX = useSpring(x, { damping: 30, stiffness: 200 });
    const springY = useSpring(y, { damping: 30, stiffness: 200 });

    // Smooth springs for tilt
    const springRotateX = useSpring(rotateX, { damping: 25, stiffness: 150 });
    const springRotateY = useSpring(rotateY, { damping: 25, stiffness: 150 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Update Magnetic Position - move button towards mouse
        x.set(distanceX * (strength / 100));
        y.set(distanceY * (strength / 100));

        // Update Tilt - inverted for a more natural pop-up feel
        rotateX.set((centerY - e.clientY) * (tiltStrength / 100));
        rotateY.set((e.clientX - centerX) * (tiltStrength / 100));
    }, [x, y, rotateX, rotateY, strength, tiltStrength]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
        rotateX.set(0);
        rotateY.set(0);
    }, [x, y, rotateX, rotateY]);

    return (
        <div
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ 
                ...style, 
                perspective: 1000, 
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none'
            }}
            className={`relative group cursor-pointer ${className}`}
        >
            <motion.div
                style={{
                    x: springX,
                    y: springY,
                    rotateX: springRotateX,
                    rotateY: springRotateY,
                    transformStyle: 'preserve-3d',
                    clipPath,
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    zIndex: 10,
                    pointerEvents: 'none',
                    willChange: 'transform'
                }}
            >
                <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                    {children}
                </div>
            </motion.div>
            
            {/* Glow Effect Target */}
            {glowColor && (
                <div 
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0"
                    style={{ background: `radial-gradient(circle at center, ${glowColor}, transparent 60%)`, clipPath }}
                />
            )}
        </div>
    );
};

export default InteractiveButton;
