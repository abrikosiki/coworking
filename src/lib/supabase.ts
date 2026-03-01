import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getUrl() {
  // In browser on HTTPS, use proxy to avoid mixed content (HTTPS → HTTP)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && supabaseUrl.startsWith('http://')) {
    return window.location.origin + '/supabase'
  }
  return supabaseUrl
}

export const supabase = createClient(getUrl(), supabaseAnonKey)
