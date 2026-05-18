/**
 * HQ Scoring Engine
 * 
 * Implements Olga's three-pillar weighted scoring model:
 * - Humanity Level:     54% weight (Self-Love, Proximate Love, Universal Love)
 * - Connection Level:   35% weight (Colleague Connection, Universal Connection)
 * - Consciousness Level: 14% weight (Emotional, Relational, Universal Consciousness)
 * 
 * Scores are expressed as 0–100 percentages.
 * Levels: CRITICAL (0–24) | EMERGING (25–49) | DEVELOPING (50–74) | STRONG (75–100)
 */

// ─── Pillar weights (must sum to 1.0) ──────────────────────────────────────
export const PILLAR_WEIGHTS = {
  humanity:      0.54,
  connection:    0.35,
  consciousness: 0.14,
} as const

// ─── Sub-dimension weights within each pillar (must sum to 1.0) ────────────
export const SUB_WEIGHTS = {
  humanity: {
    selfLove:       0.42,
    proximateLove:  0.29,
    universalLove:  0.29,
  },
  connection: {
    colleagueConnection: 0.56,
    universalConnection: 0.44,
  },
  consciousness: {
    emotional:    0.50,
    relational:   0.38,
    universal:    0.12,
  },
} as const

// ─── Score level classification ─────────────────────────────────────────────
export type ScoreLevel = 'CRITICAL' | 'EMERGING' | 'DEVELOPING' | 'STRONG'

export function getScoreLevel(score: number): ScoreLevel {
  if (score < 25) return 'CRITICAL'
  if (score < 50) return 'EMERGING'
  if (score < 75) return 'DEVELOPING'
  return 'STRONG'
}

export const SCORE_LEVEL_LABELS: Record<ScoreLevel, string> = {
  CRITICAL:   'Critical',
  EMERGING:   'Emerging',
  DEVELOPING: 'Developing',
  STRONG:     'Strong',
}

export const SCORE_LEVEL_COLOURS: Record<ScoreLevel, string> = {
  CRITICAL:   '#E24B4A',
  EMERGING:   '#F59E0B',
  DEVELOPING: '#3B82F6',
  STRONG:     '#22C55E',
}

// ─── Input types ────────────────────────────────────────────────────────────
export interface SubDimensionScores {
  // Humanity pillar
  selfLove:               number // 0–100
  proximateLove:          number
  universalLove:          number
  // Connection pillar
  colleagueConnection:    number
  universalConnection:    number
  // Consciousness pillar
  emotional:              number
  relational:             number
  universal:              number
}

export interface HQScoreResult {
  // Overall
  overallScore:            number
  overallLevel:            ScoreLevel

  // Pillar scores
  humanityScore:           number
  humanityLevel:           ScoreLevel
  connectionScore:         number
  connectionLevel:         ScoreLevel
  consciousnessScore:      number
  consciousnessLevel:      ScoreLevel

  // Sub-dimension scores (pass-through)
  subDimensions:           SubDimensionScores

  // Benchmarking (optional — populated once we have sector data)
  sectorAvg?:              number
  pointsVsSector?:         number
}

// ─── Core calculation ────────────────────────────────────────────────────────
export function calculateHQScore(
  subs: SubDimensionScores,
  sectorAvg?: number
): HQScoreResult {
  // Pillar scores (weighted average of sub-dimensions)
  const humanityScore = round(
    subs.selfLove       * SUB_WEIGHTS.humanity.selfLove +
    subs.proximateLove  * SUB_WEIGHTS.humanity.proximateLove +
    subs.universalLove  * SUB_WEIGHTS.humanity.universalLove
  )

  const connectionScore = round(
    subs.colleagueConnection * SUB_WEIGHTS.connection.colleagueConnection +
    subs.universalConnection * SUB_WEIGHTS.connection.universalConnection
  )

  const consciousnessScore = round(
    subs.emotional * SUB_WEIGHTS.consciousness.emotional +
    subs.relational * SUB_WEIGHTS.consciousness.relational +
    subs.universal  * SUB_WEIGHTS.consciousness.universal
  )

  // Overall HQ score
  const overallScore = round(
    humanityScore      * PILLAR_WEIGHTS.humanity +
    connectionScore    * PILLAR_WEIGHTS.connection +
    consciousnessScore * PILLAR_WEIGHTS.consciousness
  )

  return {
    overallScore,
    overallLevel:        getScoreLevel(overallScore),
    humanityScore,
    humanityLevel:       getScoreLevel(humanityScore),
    connectionScore,
    connectionLevel:     getScoreLevel(connectionScore),
    consciousnessScore,
    consciousnessLevel:  getScoreLevel(consciousnessScore),
    subDimensions:       subs,
    sectorAvg,
    pointsVsSector:      sectorAvg !== undefined
                           ? round(overallScore - sectorAvg)
                           : undefined,
  }
}

// ─── Quarter helpers ─────────────────────────────────────────────────────────
export function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

export function getQuarterLabel(quarter: string): string {
  // "2026-Q2" → "Q2 2026"
  const [year, q] = quarter.split('-')
  return `${q} ${year}`
}

export function getPreviousQuarters(current: string, count = 4): string[] {
  const [year, q] = current.split('-')
  const quarters: string[] = []
  let y = parseInt(year)
  let qNum = parseInt(q.replace('Q', ''))

  for (let i = 0; i < count; i++) {
    quarters.unshift(`${y}-Q${qNum}`)
    qNum--
    if (qNum === 0) { qNum = 4; y-- }
  }
  return quarters
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function round(n: number, decimals = 1): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
