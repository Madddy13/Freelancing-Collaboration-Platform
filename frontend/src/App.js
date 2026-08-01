// src/App.jsx
// Root router with React.lazy + Suspense for code splitting and CLS prevention.

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import { SkeletonCard } from './components/ui/Skeleton';

// ── Public pages (loaded eagerly — small, needed immediately) ──
import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';

// ── Auth pages ──
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage    = lazy(() => import('./pages/VerifyEmailPage'));

// ── Protected pages (lazy loaded for performance) ──
const DashboardPage        = lazy(() => import('./pages/DashboardPage'));
const ProjectListPage      = lazy(() => import('./pages/ProjectListPage'));
const MyProjectsPage       = lazy(() => import('./pages/MyProjectsPage'));
const ProjectHistoryPage   = lazy(() => import('./pages/ProjectHistoryPage'));
const CreateProjectPage    = lazy(() => import('./pages/CreateProjectPage'));
const ManageApplicantsPage = lazy(() => import('./pages/ManageApplicantsPage'));
const TeamPage             = lazy(() => import('./pages/TeamPage'));
const KanbanPage           = lazy(() => import('./pages/KanbanPage'));
const ChatPage             = lazy(() => import('./pages/ChatPage'));
const ProfilePage          = lazy(() => import('./pages/ProfilePage'));

// ── Admin Pages (lazy loaded) ──
const AdminUsersPage       = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminProjectsPage    = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminCategoriesPage  = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminReportsPage     = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminActivityPage    = lazy(() => import('./pages/admin/AdminActivityPage'));

// Global fallback loader used inside Suspense
function PageLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '20px',
      padding: '28px', maxWidth: '1000px', width: '100%', margin: '0 auto'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

// ── Protected Route Guard ──
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function ProjectsGuard({ children }) {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  if (user.role === 'ROLE_CLIENT') {
    return <Navigate to="/my-projects" replace />;
  }
  return children;
}

// ── Role Guard: Admins only ──
function AdminGuard({ children }) {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  if (user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── PUBLIC ROUTES ── */}
        <Route path="/"          element={<LandingPage />}  />
        <Route path="/login"     element={<LoginPage />}    />
        <Route path="/register"  element={<RegisterPage />} />

        <Route path="/forgot-password" element={
          <Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>
        } />
        <Route path="/reset-password" element={
          <Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>
        } />
        <Route path="/verify-email" element={
          <Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>
        } />

        {/* ── PROTECTED ROUTES (Sidebar Layout) ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsGuard>
              <AppShell>
                <Suspense fallback={<PageLoader />}><ProjectListPage /></Suspense>
              </AppShell>
            </ProjectsGuard>
          </ProtectedRoute>
        } />

        <Route path="/my-projects" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><MyProjectsPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="/project-history" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><ProjectHistoryPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="/create-project" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><CreateProjectPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="/manage-applicants" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><ManageApplicantsPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/manage-applicants/:projectId" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><ManageApplicantsPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="/team" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><TeamPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/team/:projectId" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><TeamPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="/kanban" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><KanbanPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/kanban/:projectId" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><KanbanPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><ChatPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/chat/:projectId" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><ChatPage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>
            </AppShell>
          </ProtectedRoute>
        } />

        {/* ── ADMIN ROUTES ── */}
        <Route path="/admin/users" element={
          <ProtectedRoute><AdminGuard><AppShell><Suspense fallback={<PageLoader />}>
            <AdminUsersPage />
          </Suspense></AppShell></AdminGuard></ProtectedRoute>
        } />
        <Route path="/admin/projects" element={
          <ProtectedRoute><AdminGuard><AppShell><Suspense fallback={<PageLoader />}>
            <AdminProjectsPage />
          </Suspense></AppShell></AdminGuard></ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute><AdminGuard><AppShell><Suspense fallback={<PageLoader />}>
            <AdminCategoriesPage />
          </Suspense></AppShell></AdminGuard></ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute><AdminGuard><AppShell><Suspense fallback={<PageLoader />}>
            <AdminReportsPage />
          </Suspense></AppShell></AdminGuard></ProtectedRoute>
        } />
        <Route path="/admin/activity" element={
          <ProtectedRoute><AdminGuard><AppShell><Suspense fallback={<PageLoader />}>
            <AdminActivityPage />
          </Suspense></AppShell></AdminGuard></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;