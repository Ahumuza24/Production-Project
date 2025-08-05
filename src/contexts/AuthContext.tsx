import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

// ----------------------------------------------------------------------

interface UserProfile extends User {
  role?: 'project_lead' | 'assembler';
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      setSession(data.session);
      
      if (data.session?.user) {
        // Fetch user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        if (profileError) {
          console.warn('Profile not found, using default role:', profileError);
          // If profile doesn't exist, use default role
          setUser({ ...data.session.user, role: 'assembler' });
        } else {
          setUser({ ...data.session.user, role: profile?.role });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      setSession(authSession);
      
      if (authSession?.user) {
        // Fetch user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authSession.user.id)
          .single();
        
        if (profileError) {
          console.warn('Profile not found, using default role:', profileError);
          // If profile doesn't exist, use default role
          setUser({ ...authSession.user, role: 'assembler' });
        } else {
          setUser({ ...authSession.user, role: profile?.role });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
