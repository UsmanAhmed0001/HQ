import type { Company, User, UserRole, HQScore, HRMetric, Assessment } from './prisma'

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  companyId: string
  company: {
    id: string
    name: string
    slug: string
    industry: string | null
    size: string | null
  }
}

// ─── API responses ───────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardData {
  company: Pick<Company, 'id' | 'name' | 'industry' | 'size'>
  currentQuarter: string
  latestScore: HQScore | null
  scoreHistory: HQScore[]
  latestMetrics: HRMetric | null
  metricsHistory: HRMetric[]
  assessmentStatus: Assessment | null
  participantCount: number
}

// ─── Form links ──────────────────────────────────────────────────────────────
export interface FormLinkData {
  selfAssessmentUrl: string | null
  orgClimateUrl: string | null
  selfAssessmentToken: string | null
  orgClimateToken: string | null
  lastUploaded: string | null
}

// ─── Company setup ───────────────────────────────────────────────────────────
export interface CompanySetupInput {
  companyName: string
  industry: string
  size: string
  adminName: string
  adminEmail: string
  password: string
}

// ─── HR Metrics upload ───────────────────────────────────────────────────────
export interface HRMetricsInput {
  quarter: string
  turnoverRate?: number
  involuntaryExitsPct?: number
  voluntaryExitsPct?: number
  absenteeismRate?: number
  burnoutLeaveDays?: number
  burnoutLeaveStaffPct?: number
  internalPromotionRate?: number
  enps?: number
  wellbeingParticipationRate?: number
  newHiresPct?: number
}

// ─── Score levels ─────────────────────────────────────────────────────────────
export type ScoreLevel = 'CRITICAL' | 'EMERGING' | 'DEVELOPING' | 'STRONG'

export const INDUSTRY_OPTIONS = [
  'Financial Services',
  'Technology',
  'Healthcare',
  'Retail & Consumer',
  'Manufacturing',
  'Professional Services',
  'Education',
  'Media & Entertainment',
  'Non-profit',
  'Other',
] as const

export const COMPANY_SIZE_OPTIONS = [
  '1–50',
  '51–200',
  '201–500',
  '501–1,000',
  '1,001–5,000',
  '5,000+',
] as const
