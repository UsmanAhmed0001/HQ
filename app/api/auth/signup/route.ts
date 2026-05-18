import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, createSession, validatePassword } from '@/lib/auth'
import { z } from 'zod'

const SignupSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  industry:    z.string().min(1, 'Industry is required'),
  size:        z.string().min(1, 'Company size is required'),
  adminName:   z.string().min(2, 'Name must be at least 2 characters'),
  adminEmail:  z.string().email('Invalid email address'),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SignupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { companyName, industry, size, adminName, adminEmail, password } = parsed.data

    // Validate password strength
    const pwError = validatePassword(password)
    if (pwError) {
      return NextResponse.json({ success: false, error: pwError }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Generate unique company slug
    let slug = generateSlug(companyName)
    const slugExists = await prisma.company.findUnique({ where: { slug } })
    if (slugExists) slug = `${slug}-${Date.now()}`

    const passwordHash = await hashPassword(password)

    // Create company + admin user in a transaction
    const { user, company } = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      const company = await tx.company.create({
        data: { name: companyName, slug, industry, size },
      })

      const user = await tx.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          passwordHash,
          role: 'HR_ADMIN',
          companyId: company.id,
        },
      })

      return { user, company }
    })

    // Create JWT + session
    const token = signToken({
      userId:    user.id,
      companyId: company.id,
      role:      user.role,
      email:     user.email,
    })
    await createSession(user.id, token)

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: {
          user:    { id: user.id, email: user.email, name: user.name, role: user.role },
          company: { id: company.id, name: company.name, slug: company.slug },
        },
      },
      { status: 201 }
    )

    // Set HTTP-only cookie
    response.cookies.set('hqcode_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7, // 7 days
      path:     '/',
    })

    return response
  } catch (error) {
    console.error('[SIGNUP ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
