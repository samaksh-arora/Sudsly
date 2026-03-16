import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase project URL and anon key
const SUPABASE_URL = 'https://wpmooojdcywcdesdbkll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbW9vb2pkY3l3Y2Rlc2Ria2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2Nzg3NDQsImV4cCI6MjA4OTI1NDc0NH0.6AYodMdikzM4OhNuxp3n0VLGxQ02KHEEAIctTAJrJTc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
