import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Mail, Calendar, Bell, Megaphone } from 'lucide-react';
import { Button } from '../ui/Button';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../lib/format';
import type { NotificationType } from '../../types/notification';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS: Record<NotificationType, React.ReactNode> = {
  MESSAGE: <MessageSquare size={16} className="text-blue-500" />,
  INVITATION: <Mail size={16} className="text-green-500" />,
  EVENT: <Calendar size={16} className="text-purple-500" />,
  ANNOUNCEMENT: <Bell size={16} className="text-amber-500" />,
  SYSTEM: <Megaphone size={16} className="text-gray-500" />,
};

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const { data } = useNotifications(0, 30);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.content ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                <h2 className="font-heading font-bold text-lg">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()} className="text-xs">
                  Mark all read
                </Button>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => !notif.isRead && markRead.mutate(notif.id)}
                    className={`w-full text-left p-4 flex gap-3 transition-colors ${!notif.isRead ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                  >
                    <div className="mt-1 shrink-0 p-1.5 bg-gray-50 rounded-lg">
                      {ICONS[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(notif.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.description}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
