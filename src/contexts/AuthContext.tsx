import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

interface AuthContextType {
    user: any | null;
    profile: any | null;
    loading: boolean;
    onboardingCompleted: boolean;
    signInWithProfile: (googleUser: any, token: string) => Promise<{ error: any }>;
    signOut: () => void;
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

    const getOrCreateProfile = async (userData: { email: string, name?: string, picture?: string }) => {
        try {
            // Find by email (Single source of truth in our manual flow)
            const { data: existingProfile, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', userData.email)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existingProfile) {
                setProfile(existingProfile);
                // No localStorage - profile is kept in React state only
                return;
            }

            // New User: Create initial profile (DB will generate UUID)
            const { data: newProfile, error: insertError } = await supabase
                .from('users')
                .insert({
                    email: userData.email,
                    name: userData.name || 'Usuário',
                    avatar_url: userData.picture,
                    auth_provider: 'google',
                    onboarding_completed: false
                })
                .select()
                .single();

            if (insertError) throw insertError;
            setProfile(newProfile);
            // No localStorage - profile is kept in React state only
        } catch (err) {
            console.error('Profile sync error:', err);
            // Don't clear existing profile if sync fails, just log it
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
                    await getOrCreateProfile(userData);
                } else {
                    // Token invalid, clear everything
                    localStorage.removeItem('nodus_access_token');
                    localStorage.removeItem('nodus_user');
                    localStorage.removeItem('nodus_profile');
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }
            } catch (e) {
                console.error('Failed to rehydrate session:', e);
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const signInWithProfile = async (googleUser: any, token: string) => {
        if (!googleUser || !googleUser.email) return { error: { message: 'Dados de perfil inválidos' } };

        safeSetItem('nodus_access_token', token);

        const userData = {
            id: googleUser.sub || googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture
        };

        setUser(userData);
        safeSetItem('nodus_user', JSON.stringify(userData));
        await getOrCreateProfile(userData);
        return { error: null };
    };

    const signOut = async () => {
        setUser(null);
        setProfile(null);
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
            onboardingCompleted: !!profile?.onboarding_completed,
            signInWithProfile,
            signOut
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
