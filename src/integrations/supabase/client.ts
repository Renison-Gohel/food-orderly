// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tjktecjbrdvpaynnlqev.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqa3RlY2picmR2cGF5bm5scWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMTA1NjMsImV4cCI6MjA1MjU4NjU2M30.eXAFtSDBvFG3aOSo-x-gWSnQHKPhCVpdSu199WJB7DE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);