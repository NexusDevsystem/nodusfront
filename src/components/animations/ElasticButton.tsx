import React from 'react';
import { motion } from 'framer-motion';

interface ElasticButtonProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
    clipPath?: string;
}

const ElasticButton: React.FC<ElasticButtonProps> = ({
    children,
    className = '',
    style = {},
    onClick,
    clipPath
}) => {
    return (
        <motion.div
            whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            whileTap={{ 
                scale: 0.95,
                transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            onClick={onClick}
            style={{ ...style, clipPath }}
            className={`relative cursor-pointer transition-shadow ${className}`}
        >
            {children}
            
            {/* Subtle jelly effect overlay */}
            <motion.div
                className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{ clipPath }}
                initial={false}
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </motion.div>
    );
};

export default ElasticButton;
