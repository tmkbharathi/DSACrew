import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCheck, Bell, Award, MessageSquare, PlusCircle, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, activeRoomId, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  const roomNotifications = notifications.filter((n) => n.roomId === activeRoomId);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'NEW_PROBLEM':
        return <PlusCircle className="w-5 h-5 text-cyan-400" />;
      case 'PROBLEM_SOLVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
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
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col z-10">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Notifications</h3>
            {roomNotifications.some((n) => !n.read) && (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                {roomNotifications.filter((n) => !n.read).length} New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {roomNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p>No notifications yet for this room.</p>
            </div>
          ) : (
            roomNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-800/80 border-emerald-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500 shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    {notif.authorName && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {notif.authorAvatar && (
                          <img src={notif.authorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
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
