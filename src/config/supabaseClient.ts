import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gadqvlcijsmgtbwydvay.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZHF2bGNpanNtZ3Rid3lkdmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjI2NDksImV4cCI6MjA4NTgzODY0OX0._VIpOTQLgT1m0ZmJXaLTBXjNTgS6eOH3-9NaUUc6jJc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
