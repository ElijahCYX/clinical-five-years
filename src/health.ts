import type {
  GameState,
  HealthCondition,
  HealthTreatment,
  IllnessKind,
  IllnessSeverity,
  WeatherKind,
} from './types'

export const WEATHER_LABELS: Record<WeatherKind, string> = {
  sunny: '晴',
  rain: '雨',
  cold: '降温',
  heat: '高温',
}

export function weatherLabel(weather: WeatherKind): string {
  return WEATHER_LABELS[weather] ?? '晴'
}

function rollWeather(): WeatherKind {
  const roll = Math.random()
  if (roll < 0.18) return 'rain'
  if (roll < 0.36) return 'cold'
  if (roll < 0.5) return 'heat'
  return 'sunny'
}

function weatherRisk(state: GameState): number {
  if (state.weather === 'cold') return 0.19
  if (state.weather === 'rain') return 0.16
  if (state.weather === 'heat') return 0.13
  return 0.1
}

function illnessLabel(kind: IllnessKind): string {
  return {
    cold: '感冒',
    flu: '流感',
    overwork: '过劳病倒',
    injury: '运动受伤',
    accident: '意外受伤',
  }[kind]
}

function severityFor(kind: IllnessKind): IllnessSeverity {
  if (kind === 'cold') return Math.random() < 0.3 ? 'moderate' : 'mild'
  if (kind === 'flu') return Math.random() < 0.25 ? 'severe' : 'moderate'
  if (kind === 'overwork') return 'moderate'
  if (kind === 'accident') return Math.random() < 0.35 ? 'severe' : 'moderate'
  return 'mild'
}

function daysFor(kind: IllnessKind, severity: IllnessSeverity): number {
  if (kind === 'flu') return severity === 'severe' ? 5 : 4
  if (kind === 'overwork') return 3
  if (kind === 'injury') return 4
  if (kind === 'accident') return severity === 'severe' ? 6 : 4
  return 3
}

function makeCondition(
  kind: IllnessKind,
  source: string,
): HealthCondition {
  const severity = severityFor(kind)
  return {
    id: `health-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    label: illnessLabel(kind),
    severity,
    source,
    daysLeft: daysFor(kind, severity),
    treatment: 'none',
  }
}

export function activeHealth(state: GameState): HealthCondition[] {
  return state.healthConditions ?? []
}

/** Temporary energy ceiling while ill or injured. */
export function healthEnergyCap(state: GameState): number {
  let cap = 100
  for (const condition of activeHealth(state)) {
    if (condition.kind === 'cold') {
      cap = Math.min(cap, condition.severity === 'severe' ? 75 : condition.severity === 'moderate' ? 80 : 90)
    } else if (condition.kind === 'flu') {
      cap = Math.min(cap, condition.severity === 'severe' ? 65 : 75)
    } else if (condition.kind === 'overwork') {
      cap = Math.min(cap, 80)
    } else if (condition.kind === 'accident') {
      cap = Math.min(cap, condition.severity === 'severe' ? 70 : 85)
    } else if (condition.kind === 'injury') {
      cap = Math.min(cap, 95)
    }
  }
  return cap
}

export function healthPrepMultiplier(state: GameState): number {
  const conditions = activeHealth(state)
  if (conditions.some((item) => item.kind === 'flu')) return 0.65
  if (conditions.some((item) => item.kind === 'overwork')) return 0.75
  if (conditions.some((item) => item.kind === 'accident')) return 0.85
  if (conditions.some((item) => item.kind === 'cold')) return 0.85
  return 1
}

export function healthEnergyPenalty(state: GameState): number {
  return activeHealth(state).reduce((sum, item) => {
    if (item.kind === 'flu') return sum + 8
    if (item.kind === 'overwork') return sum + 6
    if (item.kind === 'cold') return sum + 3
    return sum
  }, 0)
}

export function healthStressPenalty(state: GameState): number {
  return activeHealth(state).reduce((sum, item) => {
    if (item.kind === 'flu') return sum + 4
    if (item.kind === 'overwork') return sum + 3
    if (item.kind === 'cold') return sum + 2
    return sum
  }, 0)
}

export function healthLocksSport(state: GameState): boolean {
  return activeHealth(state).some(
    (item) => item.kind === 'injury' || item.kind === 'accident',
  )
}

export function advanceHealthForNewWeek(
  state: GameState,
  selected: string[],
): GameState {
  let next: GameState = {
    ...state,
    weather: rollWeather(),
    weatherWeekKey: `${state.season.id}-${state.week}`,
  }
  const remaining: HealthCondition[] = []
  const history = [...(next.healthHistory ?? [])]
  for (const condition of activeHealth(next)) {
    const daysLeft = condition.daysLeft - 1
    if (daysLeft <= 0) {
      history.push({
        id: `${condition.id}-history`,
        label: condition.label,
        kind: condition.kind,
        weekLabel: `${state.season.seasonLabel} 第 ${state.week} 周`,
        note: condition.source,
      })
    } else {
      remaining.push({ ...condition, daysLeft })
    }
  }
  next = { ...next, healthConditions: remaining, healthHistory: history }
  if (next.pendingHealthEvent || remaining.length > 0) return next
  if (next.week > 3) return next

  const ordinaryAvailable =
    next.healthIllnessSeason !== next.season.id &&
    next.seasonIndex >= 0
  let condition: HealthCondition | null = null
  const roll = Math.random()
  if (ordinaryAvailable && roll < weatherRisk(next)) {
    const kind: IllnessKind = Math.random() < 0.3 ? 'flu' : 'cold'
    condition = makeCondition(kind, `天气变化（${weatherLabel(next.weather)}）`)
    next = { ...next, healthIllnessSeason: next.season.id }
  } else if (
    (next.stress >= 80 || next.energy <= 20) &&
    Math.random() < 0.28
  ) {
    condition = makeCondition('overwork', '连续高压与精力透支')
  } else if (selected.includes('sport') && Math.random() < 0.08) {
    condition = makeCondition('injury', '体育课 / 运动中的意外扭伤')
  } else if (Math.random() < 0.02) {
    condition = makeCondition('accident', '校园路上的意外')
  }
  if (!condition) return next
  const withCondition = {
    ...next,
    healthConditions: [...remaining, condition],
    pendingHealthEvent: { conditionId: condition.id },
  }
  return {
    ...withCondition,
    energy: Math.min(withCondition.energy, healthEnergyCap(withCondition)),
  }
}

export function applyHealthTreatment(
  state: GameState,
  treatment: HealthTreatment,
): GameState {
  const pending = state.pendingHealthEvent
  if (!pending) return state
  const condition = state.healthConditions.find(
    (item) => item.id === pending.conditionId,
  )
  if (!condition) return { ...state, pendingHealthEvent: null }
  let money = state.money
  let stress = state.stress
  let daysLeft = condition.daysLeft
  if (treatment === 'medicine') {
    money -= 30
    daysLeft = Math.max(1, daysLeft - 1)
  } else if (treatment === 'dorm') {
    daysLeft = Math.max(1, daysLeft - 2)
    stress = Math.max(0, stress - 5)
  } else if (treatment === 'clinic') {
    money -= 100
    daysLeft = Math.max(1, daysLeft - 3)
    stress = Math.max(0, stress - 8)
  } else {
    daysLeft += 1
  }
  return {
    ...state,
    money: Math.max(0, money),
    stress,
    pendingHealthEvent: null,
    healthConditions: state.healthConditions.map((item) =>
      item.id === condition.id
        ? { ...item, treatment, daysLeft }
        : item,
    ),
  }
}
