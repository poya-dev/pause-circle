import { createClient } from '@supabase/supabase-js';

import { MMKVStorageAdapter } from '@/lib/mmkv';
import type { Database } from '@/types/supabase';

import { Env } from './env';

export const supabase = createClient<Database>(
  Env.SUPABASE_URL!,
  Env.SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: MMKVStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  }
);
