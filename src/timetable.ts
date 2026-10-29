import { ELECTIVE_COURSE_BY_ID } from './data'
import { ORG_BY_ID } from './organizations'
import type { Course, GameState, SoloInvite } from './types'
import { clubProjectDefForProject, clubProjectForSeason, currentPhaseFor } from './clubProjects'
import { DEBATE_CUP_ROUNDS, DEBATE_CUP_SLOT, DEBATE_ORG_ID, debateEditionForState } from './debateCup'

export const TIMETABLE_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const
export const TIMETABLE_SLOTS = ['早上', '下午', '晚上'] as const

export interface TimetableActivity {
  orgId: string
  name: string
  category: string
  kind?: 'default' | 'meeting' | 'event' | 'debatePractice' | 'debateCup'
  projectTitle?: string
  phaseTitle?: string
  phaseDescription?: string
  eventIndex?: number
  eventWeek?: number
  roundIndex?: number
  editionId?: string
}

export interface TimetableCell {
  day: number
  slot: number
  course: Course | null
  activity?: TimetableActivity
  soloInvite?: SoloInvite
}

export interface TimetableCourseBlock {
  course: Course
  slots: number
}

export interface TimetableData {
  cells: TimetableCell[]
  blocks: TimetableCourseBlock[]
  totalSlots: number
  placedSlots: number
}

/** 学分换算成课表格数：1→1，2-3→2，4-5→3，10学分临床前课程单独占满工作日白天。 */
export function timetableSlotCount(course: Course): number {
  if (course.credits >= 10) return 10
  if (course.credits <= 1) return 1
  if (course.credits <= 3) return 2
  return 3
}

