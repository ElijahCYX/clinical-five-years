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
    lastPatAbsWeek: 0,
    birthYear: randomBirthYear(kind),
    birthdayMonth: randInt(1, 12),
    birthdayGiftYear: 0,
    birthdayContactType: null,
    birthdayNextYear: 0,
    patBlockedUntilWeek: 0,
    partner: false,
    bondType: undefined,
    confessRejected: false,
    intimacyFrozenSeason: undefined,
    frozenIntimacy: undefined,
    partnerSinceSeasonIndex: undefined,
    partnerSinceWeek: undefined,
    partnerSinceLabel: undefined,
    lastContactKey: '',
    metAbsWeek: 1,
    brokenBondType: undefined,
    bondBreakWeek: undefined,
    bondCalmUntilWeek: undefined,
    bondReconcileAttempted: false,
    intimacyFrozenUntilWeek: undefined,
    confessionRisk: 0,
    breakupRisk: 0,
    ex: false,
    exWeek: 0,
    exPenalty: false,
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

export function orientationLabel(
  orientation: Relationship['orientation'],
): string {
  if (orientation === 'homosexual') return '同性恋'
  if (orientation === 'bisexual') return '双性恋'
  return '异性恋'
}

export function createClubRelationship(
  player: Player,
  orgId: string,
  orgName: string,
  roleLabel: string,
  metAbsWeek = 1,
): Relationship {
  return {
    ...makeRelationship(player, 'club', `${orgName} · ${roleLabel}`, Math.random() < 0.5 ? '女' : '男', randInt(32, 46)),
    clubOrgId: orgId,
    metAbsWeek,
  }
}

export function createSeniorRelationship(
  player: Player,
  mentorName: string,
): Relationship {
  const gender: Gender = Math.random() < 0.5 ? '女' : '男'
  const role = gender === '男' ? '同门师兄' : '同门师姐'
  return makeRelationship(
    player,
    'senior',
    `${mentorName}课题组 · ${role}`,
    gender,
    randInt(10, 20),
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
    case 'club':
      return '社团成员'
    case 'senior':
      return '同门前辈'
    case 'counselor':
      return '辅导员'
    default:
      return '恋人'
  }
}

export function currentWeekKey(state: GameState): string {
  return `${state.season.id}-w${state.week}`
}

export function unseenRelationCount(state: GameState): number {
  const seen = new Set(state.seenRelationIds ?? [])
  return state.relationships.filter((relation) => !seen.has(relation.id)).length
}

export const GAME_START_YEAR = 2021

export type SeasonPhase = 'autumn' | 'winter' | 'spring' | 'summer' | 'preclinical'

// 21 terms: years 1-2 are four terms; year 3 has an extra preclinical summer term.
const YEAR_START_INDICES = [0, 4, 8, 13, 17]

export function academicYearForSeason(index: number): number {
  if (index >= 17) return 5
  if (index >= 13) return 4
  if (index >= 8) return 3
  if (index >= 4) return 2
  return 1
}

export function seasonPhaseForIndex(index: number): SeasonPhase {
  if (index === 12) return 'preclinical'
  const yearStart = index < 8 ? (index < 4 ? 0 : 4) : index < 13 ? 8 : index < 17 ? 13 : 17
  const offset = index - yearStart
  if (offset === 0) return 'autumn'
  if (offset === 1) return 'winter'
  if (offset === 2) return 'spring'
  return 'summer'
}

export function isAutumnSeasonIndex(index: number): boolean {
  return YEAR_START_INDICES.includes(index)
}

export function isYearFinalSeasonIndex(index: number): boolean {
  return [3, 7, 12, 16, 20].includes(index)
}

export function gameDate(state: GameState): { year: number; month: number } {
  const academicYear = academicYearForSeason(state.seasonIndex)
  const phase = seasonPhaseForIndex(state.seasonIndex)
  const baseYear = GAME_START_YEAR + academicYear - 1
  if (state.vacation) {
    const week = Math.max(1, Math.min(3, state.vacation.week))
    if (state.vacation.kind === 'winter') {
      return { year: baseYear + 1, month: [1, 2, 2][week - 1] }
    }
    return { year: baseYear + 1, month: [7, 8, 8][week - 1] }
  }
  const week = Math.max(1, Math.min(4, state.week))
  if (phase === 'autumn') return { year: baseYear, month: [9, 10, 11, 11][week - 1] }
  if (phase === 'winter') {
    return {
      year: week === 1 ? baseYear : baseYear + 1,
      month: [12, 1, 2, 2][week - 1],
    }
  }
  if (phase === 'spring') return { year: baseYear + 1, month: [3, 4, 5, 5][week - 1] }
  if (phase === 'preclinical') return { year: baseYear + 1, month: [7, 7, 8, 8][week - 1] }
  if (state.seasonIndex === 11) {
    return { year: baseYear + 1, month: [5, 5, 6, 6][week - 1] }
  }
  return { year: baseYear + 1, month: [6, 7, 8, 8][week - 1] }
}

