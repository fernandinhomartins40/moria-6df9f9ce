import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Configurações do Supabase não encontradas!');
  console.log('Certifique-se de configurar as variáveis:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  }
});

// Helper para verificar conectividade
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.warn('⚠️ Erro de conectividade com Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Falha na conectividade com Supabase:', err);
    return false;
  }
};

// Types para TypeScript
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          price: number;
          sale_price: number | null;
          promo_price: number | null;
          images: any | null;
          stock: number;
          is_active: boolean;
          rating: number;
          specifications: any | null;
          vehicle_compatibility: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          price: number;
          sale_price?: number | null;
          promo_price?: number | null;
          images?: any | null;
          stock?: number;
          is_active?: boolean;
          rating?: number;
          specifications?: any | null;
          vehicle_compatibility?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          price?: number;
          sale_price?: number | null;
          promo_price?: number | null;
          images?: any | null;
          stock?: number;
          is_active?: boolean;
          rating?: number;
          specifications?: any | null;
          vehicle_compatibility?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          base_price: number | null;
          estimated_time: string | null;
          specifications: any | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          base_price?: number | null;
          estimated_time?: string | null;
          specifications?: any | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          base_price?: number | null;
          estimated_time?: string | null;
          specifications?: any | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          customer_address: string | null;
          status: string;
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          customer_address?: string | null;
          status?: string;
          total_amount: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          customer_address?: string | null;
          status?: string;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          type: string;
          item_id: number;
          item_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          type: string;
          item_id: number;
          item_name: string;
          quantity?: number;
          unit_price: number;
          total_price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          type?: string;
          item_id?: number;
          item_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
      promotions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          category: string | null;
          min_amount: number | null;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          category?: string | null;
          min_amount?: number | null;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          category?: string | null;
          min_amount?: number | null;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          min_amount: number | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          min_amount?: number | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          min_amount?: number | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_configs: {
        Row: {
          id: string;
          key: string;
          value: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};