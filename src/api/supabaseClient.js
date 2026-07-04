import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Safety check to catch missing values early
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables! Check your .env file.')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export default supabase
