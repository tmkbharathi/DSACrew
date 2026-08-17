import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toast, setToast } = useApp();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="glass-panel border-emerald-500/30 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md glow-emerald">
        {getIcon()}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
        </div>
        <button
          onClick={() => setToast(null)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
