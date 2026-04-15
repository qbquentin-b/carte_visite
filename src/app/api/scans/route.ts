import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { pass_slug, action_type, device_info } = body

    // 1. Find the pass
    const { data: pass, error: passError } = await supabase
      .from('passes')
      .select('id, points, tenant_id')
      .eq('pass_slug', pass_slug)
      .single()

    if (passError || !pass) {
      return NextResponse.json({ error: 'Pass not found' }, { status: 404 })
    }

    // 2. Verify tenant owns this pass
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (tenant?.id !== pass.tenant_id) {
        return NextResponse.json({ error: 'Unauthorized to scan this pass' }, { status: 403 })
    }

    // 3. Update points if action is point_added
    let newPoints = pass.points
    if (action_type === 'point_added') {
      newPoints += 1
      const { error: updateError } = await supabase
        .from('passes')
        .update({ points: newPoints })
        .eq('id', pass.id)

      if (updateError) throw updateError
    }

    // 4. Record scan
    const { error: scanError } = await supabase
      .from('scans')
      .insert([
        {
          tenant_id: pass.tenant_id,
          pass_id: pass.id,
          action_type,
          device_info
        }
      ])

    if (scanError) throw scanError

    return NextResponse.json({ success: true, newPoints })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
