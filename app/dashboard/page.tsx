'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from 'recharts'
import { getScoreLevel, SCORE_LEVEL_COLOURS, getQuarterLabel } from '@/lib/scoring'


// ─── Score gauge component ────────────────────────────────────────────────
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const level = getScoreLevel(score)
  const colour = SCORE_LEVEL_COLOURS[level]
  const levelLabels = { CRITICAL: 'Critical', EMERGING: 'Emerging', DEVELOPING: 'Developing', STRONG: 'Strong' }

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-36 h-36 rounded-full flex flex-col items-center justify-center border-8"
        style={{ borderColor: colour }}
      >
        <span className="text-4xl font-bold text-[#1A1814]">{score}%</span>
        <span className="text-xs font-medium mt-1" style={{ color: colour }}>
          {levelLabels[level]}
        </span>
      </div>
      <span className="text-sm text-[#5A5650] mt-3 font-medium">{label}</span>
    </div>
  )
}

// ─── Score level badge ─────────────────────────────────────────────────────
function LevelBadge({ score }: { score: number }) {
  const level  = getScoreLevel(score)
  const colour = SCORE_LEVEL_COLOURS[level]
  const labels = { CRITICAL: 'Critical', EMERGING: 'Emerging', DEVELOPING: 'Developing', STRONG: 'Strong' }
  return (
    <span
      className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: colour + '20', color: colour }}
    >
      {labels[level]}
    </span>
  )
}

