import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import InventoryList from './pages/Inventory/InventoryList';
import BookingsPage from './pages/Bookings';
import FormsPage from './pages/Forms';
import ContactsPage from './pages/Contacts';
import InboxPage from './pages/Inbox';
import StaffPage from './pages/Staff';
import SettingsPage from './pages/Settings';
import OnboardingPage from './pages/Onboarding';
import LandingPage from './pages/Landing';
import PublicBookingPage from './pages/Public/BookingPage';
import PublicFormPage from './pages/Public/FormPage';
import AuthCallback from './pages/AuthCallback';
import './index.css';

import { SocketProvider, useSocket } from './context/SocketContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { useEffect } from 'react';


const AuthenticatedLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const AppContent = () => {
  const { socket } = useSocket();
  const { showToast } = useToast();

  useEffect(() => {
    if (!socket) return;

    socket.on('booking:created', (data: any) => {
      showToast(`New booking: ${data.serviceTypeName} with ${data.contactName}`, 'success');
    });

    socket.on('message:received', (data: any) => {
      showToast(`New message from ${data.contactName}`, 'info');
    });

    return () => {
      socket.off('booking:created');
      socket.off('message:received');
    };
  }, [socket, showToast]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/book/:slug" element={<PublicBookingPage />} />
      <Route path="/f/:id" element={<PublicFormPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
