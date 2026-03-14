import React from 'react';
import { motion } from 'framer-motion';

interface GlitchButtonProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
}

const GlitchButton: React.FC<GlitchButtonProps> = ({
    children,
    className = '',
    style = {},
    onClick
}) => {
    return (
        <motion.div
            onClick={onClick}
            style={style}
            className={`relative group cursor-pointer overflow-hidden ${className}`}
            whileHover="hover"
        >
            {/* Primary Content */}
            <div className="relative z-10">{children}</div>

            {/* Glitch Layers */}
            <motion.div
                className="absolute inset-0 bg-red-500/20 mix-blend-screen pointer-events-none z-0 hidden group-hover:block"
                variants={{
                    hover: {
                        x: [-2, 2, -1, 0],
                        y: [0, -1, 1, 0],
                        transition: { repeat: Infinity, duration: 0.1 }
                    }
                }}
            />
            <motion.div
                className="absolute inset-0 bg-blue-500/20 mix-blend-screen pointer-events-none z-0 hidden group-hover:block"
                variants={{
                    hover: {
                        x: [2, -2, 1, 0],
                        y: [0, 1, -1, 0],
                        transition: { repeat: Infinity, duration: 0.1, delay: 0.05 }
                    }
                }}
            />

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-20 opacity-0 group-hover:opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </motion.div>
    );
};

export default GlitchButton;
