import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Layout from './components/layout/Layout';

// Landing pages
import Home from './pages/landing/Home';
import About from './pages/landing/About';
import Features from './pages/landing/Features';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/auth/Onboarding';

// Main pages
import Dashboard from './pages/dashboard/Dashboard';
import Exercises from './pages/exercises/Exercises';
import Nutrition from './pages/nutrition/Nutrition';
import Monitoring from './pages/monitoring/Monitoring';
import Predictions from './pages/predictions/Predictions';
import Medications from './pages/medications/Medications';
import Chat from './pages/chat/Chat';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/profile/Profile';
import VRDigitalTwin from './pages/vr/VRDigitalTwin';

// Smart AI Features
import SymptomChecker from './pages/smart/SymptomChecker';
import DrugInteraction from './pages/smart/DrugInteraction';
import HealthReport from './pages/smart/HealthReport';
import MealPlanner from './pages/smart/MealPlanner';
import HealthJournal from './pages/smart/HealthJournal';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Landing Pages */}
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
        <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* Protected Routes with Layout */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="exercises" element={<Exercises />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="medications" element={<Medications />} />
          <Route path="chat" element={<Chat />} />
          <Route path="vr" element={<VRDigitalTwin />} />
          <Route path="symptoms" element={<SymptomChecker />} />
          <Route path="drug-check" element={<DrugInteraction />} />
          <Route path="health-report" element={<HealthReport />} />
          <Route path="meal-planner" element={<MealPlanner />} />
          <Route path="journal" element={<HealthJournal />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Profile />} />

          {/* Admin Routes */}
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Route>

        {/* Legacy routes redirect to /app/* */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/exercises" element={<Navigate to="/app/exercises" replace />} />
        <Route path="/nutrition" element={<Navigate to="/app/nutrition" replace />} />
        <Route path="/monitoring" element={<Navigate to="/app/monitoring" replace />} />
        <Route path="/predictions" element={<Navigate to="/app/predictions" replace />} />
        <Route path="/medications" element={<Navigate to="/app/medications" replace />} />
        <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
        <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
        <Route path="/admin" element={<Navigate to="/app/admin" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
