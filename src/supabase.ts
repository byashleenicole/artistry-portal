import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iietasatfqdlgarknhwx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZXRhc2F0ZnFkbGdhcmtuaHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTMzNzcsImV4cCI6MjA4OTYyOTM3N30.FXfo7jfupe8y77gpQFUz3s1UsYby-86gIjRx7rBKXe0'

export const supabase = createClient(supabaseUrl, supabaseKey)