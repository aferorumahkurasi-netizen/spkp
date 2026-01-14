import { createClient } from '@supabase/supabase-js';

// Buat client Supabase pakai URL dan service role key kamu
const supabase = createClient(
  'https://jioatnzfmodnbnldevhs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppb2F0bnpmbW9kbmJubGRldmhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1NTQ5OCwiZXhwIjoyMDgzNDMxNDk4fQ.4Pt1Eov2dC_j7szLKYLUTcTY7w1Y2I1H3Z2qt_vYyt8'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') 
    return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, role } = req.body;

  if (!email || !password || !role) 
    return res.status(400).json({ error: 'Missing fields' });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { role }, // contoh: 'kurator' atau 'verifikator'
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ user: data });
}
