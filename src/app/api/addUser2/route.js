import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, full_name, role, curator_registration_number } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email dan role wajib diisi' },
        { status: 400 }
      )
    }

    const allowedRoles = ['super_admin', 'kurator', 'verifikator']
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    let authUserId = null

    if (password) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (error) throw error
      authUserId = data.user.id
    }

    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        email,
        full_name,
        role,
        curator_registration_number: curator_registration_number || null
      })

    if (dbError) throw dbError

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
