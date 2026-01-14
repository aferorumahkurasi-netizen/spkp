// pages/api/addUser2.js
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, full_name, role, curator_registration_number } = req.body;

  // Validasi input
  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Email, password, full name, dan role wajib diisi' });
  }

  if (!['super_admin', 'kurator', 'verifikator'].includes(role)) {
    return res.status(400).json({ error: 'Role tidak valid' });
  }

  try {
    // Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Simpan di tabel users
    const userPayload = {
      id: authData.user.id,
      email,
      full_name,
      role,
      curator_registration_number: curator_registration_number || null,
    };

    const { error: dbError } = await supabase.from('users').insert(userPayload);

    if (dbError) throw dbError;

    res.status(200).json({ message: 'Akun berhasil dibuat', user: userPayload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Gagal membuat akun' });
  }
}
