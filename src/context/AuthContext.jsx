import { supabase, isSupabaseConfigured, getFriendlyErrorMessage } from '../lib/supabase';
import { nextRecoveryState } from '../lib/authPasswordReset';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: false,
  isConfigured: false,
  recovering: false,
  setRecovering: () => {},
  clearRecovering: () => {},
  signInWithPassword: async () => {},
  signUpWithPassword: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
  getFriendlyErrorMessage: (err) => err?.message || '',
});

export const AuthProvider = ({ children, supabaseClient }) => {
  const client = supabaseClient || supabase;
  const isConfigured = Boolean(supabaseClient || isSupabaseConfigured);

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!isConfigured || !client) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Check active session from local storage without making eager remote network calls if unauthenticated
    client.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('Supabase getSession error:', error.message);
      }
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      console.warn('Failed to retrieve Supabase session:', err);
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      setRecovering((prev) => nextRecoveryState(prev, event));
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [client, isConfigured]);

  const signInWithPassword = useCallback(async (email, password) => {
    if (!isConfigured || !client) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, [client, isConfigured]);

  const signUpWithPassword = useCallback(async (email, password) => {
    if (!isConfigured || !client) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirectTo = typeof window !== 'undefined' ? window.location.origin + '/' : undefined;
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
    return data;
  }, [client, isConfigured]);

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured || !client) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirectTo = typeof window !== 'undefined' ? window.location.origin + '/' : undefined;
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) throw error;
    return data;
  }, [client, isConfigured]);

  const resetPassword = useCallback(async (email) => {
    if (!isConfigured || !client) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirectTo = typeof window !== 'undefined' ? window.location.origin + '/' : undefined;
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return data;
  }, [client, isConfigured]);

  const updatePassword = useCallback(async (newPassword) => {
    if (!isConfigured || !client) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await client.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  }, [client, isConfigured]);

  const clearRecovering = useCallback(() => {
    setRecovering(false);
  }, []);

  const signOut = useCallback(async () => {
    if (!isConfigured || !client) {
      setUser(null);
      setSession(null);
      setRecovering(false);
      return;
    }
    const { error } = await client.auth.signOut();
    if (error) {
      console.warn('Sign out warning:', error.message);
    }
    setUser(null);
    setSession(null);
    setRecovering(false);
  }, [client, isConfigured]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        recovering,
        setRecovering,
        clearRecovering,
        isConfigured,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        resetPassword,
        updatePassword,
        signOut,
        getFriendlyErrorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
