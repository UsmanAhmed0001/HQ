import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = 12

// ─── Password ───────────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT ────────────────────────────────────────────────────────────────────
export interface JWTPayload {
  userId: string
  companyId: string
  role: string
  email: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// ─── Session ────────────────────────────────────────────────────────────────
export async function createSession(userId: string, token: string) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  return prisma.session.create({
    data: { userId, token, expiresAt },
  })
}

export async function getSessionUser(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: { company: true },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) return null
  return session.user
}

export async function deleteSession(token: string) {
  return prisma.session.deleteMany({ where: { token } })
}

// ─── Password validation ────────────────────────────────────────────────────
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain a number'
  return null
}
