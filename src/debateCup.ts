import type { DebateCupRecord, GameState } from './types'

export const DEBATE_ORG_ID = 'org-debate'
export const DEBATE_CUP_SLOT = 17 // 周六晚上

export interface DebateCupEdition {
  id: string
  seasonIndex: number
  seasonId: string
  label: string
}

export const DEBATE_CUP_EDITIONS: DebateCupEdition[] = [
  { id: 'yongshi-y1', seasonIndex: 1, seasonId: 'y1-winter', label: '大一 · 冬' },
  { id: 'yongshi-y2', seasonIndex: 5, seasonId: 'y2-winter', label: '大二 · 冬' },
]

export const DEBATE_CUP_ROUNDS = ['小组赛', '预决赛', '总决赛'] as const

export function debateEditionForState(state: GameState): DebateCupEdition | null {
  return DEBATE_CUP_EDITIONS.find((edition) => edition.seasonIndex === state.seasonIndex) ?? null
}

export function debateCupRecordFor(
  state: GameState,
  editionId: string,
): DebateCupRecord | undefined {
  return state.debateCups.find((record) => record.editionId === editionId)
}

export function createDebateCupRecord(edition: DebateCupEdition): DebateCupRecord {
  return {
    editionId: edition.id,
    seasonId: edition.seasonId,
    label: edition.label,
    appearances: [false, false, false],
    watched: [false, false, false],
    teamChampion: Math.random() < 0.5,
    teamBestDebater: Math.random() < 0.75,
    playerBestDebater: false,
    settled: false,
  }
}

export function debateMember(state: GameState) {
  return state.clubMemberships.find((membership) => membership.orgId === DEBATE_ORG_ID)
}

export function bestDebaterChance(comprehension: number): number {
  return Math.min(0.85, 0.15 + comprehension * 0.05)
}
