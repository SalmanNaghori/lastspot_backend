import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zrhmpidlutbyoiysjwxt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyaG1waWRsdXRieW9peXNqd3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NjM5MjYsImV4cCI6MjEwMjUzOTkyNn0.3JHUaJknotJ34eeOVyI8haiiUPC5kpmBO8kkkdB8KhQ'
);

async function test() {
  const { data, error } = await supabase.from('user_devices').select('id, user_id, profiles:user_id(id, full_name)').limit(1);
  if (error) console.error("Join Error:", error);
  else console.log("Join Success:", data);

  const { data: d2, error: e2 } = await supabase.from('user_devices').select('id, user_id, owner:profiles!user_devices_user_id_fkey(id, full_name)').limit(1);
  if (e2) console.error("Fkey Error:", e2);
  else console.log("Fkey Success:", d2);
}
test();
