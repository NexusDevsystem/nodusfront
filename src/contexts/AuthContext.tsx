import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, API_URL } from '../services/apiClient';

interface AuthContextType {
    user: any | null;
    profile: any | null;
    loading: boolean;
    onboardingCompleted: boolean;
    signInWithProfile: (googleUser: any, token: string) => Promise<{ error: any }>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    registerWithEmail: (email: string, password: string, name: string, username: string) => Promise<{ error: any }>;
    signOut: () => void;
    setProfile: React.Dispatch<React.SetStateAction<any | null>>;
    token: string | null;
    authError: string | null;
    stripeConfig: { publishableKey: string; env: string } | null;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe localStorage setter that handles quota errors
const safeSetItem = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            // Clear snapshot data (less critical than auth data)
            localStorage.removeItem('nodus_profile_snapshot');
            localStorage.removeItem('nodus_links_snapshot');
            localStorage.removeItem('nodus_products_snapshot');
            try {
                localStorage.setItem(key, value);
            } catch (retryError) {
                // Still failing, need more aggressive cleanup
                const token = localStorage.getItem('nodus_access_token');
                localStorage.clear();
                if (token) {
                    localStorage.setItem('nodus_access_token', token);
                }
                try {
                    localStorage.setItem(key, value);
                } catch (finalError) {
                    // Silently handle storage errors
                }
            }
        }
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(() => {
        const saved = localStorage.getItem('nodus_user');
        return saved ? JSON.parse(saved) : null;
    });
    // Profile is no longer cached - always fetch from API
    const [profile, setProfile] = useState<any | null>(null);
    // Always start with loading=true to fetch fresh profile data
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(localStorage.getItem('nodus_access_token'));
    const [authError, setAuthError] = useState<string | null>(null);
    const [stripeConfig, setStripeConfig] = useState<{ publishableKey: string; env: string } | null>(null);

    const getOrCreateProfile = async () => {
        try {
            setAuthError(null);
            // Fetch fresh profile data via Backend
            const profileData = await apiClient.getMyProfile();
            setProfile(profileData);
            return { success: true };
        } catch (err: any) {
            // Silently handle profile sync error

            // If 401, session expired - clear auth
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
                signOut();
                return { success: false, error: 'unauthorized' };
            }

            // If 404, we might need onboarding, handled by route protection
            if (err.message?.includes('404')) {
                setProfile(null);
                return { success: true }; // 404 is "successful" in terms of auth, just no profile yet
            }

            setAuthError(err.message || 'Erro de conexão com o servidor');
            return { success: false, error: 'server_error' };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            // Fetch Stripe configuration automatically (Public)
            try {
                const config = await apiClient.getStripeConfig();
                setStripeConfig(config);
            } catch (e) {
                // Stripe config load failure
            }

            const token = localStorage.getItem('nodus_access_token');

            // If no token, we're done
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const savedUser = localStorage.getItem('nodus_user');
                if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                    const result = await getOrCreateProfile();
                    if (!result.success && result.error === 'unauthorized') {
                        // signOut() already called inside getOrCreateProfile
                        setLoading(false);
                        return;
                    }
                } else {
                    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (res.ok) {
                        const googleProfile = await res.json();
                        const userData = {
                            id: googleProfile.sub,
                            email: googleProfile.email,
                            name: googleProfile.name,
                            picture: googleProfile.picture
                        };
                        setUser(userData);
                        safeSetItem('nodus_user', JSON.stringify(userData));
                        const result = await getOrCreateProfile();
                        if (!result.success && result.error === 'unauthorized') {
                            setLoading(false);
                            return;
                        }
                    } else {
                        throw new Error('Invalid token');
                    }
                }
            } catch (e: any) {
                // Rehydration failure
                // Clear session if it's explicitly unauthorized (401/403)
                if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
                    signOut();
                } else {
                    // Just stop loading if it's a server/network error, don't kick user out
                    setAuthError('O servidor demorou a responder, mas sua sessão foi mantida. Recarregue a página.');
                }
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Listen for session-expired events dispatched by apiClient on 401 responses
    // This handles the case where the Google token expires after ~1h of use
    const signOutRef = useRef<(() => void) | undefined>(undefined);
    signOutRef.current = () => {
        const isProtectedRoute = window.location.pathname.startsWith('/admin') || 
                               window.location.pathname.startsWith('/onboarding');
        
        setUser(null);
        setProfile(null);
        setToken(null);
        localStorage.removeItem('nodus_access_token');
        localStorage.removeItem('nodus_user');
        localStorage.removeItem('nodus_profile');
        localStorage.removeItem('nodus_links');
        localStorage.removeItem('nodus_products');
        
        if (isProtectedRoute) {
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        const handleSessionExpired = () => {
            signOutRef.current?.();
        };
        window.addEventListener('nodus:session-expired', handleSessionExpired);
        return () => window.removeEventListener('nodus:session-expired', handleSessionExpired);
    }, []);

    const signInWithProfile = async (googleUser: any, token: string) => {
        if (!googleUser || !googleUser.email) return { error: { message: 'Dados de perfil inválidos' } };

        safeSetItem('nodus_access_token', token);
        setToken(token);

        const userData = {
            id: googleUser.sub || googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture
        };

        setUser(userData);
        safeSetItem('nodus_user', JSON.stringify(userData));
        // NOTE: We do NOT call getOrCreateProfile() here to avoid a slow double-call to Google's API.
        // The AuthMiddleware on the backend will handle token validation on the next protected route.
        // Instead, we fetch the profile immediately after setting the token.
        try {
            const profileData = await apiClient.getMyProfile();
            setProfile(profileData);
        } catch (err: any) {
            // Silently handle login profile error
            // If it's a 404, they just need onboarding, so we set profile to null and return success
            if (err.message?.includes('404')) {
                setProfile(null);
            } else {
                // For other errors (500, timeout), returning the error will keep them on the login page
                setLoading(false);
                return { error: err };
            }
        } finally {
            setLoading(false);
        }
        return { error: null };
    };

    const signOut = async () => {
        setUser(null);
        setProfile(null);
        setToken(null);
        localStorage.removeItem('nodus_access_token');
        localStorage.removeItem('nodus_user');
        localStorage.removeItem('nodus_profile');
        localStorage.removeItem('nodus_links');
        localStorage.removeItem('nodus_products');
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            setLoading(true);
            const { token: jwtToken, user: userData } = await apiClient.loginWithEmail(email, password);

            // Save token to localStorage BEFORE fetching profile so apiClient picks it up
            safeSetItem('nodus_access_token', jwtToken);
            setToken(jwtToken);

            const userObj = { id: userData.id, email: userData.email, name: userData.name, username: userData.username, picture: null };
            setUser(userObj);
            safeSetItem('nodus_user', JSON.stringify(userObj));

            // Fetch profile using explicit token to avoid any race condition with localStorage reads.
            // Retry once with a small delay in case of a cold-start 401 from the backend.
            const fetchProfileWithToken = async (attempt = 0): Promise<any> => {
                const res = await fetch(`${API_URL}/api/profile/me`, {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json'
                    },
                    cache: 'no-store'
                });
                if (res.status === 401 && attempt < 2) {
                    await new Promise(r => setTimeout(r, 800));
                    return fetchProfileWithToken(attempt + 1);
                }
                if (res.status === 404) return null;
                if (!res.ok) throw new Error(`Erro ${res.status} ao carregar perfil`);
                return res.json();
            };

            try {
                const profileData = await fetchProfileWithToken();
                setProfile(profileData);
            } catch (err: any) {
                // Non-critical: profile fetch failed but login succeeded — let EditorPage handle it
                setProfile(null);
            }
            setLoading(false);
            return { error: null };
        } catch (err: any) {
            setLoading(false);
            return { error: err };
        }
    };

    const registerWithEmail = async (email: string, password: string, name: string, username: string) => {
        try {
            setLoading(true);
            const { token: jwtToken, user: userData } = await apiClient.registerWithEmail(email, password, name, username);

            safeSetItem('nodus_access_token', jwtToken);
            setToken(jwtToken);

            const userObj = { id: userData.id, email: userData.email, name: userData.name, username: userData.username, picture: null };
            setUser(userObj);
            safeSetItem('nodus_user', JSON.stringify(userObj));
            setProfile(null); // New users need onboarding
            setLoading(false);
            return { error: null };
        } catch (err: any) {
            setLoading(false);
            return { error: err };
        }
    };

    // An existing user is considered to have completed onboarding if the field is explicitly true
    const hasCompletedOnboarding = !!(profile?.onboardingCompleted);

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            onboardingCompleted: hasCompletedOnboarding,
            signInWithProfile,
            signInWithEmail,
            registerWithEmail,
            signOut,
            setProfile,
            token,
            authError,
            stripeConfig,
            isAdmin: user?.email?.toLowerCase() === 'jaoomarcos75@gmail.com'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
