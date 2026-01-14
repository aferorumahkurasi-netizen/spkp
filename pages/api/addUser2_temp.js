// pages/api/addUser2.js
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader('Access-Control-Allow-Origin', '*'); // bisa ganti dengan domain frontend
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, full_name, role, curator_registration_number } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email dan role wajib diisi' });
  }

  const allowedRoles = ['super_admin', 'kurator', 'verifikator'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Role tidak valid' });
  }

  try {
    let authUserId = null;

    // Buat akun Supabase Auth jika password dikirim
    if (password) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (error) throw error;
      authUserId = data.user.id;
    }

    // Simpan di tabel users
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        email,
        full_name,
        role,
        curator_registration_number: curator_registration_number || null
      });

    if (dbError) throw dbError;

    return res.status(200).json({ success: true, message: 'Akun berhasil dibuat' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
