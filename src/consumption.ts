import { academicYearForSeason } from './social'
import type {
  ConsumptionEvent,
  ConsumptionPurchase,
  GameState,
  SoloInvite,
} from './types'

const rawId = (id: string) => id.replace(/^cons-/, '')

export function currentAcademicYear(state: GameState): number {
  return academicYearForSeason(state.seasonIndex)
}

export function consumptionDayOrdinal(state: GameState): number {
  return (
    state.seasonIndex * 28 +
    (state.week - 1) * 7 +
    Math.floor(state.weekSlot / 3)
  )
}

function activePurchaseRecord(
  state: GameState,
  eventId: string,
): ConsumptionPurchase | undefined {
  const id = rawId(eventId)
  const year = currentAcademicYear(state)
  return [...(state.consumptionPurchases ?? [])]
    .reverse()
    .find((purchase) => {
      if (purchase.eventId !== id) return false
      if (purchase.duration === 'permanent') return true
      if (purchase.duration === 'year') return purchase.expiresYear === year
      return purchase.expiresSeasonIndex === state.seasonIndex
    })
}

export function hasConsumption(state: GameState, eventId: string): boolean {
  return Boolean(activePurchaseRecord(state, eventId))
}

export function consumptionExcludedIds(state: GameState): string[] {
  const year = currentAcademicYear(state)
  return [
    ...new Set(
      (state.consumptionPurchases ?? [])
        .filter(
          (purchase) =>
            purchase.duration === 'permanent' ||
            (purchase.duration === 'year' && purchase.expiresYear === year) ||
            (purchase.duration === 'semester' &&
              purchase.expiresSeasonIndex === state.seasonIndex),
        )
        .map((purchase) => purchase.eventId),
    ),
  ]
}

export function makeConsumptionPurchase(
  state: GameState,
  event: ConsumptionEvent,
  mode: 'full' | 'installment',
): ConsumptionPurchase {
  const year = currentAcademicYear(state)
  return {
    id: `${event.id}-${state.seasonIndex}-${state.week}-${Date.now()}`,
    eventId: rawId(event.id),
    title: event.title,
    duration: event.duration,
    purchasedYear: year,
    purchasedSeasonIndex: state.seasonIndex,
    purchasedDayIndex: consumptionDayOrdinal(state),
    expiresYear: event.duration === 'year' ? year : undefined,
    expiresSeasonIndex:
      event.duration === 'semester' ? state.seasonIndex : undefined,
    installmentWeeks: event.installment?.weeks ?? 0,
    installmentAmount: event.installment?.amount ?? 0,
    installmentRemaining:
      mode === 'installment' ? Math.max(0, (event.installment?.weeks ?? 0) - 1) : 0,
  }
}

export function addImmediateConsumptionEffects(
  state: GameState,
  event: ConsumptionEvent,
): GameState {
  const effects = event.effects
  let prep = { ...state.prep }
  if (event.id === 'cons-books' || event.id === 'cons-textbook') {
    for (const course of state.season.courses) {
      if (course.electiveType) continue
      prep[course.id] = Math.min(100, (prep[course.id] ?? 0) + 5)
    }
  } else if (effects.prep && state.season.courses.length > 0) {
    const course =
      state.season.courses[Math.floor(Math.random() * state.season.courses.length)]
    prep[course.id] = Math.min(100, (prep[course.id] ?? 0) + effects.prep)
  }
  return {
    ...state,
    prep,
    energy: Math.max(
      0,
      Math.min(100, state.energy + (effects.energy ?? 0)),
    ),
    stress: Math.max(
      0,
      Math.min(100, state.stress + (effects.stress ?? 0)),
    ),
    constitutionGrowth: Math.max(
      0,
      state.constitutionGrowth + (effects.constitutionGrowth ?? 0),
    ),
    consumptionConcertDays:
      event.id === 'cons-concert' ? 2 : state.consumptionConcertDays,
    consumptionConcertStartDay:
      event.id === 'cons-concert'
        ? consumptionDayOrdinal(state)
        : state.consumptionConcertStartDay,
  }
}

export function applyWeeklyConsumptionEffects(state: GameState): GameState {
  let constitutionGrowth = state.constitutionGrowth
  if ((state.player?.attrs.constitution ?? 0) < 15) {
    if (hasConsumption(state, 'cons-gym')) constitutionGrowth += 5
    if (hasConsumption(state, 'cons-band')) constitutionGrowth += 5
    if (hasConsumption(state, 'cons-mat')) constitutionGrowth += 4
  }
  return { ...state, constitutionGrowth }
}

export function chargeConsumptionInstallments(state: GameState): GameState {
  let money = state.money
  const consumptionPurchases = (state.consumptionPurchases ?? []).map(
    (purchase) => {
      if (purchase.installmentRemaining <= 0) return purchase
      if (money < purchase.installmentAmount) {
        // With no money left, the instalment pauses and resumes next week.
        money = 0
        return purchase
      }
      money -= purchase.installmentAmount
      return {
        ...purchase,
        installmentRemaining: purchase.installmentRemaining - 1,
      }
    },
  )
  return { ...state, money: Math.max(0, money), consumptionPurchases }
}

