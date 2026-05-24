import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AuthGuard } from '@/guards/AuthGuard';
import { AdminGuard } from '@/guards/AdminGuard';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ToastProvider } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';

// ── Lazy page imports ─────────────────────────────────────────────────────
// Public
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// App
const Home = lazy(() => import('@/pages/Home'));
const LogContext = lazy(() => import('@/pages/log/LogContext'));
const LogDate = lazy(() => import('@/pages/log/LogDate'));
const LogEntry = lazy(() => import('@/pages/log/LogEntry'));
const RecallYear = lazy(() => import('@/pages/recall/RecallYear'));
const RecallMonth = lazy(() => import('@/pages/recall/RecallMonth'));
const RecallDetail = lazy(() => import('@/pages/recall/RecallDetail'));
const Teammates = lazy(() => import('@/pages/management/Teammates'));
const Projects = lazy(() => import('@/pages/management/Projects'));
const Tags = lazy(() => import('@/pages/management/Tags'));
const Templates = lazy(() => import('@/pages/management/Templates'));
const ChatHistory = lazy(() => import('@/pages/ChatHistory'));
const Settings = lazy(() => import('@/pages/Settings'));
const Admin = lazy(() => import('@/pages/Admin'));

// ── Loading fallback ──────────────────────────────────────────────────────

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F0F]">
      <Spinner size={28} className="text-accent" />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const { initialize, isInitialized } = useAuthStore();

  // Hydrate session from refresh-token cookie on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthLayout>
                  <Signup />
                </AuthLayout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AuthLayout showBackToHome={false}>
                  <ForgotPassword />
                </AuthLayout>
              }
            />
            <Route
              path="/reset-password"
              element={
                <AuthLayout showBackToHome={false}>
                  <ResetPassword />
                </AuthLayout>
              }
            />

            {/* Protected app routes */}
            <Route
              path="/home"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Home />
                  </AppLayout>
                </AuthGuard>
              }
            />

            {/* Log flow */}
            <Route
              path="/log"
              element={
                <AuthGuard>
                  <AppLayout>
                    <LogContext />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/log/date"
              element={
                <AuthGuard>
                  <AppLayout>
                    <LogDate />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/log/entry"
              element={
                <AuthGuard>
                  <AppLayout>
                    <LogEntry />
                  </AppLayout>
                </AuthGuard>
              }
            />

            {/* Recall flow */}
            <Route
              path="/recall"
              element={
                <AuthGuard>
                  <AppLayout>
                    <RecallYear />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/recall/:year"
              element={
                <AuthGuard>
                  <AppLayout>
                    <RecallMonth />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/recall/:year/:month"
              element={
                <AuthGuard>
                  <AppLayout>
                    <RecallDetail />
                  </AppLayout>
                </AuthGuard>
              }
            />

            {/* Management */}
            <Route
              path="/teammates"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Teammates />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/projects"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Projects />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/tags"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Tags />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/templates"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Templates />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/chat-history"
              element={
                <AuthGuard>
                  <AppLayout>
                    <ChatHistory />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </AuthGuard>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}
