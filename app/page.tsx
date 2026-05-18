import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function RootPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hqcode_token')?.value
  if (token && verifyToken(token)) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
