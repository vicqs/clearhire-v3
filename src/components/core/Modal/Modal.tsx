import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm bg-slate-900/50 dark:bg-slate-900/70 z-[9998]"
            onClick={onClose}
          />

          {/* Modal Container - Top aligned */}
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 p-4 pointer-events-none overflow-y-auto">
            <div className="w-full max-w-lg pointer-events-auto my-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`backdrop-blur-md bg-white/95 dark:bg-slate-800/95 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden ${className}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
                    <button
                      onClick={onClose}
                      className="touch-target p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="Cerrar"
                    >
                      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                )}

                {/* Content with scroll */}
                <div className="p-6 max-h-[calc(80vh-8rem)] overflow-y-auto">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
