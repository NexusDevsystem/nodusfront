import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ClickSpark from './components/animations/ClickSpark';
import CustomCursor from './components/animations/CustomCursor';
import FileRedirect from './components/FileRedirect';

// Lazy loading pages
const EditorPage = lazy(() => import('./pages/EditorPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const CookieBanner = lazy(() => import('./components/CookieBanner'));

export default function App() {
  return (
    <ClickSpark
      sparkColor='#fef08a'
      sparkSize={24}
      sparkRadius={50}
      sparkCount={8}
      duration={400}
    >
      <CustomCursor />
      <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#97cd7a] border-t-transparent rounded-full animate-spin"></div></div>}>
        <CookieBanner />
        <Routes>
          {/* 🎯 Branded File Link System (High Priority) */}
          <Route path="/arquivo/*" element={<FileRedirect />} />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment/success" element={<CheckoutSuccessPage />} />
          
          {/* Protected routes */}
          <Route
            path="/editor"
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

          {/* General content routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />

          {/* Public Profile (Dynamic Username) */}
          <Route path="/:username" element={<PublicProfilePage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/editor" replace />} />
        </Routes>
      </Suspense>
    </ClickSpark>
  );
}