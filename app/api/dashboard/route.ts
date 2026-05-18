import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentQuarter } from '@/lib/scoring'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('hqcode_token')?.value
  if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

  const user = await getSessionUser(token)
  if (!user) return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 })

  const companyId      = user.companyId
  const currentQuarter = getCurrentQuarter()

  const [
    scoreHistory,
    metricsHistory,
    assessmentStatus,
  ] = await Promise.all([
    prisma.hQScore.findMany({
      where:   { companyId },
      orderBy: { quarter: 'asc' },
      take:    8,
    }),
    prisma.hRMetric.findMany({
      where:   { companyId },
      orderBy: { quarter: 'asc' },
      take:    8,
    }),
    prisma.assessment.findFirst({
      where: { companyId, quarter: currentQuarter },
    }),
  ])

  const latestScore   = scoreHistory.at(-1) ?? null
  const latestMetrics = metricsHistory.at(-1) ?? null

  return NextResponse.json({
    success: true,
    data: {
      company:          { id: user.company.id, name: user.company.name },
      currentQuarter,
      latestScore,
      scoreHistory,
      latestMetrics,
      metricsHistory,
      assessmentStatus,
      participantCount: latestScore?.participantCount ?? 0,
    },
  })
}
