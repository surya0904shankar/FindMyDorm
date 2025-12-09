
import { createClient } from '@supabase/supabase-js';

// Configuration from user input
const supabaseUrl = 'https://gkedimiamfdoacwwgxfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZWRpbWlhbWZkb2Fjd3dneGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzk3NDMsImV4cCI6MjA4MDg1NTc0M30.JQvePMsfN3JZ5c_Fg12cerS9nRTMoscIVR9kZ0ci0fY';

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};

// Initialize Supabase client
export const supabase = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {};
