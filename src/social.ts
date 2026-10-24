import { TALENT_BY_ID, TALENTS } from './data'
import { randomCharacterName } from './names'
import type {
  AttrKey,
  GameState,
  Gender,
  Player,
  Relationship,
  RelationshipStats,
  SexualOrientation,
} from './types'

const ORIENTATIONS: SexualOrientation[] = [
  'heterosexual',
  'homosexual',
  'bisexual',
]

const ROOMMATE_ACTIONS = [
  '在宿舍补觉，错过了早饭。',
  '去图书馆占座，顺便帮全宿舍占了三个。',
  '在食堂研究新窗口，回来时带了两份炸鸡。',
  '去操场跑步，回来时喘得像刚下夜班。',
  '参加社团例会，主要负责搬椅子。',
  '在宿舍洗衣服，把白大褂染成了浅粉色。',
  '去实验室找导师，被安排了一下午的养细胞。',
  '在自习室背名词解释，背到第三页开始刷手机。',
  '约同学打球，回来时膝盖上多了两块创可贴。',
  '去校医院拿药，顺便和医生聊了半小时人生。',
  '在宿舍追剧，声称这是“医学人文素养”。',
  '去食堂兼职，学会了用一勺抖出三勺的绝技。',
]

const REFUSAL_REASONS = [
  '今晚要值班，白大褂已经穿好了。',
  '最近在减肥，看见食堂的油就害怕。',
  '钱包比我还瘦，这顿先欠着。',
  '导师临时叫我去实验室，救细胞比吃饭重要。',
  '室友已经帮我带了饭，我不好意思再吃第二顿。',
  '今天社恐发作，想把晚饭打包回宿舍吃。',
  '我在背名词解释，背完这页就去，但这页有点长。',
  '刚洗完头，不想戴帽子出门。',
  '我今晚约了健身房，不能辜负刚办的卡。',
  '临时被拉去听讲座，结束时间看老师心情。',
]

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}

function randomOrientation(): SexualOrientation {
  return ORIENTATIONS[randInt(0, ORIENTATIONS.length - 1)]
}

function randomStats(): RelationshipStats {
  const attrs = {} as Record<AttrKey, number>
  for (const key of [
    'memory',
    'comprehension',
    'dexterity',
    'social',
    'appearance',
    'energy',
    'constitution',
    'resilience',
  ] as AttrKey[]) {
    attrs[key] = randInt(2, 10)
  }
  return {
    talent: TALENTS[randInt(0, TALENTS.length - 1)].id,
    gpa: Number(rand(2.0, 4.0).toFixed(2)),
    attrs,
  }
}

function baseIntimacy(player: Player): number {
  const raw =
    (player.attrs.appearance + player.attrs.social) * 2.5 +
    rand(-5, 5)
  return Math.min(50, Math.max(0, Math.round(raw)))
}

