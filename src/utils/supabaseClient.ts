import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Production debugging
console.log('🔧 Environment Debug:', {
  hasUrl: !!SUPABASE_URL,
  hasKey: !!SUPABASE_ANON_KEY,
  urlPreview: SUPABASE_URL?.substring(0, 30) + '...',
  keyPreview: SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  nodeEnv: import.meta.env.MODE
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL);
  console.error('VITE_SUPABASE_ANON_KEY present:', !!SUPABASE_ANON_KEY);
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
    console.log('Full error:', error);
  }
})();

// Realtime connection test
const testRealtimeConnection = () => {
  console.log('🔄 Testing Realtime connection...');
  
  const testChannel = supabase.channel('connection-test');
  
  testChannel.subscribe((status) => {
    console.log('📡 Realtime status:', status);
    if (status === 'SUBSCRIBED') {
      console.log('✅ Realtime connected successfully');
      testChannel.unsubscribe();
    } else if (status === 'CHANNEL_ERROR') {
      console.log('❌ Realtime connection failed');
    }
  });

  // Auto cleanup
  setTimeout(() => {
    testChannel.unsubscribe();
  }, 10000);
};

// Test realtime after a short delay
setTimeout(testRealtimeConnection, 1000);