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
        className={`fixed inset-0 bg-black/80 backdrop-blur-md md:hidden ${fullScreen ? 'z-[55]' : 'z-40'}`}
        onClick={onClose}
      />
      <motion.div
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: { y: 0, opacity: 1 },
          closed: { y: '100%', opacity: 0 },
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed bottom-0 left-0 right-0 bg-[#fdfcf0] flex flex-col md:hidden
          ${fullScreen ? 'h-[100dvh] z-[80] rounded-none border-t-0' : 'h-[75vh] z-[60] border-t-4 border-black rounded-t-[40px]'}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-dashed border-black/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={(e) => { e.stopPropagation(); onBack(); }}
                className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-md group"
              >
                <ChevronLeft size={24} strokeWidth={4} />
              </button>
            )}
            {title && (
              <h2 className="text-xl font-black uppercase text-black italic tracking-tighter leading-none">{title}</h2>
            )}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-md group"
          >
            <X size={24} strokeWidth={4} />
          </button>
        </div>

        {/* Content with Scroll */}
        <div className={`flex-1 overflow-y-auto px-4 pt-4 custom-scrollbar ${fullScreen ? 'pb-32' : 'pb-28'}`}>
          {children}
        </div>
      </motion.div>
    </>
  );
}
