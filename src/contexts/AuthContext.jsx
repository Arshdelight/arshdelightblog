import { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../services/SupabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setSession(data.session || null);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpNewUser = async (email, password, username) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          },
          emailRedirectTo: window.location.origin + '/'
        }
      });

      if (error) {
        throw error;
      }

      const needsConfirmation = data.user && !data.session;

      return { success: true, needsConfirmation, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signInUser = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    loading,
    signUpNewUser,
    signInUser,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;