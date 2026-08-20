import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toast, setToast, theme } = useApp();
  const isIllustrative = theme === 'illustrative';

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
        return <CheckCircle className={`w-5 h-5 shrink-0 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />;
      case 'info':
        return <Info className={`w-5 h-5 shrink-0 ${isIllustrative ? 'text-[#0284c7]' : 'text-cyan-400'}`} />;
      case 'warning':
        return <AlertTriangle className={`w-5 h-5 shrink-0 ${isIllustrative ? 'text-[#d97706]' : 'text-amber-400'}`} />;
      default:
        return <Bell className={`w-5 h-5 shrink-0 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] pointer-events-auto max-w-md w-full px-4 sm:px-0">
      <div
        className={`px-4 py-3.5 rounded-2xl shadow-2xl flex items-start gap-3 w-full border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#161b22] border-[#30363d] text-white'
        }`}
      >
        <div className="pt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-bold font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>{toast.title}</h4>
          <p className={`text-xs mt-0.5 leading-relaxed font-sans break-words ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>{toast.message}</p>
        </div>
        <button
          onClick={() => setToast(null)}
          className={`p-1 rounded-lg transition-colors shrink-0 ${
            isIllustrative
              ? 'text-[#8d9a93] hover:text-[#212d27] hover:bg-[#fbf7ee]'
              : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
          }`}
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
