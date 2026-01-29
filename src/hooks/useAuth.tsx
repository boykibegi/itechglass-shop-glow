import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isDriver: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkRole = async (userId: string, role: 'admin' | 'driver') => {
    const { data } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: role,
    });
    return data === true;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role checks with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(async () => {
            const [adminStatus, driverStatus] = await Promise.all([
              checkRole(session.user.id, 'admin'),
              checkRole(session.user.id, 'driver'),
            ]);
            setIsAdmin(adminStatus);
            setIsDriver(driverStatus);
            setIsLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsDriver(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const [adminStatus, driverStatus] = await Promise.all([
          checkRole(session.user.id, 'admin'),
          checkRole(session.user.id, 'driver'),
        ]);
        setIsAdmin(adminStatus);
        setIsDriver(driverStatus);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsDriver(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isDriver, isLoading, signIn, signUp, signOut }}>
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
