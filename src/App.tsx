import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import EditorPage from './pages/EditorPage';
import LandingPage from './pages/LandingPage';
import PublicProfilePage from './pages/PublicProfilePage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/payment/success" element={<CheckoutSuccessPage />} />
            {/* Protected routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Public Profile (Dynamic Username) */}
            <Route path="/:username" element={<PublicProfilePage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  );
}