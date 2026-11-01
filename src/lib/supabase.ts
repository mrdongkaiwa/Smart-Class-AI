// Smart Class - Supabase Client Bridge
// Allows seamless switching between local high-performance reactive database
// and remote Supabase PostgreSQL instance via environment variables.

export const isSupabaseConfigured = (): boolean => {
  const url = typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : (import.meta as any).env?.VITE_SUPABASE_URL;
  const key = typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== 'https://your-project.supabase.co');
};

export const getSupabaseConfig = () => {
  return {
    url: (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : (import.meta as any).env?.VITE_SUPABASE_URL) || 'https://your-project.supabase.co',
    anonKey: (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    isConfigured: isSupabaseConfigured(),
  };
};
