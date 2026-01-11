import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnhiinehardcpjtbujux.supabase.co';
const supabaseKey = 'sb_publishable_f3Olr8V2NjmRL3QuqEMTng_wRugtRLf';

export const supabase = createClient(supabaseUrl, supabaseKey);
