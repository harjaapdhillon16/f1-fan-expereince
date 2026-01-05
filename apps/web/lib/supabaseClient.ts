import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://bthgrqjbdhhgaccybhrb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aGdycWpiZGhoZ2FjY3liaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDgzNDgsImV4cCI6MjA4MzEyNDM0OH0.rOpj41pBMmwaYhcKnSsi4Bn6yxTfUCC_HDwH6kJRuhE'
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