export const PEER_BIRTH_YEAR_MIN = 2002
export const PEER_BIRTH_YEAR_MAX = 2004

function clampPeerBirthYear(kind: Relationship['kind'], year: number): number {
  if (kind === 'mentor' || kind === 'counselor') return year
  return Math.max(PEER_BIRTH_YEAR_MIN, Math.min(PEER_BIRTH_YEAR_MAX, year))
}

function randomBirthYear(kind: Relationship['kind']): number {
  if (kind === 'mentor') return GAME_START_YEAR - randInt(38, 58)
  if (kind === 'counselor') return GAME_START_YEAR - randInt(28, 42)
  if (kind === 'senior') return GAME_START_YEAR - randInt(17, 23)
  // 2021 年入学：2003 年为主，2002 年通常为延迟入学，2004 年为提早入学。
  const roll = Math.random()
  if (roll < 0.2) return 2002
  if (roll < 0.8) return 2003
  return 2004
}

export const PAT_LIMIT = 3

export function progressWeek(state: GameState): number {
  return (
    state.seasonIndex * 4 +
    (state.vacation ? 4 + state.vacation.week : state.week)
  )
}

export function vacationTravelInviteKey(state: GameState): string {
  if (!state.vacation) return ''
  return `vacation-${state.seasonIndex}-${state.vacation.kind}-w${state.vacation.week}`
}

export function patPeriodKey(state: GameState): string {
  return state.vacation
    ? `vacation-${state.vacation.kind}-${state.seasonIndex}`
    : currentWeekKey(state)
}

export function patLimit(state: GameState): number {
  return state.vacation ? 5 : PAT_LIMIT
}

export function intimacyMultiplier(state: GameState, relation: Relationship): number {
  const playerSocial = state.player?.attrs.social ?? 2
  const otherSocial = relation.stats.attrs.social
  const sum = playerSocial + otherSocial
  if (sum >= 16) return 1.3
  if (sum >= 13) return 1.15
  return 1
}

/** 真正交心的同辈朋友上限；导师/辅导员不计入。 */
export const CLOSE_FRIEND_LIMIT = 5
export const CLOSE_FRIEND_THRESHOLD = 60
/** 0–5 个交心朋友时，其余未交心同辈的正向亲密度倍率。 */
export const CLOSE_FRIEND_GROWTH_MULTIPLIERS = [1, 0.85, 0.7, 0.55, 0.4, 0.25] as const

export function isPeerFriend(relation: Relationship): boolean {
  return !isStaffRelation(relation)
}

/** 前辈：科研课题组里的同门，以及社团/学生会/辩论队里认识的学长学姐。 */
export function isSeniorRelation(relation: Relationship): boolean {
  return relation.kind === 'senior' || relation.kind === 'club'
}

export function isCloseFriend(relation: Relationship): boolean {
  return (
    isPeerFriend(relation) && relation.intimacy >= CLOSE_FRIEND_THRESHOLD
  )
}

export function closeFriendCount(state: GameState): number {
  return state.relationships.filter(isCloseFriend).length
}

export function closeFriendGrowthMultiplier(state: GameState): number {
  const count = Math.min(
    CLOSE_FRIEND_LIMIT,
    closeFriendCount(state),
  )
  return CLOSE_FRIEND_GROWTH_MULTIPLIERS[count]
}

/**
 * 亲密度变化统一入口：社交面板倍率 → 交心朋友数量倍率 → 5 人封顶。
 * 只有同辈且当前亲密度低于 60 的正向增长会受新规则影响。
 */
export function adjustIntimacyDelta(
  state: GameState,
  relation: Relationship,
  delta: number,
): number {
  if (!delta) return 0
  if (relation.intimacyFrozenSeason === state.season.id) return 0
  if (
    typeof relation.intimacyFrozenUntilWeek === 'number' &&
    progressWeek(state) <= relation.intimacyFrozenUntilWeek
  ) {
    return 0
  }
  let adjusted = Math.round(delta * intimacyMultiplier(state, relation))
  if (
    adjusted > 0 &&
    isPeerFriend(relation) &&
    relation.intimacy < CLOSE_FRIEND_THRESHOLD
  ) {
    adjusted = Math.round(adjusted * closeFriendGrowthMultiplier(state))
    if (closeFriendCount(state) >= CLOSE_FRIEND_LIMIT) {
      adjusted = Math.min(adjusted, CLOSE_FRIEND_THRESHOLD - 1 - relation.intimacy)
    }
    adjusted = Math.max(0, adjusted)
  }
  return adjusted
}

export function patUsedThisWeek(state: GameState): number {
  const key = patPeriodKey(state)
  return state.relationships.filter((relation) => relation.lastPatKey === key).length
}

export function patRemainingThisWeek(state: GameState): number {
  return Math.max(0, patLimit(state) - patUsedThisWeek(state))
}

export function canPat(state: GameState, relation: Relationship): boolean {
  return (
    !isPatBlocked(state, relation) &&
    relation.lastPatKey !== patPeriodKey(state)
  )
}

