import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCheck, Bell, Award, MessageSquare, PlusCircle, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, activeRoomId, markNotificationRead, markAllNotificationsRead } = useApp();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roomNotifications = notifications.filter((n) => n.roomId === activeRoomId);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'NEW_PROBLEM':
        return <PlusCircle className="w-5 h-5 text-cyan-400" />;
      case 'PROBLEM_SOLVED':
        return <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />;
      case 'STREAK_MILESTONE':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'COMMENT':
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#1c2024] border-l border-[#3d4a3e] h-full shadow-2xl flex flex-col z-10">
        <div className="p-4 sm:p-5 border-b border-[#3d4a3e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#4ade80]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">Notifications</h3>
            {roomNotifications.some((n) => !n.read) && (
              <span className="bg-[#4ade80]/15 text-[#4ade80] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#4ade80]/30">
                {roomNotifications.filter((n) => !n.read).length} New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-slate-400 hover:text-[#4ade80] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#262a2f] transition-colors font-mono"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#262a2f] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {roomNotifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
              <p>No notifications yet for this room.</p>
            </div>
          ) : (
            roomNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-[#101418]/60 border-[#3d4a3e]/50 opacity-80 hover:opacity-100'
                    : 'bg-[#101418] border-[#4ade80]/40 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate font-sans">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    {notif.authorName && (
                      <div className="flex items-center gap-1.5 mt-2 font-mono">
                        {notif.authorAvatar && (
                          <img src={notif.authorAvatar} alt="" className="w-4 h-4 rounded-full object-cover border border-[#3d4a3e]" />
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">{notif.authorName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