function makeRelationship(
  player: Player,
  kind: Relationship['kind'],
  identity: string,
  gender: Gender,
  intimacy: number,
): Relationship {
  return {
    id: `rel-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: randomCharacterName(),
    gender,
    orientation: randomOrientation(),
    kind,
    identity,
    intimacy: Math.min(50, Math.max(0, intimacy)),
    statsKnown: false,
    knownStats: null,
    stats: randomStats(),
    weeklyAction: ROOMMATE_ACTIONS[randInt(0, ROOMMATE_ACTIONS.length - 1)],
    lastPatKey: '',
    partner: false,
    confessionRisk: 0,
    breakupRisk: 0,
  }
}

export function createInitialRelationships(player: Player): Relationship[] {
  const relationships: Relationship[] = []
  for (let i = 0; i < 3; i += 1) {
    relationships.push(
      makeRelationship(
        player,
        'roommate',
        '舍友',
        player.gender,
        Math.max(0, baseIntimacy(player) + randInt(-4, 4)),
      ),
    )
  }
  const staffGender: Gender = Math.random() < 0.5 ? '女' : '男'
  relationships.push(
    makeRelationship(
      player,
      'counselor',
      '辅导员',
      staffGender,
      Math.max(8, Math.min(40, baseIntimacy(player))),
    ),
  )
  relationships.push(
    makeRelationship(
      player,
      'mentor',
      '导师',
      Math.random() < 0.5 ? '女' : '男',
      Math.max(0, Math.min(35, baseIntimacy(player) - 8)),
    ),
  )
  return relationships
}

export function createEventFriend(player: Player): Relationship {
  return makeRelationship(
    player,
    'friend',
    '随机事件认识的朋友',
    Math.random() < 0.5 ? '女' : '男',
    randInt(8, 28),
  )
}

export function createCourseFriend(player: Player, courseName: string): Relationship {
  return makeRelationship(
    player,
    'classmate',
    `${courseName}认识的同学`,
    Math.random() < 0.5 ? '女' : '男',
    randInt(6, 22),
  )
}

export function relationshipKindLabel(kind: Relationship['kind']): string {
  switch (kind) {
    case 'roommate':
      return '舍友'
    case 'friend':
      return '朋友'
    case 'classmate':
      return '同学'
    case 'mentor':
      return '导师'
    case 'counselor':
      return '辅导员'
    default:
      return '恋人'
  }
}

export function currentWeekKey(state: GameState): string {
  return `${state.season.id}-w${state.week}`
}

export const PAT_LIMIT = 3

export function patUsedThisWeek(state: GameState): number {
  const key = currentWeekKey(state)
  return state.relationships.filter((relation) => relation.lastPatKey === key).length
}

export function patRemainingThisWeek(state: GameState): number {
  return Math.max(0, PAT_LIMIT - patUsedThisWeek(state))
}

export function canPat(state: GameState, relation: Relationship): boolean {
  return relation.lastPatKey !== currentWeekKey(state)
}

export function patRelationship(relation: Relationship, state: GameState): Relationship {
  if (!canPat(state, relation)) return relation
  return revealMaybe({
    ...relation,
    intimacy: Math.min(100, relation.intimacy + 2),
    lastPatKey: currentWeekKey(state),
  })
}

export function revealMaybe(relation: Relationship): Relationship {
  if (relation.statsKnown) return relation
  if (relation.intimacy >= 100 || Math.random() < 0.28) {
    return {
      ...relation,
      statsKnown: true,
      knownStats: relation.knownStats ?? relation.stats,
    }
  }
  return relation
}

export function normalizeRelationships(
  relationships: Relationship[],
): Relationship[] {
  return relationships.map((relation) => ({
    ...relation,
    intimacy: Math.min(100, Math.max(0, relation.intimacy ?? 0)),
    statsKnown: relation.statsKnown ?? false,
    knownStats: relation.knownStats ?? null,
    stats: relation.stats ?? randomStats(),
    weeklyAction:
      relation.weeklyAction ??
      ROOMMATE_ACTIONS[randInt(0, ROOMMATE_ACTIONS.length - 1)],
    lastPatKey: relation.lastPatKey ?? '',
    partner: relation.partner ?? false,
    confessionRisk: relation.confessionRisk ?? 0,
    breakupRisk: relation.breakupRisk ?? 0,
  }))
}

export function revealAtFullIntimacy(relation: Relationship): Relationship {
  if (relation.intimacy < 100) return relation
  return {
    ...relation,
    statsKnown: true,
    knownStats: relation.knownStats ?? relation.stats,
  }
}

export function playerAllowsGender(player: Player, gender: Gender): boolean {
  if (player.orientation === 'heterosexual') return player.gender !== gender
  if (player.orientation === 'homosexual') return player.gender === gender
  return true
}

export function npcOrientationAllows(relation: Relationship, gender: Gender): boolean {
  if (relation.orientation === 'bisexual') return true
  if (relation.orientation === 'heterosexual') return relation.gender !== gender
  return relation.gender === gender
}

export function isStaffRelation(relation: Relationship): boolean {
  return relation.kind === 'mentor' || relation.kind === 'counselor'
}

export function canConfess(player: Player, relation: Relationship): boolean {
  return (
    relation.intimacy > 60 &&
    !relation.partner &&
    playerAllowsGender(player, relation.gender)
  )
}

export function confessionChance(player: Player, relation: Relationship): number {
  if (!canConfess(player, relation)) return 0
  const base =
    0.08 + relation.intimacy / 200 + player.attrs.social * 0.025
  const attraction = npcOrientationAllows(relation, player.gender) ? 1 : 0.12
  const staffPenalty = isStaffRelation(relation) ? 0.16 : 1
  return Math.max(0.02, Math.min(0.92, base * attraction * staffPenalty))
}

export function nextRoommateAction(): string {
  return ROOMMATE_ACTIONS[randInt(0, ROOMMATE_ACTIONS.length - 1)]
}

export function randomRefusalReason(): string {
  return REFUSAL_REASONS[randInt(0, REFUSAL_REASONS.length - 1)]
}

export function dinnerCost(acceptedCount: number): number {
  if (acceptedCount <= 0) return 0
  return 50 - (acceptedCount - 1) * 5
}

export function dinnerAttendanceChance(relation: Relationship): number {
  return Math.min(0.95, 0.25 + relation.intimacy / 100 * 0.7)
}

export function isDinnerFriend(relation: Relationship): boolean {
  return (
    relation.kind === 'roommate' ||
    relation.kind === 'friend' ||
    relation.kind === 'classmate'
  )
}

export function relationshipStatsLine(relation: Relationship): string[] {
  if (!relation.statsKnown) return []
  const stats = relation.knownStats
  if (!stats) return []
  return [
    `天赋 ${TALENT_BY_ID[stats.talent]?.name ?? '未知'}`,
    `GPA ${stats.gpa.toFixed(2)}`,
    ...Object.entries(stats.attrs).map(
      ([key, value]) =>
        `${key === 'memory' ? '记忆' : key === 'comprehension' ? '悟性' : key === 'dexterity' ? '操作' : key === 'social' ? '交际' : key === 'appearance' ? '建模' : key === 'energy' ? '精力' : key === 'constitution' ? '体质' : '抗压'} ${value}`,
    ),
  ]
}
