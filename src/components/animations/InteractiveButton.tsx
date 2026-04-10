import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveButtonProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
    strength?: number; // Kept for prop compat
    tiltStrength?: number; // Kept for prop compat
    glowColor?: string; // Color for the hover glow effect
    clipPath?: string; // HEX or polygon clip-path
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
    children,
    className = '',
    style = {},
    onClick,
    glowColor,
    clipPath
}) => {
    return (
        <div
            onClick={onClick}
            style={{ 
                ...style, 
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none'
            }}
            className={`relative group cursor-pointer ${className}`}
        >
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                    clipPath,
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    zIndex: 10,
                    borderRadius: 'inherit'
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
