import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

import ToastContainer from './components/ToastContainer';

const AuthenticatedLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
