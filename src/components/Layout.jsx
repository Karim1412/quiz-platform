// Layout is no longer used — each page manages its own header.
// Kept as an empty passthrough to avoid import errors if referenced anywhere.
import { Outlet } from 'react-router-dom';
import NotificationStack from './Notification.jsx';

export default function Layout() {
  return (
    <>
      <Outlet />
      <NotificationStack />
    </>
  );
}
