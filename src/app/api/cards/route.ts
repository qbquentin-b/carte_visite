import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { title, type, design_config } = body

    const { data, error } = await supabase
      .from('cards')
      .insert([
        { tenant_id: tenant.id, title, type, design_config }
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
