import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  session: Session | null;
  needsProfileSetup: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error?: any }>;
  deleteAccount: (reason?: string) => Promise<{ error?: any }>;
  completeProfileSetup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkProfileSetup(session.user);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // If this is a sign-in event (not a fresh registration), clear any registration flags
        if (event === 'SIGNED_IN') {
          const justRegisteredKey = `just_registered_${session.user.id}`;
          const wasJustRegistered = localStorage.getItem(justRegisteredKey) === 'true';
          
          // If user wasn't just registered (i.e., this is a regular login), clear the flag
          if (!wasJustRegistered) {
            localStorage.removeItem(justRegisteredKey);
          }
        }
        
        checkProfileSetup(session.user);
      } else {
        setNeedsProfileSetup(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfileSetup = (user: User) => {
    // Check if user just registered
    const justRegisteredKey = `just_registered_${user.id}`;
    const wasJustRegistered = localStorage.getItem(justRegisteredKey) === 'true';
    
    // Check if user has completed profile setup
    const hasFullName = user.user_metadata?.full_name;
    const profileSetupComplete = localStorage.getItem(`profile_setup_complete_${user.id}`) === 'true';
    
    // Only show profile setup if:
    // 1. User just registered AND
    // 2. User doesn't have a full name OR profile setup is not marked as complete
    setNeedsProfileSetup(wasJustRegistered && (!hasFullName || !profileSetupComplete));
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Mark user as just registered if signup was successful
      if (data.user) {
        localStorage.setItem(`just_registered_${data.user.id}`, 'true');
      }

      return { data };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Clear any registration flags for existing users logging in
      if (data.user) {
        localStorage.removeItem(`just_registered_${data.user.id}`);
      }

      return { data };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    const currentUserId = user?.id;
    
    try {
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase signOut error (will continue with local cleanup):', error);
      }
    } catch (error) {
      console.warn('Error during Supabase signOut (will continue with local cleanup):', error);
    } finally {
      // Always clear local state regardless of whether Supabase signOut succeeded
      // Clear registration flags
      if (currentUserId) {
        localStorage.removeItem(`just_registered_${currentUserId}`);
        localStorage.removeItem(`profile_setup_complete_${currentUserId}`);
      }
      
      // Clear user state
      setUser(null);
      setSession(null);
      setNeedsProfileSetup(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error };
      }

      return { data };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        return { error };
      }

      return { data };
    } catch (error) {
      return { error };
    }
  };

  const deleteAccount = async (reason?: string) => {
    try {
      if (!user || !session) {
        return { error: new Error('No authenticated user found') };
      }

      console.log('Starting account deletion process...');

      // Check if Supabase URL is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
        console.warn('Supabase not configured, performing local deletion only');
        
        // Clear local data immediately
        localStorage.clear();
        
        // Clear user state
        setUser(null);
        setSession(null);
        setNeedsProfileSetup(false);
        
        // Sign out the user
        await signOut();
        
        return { success: true, localOnly: true };
      }

      try {
        // Try to call the Supabase Edge Function to delete the user
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { 
            userId: user.id, 
            reason: reason || 'User requested account deletion' 
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (error) {
          console.error('Error calling delete-user function:', error);
          
          // If the Edge Function fails, still clear local data and sign out
          console.warn('Edge Function failed, clearing local data and signing out...');
          localStorage.clear();
          setUser(null);
          setSession(null);
          setNeedsProfileSetup(false);
          await signOut();
          
          return { 
            success: true, 
            warning: 'Account signed out locally. Contact support to ensure complete deletion.' 
          };
        }

        console.log('Edge Function response:', data);

        // If the Edge Function call was successful, clear local data
        localStorage.clear();
        
        // Clear user state
        setUser(null);
        setSession(null);
        setNeedsProfileSetup(false);

        return { success: true, data };
      } catch (functionError) {
        console.error('Error invoking Edge Function:', functionError);
        
        // Fallback: clear local data and sign out
        console.warn('Edge Function invocation failed, performing local cleanup...');
        localStorage.clear();
        setUser(null);
        setSession(null);
        setNeedsProfileSetup(false);
        await signOut();
        
        return { 
          success: true, 
          warning: 'Account signed out locally. Contact support to ensure complete deletion.' 
        };
      }
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      
      // Last resort fallback: still clear local data
      try {
        localStorage.clear();
        setUser(null);
        setSession(null);
        setNeedsProfileSetup(false);
        await signOut();
        
        return { 
          success: true, 
          warning: 'Account signed out locally. Contact support to ensure complete deletion.' 
        };
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
        return { 
          error: new Error('Unable to delete account. Please contact support.') 
        };
      }
    }
  };

  const completeProfileSetup = () => {
    if (user) {
      // Mark profile setup as complete
      localStorage.setItem(`profile_setup_complete_${user.id}`, 'true');
      
      // Clear the "just registered" flag since setup is now complete
      localStorage.removeItem(`just_registered_${user.id}`);
      
      setNeedsProfileSetup(false);
    }
  };

  const value = {
    isLoggedIn: !!user,
    user,
    session,
    needsProfileSetup,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    deleteAccount,
    completeProfileSetup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};