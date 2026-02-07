import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, onboardingCompleted, loading, profile } = useAuth();
    const location = window.location.pathname;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="mb-8">
                    <span className="text-3xl font-black tracking-tight text-slate-800">
                        N<span className="text-[#acc8a2]">o</span>dus
                    </span>
                </div>
                <div className="relative w-12 h-12">
                    <svg className="animate-spin w-full h-full text-[#acc8a2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!onboardingCompleted && location !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    if (onboardingCompleted && location === '/onboarding') {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
