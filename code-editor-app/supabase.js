// code-editor-app/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pofaqrahjhsjfraziodr.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEYeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZmFxcmFoamhzamZyYXppb2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTkwODMsImV4cCI6MjA4ODQ5NTA4M30.K2XaqVEoVF5EYf4wqnXKsB7yrb_UHUj4F6RNpmaFa2M' // replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)