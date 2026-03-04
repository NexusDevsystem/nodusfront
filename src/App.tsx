import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Lazy loading pages
const EditorPage = lazy(() => import('./pages/EditorPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#97cd7a] border-t-transparent rounded-full animate-spin"></div></div>}>
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  );
}