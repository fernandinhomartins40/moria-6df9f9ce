// Configuração do Supabase
// Este arquivo será configurado quando integrarmos com Supabase

export const supabaseConfig = {
  // url: process.env.VITE_SUPABASE_URL,
  // anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  url: '', // A ser configurado
  anonKey: '', // A ser configurado
};

// Placeholder para cliente Supabase
export const supabase = null;

// Funções de utilitário para quando integrarmos
export const initSupabase = () => {
  console.log('Supabase será inicializado aqui quando configurado');
  return null;
};

// Mock de funções de autenticação para compatibilidade
export const auth = {
  signIn: async () => ({ data: null, error: 'Supabase não configurado' }),
  signUp: async () => ({ data: null, error: 'Supabase não configurado' }),
  signOut: async () => ({ data: null, error: 'Supabase não configurado' }),
  getUser: async () => ({ data: { user: null }, error: 'Supabase não configurado' }),
};

export default {
  supabase,
  auth,
  initSupabase,
};