export function applyConsumptionWeekStart(state: GameState): GameState {
  return chargeConsumptionInstallments(applyWeeklyConsumptionEffects(state))
}

export function applyDailyConsumptionEffects(
  state: GameState,
  dayIndex: number,
): GameState {
  if (state.vacation || state.week > 3) return state
  const dayOrdinal =
    state.seasonIndex * 28 + (state.week - 1) * 7 + dayIndex
  const active = (eventId: string) => {
    const purchase = activePurchaseRecord(state, eventId)
    return Boolean(purchase && purchase.purchasedDayIndex < dayOrdinal)
  }
  const stressReduction =
    (active('cons-phone') ? 4 : 0) +
    (active('cons-massager') ? 1 : 0) +
    (active('cons-shoes') ? 2 : 0) +
    (active('cons-skincare') ? 1 : 0) +
    (active('cons-ereader') ? 2 : 0) +
    (active('cons-fridge') ? 5 : 0) +
    (active('cons-airfryer') ? 2 : 0) +
    (active('cons-laundry') ? 2 : 0) +
    (active('cons-lamp') ? 1 : 0) +
    (active('cons-chair') ? 3 : 0)
  const energyGain = active('cons-fridge') ? 5 : 0
  let energy = state.energy + energyGain
  let stress = state.stress - stressReduction
  let appearanceGrowth = state.appearanceGrowth
  if (
    active('cons-skincare') &&
    (state.player?.attrs.appearance ?? 0) < 15
  ) {
    appearanceGrowth += 1 * consumptionAppearanceMultiplier(state)
  }
  let prep = { ...state.prep }
  const addRandomPrep = () => {
    if (state.season.courses.length === 0) return
    const course =
      state.season.courses[Math.floor(Math.random() * state.season.courses.length)]
    prep[course.id] = Math.min(100, (prep[course.id] ?? 0) + 1)
  }
  if (active('cons-printer')) addRandomPrep()
  if (active('cons-course')) addRandomPrep()
  let consumptionConcertDays = state.consumptionConcertDays ?? 0
  if (
    consumptionConcertDays > 0 &&
    dayOrdinal > (state.consumptionConcertStartDay ?? 0)
  ) {
    energy += 5
    stress -= 10
    consumptionConcertDays -= 1
  }
  return {
    ...state,
    energy: Math.max(0, Math.min(100, energy)),
    stress: Math.max(0, Math.min(100, stress)),
    appearanceGrowth,
    prep,
    consumptionConcertDays,
  }
}

export function activeInstallmentSummary(state: GameState): {
  count: number
  weekly: number
} {
  const pending = (state.consumptionPurchases ?? []).filter(
    (purchase) => purchase.installmentRemaining > 0,
  )
  return {
    count: pending.length,
    weekly: pending.reduce(
      (sum, purchase) => sum + purchase.installmentAmount,
      0,
    ),
  }
}


export function applyBreakfastConsumptionEffect(
  state: GameState,
  dayIndex: number,
): GameState {
  const purchase = activePurchaseRecord(state, 'cons-breakfast')
  if (!purchase) return state
  const dayOrdinal =
    state.seasonIndex * 28 + (state.week - 1) * 7 + dayIndex
  if (purchase.purchasedDayIndex >= dayOrdinal) return state
  const dayKey = `${state.seasonIndex}-${state.week}-${dayIndex}`
  if (state.sleepInDayKey === dayKey) return state
  return { ...state, energy: Math.min(100, state.energy + 5) }
}

export function consumptionCoffeeCost(state: GameState, base: number): number {
  return hasConsumption(state, 'cons-coffee') ? 0 : base
}

export function consumptionSelfCareCost(state: GameState, base: number): number {
  return hasConsumption(state, 'cons-delivery') ? Math.max(0, base - 10) : base
}

export function consumptionSoloChanceBonus(state: GameState): number {
  return hasConsumption(state, 'cons-phone') ? 5 : 0
}

export function consumptionLibraryMultiplier(state: GameState): number {
  return hasConsumption(state, 'cons-headphone') ? 1.05 : 1
}

export function consumptionExamReviewStressReduction(state: GameState): number {
  return hasConsumption(state, 'cons-books') ? 5 : 0
}

export function consumptionExamPrepGainMultiplier(state: GameState): number {
  return hasConsumption(state, 'cons-textbook') ? 1.1 : 1
}

export function consumptionAppearanceMultiplier(state: GameState): number {
  return hasConsumption(state, 'cons-shoes') ? 1.5 : 1
}

export function consumptionSoloDateCost(
  state: GameState,
  invite: SoloInvite,
): number {
  if (invite.eventId === 'movie' && hasConsumption(state, 'cons-movie')) {
    return 30
  }
  if (invite.eventId === 'internetCafe' && hasConsumption(state, 'cons-park')) {
    const relation = state.relationships.find(
      (item) => item.id === invite.relationshipId,
    )
    if (relation?.bondType === 'brother') return 0
  }
  return 50
}

export function consumptionCampingUnlocked(state: GameState): boolean {
  return hasConsumption(state, 'cons-camping')
}
