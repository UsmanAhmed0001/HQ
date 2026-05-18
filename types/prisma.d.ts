// Temporary type declarations until `npx prisma generate` is run locally
// These mirror the schema.prisma definitions exactly

export type UserRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'VIEWER'
export type FormType = 'SELF_ASSESSMENT' | 'ORG_CLIMATE'
export type AssessmentStatus = 'OPEN' | 'CLOSED' | 'SCORED'
export type MetricSource = 'MANUAL' | 'CSV_UPLOAD' | 'API'

export interface Company {
  id: string; name: string; slug: string; industry: string | null
  size: string | null; country: string; createdAt: Date; updatedAt: Date
}
export interface User {
  id: string; email: string; name: string | null; passwordHash: string
  role: UserRole; companyId: string; createdAt: Date; updatedAt: Date; lastLoginAt: Date | null
}
export interface Session {
  id: string; userId: string; token: string; expiresAt: Date; createdAt: Date
}
export interface HQScore {
  id: string; companyId: string; quarter: string; participantCount: number
  overallScore: number; humanityScore: number; connectionScore: number; consciousnessScore: number
  selfLoveScore: number; proximateLoveScore: number; universalLoveScore: number
  colleagueConnectionScore: number; universalConnectionScore: number
  emotionalConsciousnessScore: number; relationalConsciousnessScore: number; universalConsciousnessScore: number
  sectorAvgScore: number | null; sectorParticipants: number | null; calculatedAt: Date
}
export interface HRMetric {
  id: string; companyId: string; quarter: string
  turnoverRate: number | null; involuntaryExitsPct: number | null; voluntaryExitsPct: number | null
  absenteeismRate: number | null; burnoutLeaveDays: number | null; burnoutLeaveStaffPct: number | null
  internalPromotionRate: number | null; enps: number | null
  wellbeingParticipationRate: number | null; newHiresPct: number | null
  source: MetricSource; uploadedAt: Date
}
export interface Assessment {
  id: string; companyId: string; quarter: string
  status: AssessmentStatus; openedAt: Date; closedAt: Date | null
}
export interface FormLink {
  id: string; companyId: string; type: FormType; token: string
  isActive: boolean; createdAt: Date; expiresAt: Date | null
}
