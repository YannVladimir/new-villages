import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type ToastType } from '../../store/useToastStore';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  error:   <XCircle    size={18} className="text-red-500 shrink-0"   />,
  info:    <Info       size={18} className="text-blue-500 shrink-0"  />,
  warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
};

const borders: Record<ToastType, string> = {
  success: 'border-l-green-400',
  error:   'border-l-red-400',
  info:    'border-l-blue-400',
  warning: 'border-l-amber-400',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className={`
              pointer-events-auto flex items-start gap-3 bg-white rounded-xl shadow-xl 
              border border-gray-100 border-l-4 px-4 py-3
              ${borders[toast.type]}
            `}
          >
            {icons[toast.type]}
            <p className="flex-1 text-sm text-gray-800 font-medium leading-snug">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
