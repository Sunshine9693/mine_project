import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileNavigation from './components/MobileNavigation';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Login from './pages/Login';
import Register from './pages/Register';
import Placeholder from './pages/Placeholder';
import Conversations from './pages/Conversations';
import NotesPage from './pages/NotesPage';
import TasksPage from './pages/TasksPage';
import RemindersPage from './pages/RemindersPage';

// Layout wrapper to conditional render Sidebar and Mobile Nav
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isLanding || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-aura p-0 lg:p-4 gap-4 relative overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-4 md:px-8 py-6 pb-24 lg:pb-6 overflow-y-auto max-h-screen lg:max-h-[calc(100vh-2rem)] glass-card lg:rounded-[30px] border-0 lg:border border-white/60 shadow-[0_15px_50px_rgba(120,80,160,0.04)] my-0 lg:my-4 mr-0 lg:mr-4">
        {children}
      </main>

      {/* Mobile Navigation Bottom Bar */}
      <MobileNavigation />
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-aura">
        <div className="text-xs font-semibold tracking-[0.35rem] text-aura-primary-purple uppercase">
          Loading AURA
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing / Welcome Screen */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected Main Dashboard Pages */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
      <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
      <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Placeholder /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Placeholder /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Placeholder /></ProtectedRoute>} />

      {/* Catch all / Redirect */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <LayoutWrapper>
          <AppRoutes />
        </LayoutWrapper>
      </Router>
    </AuthProvider>
  );
};

export default App;
