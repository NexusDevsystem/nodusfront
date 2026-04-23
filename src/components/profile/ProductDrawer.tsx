import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, UserProfile } from '../../types';
import { ShoppingCart, X } from 'lucide-react';
import InteractiveButton from '../animations/InteractiveButton';
import BackgroundLayer from '../BackgroundLayer';

interface ProductDrawerProps {
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;
    isPT: boolean;
    profile: UserProfile;
    currentTheme: any;
    effectiveFontFamily: string;
    getSmartTextColor: () => string | undefined;
    buttonClass: string;
    mainButtonStyle: React.CSSProperties;
    borderRadiusValue: any;
    isStatic: boolean;
    handleLinkClick: (id: string) => void;
    activeCollection: string | null;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({
    selectedProduct,
    setSelectedProduct,
    isPT,
    profile,
    currentTheme,
    effectiveFontFamily,
    getSmartTextColor,
    buttonClass,
    mainButtonStyle,
    borderRadiusValue,
    isStatic,
    handleLinkClick,
    activeCollection
}) => {
    if (!selectedProduct) return null;

    const contrastColor = getSmartTextColor();
    const isDark = profile.themeId.includes('dark') || profile.themeId.includes('black');

    return (
        <AnimatePresence>
            {selectedProduct && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedProduct(null)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.8 }}
                        className={`relative w-full max-w-lg overflow-hidden flex flex-col shadow-2xl pointer-events-auto ${currentTheme.backgroundClass}`}
                        style={{
                            backgroundColor: (profile.themeId === 'custom' && profile.customSolidColor) ? profile.customSolidColor : undefined,
                            color: contrastColor,
                            fontFamily: effectiveFontFamily,
                            borderTopLeftRadius: borderRadiusValue === 0 ? '0px' : '32px',
                            borderTopRightRadius: borderRadiusValue === 0 ? '0px' : '32px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                            height: 'auto',
                            maxHeight: '92%',
                            willChange: 'transform'
                        }}
                    >
                        <BackgroundLayer
                            profile={{ ...profile, headerLayout: 'classico' }}
                            currentTheme={currentTheme}
                            isStatic={isStatic}
                        />

                        {/* Drag Handle & Close */}
                        <div className="flex justify-center pt-3 pb-1 relative z-10 shrink-0">
                            <div className="w-12 h-1.5 rounded-full bg-white/20" />
                        </div>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-6 p-2 rounded-full hover:bg-black/10 transition-colors z-[60] bg-white/10 backdrop-blur-md"
                        >
                            <X size={24} strokeWidth={2.5} style={{ color: contrastColor }} />
                        </button>

                        {/* Product Info Content */}
                        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-10 relative z-10">
                            {/* Large Image */}
                            <div className="w-full px-6 flex justify-center">
                                <div className="w-full aspect-square overflow-hidden rounded-md relative shadow-xl">
                                    <img
                                        src={selectedProduct.image}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedProduct.discountCode && (
                                        <div className="absolute top-4 left-4 bg-[#ffdf00] text-black text-[10px] px-3 py-1.5 rounded-md shadow-xl tracking-tight uppercase border-2 border-black" 
                                            style={{ fontWeight: profile.fontWeight || '900' }}>
                                            {isPT ? 'CUPOM:' : 'COUPON:'} {selectedProduct.discountCode}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Text Details */}
                            <div className="px-8 py-8 space-y-6">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="text-3xl sm:text-4xl uppercase tracking-tight leading-tight" style={{ fontFamily: effectiveFontFamily, fontWeight: profile.fontWeight || '900' }}>
                                            {selectedProduct.name}
                                        </h4>
                                        <div className="flex items-center justify-center gap-3 mt-4">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-sm sm:text-lg opacity-30 uppercase tracking-widest" style={{ fontWeight: profile.fontWeight || '900' }}>{isPT ? 'R$' : '$'}</span>
                                                <span className="text-5xl sm:text-6xl font-black tracking-tighter">
                                                    {(() => {
                                                        const clean = String(selectedProduct.price || '').replace(/[^\d,.]/g, '').replace(',', '.');
                                                        const val = parseFloat(clean);
                                                        if (isNaN(val)) return '0,00';
                                                        return new Intl.NumberFormat(isPT ? 'pt-BR' : 'en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }).format(val);
                                                    })()}
                                                </span>
                                            </div>
                                            {selectedProduct.discountCode && (
                                                <div className="bg-[#97cd7a] text-[#1a3a16] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shadow-sm">
                                                    {isPT ? 'DESCONTO ATIVO' : 'DISCOUNT ACTIVE'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Buying CTA */}
                                <div className="mt-4">
                                    <InteractiveButton strength={15} tiltStrength={0}>
                                        <a
                                            href={selectedProduct.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => handleLinkClick(selectedProduct.id)}
                                            className={`w-full py-6 flex items-center justify-center gap-4 transition-all duration-300 transform active:scale-[0.98] ${buttonClass}`}
                                            style={{
                                                ...mainButtonStyle,
                                                borderRadius: borderRadiusValue,
                                                fontSize: '18px',
                                                fontWeight: 900,
                                                letterSpacing: '0.05em',
                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <div className="flex items-center justify-center gap-4" style={{ color: contrastColor }}>
                                                <ShoppingCart size={24} strokeWidth={2.5} />
                                                <span className="uppercase">{isPT ? 'COMPRAR AGORA' : 'BUY NOW'}</span>
                                            </div>
                                        </a>
                                    </InteractiveButton>
                                </div>

                                <p className="text-[10px] text-center opacity-30 font-black uppercase tracking-[0.2em] pt-4">
                                    {isPT ? 'Vendido por' : 'Sold by'} {activeCollection || profile.name}
                                </p>
                            </div>
                        </div>
                        <div className="h-10 w-full shrink-0" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductDrawer;
