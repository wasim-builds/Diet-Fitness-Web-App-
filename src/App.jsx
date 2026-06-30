import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import Layout from './components/Layout';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import Wizard from './features/onboarding/Wizard';
import Dashboard from './features/dashboard/Dashboard';
import DietTab from './features/diet/DietTab';
import ExerciseList from './features/exercise/ExerciseList';
import ProgressTab from './features/progress/ProgressTab';
import ProfileTab from './features/profile/ProfileTab';
import Community from './features/community/Community';
import AICoach from './features/aicoach/AICoach';
import LandingPage from './features/landing/LandingPage';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0B1120]"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!userProfile) return <Navigate to="/onboarding" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0B1120]"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (currentUser && userProfile) return <Navigate to="/dashboard" replace />;
  if (currentUser && !userProfile) return <Navigate to="/onboarding" replace />;
  return children;
};

const OnboardingRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0B1120]"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userProfile) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="app-bg"></div>
      <div className="app-bg-overlay"></div>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Onboarding Route */}
          <Route path="/onboarding" element={<OnboardingRoute><Wizard /></OnboardingRoute>} />

          {/* Protected Main App Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="diet" element={<DietTab />} />
            <Route path="exercise" element={<ExerciseList />} />
            <Route path="progress" element={<ProgressTab />} />
            <Route path="settings" element={<ProfileTab />} />
            <Route path="community" element={<Community />} />
            <Route path="aicoach" element={<AICoach />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
