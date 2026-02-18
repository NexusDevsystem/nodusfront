import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
    user: any | null;
    profile: any | null;
    loading: boolean;
    onboardingCompleted: boolean;
    signInWithProfile: (googleUser: any, token: string) => Promise<{ error: any }>;
    signOut: () => void;
    setProfile: React.Dispatch<React.SetStateAction<any | null>>;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe localStorage setter that handles quota errors
const safeSetItem = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, clearing snapshots and retrying...');
            // Clear snapshot data (less critical than auth data)
            localStorage.removeItem('nodus_profile_snapshot');
            localStorage.removeItem('nodus_links_snapshot');
            localStorage.removeItem('nodus_products_snapshot');
            try {
                localStorage.setItem(key, value);
            } catch (retryError) {
                // Still failing, need more aggressive cleanup
                console.warn('Still quota exceeded, clearing ALL non-essential data...');
                const token = localStorage.getItem('nodus_access_token');
                localStorage.clear();
                if (token) {
                    localStorage.setItem('nodus_access_token', token);
                }
                try {
                    localStorage.setItem(key, value);
                    console.log('Successfully saved after aggressive cleanup');
                } catch (finalError) {
                    console.error('Failed to save to localStorage even after full cleanup:', finalError);
                }
            }
        } else {
            console.error('Failed to save to localStorage:', e);
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

    const getOrCreateProfile = async () => {
        try {
            // Fetch fresh profile data via Backend
            const profileData = await apiClient.getMyProfile();
            setProfile(profileData);
        } catch (err: any) {
            console.error('Profile sync error:', err);
            // If 404, we might need onboarding, handled by route protection
            if (err.message?.includes('404')) {
                setProfile(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('nodus_access_token');

            // If no token, we're done
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // We no longer fetch from Google on EVERY mount.
                // We rely on getOrCreateProfile which calls our backend, which in turn validates the token.
                // This reduces redundant Google API calls and speeds up startup.
                const savedUser = localStorage.getItem('nodus_user');
                if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                    await getOrCreateProfile();
                } else {
                    // If no saved user info but we have a token, we still need to know who the user is.
                    // THIS is a valid case for a single Google check.
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
                        await getOrCreateProfile();
                    } else {
                        throw new Error('Invalid token');
                    }
                }
            } catch (e) {
                console.error('Failed to rehydrate session:', e);
                localStorage.removeItem('nodus_access_token');
                localStorage.removeItem('nodus_user');
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        };

        initAuth();
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
        await getOrCreateProfile();
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

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            onboardingCompleted: !!profile?.onboardingCompleted,
            signInWithProfile,
            signOut,
            setProfile,
            token
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