function hashSeed(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function randomSource(seed: number): () => number {
  let state = seed
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

const WEEKDAY_MORNING_AFTERNOON = [0, 1, 3, 4, 6, 7, 9, 10, 12, 13]
const WEEKDAY_EVENING = [2, 5, 8, 11, 14]
const WEEKEND_MORNING_AFTERNOON = [15, 16, 18, 19]
const WEEKEND_EVENING = [17, 20]

export function timetableCourseAt(state: GameState, slotIndex: number): Course | null {
  if (slotIndex < 0 || slotIndex > 20) return null
  return buildTimetable(state).cells[slotIndex].course
}

export function timetableActivityAt(
  state: GameState,
  slotIndex: number,
): TimetableActivity | null {
  if (slotIndex < 0 || slotIndex > 20) return null
  return buildTimetable(state).cells[slotIndex].activity ?? null
}

export function buildTimetable(state: GameState): TimetableData {
  const cells: TimetableCell[] = Array.from({ length: 21 }, (_, index) => ({
    day: Math.floor(index / 3),
    slot: index % 3,
    course: null,
  }))

  const pendingPe =
    state.pendingPeCourseId
      ? ELECTIVE_COURSE_BY_ID[state.pendingPeCourseId]
      : undefined
  const seasonCourses = state.season.courses.filter(
    (course) => course.id !== pendingPe?.id,
  )
  const professional = seasonCourses.filter((course) => !course.electiveType)
  const electives = seasonCourses.filter((course) => Boolean(course.electiveType))
  const courses = [
    ...professional,
    ...electives,
    ...(pendingPe ? [pendingPe] : []),
  ]
  const seedText = [
    state.season.id,
    state.seasonIndex,
    ...courses.map((course) => course.id),
  ].join('|')
  const random = randomSource(hashSeed(seedText))
  const blocks: TimetableCourseBlock[] = []

  // 社团/学生会/辩论队活动强制占格：优先周五、周六、周日的晚上。
  const clubSlotPriority = [14, 17, 20]
  for (let i = 0; i < (state.clubMemberships ?? []).length; i += 1) {
    const membership = state.clubMemberships[i]
    const org = ORG_BY_ID[membership.orgId]
    const slot = clubSlotPriority[i]
    if (!org || slot === undefined) continue
    const project = clubProjectForSeason(membership, state.season.id)
    const projectDef = clubProjectDefForProject(project)
    const phase = project && projectDef
      ? currentPhaseFor(project, projectDef, state.week)
      : null
    if (projectDef && project && phase) {
      cells[slot].activity = {
        orgId: org.id,
        name: org.name,
        category: org.category,
        kind: 'meeting',
        projectTitle: projectDef.title,
        phaseTitle: phase.stage.title,
        phaseDescription: phase.stage.description,
        eventWeek: project.eventWeek,
      }
      if (state.week === project.eventWeek) {
        project.eventSlots.forEach((eventSlot, eventIndex) => {
          if (eventSlot < 0 || eventSlot > 20) return
          const eventPhase = projectDef.eventPhases[eventIndex]
          cells[eventSlot].activity = {
            orgId: org.id,
            name: org.name,
            category: org.category,
            kind: 'event',
            projectTitle: projectDef.title,
            phaseTitle: eventPhase?.title ?? '活动进行中',
            phaseDescription: eventPhase?.description ?? '',
            eventIndex,
            eventWeek: project.eventWeek,
          }
        })
      }
    } else if (org.id === DEBATE_ORG_ID) {
      cells[slot].activity = {
        orgId: org.id,
        name: org.name,
        category: org.category,
        kind: 'debatePractice',
        phaseTitle: '队内模辩',
        phaseDescription: '本周队内模辩。参加后悟性成长值 +10%。',
      }
    } else {
      cells[slot].activity = {
        orgId: org.id,
        name: org.name,
        category: org.category,
      }
    }
  }

  // 永昰杯：大一冬、大二冬第1-3周，周六晚对全校玩家开放；课程避开该格。
  const cupEdition = debateEditionForState(state)
  if (cupEdition && state.week >= 1 && state.week <= 3) {
    const roundIndex = state.week - 1
    cells[DEBATE_CUP_SLOT].activity = {
      orgId: DEBATE_ORG_ID,
      name: '永昰杯',
      category: 'debate',
      kind: 'debateCup',
      phaseTitle: DEBATE_CUP_ROUNDS[roundIndex],
      phaseDescription: '永昰杯辩论赛',
      roundIndex,
      editionId: cupEdition.id,
    }
  }

  const free = (index: number) =>
    cells[index].course === null && !cells[index].activity

  const takeFrom = (course: Course, pool: number[], count: number) => {
    let remaining = count
    const available = shuffle(pool.filter(free), random)
    for (const index of available) {
      if (remaining <= 0) break
      cells[index].course = course
      remaining -= 1
    }
    return remaining
  }

  const place = (course: Course) => {
    const slots = timetableSlotCount(course)
    blocks.push({ course, slots })

    // 临床前 10 学分课程：周一至周五的早上和下午全部占满。
    if (course.credits >= 10) {
      let remaining = slots
      remaining = takeFrom(course, WEEKDAY_MORNING_AFTERNOON, remaining)
      if (remaining > 0) remaining = takeFrom(course, WEEKDAY_EVENING, remaining)
      if (remaining > 0) remaining = takeFrom(course, WEEKEND_MORNING_AFTERNOON, remaining)
      if (remaining > 0) takeFrom(course, WEEKEND_EVENING, remaining)
      return
    }

    let remaining = slots
    // 1. 优先周一至周五的上午/下午。
    remaining = takeFrom(course, WEEKDAY_MORNING_AFTERNOON, remaining)
    // 2. 工作日白天填满后，才使用工作日晚上。
    if (remaining > 0) remaining = takeFrom(course, WEEKDAY_EVENING, remaining)
    // 3. 工作日全部填满后，才使用周末白天。
    if (remaining > 0) remaining = takeFrom(course, WEEKEND_MORNING_AFTERNOON, remaining)
    // 4. 最后才使用周末晚上。
    if (remaining > 0) takeFrom(course, WEEKEND_EVENING, remaining)
  }

  const electivePlacement = pendingPe ? [...electives, pendingPe] : electives
  for (const course of shuffle(professional, random)) place(course)
  for (const course of shuffle(electivePlacement, random)) place(course)

  const currentWeekKey = `${state.season.id}-${state.week}`
  for (const invite of state.soloInvites ?? []) {
    if (invite.weekKey !== currentWeekKey) continue
    const cell = cells[invite.slot]
    if (cell && !cell.activity) {
      cell.soloInvite = invite
    }
  }

  return {
    cells,
    blocks,
    totalSlots: blocks.reduce((sum, block) => sum + block.slots, 0),
    placedSlots: cells.filter(
      (cell) => cell.course !== null || cell.activity || cell.soloInvite,
    ).length,
  }
}