export function isPatBlocked(
  state: GameState,
  relation: Relationship,
): boolean {
  return (
    relation.patBlockedUntilWeek > 0 &&
    progressWeek(state) <= relation.patBlockedUntilWeek
  )
}

/** 生日月份过去且未送礼/祝福：扣亲密度并封拍拍三周。 */
export function applyMissedBirthdayPenalties(
  state: GameState,
): Relationship[] {
  const date = gameDate(state)
  const now = progressWeek(state)
  return state.relationships.map((relation) => {
    if (relation.intimacy < 40) return relation
    const birthdayMonth = relation.birthdayMonth
    let nextYear = relation.birthdayNextYear
    if (!nextYear) {
      nextYear = date.month <= birthdayMonth ? date.year : date.year + 1
      relation = { ...relation, birthdayNextYear: nextYear }
    }
    const birthdayPassed =
      date.year > nextYear ||
      (date.year === nextYear && date.month > birthdayMonth)
    if (!birthdayPassed) return relation
    return {
      ...relation,
      intimacy: Math.max(
        0,
        relation.intimacy + adjustIntimacyDelta(state, relation, -5),
      ),
      patBlockedUntilWeek: now + 3,
      birthdayNextYear: nextYear + 1,
    }
  })
}

export function patRelationship(relation: Relationship, state: GameState): Relationship {
  if (!canPat(state, relation)) return relation
  return revealMaybe({
    ...relation,
    intimacy: Math.min(
      100,
      relation.intimacy + adjustIntimacyDelta(state, relation, 2),
    ),
    lastPatKey: patPeriodKey(state),
    lastPatAbsWeek: progressWeek(state),
  })
}

export function applyFriendContactDecay(
  state: GameState,
  now = progressWeek(state),
): Relationship[] {
  return state.relationships.map((relation) => {
    if (
      relation.kind !== 'roommate' &&
      relation.kind !== 'friend' &&
      relation.kind !== 'classmate'
    ) {
      return relation
    }
    if (now - (relation.lastPatAbsWeek ?? 0) < 3) return relation
    const rawDelta =
      relation.intimacy > 15
        ? -Math.min(5, relation.intimacy - 15)
        : -1
    return {
      ...relation,
      intimacy: Math.max(
        0,
        relation.intimacy + adjustIntimacyDelta(state, relation, rawDelta),
      ),
    }
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
    lastPatAbsWeek: relation.lastPatAbsWeek ?? 0,
    birthYear: clampPeerBirthYear(
      relation.kind,
      relation.birthYear ?? randomBirthYear(relation.kind),
    ),
    birthdayMonth: relation.birthdayMonth ?? randInt(1, 12),
    birthdayGiftYear: relation.birthdayGiftYear ?? 0,
    birthdayContactType: relation.birthdayContactType ?? null,
    birthdayNextYear: relation.birthdayNextYear ?? 0,
    patBlockedUntilWeek: relation.patBlockedUntilWeek ?? 0,
    partner: relation.partner ?? false,
    bondType: relation.bondType ?? (relation.partner ? 'lover' : undefined),
    confessRejected: relation.confessRejected ?? false,
    intimacyFrozenSeason: relation.intimacyFrozenSeason,
    frozenIntimacy: relation.frozenIntimacy,
    partnerSinceSeasonIndex: relation.partnerSinceSeasonIndex,
    partnerSinceWeek: relation.partnerSinceWeek,
    partnerSinceLabel: relation.partnerSinceLabel,
    lastContactKey: relation.lastContactKey ?? '',
    metAbsWeek: relation.metAbsWeek ?? 1,
    brokenBondType: relation.brokenBondType,
    bondBreakWeek: relation.bondBreakWeek,
    bondCalmUntilWeek: relation.bondCalmUntilWeek,
    bondReconcileAttempted: relation.bondReconcileAttempted ?? false,
    intimacyFrozenUntilWeek: relation.intimacyFrozenUntilWeek,
    confessionRisk: relation.confessionRisk ?? 0,
    breakupRisk: relation.breakupRisk ?? 0,
    ex: relation.ex ?? false,
    exWeek: relation.exWeek ?? 0,
    exPenalty: relation.exPenalty ?? false,
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
    relation.intimacy >= 60 &&
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
  const exPenalty = relation.ex && relation.exPenalty ? 0.5 : 1
  return Math.max(
    0.02,
    Math.min(0.92, base * attraction * staffPenalty * exPenalty),
  )
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

export function travelJoinChance(relation: Relationship): number {
  return Math.min(0.9, Math.max(0.08, 0.15 + relation.intimacy / 120))
}

export function travelCost(acceptedCount: number): number {
  if (acceptedCount <= 0) return 500
  if (acceptedCount === 1) return 300
  return 250
}

export function isDinnerFriend(relation: Relationship): boolean {
  return (
    relation.kind === 'roommate' ||
    relation.kind === 'friend' ||
    relation.kind === 'classmate' ||
    relation.kind === 'club'
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
