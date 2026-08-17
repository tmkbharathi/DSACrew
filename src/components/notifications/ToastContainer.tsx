import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toast, setToast } = useApp();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#3fb950] shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-[#3fb950] shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] pointer-events-auto max-w-md w-full px-4 sm:px-0">
      <div className="bg-[#161b22] border border-[#30363d] text-white px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3 w-full">
        <div className="pt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white font-sans">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-sans break-words">{toast.message}</p>
        </div>
        <button
          onClick={() => setToast(null)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#21262d] transition-colors shrink-0"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
