import { motion } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  children: React.ReactNode;
  fullScreen?: boolean;
}

export default function MobileBottomSheet({ isOpen, onClose, onBack, title, children, fullScreen }: Props) {

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        className={`fixed inset-0 bg-black/50 md:hidden ${fullScreen ? 'z-[55]' : 'z-40'}`}
        onClick={onClose}
      />
      <motion.div
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: { y: 0 },
          closed: { y: '100%' },
        }}
        transition={{ duration: 0 }}
        className={`fixed bottom-0 left-0 right-0 bg-[#fdfcf0] border-t-4 border-black shadow-[0_-12px_24px_rgba(0,0,0,0.15)] flex flex-col md:hidden
          ${fullScreen ? 'h-[calc(100%-80px)] z-[60] rounded-none' : 'h-[70dvh] max-h-[70dvh] z-40 rounded-t-3xl'}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-dashed border-black/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={(e) => { e.stopPropagation(); onBack(); }}
                className="p-1 -ml-1 hover:bg-black/5 rounded-lg transition-colors border-2 border-transparent active:border-black/10 text-black"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>
            )}
            {title && (
              <h2 className="text-xl font-black uppercase text-black italic tracking-tighter leading-none">{title}</h2>
            )}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors border-2 border-transparent active:border-black/10 text-black"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Content with Scroll */}
        <div className={`flex-1 overflow-y-auto px-4 pt-4 custom-scrollbar ${fullScreen ? 'pb-10' : 'pb-28'}`}>
          {children}
        </div>
      </motion.div>
    </>
  );
}
