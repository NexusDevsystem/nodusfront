import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BrutalistLoader from './BrutalistLoader';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, onboardingCompleted, loading, profile, authError } = useAuth();
    const location = window.location.pathname;

    if (loading) {
        return <BrutalistLoader message="Autenticando..." progress={25} />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If there was a server error (timeout, 500, etc.), don't redirect to onboarding.
    // That would be misleading. Instead, we stay on the current page or let the 
    // context handle the error display.
    if (authError) {
        return <Navigate to="/login" replace state={{ error: authError }} />;
    }

    // Only redirect to onboarding if:
    // 1. We're NOT loading
    // 2. User is authenticated (checked above)
    // 3. We explicitly know onboarding is NOT completed, 
    // AND the profile row was successfully fetched (even if empty, but not failed due to auth)
    if (!onboardingCompleted && location !== '/onboarding') {
        // Double check: if profile is null but user exists, it's definitely a new user
        // If profile exists but onboardingCompleted is false, it's also a new user
        return <Navigate to="/onboarding" replace />;
    }

    if (onboardingCompleted && location === '/onboarding') {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