// ─── Pillar card ───────────────────────────────────────────────────────────
function PillarCard({
  title, score, weight, subDimensions
}: {
  title: string
  score: number
  weight: string
  subDimensions: { name: string; score: number }[]
}) {
  const colour = SCORE_LEVEL_COLOURS[getScoreLevel(score)]
  return (
    <div className="bg-white rounded-xl border border-[#E2DDD5] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-[#1A1814] text-sm">{title}</p>
          <p className="text-xs text-[#9A968F] mt-0.5">Weight: {weight}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: colour }}>{score}%</p>
          <LevelBadge score={score} />
        </div>
      </div>
      <div className="space-y-2.5">
        {subDimensions.map(sub => (
          <div key={sub.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#5A5650]">{sub.name}</span>
              <span className="font-medium text-[#1A1814]">{sub.score}%</span>
            </div>
            <div className="h-1.5 bg-[#F0ECE5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${sub.score}%`,
                  background: SCORE_LEVEL_COLOURS[getScoreLevel(sub.score)]
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HR metric row ─────────────────────────────────────────────────────────
function MetricRow({
  label, value, benchmark, unit = '%', inverse = false
}: {
  label: string; value: number | null; benchmark: string; unit?: string; inverse?: boolean
}) {
  if (value === null) return null
  return (
    <tr className="border-b border-[#F0ECE5] last:border-0">
      <td className="py-3 text-sm text-[#5A5650]">{label}</td>
      <td className="py-3 text-sm font-semibold text-[#1A1814] text-right">
        {value}{unit}
      </td>
      <td className="py-3 text-xs text-[#9A968F] text-right">{benchmark}</td>
    </tr>
  )
}

// ─── Main dashboard ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      // Get current user + company
      const meRes = await fetch('/api/auth/me')
      const me    = await meRes.json()
      if (me.success) setCompany(me.data.company)

      // Get dashboard data
      const dashRes = await fetch('/api/dashboard')
      const dash    = await dashRes.json()
      if (dash.success) setData(dash.data)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-[#5A5650] text-sm">Loading dashboard...</div>
      </div>
    )
  }

  const score    = data?.latestScore
  const metrics  = data?.latestMetrics
  const history  = data?.scoreHistory ?? []

  const chartData = history.map((s: any) => ({
    quarter:      getQuarterLabel(s.quarter),
    HQ:           s.overallScore,
    Humanity:     s.humanityScore,
    Connection:   s.connectionScore,
    Consciousness:s.consciousnessScore,
  }))

  const radarData = score ? [
    { dimension: 'Self-Love',        score: score.selfLoveScore },
    { dimension: 'Proximate Love',   score: score.proximateLoveScore },
    { dimension: 'Universal Love',   score: score.universalLoveScore },
    { dimension: 'Colleague Conn.',  score: score.colleagueConnectionScore },
    { dimension: 'Universal Conn.',  score: score.universalConnectionScore },
    { dimension: 'Emotional Cons.',  score: score.emotionalConsciousnessScore },
    { dimension: 'Relational Cons.', score: score.relationalConsciousnessScore },
  ] : []

  return (
    <div className="min-h-screen bg-[#F7F5F0]">

      {/* Top nav */}
      <header className="bg-white border-b border-[#E2DDD5] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#1D5C3A] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">HQ</span>
          </div>
          <span className="font-semibold text-[#1A1814]">HQ Code</span>
          {company && (
            <>
              <span className="text-[#E2DDD5]">|</span>
              <span className="text-sm text-[#5A5650]">{company.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#9A968F]">
            {data?.currentQuarter ? getQuarterLabel(data.currentQuarter) : ''}
          </span>
          <button
            onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login')}
            className="text-xs text-[#5A5650] hover:text-[#1A1814]"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A1814]">HQ Dashboard</h1>
          <p className="text-sm text-[#5A5650] mt-1">
            Humanity Quotient overview — {company?.name}
          </p>
        </div>

        {!score ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-[#E2DDD5] p-12 text-center">
            <div className="w-16 h-16 bg-[#F0ECE5] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-lg font-semibold text-[#1A1814] mb-2">No assessment data yet</h2>
            <p className="text-sm text-[#5A5650] max-w-md mx-auto mb-6">
              Share the assessment forms with your employees to generate your first HQ score.
              Results will appear here once the assessment period closes.
            </p>
            <a
              href="/assessment"
              className="inline-block bg-[#1D5C3A] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#164d30] transition-colors"
            >
              Go to Assessment
            </a>
          </div>
        ) : (
          <>
            {/* Overall score row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
              <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 flex flex-col items-center justify-center md:col-span-1">
                <ScoreGauge score={score.overallScore} label="Overall HQ Score" />
                {score.sectorAvgScore && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-[#9A968F]">Sector average</p>
                    <p className="text-sm font-semibold text-[#1A1814]">{score.sectorAvgScore}%</p>
                    <p className={`text-xs font-medium ${(score.overallScore - score.sectorAvgScore) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {score.overallScore - score.sectorAvgScore > 0 ? '+' : ''}
                      {(score.overallScore - score.sectorAvgScore).toFixed(1)} pp vs sector
                    </p>
                  </div>
                )}
              </div>

              {/* Score level legend */}
              <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 md:col-span-3">
                <p className="text-xs font-semibold text-[#9A968F] uppercase tracking-wider mb-4">
                  Score scale
                </p>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {(['STRONG', 'DEVELOPING', 'EMERGING', 'CRITICAL'] as const).map(level => (
                    <div
                      key={level}
                      className={`rounded-lg p-3 text-center ${score && getScoreLevel(score.overallScore) === level ? 'ring-2 ring-offset-1' : ''}`}
                      style={{
                        background: SCORE_LEVEL_COLOURS[level] + '15',
                        // ring applied via className
                      }}
                    >
                      <p className="text-xs font-semibold" style={{ color: SCORE_LEVEL_COLOURS[level] }}>
                        {level === 'STRONG' ? 'Strong' : level === 'DEVELOPING' ? 'Developing' : level === 'EMERGING' ? 'Emerging' : 'Critical'}
                      </p>
                      <p className="text-xs text-[#9A968F] mt-0.5">
                        {level === 'STRONG' ? '75–100%' : level === 'DEVELOPING' ? '50–74%' : level === 'EMERGING' ? '25–49%' : '0–24%'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#F7F5F0] rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9A968F]">Participants</p>
                    <p className="text-xl font-bold text-[#1A1814] mt-1">{score.participantCount}</p>
                  </div>
                  <div className="bg-[#F7F5F0] rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9A968F]">Quarter</p>
                    <p className="text-sm font-bold text-[#1A1814] mt-1">{getQuarterLabel(score.quarter)}</p>
                  </div>
                  <div className="bg-[#F7F5F0] rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9A968F]">Level</p>
                    <p className="text-sm font-bold mt-1" style={{ color: SCORE_LEVEL_COLOURS[getScoreLevel(score.overallScore)] }}>
                      {getScoreLevel(score.overallScore).charAt(0) + getScoreLevel(score.overallScore).slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Three pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <PillarCard
                title="Humanity Level"
                score={score.humanityScore}
                weight="54%"
                subDimensions={[
                  { name: 'Self-Love',      score: score.selfLoveScore },
                  { name: 'Proximate Love', score: score.proximateLoveScore },
                  { name: 'Universal Love', score: score.universalLoveScore },
                ]}
              />
              <PillarCard
                title="Connection Level"
                score={score.connectionScore}
                weight="35%"
                subDimensions={[
                  { name: 'Colleague Connection', score: score.colleagueConnectionScore },
                  { name: 'Universal Connection', score: score.universalConnectionScore },
                ]}
              />
              <PillarCard
                title="Consciousness Level"
                score={score.consciousnessScore}
                weight="14%"
                subDimensions={[
                  { name: 'Emotional',    score: score.emotionalConsciousnessScore },
                  { name: 'Relational',   score: score.relationalConsciousnessScore },
                  { name: 'Universal',    score: score.universalConsciousnessScore },
                ]}
              />
            </div>

            {/* Charts row */}
            {chartData.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {/* Trend line chart */}
                <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 md:col-span-2">
                  <p className="text-sm font-semibold text-[#1A1814] mb-4">HQ trend by quarter</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE5" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#9A968F' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9A968F' }} />
                      <Tooltip
                        contentStyle={{ border: '0.5px solid #E2DDD5', borderRadius: 8, fontSize: 12 }}
                        formatter={(value: any) => [`${value}%`]}
                      />
                      <Line type="monotone" dataKey="HQ"            stroke="#1D5C3A" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Humanity"      stroke="#C8A96E" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="Connection"    stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="Consciousness" stroke="#A855F7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar chart */}
                <div className="bg-white rounded-xl border border-[#E2DDD5] p-5">
                  <p className="text-sm font-semibold text-[#1A1814] mb-4">Dimension radar</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#F0ECE5" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: '#9A968F' }} />
                      <Radar dataKey="score" stroke="#1D5C3A" fill="#1D5C3A" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* HR Metrics */}
            {metrics && (
              <div className="bg-white rounded-xl border border-[#E2DDD5] p-5">
                <p className="text-sm font-semibold text-[#1A1814] mb-4">
                  HR Metrics — {getQuarterLabel(metrics.quarter)}
                </p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0ECE5]">
                      <th className="text-left text-xs text-[#9A968F] font-medium pb-2">Metric</th>
                      <th className="text-right text-xs text-[#9A968F] font-medium pb-2">Value</th>
                      <th className="text-right text-xs text-[#9A968F] font-medium pb-2">Benchmark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <MetricRow label="Turnover Rate"               value={metrics.turnoverRate}               benchmark="12–15% (UK)" />
                    <MetricRow label="Absenteeism Rate"            value={metrics.absenteeismRate}            benchmark="3.5–4.0%" />
                    <MetricRow label="Burnout Leave (% of staff)"  value={metrics.burnoutLeaveStaffPct}       benchmark="<3%" />
                    <MetricRow label="Internal Promotion Rate"     value={metrics.internalPromotionRate}      benchmark="25–30%" />
                    <MetricRow label="eNPS"                        value={metrics.enps}                       benchmark="+30 to +50" unit="" />
                    <MetricRow label="Wellbeing Participation"     value={metrics.wellbeingParticipationRate} benchmark=">50%" />
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
