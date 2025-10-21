import React from 'react';
import { useSelector } from 'react-redux';
import { selectNotifications } from '../../store/slices/uiSlice';

const NotificationContainer = () => {
  const notifications = useSelector(selectNotifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : notification.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : notification.type === 'warning'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
