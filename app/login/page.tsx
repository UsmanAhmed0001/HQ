'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [form, setForm]     = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Invalid credentials')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#1D5C3A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HQ</span>
            </div>
            <span className="text-xl font-semibold text-[#1A1814]">HQ Code</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1814] mt-4">Welcome back</h1>
          <p className="text-[#5A5650] mt-2 text-sm">Sign in to your organisation dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2DDD5] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
                Work email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@acme.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[#E2DDD5] bg-[#FAFAF8] text-[#1A1814] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5C3A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-[#E2DDD5] bg-[#FAFAF8] text-[#1A1814] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5C3A]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1D5C3A] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#164d30] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#5A5650] mt-6">
          No account yet?{' '}
          <Link href="/signup" className="text-[#1D5C3A] font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
