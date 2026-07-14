import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
      // Focus modal for screen readers
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div 
              ref={modalRef}
              tabIndex={-1}
              className={cn("bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh] outline-none", className)}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 id="modal-title" className="text-xl font-heading font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 focus:ring-2 focus:ring-primary outline-none"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
