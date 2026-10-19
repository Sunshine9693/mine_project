import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileNavigation from './components/MobileNavigation';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import { AuthProvider, useAuth } from './context/AuthContext';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Placeholder = lazy(() => import('./pages/Placeholder'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const Conversations = lazy(() => import('./pages/Conversations'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const RemindersPage = lazy(() => import('./pages/RemindersPage'));
const UtilitiesPage = lazy(() => import('./pages/UtilitiesPage'));

class RouteErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('[AURA Route Loading Error]:', error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex flex-1 items-center justify-center text-xs font-semibold tracking-[0.35rem] text-aura-primary-purple uppercase">
          Unable to load this page. Please refresh.
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const location = useLocation();

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
    <RouteErrorBoundary key={location.pathname}>
      <Suspense fallback={<div className="flex flex-1 items-center justify-center"><Loader size="sm" /></div>}>
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
          <Route path="/utilities" element={<ProtectedRoute><UtilitiesPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Placeholder /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Catch all / Redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
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
