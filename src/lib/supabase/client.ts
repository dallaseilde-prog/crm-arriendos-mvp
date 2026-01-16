import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    console.warn('⚠️ ATENCIÓN: Las variables de entorno de Supabase no están configuradas en Vercel. Sigue los pasos indicados para conectar la base de datos.')
}

// Solo inicializar si las variables existen para evitar "Failed to fetch" con URLs falsas
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any

// Client para uso en componentes del lado del cliente
export function createBrowserClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase credentials missing')
    }
    return createClient(supabaseUrl || '', supabaseAnonKey || '')
}
