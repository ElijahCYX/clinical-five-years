import type {
  GameState,
  Gender,
  GossipRecord,
  NpcProfile,
  NpcRelation,
  NpcRelationKind,
  PendingEvent,
  SexualOrientation,
} from './types'
import { randomCharacterName } from './names'
import { currentWeekKey } from './social'
import { soloSlotLabel } from './solo'
import { pickGossipReply } from './gossipReplies'

export const NPC_RELATION_LABELS: Record<NpcRelationKind, string> = {
  roommate: '舍友',
  classmate: '同学',
  clubmate: '同组织',
  friend: '朋友',
  lover: '恋人',
  brother: '兄弟',
  sister: '闺蜜',
  crush: '暗恋',
  ex: '前任',
  conflict: '矛盾',
}

const SECRET_KINDS: NpcRelationKind[] = ['lover', 'crush', 'conflict']
const DYNAMIC_KINDS: NpcRelationKind[] = ['lover', 'crush', 'conflict', 'ex']

/** Every NPC relationship kind has a coherent intimacy range. */
const INTIMACY_BOUNDS: Record<NpcRelationKind, [number, number]> = {
  roommate: [20, 75],
  classmate: [20, 75],
  clubmate: [20, 75],
  friend: [40, 75],
  lover: [60, 100],
  brother: [60, 100],
  sister: [60, 100],
  crush: [30, 85],
  ex: [15, 59],
  conflict: [0, 40],
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

const PROFILE_ORIENTATIONS: SexualOrientation[] = [
  'heterosexual',
  'homosexual',
  'bisexual',
]

function createNpcProfile(): NpcProfile {
  const gender: Gender = Math.random() < 0.5 ? '女' : '男'
  return {
    name: randomCharacterName(),
    gender,
    orientation:
      PROFILE_ORIENTATIONS[Math.floor(Math.random() * PROFILE_ORIENTATIONS.length)],
    revealed: false,
  }
}

function ensureNpcProfiles(
  state: GameState,
  relations: NpcRelation[],
): Record<string, NpcProfile> {
  const profiles: Record<string, NpcProfile> = { ...(state.npcProfiles ?? {}) }
  const knownIds = new Set(state.relationships.map((relation) => relation.id))
  for (const relation of relations) {
    for (const id of [relation.aId, relation.bId]) {
      if (knownIds.has(id) || profiles[id]) continue
      profiles[id] = createNpcProfile()
    }
  }
  return profiles
}

function randomSecretIntimacy(kind: NpcRelationKind): number {
  if (kind === 'lover') return randomInt(62, 94)
  if (kind === 'ex') return randomInt(18, 55)
  if (kind === 'conflict') return randomInt(10, 40)
  return randomInt(32, 82)
}

/**
 * Keep labels and numbers consistent. A lover below 60 is an ex, a sibling
 * below 60 becomes a friend, and conflict/ex/friend values are clamped.
 */
export function normalizeNpcRelation(relation: NpcRelation): NpcRelation {
  const raw = Number.isFinite(relation.intimacy) ? relation.intimacy : 20
  let kind = relation.kind

  // Decide the coherent label from the raw value first, then clamp into that
  // label's range. Clamping first would silently turn a 45-point "lover" into
  // a 60-point lover instead of an ex.
  if (kind === 'lover' && raw < 60) {
    kind = 'ex'
  } else if ((kind === 'brother' || kind === 'sister') && raw < 60) {
    kind = 'friend'
  } else if (kind === 'ex' && raw > 59) {
    kind = 'friend'
  } else if (kind === 'conflict' && raw > 40) {
    kind = 'friend'
  } else if (kind === 'friend' && raw < 40) {
    kind = 'classmate'
  } else if (kind === 'crush' && raw < 30) {
    kind = 'friend'
  }

  const bounds = INTIMACY_BOUNDS[kind]
  const intimacy = Math.round(clamp(raw, bounds[0], bounds[1]))
  return kind === relation.kind && intimacy === relation.intimacy
    ? relation
    : { ...relation, kind, intimacy }
}

function normalizedRelations(state: GameState): NpcRelation[] {
  return (state.npcRelations ?? []).map(normalizeNpcRelation)
}
const GOSSIP_TEXTS = [
  '我最近看到{known}和{other}在食堂角落坐了很久，看起来关系不一般。',
  '有人说{known}和{other}之间有点什么，但具体是什么我也说不准。',
  '{known}最近总在提{other}，每次说到这个名字，语气都不太一样。',
  '我撞见过{known}和{other}一起从图书馆出来，两个人走得特别近。',
  '听说{known}和{other}之间有过一段，后来不知道怎么就淡了。',
  '{known}和{other}最近有点不对劲，见面连招呼都不打。',
  '有人看见{known}给{other}带了早饭，这关系肯定不只是普通朋友。',
  '我听说{known}和{other}已经算是{label}了，只是一直没公开。',
  '{known}在{other}面前和平时完全不一样，你自己观察一下就知道。',
  '关于{known}和{other}，我知道的不多，但肯定不是普通同学那么简单。',
]
const GOSSIP_TEXTS_BY_KIND: Partial<Record<NpcRelationKind, string[]>> = {
  lover: [
    '听说 {known} 和 {other} 已经在一起了，只是还没公开。',
    '最近 {known} 和 {other} 总是一起出现，大家都默认他们是一对了。',
    '{known} 和 {other} 的关系好像有了新进展，有人看到他们牵手了。',
  ],
  crush: [
    '{known} 最近看 {other} 的眼神不太一样，八成是有点意思。',
    '我听说 {known} 一直暗恋 {other}，但对方好像还没察觉。',
    '{known} 每次提到 {other} 都会突然话多，你说这是不是暗恋？',
  ],
  ex: [
    '听说 {known} 和 {other} 已经分手了，最近两个人见面都绕着走。',
    '{known} 和 {other} 那段关系结束了，具体原因没人说得清。',
    '有人看见 {known} 把 {other} 送的东西还回去了，应该是分手了。',
    '{known} 和 {other} 现在是前任关系，气氛有点尴尬。',
  ],
  conflict: [
    '{known} 和 {other} 最近闹得很僵，听说因为一件小事吵了一架。',
    '我听说 {known} 和 {other} 已经冷战好几天了，谁也不先开口。',
    '{known} 和 {other} 现在见面连招呼都不打，气氛明显不对。',
    '最近 {known} 和 {other} 之间有点矛盾，周围人都不敢提这件事。',
  ],
}

const REFUSALS = [
  '嗯……这个我还是不说了吧，传出去不太好。',
  '你听谁说的？我倒是知道一点，但不太方便讲。',
  'TA 看了你一眼，笑了一下：“有些事，知道太多反而没意思。”',
]

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function pairKey(aId: string, bId: string): string {
  return aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`
}

function isStaffKind(kind: string): boolean {
  return kind === 'mentor' || kind === 'counselor'
}

function knownRelationship(state: GameState, id: string) {
  return state.relationships.find((relation) => relation.id === id) ?? null
}

export function npcRelationLabel(kind: NpcRelationKind): string {
  return NPC_RELATION_LABELS[kind]
}

export function npcPersonName(state: GameState, id: string): string {
  const relation = knownRelationship(state, id)
  if (relation) return relation.name
  const profile = state.npcProfiles?.[id]
  return profile?.revealed ? profile.name : '一个你还不认识的人'
}

export function npcGraphName(state: GameState, id: string): string {
  const relation = knownRelationship(state, id)
  if (relation) return relation.name
  const profile = state.npcProfiles?.[id]
  return profile?.revealed ? profile.name : '？？'
}

export function npcAffinity(state: GameState, aId: string, bId: string): number {
  if (aId === bId) return 100
  const direct = state.npcRelations.find(
    (relation) =>
      pairKey(relation.aId, relation.bId) === pairKey(aId, bId),
  )
  if (direct) return direct.intimacy
  const reverse = state.npcRelations.find(
    (relation) =>
      pairKey(relation.aId, relation.bId) === pairKey(bId, aId),
  )
  if (reverse) return reverse.intimacy
  return 15 + (hashString(pairKey(aId, bId)) % 31)
}

/** 创建开局 NPC 社交关系：舍友关系公开，秘密关系先隐藏。 */
export function createInitialNpcSocial(state: GameState): GameState {
  if ((state.npcRelations ?? []).length > 0) return state
  const peers = state.relationships.filter(
    (relation) => !isStaffKind(relation.kind),
  )
  const relations: NpcRelation[] = []
  const usedPairs = new Set<string>()
  const add = (
    aId: string,
    bId: string,
    kind: NpcRelationKind,
    known: boolean,
    intimacy: number,
    source: NpcRelation['source'] = 'initial',
  ) => {
    const key = pairKey(aId, bId)
    if (usedPairs.has(key)) return
    usedPairs.add(key)
    relations.push({
      id: uid('npc-rel'),
      aId,
      bId,
      kind,
      intimacy,
      known,
      source,
    })
  }

  const roommates = peers.filter((relation) => relation.kind === 'roommate')
  for (let index = 0; index < roommates.length; index += 1) {
    for (let other = index + 1; other < roommates.length; other += 1) {
      add(
        roommates[index].id,
        roommates[other].id,
        'roommate',
        true,
        48 + (hashString(roommates[index].id + roommates[other].id) % 28),
      )
    }
  }

  const clubPeople = peers.filter((relation) => relation.kind === 'club')
  for (let index = 0; index < clubPeople.length; index += 1) {
    for (let other = index + 1; other < clubPeople.length; other += 1) {
      if (
        clubPeople[index].clubOrgId &&
        clubPeople[index].clubOrgId === clubPeople[other].clubOrgId
      ) {
        add(clubPeople[index].id, clubPeople[other].id, 'clubmate', true, 42)
      }
    }
  }

  // 一条发生在两个已知 NPC 之间的秘密羁绊，其余秘密关系先使用未知对象。
  if (peers.length >= 2) {
    relations.push({
      id: uid('npc-rel'),
      aId: peers[0].id,
      bId: peers[1].id,
      kind: 'lover',
      intimacy: 72,
      known: false,
      source: 'initial',
    })
  }
  peers.slice(0, 2).forEach((relation, index) => {
    const unknownId = `unknown-${index + 1}`
    const kind = SECRET_KINDS[index % SECRET_KINDS.length]
    add(
      relation.id,
      unknownId,
      kind,
      false,
      randomSecretIntimacy(kind),
    )
  })

  const normalized = relations.map(normalizeNpcRelation)
  return {
    ...state,
    npcRelations: normalized,
    npcProfiles: ensureNpcProfiles(state, normalized),
    npcClueAsked: state.npcClueAsked ?? {},
  }
}

export function ensureNpcSocial(state: GameState): GameState {
  if ((state.npcRelations ?? []).length === 0) return createInitialNpcSocial(state)
  const npcRelations = normalizedRelations(state)
  return {
    ...state,
    npcRelations,
    npcProfiles: ensureNpcProfiles(state, npcRelations),
    npcClueAsked: state.npcClueAsked ?? {},
  }
}

/** 每周让 1–2 个 NPC 关系自然变化，并维持关系类型与亲密度的合理性。 */
function mutateNpcRelationOnce(relation: NpcRelation): NpcRelation {
  const kind = relation.kind
  const roll = Math.random()
  const drift = randomInt(-7, 7)
  const make = (
    nextKind: NpcRelationKind,
    min: number,
    max: number,
    intimacy = randomInt(min, max),
  ) => normalizeNpcRelation({ ...relation, kind: nextKind, intimacy })

  if (kind === 'lover') {
    if (roll < 0.14) return make('ex', 18, 55)
    if (roll < 0.2) return make('conflict', 10, 40)
    if (roll < 0.24) return make('friend', 40, 60)
    return normalizeNpcRelation({ ...relation, intimacy: relation.intimacy + drift })
  }

  if (kind === 'brother' || kind === 'sister') {
    if (roll < 0.12) return make('conflict', 10, 40)
    if (roll < 0.18) return make('friend', 40, 60)
    return normalizeNpcRelation({ ...relation, intimacy: relation.intimacy + drift })
  }

  if (kind === 'crush') {
    if (roll < 0.12 && relation.intimacy >= 60) {
      return make('lover', 60, 100, clamp(relation.intimacy + randomInt(3, 9), 60, 100))
    }
    if (roll < 0.2) return make('friend', 40, 65)
    return normalizeNpcRelation({ ...relation, intimacy: relation.intimacy + drift })
  }

  if (kind === 'ex') {
    if (roll < 0.18) return make('friend', 40, 60)
    if (roll < 0.28) return make('conflict', 10, 40)
    return normalizeNpcRelation({ ...relation, intimacy: relation.intimacy + drift })
  }

  if (kind === 'conflict') {
    if (roll < 0.3) return make('friend', 40, 55)
    if (roll < 0.4) return make('ex', 20, 50)
    return normalizeNpcRelation({ ...relation, intimacy: relation.intimacy + drift })
  }

  if (kind === 'friend') {
    if (roll < 0.1) return make('crush', 30, 65)
    if (roll < 0.16) return make('conflict', 10, 40)
    return normalizeNpcRelation({ ...relation, intimacy: relation.intimacy + drift })
  }

  if (roll < 0.07) return make('crush', 30, 65)
  if (roll < 0.14) return make('friend', 40, 65)
  if (roll < 0.18) return make('conflict', 10, 40)
  return normalizeNpcRelation({ ...relation, intimacy: relation.intimacy + drift })
}

function mutateNpcRelation(relation: NpcRelation): NpcRelation {
  const next = mutateNpcRelationOnce(relation)
  if (next.kind !== relation.kind || next.intimacy !== relation.intimacy) {
    return next
  }
  // A 0-point drift should still count as a weekly change. Nudge by one
  // within the relationship's own range instead of leaving the graph static.
  const [min, max] = INTIMACY_BOUNDS[next.kind]
  const direction = next.intimacy >= max ? -1 : 1
  return normalizeNpcRelation({
    ...next,
    intimacy: Math.max(min, Math.min(max, next.intimacy + direction)),
  })
}

function newHiddenRelation(
  state: GameState,
  relations: NpcRelation[],
): NpcRelation | null {
  const peers = state.relationships.filter(
    (relation) => !isStaffKind(relation.kind),
  )
  if (peers.length < 1) return null
  const usedPairs = new Set(
    relations.map((relation) => pairKey(relation.aId, relation.bId)),
  )
  const knownPairs: Array<[string, string]> = []
  for (let index = 0; index < peers.length; index += 1) {
    for (let other = index + 1; other < peers.length; other += 1) {
      if (!usedPairs.has(pairKey(peers[index].id, peers[other].id))) {
        knownPairs.push([peers[index].id, peers[other].id])
      }
    }
  }
  const kind = DYNAMIC_KINDS[Math.floor(Math.random() * DYNAMIC_KINDS.length)]
  if (knownPairs.length > 0) {
    const pair = knownPairs[Math.floor(Math.random() * knownPairs.length)]
    return {
      id: uid('npc-rel'),
      aId: pair[0],
      bId: pair[1],
      kind,
      intimacy: randomSecretIntimacy(kind),
      known: false,
      source: 'dynamic',
    }
  }
  const anchor = peers[Math.floor(Math.random() * peers.length)]
  const unknownId = uid('unknown-dynamic')
  return {
    id: uid('npc-rel'),
    aId: anchor.id,
    bId: unknownId,
    kind,
    intimacy: randomSecretIntimacy(kind),
    known: false,
    source: 'dynamic',
  }
}

export function evolveNpcSocial(state: GameState): GameState {
  const peers = state.relationships.filter(
    (relation) => !isStaffKind(relation.kind),
  )
  if (peers.length === 0) return state
  const relations = normalizedRelations(state)
  if (relations.length === 0) return state

  const changed = [...relations]
  const changeCount = 1 + (Math.random() < 0.5 ? 1 : 0)
  const order = relations.map((_, index) => index)
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[order[index], order[swap]] = [order[swap], order[index]]
  }
  for (let index = 0; index < Math.min(changeCount, order.length); index += 1) {
    const position = order[index]
    changed[position] = mutateNpcRelation(changed[position])
  }

  const hiddenCount = changed.filter((relation) => !relation.known).length
  if ((hiddenCount === 0 || Math.random() < 0.65) && changed.length < 24) {
    const secret = newHiddenRelation(state, changed)
    if (secret) changed.push(secret)
  }

  const normalized = changed.map(normalizeNpcRelation)
  return {
    ...state,
    npcRelations: normalized,
    npcProfiles: ensureNpcProfiles(state, normalized),
    npcClueAsked: state.npcClueAsked ?? {},
  }
}

export interface NpcClueTarget {
  relation: NpcRelation
  relationLabel: string
  unknownId: string
  profile: NpcProfile
  knownPartyId: string | null
  knownPartyName: string | null
}

/** The unknown party attached to a revealed relation, if the clue still exists. */
export function getNpcClueTarget(
  state: GameState,
  relationId: string,
): NpcClueTarget | null {
  const relation = (state.npcRelations ?? []).find((item) => item.id === relationId)
  if (!relation) return null
  const unknownId = [relation.aId, relation.bId].find(
    (id) => !knownRelationship(state, id) && Boolean(state.npcProfiles?.[id]),
  )
  if (!unknownId) return null
  const profile = state.npcProfiles?.[unknownId]
  if (!profile) return null
  const knownPartyId =
    [relation.aId, relation.bId].find((id) => knownRelationship(state, id)) ?? null
  return {
    relation,
    relationLabel: npcRelationLabel(relation.kind),
    unknownId,
    profile,
    knownPartyId,
    knownPartyName: knownPartyId
      ? knownRelationship(state, knownPartyId)?.name ?? npcPersonName(state, knownPartyId)
      : null,
  }
}

export function npcClueAttemptedThisWeek(
  state: GameState,
  relationId: string,
): boolean {
  return (state.npcClueAsked ?? {})[relationId] === currentWeekKey(state)
}

export interface NpcClueResult {
  state: GameState
  success: boolean
  chance: number
  relationId: string
  unknownId: string
  name?: string
  message: string
  attemptedThisWeek: boolean
}

function applyNpcClueAttempt(
  state: GameState,
  target: NpcClueTarget,
  chance: number,
  roll: number,
  partnerId: string | null,
): NpcClueResult {
  const weekKey = currentWeekKey(state)
  if (npcClueAttemptedThisWeek(state, target.relation.id)) {
    return {
      state,
      success: false,
      chance,
      relationId: target.relation.id,
      unknownId: target.unknownId,
      message: '这条线索本周已经追过了，下周再试试。',
      attemptedThisWeek: true,
    }
  }

  const success = roll < chance
  const name = success ? target.profile.name : undefined
  const message = success
    ? `你从几条零碎的线索里把名字拼了出来：${target.profile.name}。现在关系网里不再是一个「？？」，但你们还没有正式认识。`
    : '线索到这里就断了。对方只知道一个模糊的称呼，下周再问问看吧。'

  const nextProfiles = success
    ? {
        ...(state.npcProfiles ?? {}),
        [target.unknownId]: { ...target.profile, revealed: true },
      }
    : (state.npcProfiles ?? {})

  let nextRecords = state.gossipRecords ?? []
  if (partnerId) {
    nextRecords = nextRecords.map((record) =>
      record.partnerId === partnerId &&
      record.relationId === target.relation.id &&
      record.told
        ? { ...record, clueNote: message }
        : record,
    )
  }

  return {
    state: {
      ...state,
      npcProfiles: nextProfiles,
      npcClueAsked: {
        ...(state.npcClueAsked ?? {}),
        [target.relation.id]: weekKey,
      },
      gossipRecords: nextRecords,
    },
    success,
    chance,
    relationId: target.relation.id,
    unknownId: target.unknownId,
    name,
    message,
    attemptedThisWeek: false,
  }
}

/** Continue asking the bond who told the gossip. Chance grows with intimacy. */
export function attemptNpcClueByChat(
  state: GameState,
  partnerId: string,
  relationId: string,
  roll = Math.random(),
): NpcClueResult | null {
  const target = getNpcClueTarget(state, relationId)
  const partner = knownRelationship(state, partnerId)
  if (!target || !partner) return null
  const chance = Math.max(0.2, Math.min(0.92, 0.35 + partner.intimacy * 0.0055))
  return applyNpcClueAttempt(state, target, chance, roll, partnerId)
}

/** Investigate an unknown node from the relationship graph. */
export function attemptNpcClueByInvestigation(
  state: GameState,
  relationId: string,
  roll = Math.random(),
): NpcClueResult | null {
  const target = getNpcClueTarget(state, relationId)
  if (!target) return null
  const social = state.player?.attrs.social ?? 0
  const knownIntimacy = target.knownPartyId
    ? knownRelationship(state, target.knownPartyId)?.intimacy ?? 0
    : 0
  const chance = Math.max(
    0.05,
    Math.min(0.95, (10 + social * 2 + knownIntimacy * 0.2) / 100),
  )
  return applyNpcClueAttempt(state, target, chance, roll, null)
}

export function gossipEligibleRelations(
  state: GameState,
  partnerId: string,
): NpcRelation[] {
  return (state.npcRelations ?? []).filter((relation) => {
    if (relation.known) return false
    if (relation.aId === partnerId || relation.bId === partnerId) return false
    const aKnown = Boolean(knownRelationship(state, relation.aId))
    const bKnown = Boolean(knownRelationship(state, relation.bId))
    return aKnown || bKnown
  })
}

export function gossipChance(state: GameState, partnerId: string, relation: NpcRelation): number {
  const partner = knownRelationship(state, partnerId)
  if (!partner) return 0
  const p = partner.intimacy
  const s =
    (npcAffinity(state, partnerId, relation.aId) +
      npcAffinity(state, partnerId, relation.bId)) /
    2
  return Math.max(0.05, Math.min(0.8, 0.5 + 0.5 * (p - s) / 100))
}

export function gossipText(
  state: GameState,
  relation: NpcRelation,
): string {
  const known = npcPersonName(state, relation.aId)
  const other = npcPersonName(state, relation.bId)
  const pool = GOSSIP_TEXTS_BY_KIND[relation.kind] ?? GOSSIP_TEXTS
  const template = pool[Math.floor(Math.random() * pool.length)]
  return template
    .replaceAll('{known}', known)
    .replaceAll('{other}', other)
    .replaceAll('{label}', npcRelationLabel(relation.kind))
}

function refusalText(): string {
  return REFUSALS[Math.floor(Math.random() * REFUSALS.length)]
}

export interface GossipResult {
  state: GameState
  record: GossipRecord
  revealed: boolean
  chance: number
}

/** 询问一次八卦；调用方负责限制每个羁绊对象每周一次。 */
export function askGossip(
  state: GameState,
  partnerId: string,
  roll = Math.random(),
): GossipResult {
  const weekKey = currentWeekKey(state)
  const partner = knownRelationship(state, partnerId)
  const candidates = gossipEligibleRelations(state, partnerId)
  if (!partner || candidates.length === 0) {
    const record: GossipRecord = {
      id: uid('gossip'),
      partnerId,
      weekKey,
      seasonIndex: state.seasonIndex,
      week: state.week,
      weekSlot: state.weekSlot,
      timeLabel: `第 ${state.week} 周 · ${soloSlotLabel(state.weekSlot)}`,
      atMs: Date.now(),
      text: partner
        ? 'TA 想了想，说最近没听到什么值得说的八卦。'
        : '你找不到可以询问的人。',
      relationId: null,
      told: false,
      reply: pickGossipReply(false),
    }
    return {
      state: {
        ...state,
        gossipAsked: { ...(state.gossipAsked ?? {}), [partnerId]: weekKey },
        gossipRecords: [...(state.gossipRecords ?? []), record],
      },
      record,
      revealed: false,
      chance: 0,
    }
  }

  const relation = candidates[Math.floor(Math.random() * candidates.length)]
  const chance = gossipChance(state, partnerId, relation)
  const told = roll < chance
  if (!told) {
    const record: GossipRecord = {
      id: uid('gossip'),
      partnerId,
      weekKey,
      seasonIndex: state.seasonIndex,
      week: state.week,
      weekSlot: state.weekSlot,
      timeLabel: `第 ${state.week} 周 · ${soloSlotLabel(state.weekSlot)}`,
      atMs: Date.now(),
      text: refusalText(),
      relationId: null,
      told: false,
      reply: pickGossipReply(false),
    }
    return {
      state: {
        ...state,
        gossipAsked: { ...(state.gossipAsked ?? {}), [partnerId]: weekKey },
        gossipRecords: [...(state.gossipRecords ?? []), record],
      },
      record,
      revealed: false,
      chance,
    }
  }

  const text = gossipText(state, relation)
  const next: GameState = {
    ...state,
    npcRelations: (state.npcRelations ?? []).map((item) =>
      item.id === relation.id
        ? { ...item, known: true, discoveredWeekKey: weekKey }
        : item,
    ),
    gossipAsked: { ...state.gossipAsked, [partnerId]: weekKey },
    gossipRecords: [
      ...(state.gossipRecords ?? []),
      {
        id: uid('gossip'),
        partnerId,
        weekKey,
        seasonIndex: state.seasonIndex,
        week: state.week,
        weekSlot: state.weekSlot,
        timeLabel: `第 ${state.week} 周 · ${soloSlotLabel(state.weekSlot)}`,
        atMs: Date.now(),
        text,
        relationId: relation.id,
        told: true,
        relationLabel: npcRelationLabel(relation.kind),
        reply: pickGossipReply(true),
      },
    ],
  }
  return {
    state: next,
    record: next.gossipRecords[next.gossipRecords.length - 1],
    revealed: true,
    chance,
  }
}

export function revealNpcRelation(state: GameState, relationId: string): GameState {
  return {
    ...state,
    npcRelations: (state.npcRelations ?? []).map((relation) =>
      relation.id === relationId
        ? { ...relation, known: true, discoveredWeekKey: currentWeekKey(state) }
        : relation,
    ),
  }
}

/** 少量随机事件揭示 NPC 关系。 */
export function maybeCreateNpcRevealEvent(state: GameState): PendingEvent | null {
  if (Math.random() > 0.12) return null
  const hidden = (state.npcRelations ?? []).filter(
    (relation) =>
      !relation.known &&
      (Boolean(knownRelationship(state, relation.aId)) ||
        Boolean(knownRelationship(state, relation.bId))),
  )
  if (hidden.length === 0) return null
  const relation = hidden[Math.floor(Math.random() * hidden.length)]
  const id = `ev-npc-reveal-${relation.id}`
  if (state.eventHistory.includes(id)) return null
  const known = npcPersonName(state, relation.aId)
  const other = npcPersonName(state, relation.bId)
  const label = npcRelationLabel(relation.kind)
  const texts = [
    `课后你留在教室收东西，隔着一排桌子听见有人在聊 ${known} 和 ${other}。对方压低声音说：“他们最近已经是${label}了吧？”你假装没听见，把书慢慢塞进包里。`,
    `食堂排队时，你无意间听见前面两个人提到 ${known}。一个说：“${other}最近总和 TA 一起走。”另一个人笑了一声，没有反驳。`,
    `你在宿舍楼道里遇见 ${known}，TA 正低头回消息。你瞥见屏幕顶端跳出的名字是 ${other}，而 TA 很快把手机扣了过去。`,
  ]
  return {
    id,
    kind: 'random',
    title: '无意间听见的八卦',
    text: texts[hashString(relation.id) % texts.length],
    effects: { revealNpcRelationId: relation.id },
    effectLines: [`发现 ${known} 与 ${other} 的关系：${label}`],
  }
}
