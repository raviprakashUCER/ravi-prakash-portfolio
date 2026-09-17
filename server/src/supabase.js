import { createClient } from '@supabase/supabase-js';
import { config, validateSupabaseConfig } from './config.js';

let supabaseClient = null;

export function getSupabase() {
  if (!supabaseClient) {
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
      validateSupabaseConfig();
      if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase client cannot be initialized: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
      }
    }

    supabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

export const supabase = {
  get client() {
    return getSupabase();
  },
  from(table) {
    return getSupabase().from(table);
  },
  get storage() {
    return getSupabase().storage;
  }
};
