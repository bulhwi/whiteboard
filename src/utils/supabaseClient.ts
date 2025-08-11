import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Connection test
(async () => {
  try {
    await supabase.from('_test_connection').select('*').limit(1);
    console.log('✅ Supabase connected successfully');
  } catch (error: any) {
    console.log('⚠️ Supabase connection test failed:', error.message);
  }
})();