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
            style={{ ...style, clipPath, WebkitTapHighlightColor: 'transparent', outline: 'none' }}
            className={`relative cursor-pointer transition-shadow outline-none ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default ElasticButton;
