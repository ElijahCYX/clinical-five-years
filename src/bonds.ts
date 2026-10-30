import { currentWeekKey } from './social'
import type { BondType, GameState, Player, Relationship } from './types'

export const BOND_DEFS: { type: BondType; label: string; description: string }[] = [
  {
    type: 'lover',
    label: '恋人',
    description: '确认彼此的心意，成为恋人。是否可选取决于你的性取向。',
  },
  {
    type: 'brother',
    label: '兄弟',
    description: '两个男生之间的牢固情谊，一起扛过考试和深夜。',
  },
  {
    type: 'sister',
    label: '闺蜜',
    description: '两个女生之间的亲密友谊，分享秘密，也分享零食。',
  },
]

export function bondLabel(type?: BondType): string {
  if (type === 'brother') return '兄弟'
  if (type === 'sister') return '闺蜜'
  return '恋人'
}

export function playerAllowsLover(player: Player, relation: Relationship): boolean {
  if (player.orientation === 'heterosexual') return player.gender !== relation.gender
  if (player.orientation === 'homosexual') return player.gender === relation.gender
  return true
}

export function bondTypeAvailable(
  player: Player,
  relation: Relationship,
  type: BondType,
): boolean {
  if (relation.kind === 'mentor') return false
  if (relation.intimacy < 59) return false
  if (relation.partner || relation.bondType) return false
  if (type === 'lover') {
    return !relation.confessRejected && playerAllowsLover(player, relation)
  }
  if (type === 'brother') {
    return player.gender === '男' && relation.gender === '男'
  }
  return player.gender === '女' && relation.gender === '女'
}

export const BROTHER_BOND_TEXT =
  '你们没有说什么矫情的话。TA 把胳膊搭到你肩上，说：“以后有事就说一声。”你嗯了一声，觉得这句话比很多漂亮话都重。'

export const SISTER_BOND_TEXT =
  'TA 把耳机分给你一只，说：“以后这些事都可以跟我说。”你们坐在操场边听完那首歌，谁也没急着回宿舍。'


export function hasAvailableBond(state: GameState): boolean {
  const player = state.player
  if (!player) return false
  return state.relationships.some((relation) =>
    BOND_DEFS.some((def) => bondTypeAvailable(player, relation, def.type)),
  )
}


export function hasUnusedLoverContact(state: GameState): boolean {
  const weekKey = currentWeekKey(state)
  return state.relationships.some(
    (relation) =>
      relation.partner &&
      relation.lastContactKey !== weekKey,
  )
}
