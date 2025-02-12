// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gdrflqgtxrsycxwiuoek.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcmZscWd0eHJzeWN4d2l1b2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyOTEyMzcsImV4cCI6MjA1NDg2NzIzN30.MfjFk_UmfxgTA18XtbWCgwFVceEWUSqu10oV0HMYox0";

export const supabase = createClient(supabaseUrl, supabaseKey);
