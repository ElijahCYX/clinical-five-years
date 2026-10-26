import { SOLO_EVENTS, SOLO_EVENT_BY_ID, type SoloEventDef, type SoloSeasonKind } from './soloData'
import { buildTimetable, TIMETABLE_DAYS, TIMETABLE_SLOTS } from './timetable'
import type { BondType, GameState, Relationship, SoloChatLine, SoloInvite } from './types'

export const SOLO_MAX_WEEKLY_SUCCESS = 2
export const SOLO_EFFECTS = {
  intimacy: 5,
  energy: -10,
  money: -50,
} as const

export function soloWeekKey(state: GameState): string {
  return `${state.season.id}-${state.week}`
}

export function soloDayKey(state: GameState): string {
  return `${soloWeekKey(state)}-${Math.floor(state.weekSlot / 3)}`
}

export function soloSeasonKind(state: GameState): SoloSeasonKind {
  const id = state.season.id
  if (id.includes('spring')) return 'spring'
  if (id.includes('summer')) return 'summer'
  if (id.includes('autumn')) return 'autumn'
  return 'winter'
}

export function bondOf(relation: Relationship): BondType {
  return relation.bondType ?? 'lover'
}

export function soloContacts(state: GameState): Relationship[] {
  return state.relationships.filter(
    (relation) => Boolean(relation.bondType) || relation.partner,
  )
}

export function soloSuccessCount(state: GameState, relationshipId: string): number {
  const weekKey = soloWeekKey(state)
  return (state.soloInvites ?? []).filter(
    (invite) =>
      invite.weekKey === weekKey && invite.relationshipId === relationshipId,
  ).length
}

export function soloRefusedToday(state: GameState, relationshipId: string): boolean {
  return (state.soloRefusals ?? {})[relationshipId] === soloDayKey(state)
}

export function soloContactBlocked(state: GameState, relation: Relationship): boolean {
  return soloSuccessCount(state, relation.id) >= SOLO_MAX_WEEKLY_SUCCESS
}

export function soloSuccessChance(intimacy: number): number {
  return Math.max(25, Math.min(100, 25 + intimacy * 0.75))
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function drawSoloOptions(
  bond: BondType,
  season: SoloSeasonKind,
): SoloEventDef[] {
  const pool = SOLO_EVENTS.filter(
    (event) =>
      (!event.bonds || event.bonds.includes(bond)) &&
      (!event.season || event.season === season),
  )
  const seasonal = pool.find((event) => event.season === season)
  const rest = shuffle(pool.filter((event) => event !== seasonal))
  const result = seasonal ? [seasonal, ...rest] : rest
  return result.slice(0, 4)
}

export function soloEventTimeHint(event: SoloEventDef): string {
  if (event.timing === 'morning') return '仅早上'
  if (event.timing === 'afternoon') return '仅下午'
  if (event.timing === 'evening') return '仅晚上'
  if (event.timing === 'not-evening') return '避开晚上'
  if (event.season === 'spring') return '春季限定'
  if (event.season === 'autumn') return '秋季限定'
  return '时间灵活'
}

export function soloSlotAllowed(event: SoloEventDef, slot: number): boolean {
  const phase = slot % 3
  if (event.timing === 'morning') return phase === 0
  if (event.timing === 'afternoon') return phase === 1
  if (event.timing === 'evening') return phase === 2
  if (event.timing === 'not-evening') return phase !== 2
  return true
}

export function soloSlotLabel(slot: number): string {
  return `${TIMETABLE_DAYS[Math.floor(slot / 3)]} · ${TIMETABLE_SLOTS[slot % 3]}`
}

export function findSoloSlot(
  state: GameState,
  event: SoloEventDef,
): number | null {
  const timetable = buildTimetable(state)
  const current = Math.max(0, Math.min(20, state.weekSlot))
  const isFree = (slot: number) => {
    const cell = timetable.cells[slot]
    if (!cell || cell.activity || cell.soloInvite) return false
    // A successfully skipped class leaves the current slot free for actions.
    if (cell.course) return slot === current && state.weekSlotSkipped
    return true
  }
  const unrestricted = !event.timing

  if (unrestricted) {
    if (isFree(current) && Math.random() < 0.75) return current
    const laterFree = Array.from(
      { length: 21 - current - 1 },
      (_, index) => current + 1 + index,
    ).filter(isFree)
    if (laterFree.length > 0) {
      return laterFree[Math.floor(Math.random() * laterFree.length)]
    }
    return isFree(current) ? current : null
  }

  const valid = Array.from(
    { length: 21 - current },
    (_, index) => current + index,
  ).filter((slot) => soloSlotAllowed(event, slot) && isFree(slot))
  if (valid.length === 0) return null
  return valid[Math.floor(Math.random() * valid.length)]
}

export function createSoloInvite(
  state: GameState,
  relation: Relationship,
  event: SoloEventDef,
  slot: number,
  chat: SoloChatLine[] = [],
): SoloInvite {
  return {
    id: `solo-${soloWeekKey(state)}-${relation.id}-${event.id}-${slot}-${Date.now()}`,
    relationshipId: relation.id,
    partnerName: relation.name,
    bondType: bondOf(relation),
    eventId: event.id,
    eventName: event.name,
    slot,
    weekKey: soloWeekKey(state),
    resolved: false,
    attemptSlot: state.weekSlot,
    chat,
  }
}

export function soloInviteAt(
  state: GameState,
  slot: number,
): SoloInvite | null {
  return (
    (state.soloInvites ?? []).find(
      (invite) =>
        invite.weekKey === soloWeekKey(state) &&
        invite.slot === slot &&
        !invite.resolved,
    ) ?? null
  )
}

export function soloEventForInvite(invite: SoloInvite): SoloEventDef | null {
  return SOLO_EVENT_BY_ID[invite.eventId] ?? null
}

export function soloAcceptanceText(slot: number): string {
  return `好呀，那 ${soloSlotLabel(slot)} 见。`
}
