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

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!userProfile) return <Navigate to="/onboarding" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  if (currentUser && userProfile) return <Navigate to="/" replace />;
  if (currentUser && !userProfile) return <Navigate to="/onboarding" replace />;
  return children;
};

const OnboardingRoute = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userProfile) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Onboarding Route */}
          <Route path="/onboarding" element={<OnboardingRoute><Wizard /></OnboardingRoute>} />

          {/* Protected Main App Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="diet" element={<DietTab />} />
            <Route path="exercise" element={<ExerciseList />} />
            <Route path="progress" element={<ProgressTab />} />
            <Route path="profile" element={<ProfileTab />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
