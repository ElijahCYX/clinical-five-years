import type {
  GameState,
  GossipRecord,
  NpcRelation,
  NpcRelationKind,
  PendingEvent,
} from './types'
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
  return knownRelationship(state, id)?.name ?? '一个你还不认识的人'
}

export function npcGraphName(state: GameState, id: string): string {
  return knownRelationship(state, id)?.name ?? '？？'
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
    add(
      relation.id,
      unknownId,
      SECRET_KINDS[index % SECRET_KINDS.length],
      false,
      35 + (hashString(relation.id) % 35),
    )
  })

  return { ...state, npcRelations: relations }
}

export function ensureNpcSocial(state: GameState): GameState {
  if ((state.npcRelations ?? []).length === 0) return createInitialNpcSocial(state)
  return state
}

/** 每周低概率让 NPC 关系发生一点变化。 */
export function evolveNpcSocial(state: GameState): GameState {
  const peers = state.relationships.filter(
    (relation) => !isStaffKind(relation.kind),
  )
  if (peers.length === 0) return state
  if (Math.random() > 0.09) return state
  const relations = [...(state.npcRelations ?? [])]
  const hidden = relations.filter((relation) => !relation.known)
  if (hidden.length > 0 && Math.random() < 0.35) {
    const target = hidden[Math.floor(Math.random() * hidden.length)]
    const nextKind =
      DYNAMIC_KINDS[Math.floor(Math.random() * DYNAMIC_KINDS.length)]
    return {
      ...state,
      npcRelations: relations.map((relation) =>
        relation.id === target.id ? { ...relation, kind: nextKind } : relation,
      ),
    }
  }
  const playerBonded = new Set(
    state.relationships
      .filter((relation) => relation.partner || relation.bondType)
      .map((relation) => relation.id),
  )
  const candidates = peers.filter((relation) => !playerBonded.has(relation.id))
  if (candidates.length === 0 || relations.length >= 24) return state
  const anchor = candidates[Math.floor(Math.random() * candidates.length)]
  const unknownId = `unknown-dynamic-${relations.length + 1}`
  const kind = DYNAMIC_KINDS[Math.floor(Math.random() * DYNAMIC_KINDS.length)]
  return {
    ...state,
    npcRelations: [
      ...relations,
      {
        id: uid('npc-rel'),
        aId: anchor.id,
        bId: unknownId,
        kind,
        intimacy: 35 + Math.floor(Math.random() * 35),
        known: false,
        source: 'dynamic',
      },
    ],
  }
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
  const template = GOSSIP_TEXTS[Math.floor(Math.random() * GOSSIP_TEXTS.length)]
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
