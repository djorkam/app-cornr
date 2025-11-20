import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Can we connect?
  const { data, error } = await supabase
    .from('profiles')
    .select('count');
  
  if (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
  
  console.log('✅ Connected to Supabase');
  return true;
}