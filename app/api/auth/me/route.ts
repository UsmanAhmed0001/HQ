import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('hqcode_token')?.value

  if (!token) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const user = await getSessionUser(token)

  if (!user) {
    return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    data: {
      id:        user.id,
      email:     user.email,
      name:      user.name,
      role:      user.role,
      companyId: user.companyId,
      company: {
        id:       user.company.id,
        name:     user.company.name,
        slug:     user.company.slug,
        industry: user.company.industry,
        size:     user.company.size,
      },
    },
  })
}
