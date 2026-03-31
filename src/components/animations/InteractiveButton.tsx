import React, { useRef, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface InteractiveButtonProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
    strength?: number; // Strength of the magnetic pull
    tiltStrength?: number; // Strength of the tilt effect
    glowColor?: string; // Color for the hover glow effect
    clipPath?: string; // HEX or polygon clip-path
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
    children,
    className = '',
    style = {},
    onClick,
    strength = 6,
    tiltStrength = 4,
    glowColor,
    clipPath
}) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    
    // Magnetic motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Tilt motion values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    // Smooth springs for magnetic pull
    const springX = useSpring(x, { damping: 25, stiffness: 400 });
    const springY = useSpring(y, { damping: 25, stiffness: 400 });
    
    // Smooth springs for tilt
    const springRotateX = useSpring(rotateX, { damping: 30, stiffness: 300 });
    const springRotateY = useSpring(rotateY, { damping: 30, stiffness: 300 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - rect.left;
        const distanceY = e.clientY - rect.top;


        // Update Magnetic Position
        x.set((e.clientX - centerX) * (strength / 100));
        y.set((e.clientY - centerY) * (strength / 100));

        // Update Tilt
        rotateX.set(-(e.clientY - centerY) * (tiltStrength / 100));
        rotateY.set((e.clientX - centerX) * (tiltStrength / 100));
    }, [x, y, rotateX, rotateY, strength, tiltStrength]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
        rotateX.set(0);
        rotateY.set(0);
    }, [x, y, rotateX, rotateY]);

    return (
        <motion.div
            ref={buttonRef}
            onMouseMove={handleMouseMove}
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
                clipPath,
                overflow: clipPath ? 'hidden' : 'visible'
            }}
            className={`relative cursor-pointer cursor-target ${className}`}
        >

            {children}
        </motion.div>
    );
};

export default InteractiveButton;
