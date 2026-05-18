'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    companyName: '',
    industry:    '',
    size:        '',
    adminName:   '',
    adminEmail:  '',
    password:    '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Something went wrong')
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
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#1D5C3A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HQ</span>
            </div>
            <span className="text-xl font-semibold text-[#1A1814]">HQ Code</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1814] mt-4">Create your organisation account</h1>
          <p className="text-[#5A5650] mt-2 text-sm">Set up HQ Code for your company in under 2 minutes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2DDD5] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Company info */}
            <div>
              <p className="text-xs font-semibold text-[#9A968F] uppercase tracking-wider mb-4">
                Organisation details
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
                    Company name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Acme Ltd"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2DDD5] bg-[#FAFAF8] text-[#1A1814] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5C3A] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2DDD5] bg-[#FAFAF8] text-[#1A1814] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5C3A]"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRY_OPTIONS.map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
                      Company size <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="size"
                      value={form.size}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2DDD5] bg-[#FAFAF8] text-[#1A1814] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5C3A]"
                    >
                      <option value="">Select size</option>
                      {COMPANY_SIZE_OPTIONS.map(s => (
                        <option key={s} value={s}>{s} employees</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-[#E2DDD5]" />

            {/* Admin info */}
            <div>
              <p className="text-xs font-semibold text-[#9A968F] uppercase tracking-wider mb-4">
                Admin account
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
                    Your name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="adminName"
                    value={form.adminName}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2DDD5] bg-[#FAFAF8] text-[#1A1814] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5C3A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
                    Work email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="adminEmail"
                    type="email"
                    value={form.adminEmail}
                    onChange={handleChange}
                    placeholder="jane@acme.com"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2DDD5] bg-[#FAFAF8] text-[#1A1814] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5C3A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2DDD5] bg-[#FAFAF8] text-[#1A1814] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5C3A]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1D5C3A] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#164d30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center text-xs text-[#9A968F]">
              By creating an account you agree to our{' '}
              <a href="#" className="text-[#1D5C3A] underline">Terms</a> and{' '}
              <a href="#" className="text-[#1D5C3A] underline">Privacy Policy</a>.
              All data is processed in compliance with UK GDPR.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-[#5A5650] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#1D5C3A] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
