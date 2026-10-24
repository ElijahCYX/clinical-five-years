import { useEffect, useState } from 'react'
import {
  ACTION_BY_ID,
  CET,
  ELECTIVE_COURSE_BY_ID,
  HABIT_BY_ID,
  SEASONS,
  VACATION_ACTION_BY_ID,
  VACATIONS,
} from './data'
import { buildDemoState, demoPlayer } from './demo'
import {
  backgroundAllowance,
  clamp,
  courseK,
  cetScore,
  getReviewEffect,
  gpaFromScore,
  KAOYAN_PASS,
  kaoyanScoreFor,
  makeupGpa,
  newGameState,
  peGpaFor,
  peScoreFor,
  postgradChanceFor,
  scholarshipFor,
  effectiveEnergyCost,
  estimateRange,
  generateElectiveOffers,
  estimateScore,
  prepGainMultiplier,
  stressReliefForScore,
  planEnergyCost,
  planPassive,
  planStress,
  simulateWeek,
  signed,
  WEEKLY_FIXED_COST,
  applyOpeningTalent,
  applyWeeklyOpeningTalent,
  applyScoreRescue,
  coursePrepTalentMultiplier,
  examCoffeeMultiplier,
  examReviewTalentMultiplier,
} from './game'
import type {
  AttrKey,
  DemoName,
  GameState,
  HabitId,
  OpeningTalentId,
  PlanId,
  Player,
  PostgradChoice,
  ReviewChoice,
  ScreenName,
  VacationKind,
  WeekLog,
} from './types'
import { CetEventScreen } from './screens/CetEvent'
import { CetResultScreen } from './screens/CetResult'
import { CreateScreen } from './screens/Create'
import { EndingScreen } from './screens/Ending'
import { PlanScreen } from './screens/Plan'
import {
  BaoyanResultScreen,
  GraduationScreen,
  KaoyanExamScreen,
  KaoyanResultScreen,
  RouteScreen,
} from './screens/Postgrad'
import { PrepScreen } from './screens/Prep'
import { ScholarshipScreen } from './screens/Scholarship'
import { CrisisScreen, type CrisisKind } from './screens/Crisis'
import { ResultScreen } from './screens/Result'
import { TitleScreen } from './screens/Title'
import { VacationScreen } from './screens/Vacation'
import { WeekScreen } from './screens/Week'
import { WhoAmIScreen } from './screens/WhoAmI'
import { TalentSelectScreen } from './screens/TalentSelect'
import { OpeningTalentEventScreen } from './screens/OpeningTalentEvent'
import { setSaveHandler } from './saveBridge'
import {
  applyEvent,
  createFamilyReliefEvent,
  createMentorEncounterEvent,
  rollRelationshipWeekly,
  rollWeeklyEvent,
} from './events'
import { RandomEventModal } from './screens/RandomEvent'
import { WhoIsTAScreen } from './screens/WhoIsTA'
import {
  ResearchNoticeProvider,
  useResearchNotice,
} from './screens/ResearchNotice'
import { EncounterProvider, useEncounter } from './screens/Encounter'
import { ENCOUNTER_CHATS } from './encounters'
import { MENTOR_BY_ID, ensureMentor } from './mentors'
import { pickHypothesis } from './hypotheses'
import {
  canConfess,
  canPat,
  confessionChance,
  createCourseFriend,
  createEventFriend,
  createInitialRelationships,
  nextRoommateAction,
  normalizeRelationships,
  patRelationship,
  patRemainingThisWeek,
  isStaffRelation,
  revealMaybe,
} from './social'

const SAVE_KEY = 'clinical-five-years-save-v27'
const LEGACY_SAVE_KEYS = [
  'clinical-five-years-save-v26',
  'clinical-five-years-save-v25',
  'clinical-five-years-save-v24',
  'clinical-five-years-save-v23',
  'clinical-five-years-save-v22',
  'clinical-five-years-save-v21',
  'clinical-five-years-save-v20',
  'clinical-five-years-save-v19',
]

type View = ScreenName | 'crisis' | 'whoami' | 'whois'

function persist(game: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ game, savedAt: Date.now() }))
  } catch {
    /* localStorage may be unavailable */
  }
}

function readSave(): GameState | null {
  try {
    const raw =
      localStorage.getItem(SAVE_KEY) ??
      LEGACY_SAVE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { game?: GameState }
    if (!parsed.game) return null
    const game = parsed.game
    return ensureMentor({
      ...game,
      screen: game.screen === 'randomEvent' ? 'week' : game.screen,
      player: game.player
        ? { ...game.player, orientation: game.player.orientation ?? 'heterosexual' }
        : null,
      eventWeek: game.eventWeek ?? 0,
      eventHistory: game.eventHistory ?? [],
      pendingEvent: game.pendingEvent ?? null,
      socialModuleUnlocked: game.socialModuleUnlocked ?? false,
      relationships:
        game.relationships && game.relationships.length > 0
          ? normalizeRelationships(game.relationships)
          : game.player
            ? createInitialRelationships(game.player)
            : [],
      dinnerPlan: game.dinnerPlan ?? null,
      romanceUnlocked: game.romanceUnlocked ?? false,
      courseRecords: game.courseRecords ?? [],
      romanceRisk: game.romanceRisk ?? 0,
      teacherScandalRisk: game.teacherScandalRisk ?? 0,
      pendingConfession: game.pendingConfession ?? null,
      mentorProfileId: game.mentorProfileId ?? null,
      researchProgress: game.researchProgress ?? 0,
      researchPublished: game.researchPublished ?? false,
      researchJournal: game.researchJournal ?? null,
      researchStarted: game.researchStarted ?? false,
      activeHypothesisId: game.activeHypothesisId ?? null,
      activeHypothesisTitle: game.activeHypothesisTitle ?? null,
      lastResearchWeek: game.lastResearchWeek ?? 0,
      lastResearchWarningWeek: game.lastResearchWarningWeek ?? 0,
      lastHypothesisOfferSeason: game.lastHypothesisOfferSeason ?? null,
      familyAffection: game.familyAffection ?? 0,
      familyReliefWeek: game.familyReliefWeek ?? 0,
    })
  } catch {
    return null
  }
}

function buildWeekLog(
  game: GameState,
  next: {
    energy: number
    stress: number
    money: number
    prep: number
    studyCount: number
    habitApplied: boolean
  },
): WeekLog {
  const selectedNames = game.selected
    .map((id) => ACTION_BY_ID[id]?.name)
    .filter(Boolean)
    .join('、')

  const titles = [
    `${game.season.seasonLabel} · 第 1 周`,
    `${game.season.seasonLabel} · 第 2 周`,
    `${game.season.seasonLabel} · 第 3 周`,
  ]
  const texts = [
    `${game.season.seasonLabel}开始了。你把这周的时间分给了${selectedNames || '一些琐事'}。`,
    `课程开始加速。这周你选择了${selectedNames || '按部就班'}，并开始习惯大学的速度。`,
    `离考试只剩一周。你把这周交给了${selectedNames || '日常'}，并在心里默默计算还差多少。`,
  ]

  const energyDelta = Math.round(next.energy - game.energy)
  const stressDelta = Math.round(next.stress - game.stress)
  const moneyDelta = Math.round(next.money - game.money)
  const prepDelta = Math.round(
    next.prep - Object.values(game.prep).reduce((sum, value) => sum + value, 0),
  )

  const deltas: string[] = []
  if (energyDelta !== 0) deltas.push(`精力 ${signed(energyDelta)}`)
  if (stressDelta !== 0) deltas.push(`压力 ${signed(stressDelta)}`)
  if (moneyDelta !== 0) deltas.push(`生活费 ${signed(moneyDelta)}`)
  if (prepDelta !== 0) deltas.push(`准备度 ${signed(prepDelta)}`)
  if (next.habitApplied) deltas.push('习惯生效')
  if (next.studyCount > 0) deltas.push(`学习 ${next.studyCount} 次`)

  return {
    week: game.week,
    title: titles[game.week - 1] ?? `${game.season.seasonLabel} · 第 ${game.week} 周`,
    text: texts[game.week - 1] ?? texts[0],
    deltas,
  }
}

function buildVacationLog(
  game: GameState,
  next: { energy: number; stress: number; money: number; habitApplied: boolean },
): WeekLog {
  const meta = game.vacation ? VACATIONS[game.vacation.kind] : null
  const selectedNames = game.selected
    .map((id) => VACATION_ACTION_BY_ID[id]?.name)
    .filter(Boolean)
    .join('、')
  const week = game.vacation?.week ?? 1

  const energyDelta = Math.round(next.energy - game.energy)
  const stressDelta = Math.round(next.stress - game.stress)
  const moneyDelta = Math.round(next.money - game.money)
  const deltas: string[] = []
  if (energyDelta !== 0) deltas.push(`精力 ${signed(energyDelta)}`)
  if (stressDelta !== 0) deltas.push(`压力 ${signed(stressDelta)}`)
  if (moneyDelta !== 0) deltas.push(`生活费 ${signed(moneyDelta)}`)
  if (next.habitApplied) deltas.push('习惯生效')

  return {
    week,
    title: `${meta?.name ?? '假期'} · 第 ${week} 周`,
    text: `没有早八的一周。你把这周的时间分给了${selectedNames || '一些小事'}。`,
    deltas,
  }
}

function resultNextLabel(index: number): string {
  if (index === 15) return '学年结算'
  if (index === 16) return '推免结果'
  if (index === 17) return '考研初试'
  if (index === 18) return '考研结果'
  if (index === 19) return '毕业结算'
  if (index === 1 || index === 5 || index === 9) return '寒假'
  if (index === 3 || index === 7) return '暑假'
  if (index === 11) return '学年结算'
  return SEASONS[index + 1]?.seasonLabel ?? '继续'
}

function yearNumber(index: number): number {
  return Math.floor(index / 4) + 1
}

function yearName(index: number): string {
  return ['大一', '大二', '大三', '大四', '大五'][yearNumber(index) - 1] ?? `第 ${yearNumber(index)} 学年`
}

function isYearFinal(index: number): boolean {
  return [3, 7, 11, 15, 19].includes(index)
}

function finalizeYear(base: GameState): GameState {
  const year = yearNumber(base.seasonIndex)
  if (base.yearRecords.some((record) => record.year === year)) return base
  const previous = base.yearRecords[base.yearRecords.length - 1]
  const prevCredits = previous?.cumulativeCredits ?? 0
  const prevPoints = previous?.cumulativePoints ?? 0
  const prevComposite = previous?.cumulativeComposite ?? 0
  const prevResearch = previous?.cumulativeResearch ?? 0
  const creditsGain = base.cumulativeCredits - prevCredits
  const pointsGain = base.cumulativePoints - prevPoints
  const gpa = creditsGain > 0 ? pointsGain / creditsGain : 0
  const compositeGain = base.composite - prevComposite
  const paperGain =
    Math.floor(base.research / 100) - Math.floor(prevResearch / 100)
  const record = {
    year,
    gpa,
    compositeGain,
    researchGain: base.research - prevResearch,
    papers: Math.max(0, paperGain),
    failed: base.yearFailed,
    cumulativeCredits: base.cumulativeCredits,
    cumulativePoints: base.cumulativePoints,
    cumulativeComposite: base.composite,
    cumulativeResearch: base.research,
    evaluated: false,
    award: null,
    awards: [],
    score: null,
  }
  return {
    ...base,
    yearRecords: [...base.yearRecords, record],
    yearFailed: false,
  }
}

function evaluateScholarship(base: GameState, index: number): GameState | null {
  if (!base.player) return null
  const record = base.yearRecords.find(
    (item) => !item.evaluated && item.year === yearNumber(index) - 1,
  )
  if (!record) return null
  const prior = base.yearRecords.filter((item) => item.year < record.year)
  const score = scholarshipFor(record, base.player, prior, base.everFailed)
  return {
    ...base,
    money: base.money + score.reward,
    yearRecords: base.yearRecords.map((item) =>
      item === record
        ? {
            ...item,
            evaluated: true,
            award: score.award,
            awards: score.awards,
            score,
          }
        : item,
    ),
  }
}

function settlePe(base: GameState): GameState {
  const year = yearNumber(base.seasonIndex)
  if (base.peResults.some((item) => item.year === year)) return base
  const constitution = base.player?.attrs.constitution ?? 2
  const score = peScoreFor(constitution)
  const gpa = peGpaFor(score)
  const passed = score >= 60
  return {
    ...base,
    peResults: [...base.peResults, { year, score, gpa, passed }],
    cumulativeCredits: base.cumulativeCredits + (passed ? 2 : 0),
    cumulativePoints: base.cumulativePoints + (passed ? 2 * gpa : 0),
    everFailed: base.everFailed || !passed,
    yearFailed: base.yearFailed || !passed,
  }
}

function prepareSeason(base: GameState, index: number): GameState {
  const baseSeason = SEASONS[index]
  const pending = base.pendingMakeups ?? []
  const retakeCourses = (base.pendingElectiveRetakes ?? [])
    .map((id) => ELECTIVE_COURSE_BY_ID[id])
    .filter(Boolean)
  const extraCourses = [...pending, ...retakeCourses]
  const season = extraCourses.length > 0
    ? { ...baseSeason, courses: [...baseSeason.courses, ...extraCourses] }
    : baseSeason
  return {
    ...base,
    screen: 'plan',
    season,
    seasonIndex: index,
    plan: null,
    habits: [],
    weekFocus: null,
    electiveOffers:
      index < 12
        ? generateElectiveOffers(
            base.electiveHistory ?? [],
            base.politicsCompleted ?? [],
            base.pendingElectiveRetakes ?? [],
          )
        : [],
    electiveSelectionDone: index >= 12,
    pendingElectiveRetakes: [],
    week: 1,
    money: base.money + (base.player ? backgroundAllowance(base.player) : 0),
    prep: Object.fromEntries(season.courses.map((course) => [course.id, 0])),
    results: [],
    selected: [],
    actionsUsed: 0,
    vacation: null,
    cetEventDone: false,
    examCoffee: false,
    examAllNighter: false,
    examEnglishPrep: false,
    pendingMakeups: [],
  }
}

function prepareVacation(base: GameState, kind: VacationKind): GameState {
  const meta = VACATIONS[kind]
  return {
    ...base,
    screen: 'vacation',
    plan: null,
    week: 1,
    results: [],
    selected: [],
    actionsUsed: 0,
    vacation: { kind, week: 1, totalWeeks: meta.weeks },
  }
}

function growAttributes(
  attrs: Record<AttrKey, number>,
  constitutionGrowth: number,
  appearanceGrowth: number,
  socialGrowth: number,
) {
  let nextAttrs = attrs
  if (constitutionGrowth >= 100) {
    if (attrs.constitution < 10) {
      nextAttrs = { ...attrs, constitution: attrs.constitution + 1 }
      constitutionGrowth -= 100
    } else {
      constitutionGrowth = 100
    }
  }
  if (appearanceGrowth >= 100) {
    if (attrs.appearance < 10) {
      nextAttrs = { ...nextAttrs, appearance: attrs.appearance + 1 }
      appearanceGrowth -= 100
    } else {
      appearanceGrowth = 100
    }
  }
  if (socialGrowth >= 100) {
    if (nextAttrs.social < 10) {
      nextAttrs = { ...nextAttrs, social: nextAttrs.social + 1 }
      socialGrowth -= 100
    } else {
      socialGrowth = 100
    }
  }
  return { attrs: nextAttrs, constitutionGrowth, appearanceGrowth, socialGrowth }
}

function getCount(selected: string[], id: string): number {
  return selected.filter((item) => item === id).length
}

function absoluteWeek(state: GameState): number {
  return state.seasonIndex * 4 + state.week
}

function RealApp() {
  const { showResearchNotice } = useResearchNotice()
  const { showEncounter } = useEncounter()
  const [view, setView] = useState<View>('title')
  const [game, setGame] = useState<GameState | null>(null)
  const [hasSave, setHasSave] = useState(false)
  const [crisisKind, setCrisisKind] = useState<CrisisKind | null>(null)
  const [crisisReturn, setCrisisReturn] = useState<View>('week')
  const [whoamiReturn, setWhoamiReturn] = useState<View>('week')
  const [whoisReturn, setWhoisReturn] = useState<View>('week')

  useEffect(() => {
    setHasSave(Boolean(readSave()))
  }, [])

  useEffect(() => {
    if (!game || view === 'title' || view === 'create') {
      setSaveHandler(null)
      return
    }
    setSaveHandler(() => {
      persist(game)
      setHasSave(true)
    })
    return () => setSaveHandler(null)
  }, [game, view])

  useEffect(() => {
    const body = document.body
    const active =
      Boolean(game) && view !== 'title' && view !== 'create'
    const stress = active ? game!.stress : 0
    const energy = active ? game!.energy : 100
    body.classList.toggle('stress-high', stress > 79)
    body.classList.toggle('stress-critical', stress > 80)
    body.classList.toggle('energy-low', energy < 20)
    return () => {
      body.classList.remove('stress-high', 'stress-critical', 'energy-low')
    }
  }, [game, view])

  useEffect(() => {
    if (!game || view !== 'week') return
    if (
      game.pendingEvent ||
      game.pendingConfession ||
      game.eventWeek === game.week
    ) {
      return
    }
    if (game.week < 1 || game.week > 3) return
    if (
      (!game.highPressureDebuff && game.stress > 80) ||
      (!game.lowEnergyAlert && game.energy < 20)
    ) {
      return
    }
    const mentorRelation = game.relationships.find(
      (relation) => relation.kind === 'mentor',
    )
    if (
      mentorRelation &&
      game.mentorContactUnlocked &&
      !game.labEntered &&
      mentorRelation.intimacy >= 40
    ) {
      const mentorName = mentorRelation.name
      const next: GameState = {
        ...game,
        eventWeek: game.week,
        pendingEvent: null,
        pendingConfession: null,
        screen: 'week',
      }
      setGame(next)
      persist(next)
      showResearchNotice({
        kind: 'lab',
        title: '导师的通知',
        text: `${mentorName}在群里艾特你：“下周起跟着组会听一听，实验室门禁我帮你开好了。先别碰贵重仪器，先学会给移液枪装枪头。”你盯着这条消息看了三遍，确定自己没有看错。`,
        onAcknowledge: () => {
          setGame((previous) => {
            if (!previous) return previous
            const updated = { ...previous, labEntered: true }
            persist(updated)
            return updated
          })
        },
      })
      return
    }
    const mentor = mentorRelation
    const currentAbsoluteWeek = absoluteWeek(game)
    const isAutumn = game.season.seasonLabel.includes('秋')
    const ideaThresholdDue =
      mentor !== undefined &&
      mentor.intimacy >= 60 &&
      game.lastHypothesisOfferSeason === null
    const ideaAutumnDue =
      mentor !== undefined &&
      mentor.intimacy >= 60 &&
      isAutumn &&
      game.lastHypothesisOfferSeason !== game.season.id
    if (
      mentor &&
      game.labEntered &&
      !game.researchStarted &&
      !game.researchPublished &&
      (ideaThresholdDue || ideaAutumnDue)
    ) {
      const hypothesis = game.mentorProfileId
        ? pickHypothesis(game.mentorProfileId)
        : null
      if (hypothesis) {
        const offerNext: GameState = {
          ...game,
          eventWeek: game.week,
          lastHypothesisOfferSeason: game.season.id,
          pendingEvent: null,
          pendingConfession: null,
          screen: 'week',
        }
        setGame(offerNext)
        persist(offerNext)
        showResearchNotice({
          kind: 'idea',
          title: '导师的 idea',
          text: `${mentor.name}在组会结束后叫住你：“我最近想到一个题目——‘${hypothesis.title}’。有点冒险，但值得一试。你要不要接？”`,
          choices: [
            {
              label: '接下课题',
              primary: true,
              onClick: () => {
                setGame((previous) => {
                  if (!previous) return previous
                  const updated: GameState = {
                    ...previous,
                    researchStarted: true,
                    activeHypothesisId: hypothesis.id,
                    activeHypothesisTitle: hypothesis.title,
                    researchProgress: 0,
                    researchPublished: false,
                    lastResearchWeek: currentAbsoluteWeek,
                    lastResearchWarningWeek: currentAbsoluteWeek,
                    relationships: previous.relationships.map((relation) =>
                      relation.kind === 'mentor'
                        ? {
                            ...relation,
                            intimacy: Math.min(100, relation.intimacy + 5),
                          }
                        : relation,
                    ),
                  }
                  persist(updated)
                  return updated
                })
              },
            },
            {
              label: '暂时不接',
              onClick: () => {
                setGame((previous) => {
                  if (!previous) return previous
                  const updated: GameState = {
                    ...previous,
                    relationships: previous.relationships.map((relation) =>
                      relation.kind === 'mentor'
                        ? {
                            ...relation,
                            intimacy: Math.max(0, relation.intimacy - 3),
                          }
                        : relation,
                    ),
                    stress: Math.min(100, previous.stress + 2),
                  }
                  persist(updated)
                  return updated
                })
              },
            },
          ],
        })
        return
      }
    }

    if (
      mentor &&
      game.researchStarted &&
      !game.researchPublished &&
      currentAbsoluteWeek - game.lastResearchWeek > 3 &&
      (game.lastResearchWarningWeek === 0 ||
        currentAbsoluteWeek - game.lastResearchWarningWeek >= 3)
    ) {
      const warningNext: GameState = {
        ...game,
        eventWeek: game.week,
        lastResearchWarningWeek: currentAbsoluteWeek,
        stress: Math.min(100, game.stress + 5),
        relationships: game.relationships.map((relation) =>
          relation.kind === 'mentor'
            ? {
                ...relation,
                intimacy: Math.max(0, relation.intimacy - 5),
              }
            : relation,
        ),
        pendingEvent: null,
        pendingConfession: null,
        screen: 'week',
      }
      setGame(warningNext)
      persist(warningNext)
      showResearchNotice({
        kind: 'warning',
        title: '导师的电话',
        text: `导师在电话里沉默了几秒，然后说：“课题不是挂在墙上的画。你已经三周没有推进了，再这样下去，我只能当你还没准备好。”你握着手机，压力一下子涨了上来。`,
      })
      return
    }

    if (
      game.familyAffection >= 20 &&
      Math.random() < Math.min(0.35, 0.05 + game.familyAffection / 500)
    ) {
      const next: GameState = {
        ...game,
        eventWeek: game.week,
        familyReliefWeek: absoluteWeek(game),
        pendingEvent: createFamilyReliefEvent(),
        pendingConfession: null,
        screen: 'week',
      }
      setGame(next)
      persist(next)
      return
    }
    if (
      game.habits.includes('meditation') &&
      Math.random() < 0.25 &&
      view === 'week'
    ) {
      const known = game.relationships.filter(
        (relation) =>
          relation.kind !== 'mentor' && relation.kind !== 'counselor',
      )
      let next = game
      let relation = known.length > 0
        ? known[Math.floor(Math.random() * known.length)]
        : null
      if (!relation || Math.random() < 0.32) {
        relation = {
          ...createEventFriend(game.player!),
          identity: '校园偶遇认识的人',
        }
        next = {
          ...game,
          relationships: [...game.relationships, relation],
        }
      }
      const chat =
        ENCOUNTER_CHATS[Math.floor(Math.random() * ENCOUNTER_CHATS.length)]
      const nextWithWeek: GameState = {
        ...next,
        eventWeek: game.week,
        pendingEvent: null,
        pendingConfession: null,
        screen: 'week',
      }
      setGame(nextWithWeek)
      persist(nextWithWeek)
      showEncounter({
        name: relation.name,
        identity: relation.identity,
        chat,
        onResolve: (intimacy) => {
          setGame((previous) => {
            if (!previous) return previous
            const updated: GameState = {
              ...previous,
              relationships: previous.relationships.map((item) =>
                item.id === relation!.id
                  ? {
                      ...item,
                      intimacy: Math.max(
                        0,
                        Math.min(100, item.intimacy + intimacy),
                      ),
                    }
                  : item,
              ),
            }
            persist(updated)
            return updated
          })
        },
      })
      return
    }

    if (!game.mentorContactUnlocked && Math.random() < 0.28) {
      const next: GameState = {
        ...game,
        eventWeek: game.week,
        pendingEvent: createMentorEncounterEvent(),
        pendingConfession: null,
        screen: 'week',
      }
      setGame(next)
      persist(next)
      return
    }
    const social = rollRelationshipWeekly(game)
    if (social.pendingEvent || social.pendingConfession) {
      const next: GameState = {
        ...social.state,
        eventWeek: game.week,
        pendingEvent: social.pendingEvent,
        pendingConfession: social.pendingConfession,
        screen: 'week',
      }
      setGame(next)
      persist(next)
      return
    }
    const pending = rollWeeklyEvent(social.state)
    const next: GameState = {
      ...social.state,
      eventWeek: game.week,
      pendingEvent: pending,
      pendingConfession: null,
      screen: 'week',
    }
    setGame(next)
    persist(next)
  }, [game, view])

  useEffect(() => {
    if (
      !game ||
      crisisKind ||
      view === 'title' ||
      view === 'create' ||
      view === 'crisis'
    ) {
      return
    }

    if (game.stress > 80 && !game.highPressureDebuff) {
      const next = { ...game, highPressureDebuff: true }
      setGame(next)
      persist(next)
      setCrisisReturn(view)
      setCrisisKind('stress')
      setView('crisis')
      return
    }

    if (game.stress < 60 && game.highPressureDebuff) {
      const next = { ...game, highPressureDebuff: false }
      setGame(next)
      persist(next)
      return
    }

    if (game.energy < 20 && !game.lowEnergyAlert) {
      const next = { ...game, lowEnergyAlert: true }
      setGame(next)
      persist(next)
      setCrisisReturn(view)
      setCrisisKind('energy')
      setView('crisis')
      return
    }

    if (game.energy >= 20 && game.lowEnergyAlert) {
      const next = { ...game, lowEnergyAlert: false }
      setGame(next)
      persist(next)
    }
  }, [game, view, crisisKind])

  const commit = (next: GameState, nextView: View) => {
    setGame(next)
    setView(nextView)
    persist(next)
    setHasSave(true)
  }

  const goTitle = () => {
    if (game) {
      persist(game)
      setHasSave(true)
    }
    setCrisisKind(null)
    setView('title')
  }

  const startCreate = () => {
    setCrisisKind(null)
    setGame(null)
    setView('create')
  }

  const handleCreate = (player: Player) => {
    setCrisisKind(null)
    const next = {
      ...newGameState(player),
      screen: 'talentSelect' as const,
      relationships: createInitialRelationships(player),
    }
    commit(next, 'talentSelect')
  }

  const handleOpeningTalent = (talents: OpeningTalentId[]) => {
    if (!game) return
    let next = applyOpeningTalent({ ...game, screen: 'plan' }, talents)
    next = ensureMentor(next)
    if (talents.includes('modelMonster') && next.player) {
      const chance = Math.min(0.75, next.player.attrs.appearance * 0.08)
      if (Math.random() < chance) {
        next = {
          ...next,
          screen: 'talentEvent',
          roommateBond: true,
          socialGrowth: next.socialGrowth + 20,
        }
        commit(next, 'talentEvent')
        return
      }
    }
    commit(next, 'plan')
  }

  const handleTalentEventContinue = () => {
    if (!game) return
    commit({ ...game, screen: 'plan' }, 'plan')
  }

  const handleRandomEventContinue = () => {
    if (!game || !game.pendingEvent) return
    const next = applyEvent(game, game.pendingEvent)
    commit(next, 'week')
  }

  const handleNpcConfession = (accept: boolean) => {
    if (!game || !game.pendingConfession) return
    const pending = game.pendingConfession
    const relation = game.relationships.find(
      (item) => item.id === pending.relationshipId,
    )
    if (!relation) {
      commit({ ...game, pendingConfession: null }, 'week')
      return
    }
    const updated: typeof relation = accept
      ? {
          ...relation,
          partner: true,
          intimacy: Math.min(100, relation.intimacy + 5),
          confessionRisk: 0,
          breakupRisk: 0,
          ex: false,
          exWeek: 0,
          exPenalty: false,
        }
      : {
          ...relation,
          intimacy: Math.max(0, relation.intimacy - 5),
          confessionRisk: 0,
        }
    const next: GameState = {
      ...game,
      pendingConfession: null,
      relationships: game.relationships.map((item) =>
        item.id === relation.id ? updated : item,
      ),
      romanceUnlocked: game.romanceUnlocked || accept,
      teacherScandalRisk:
        accept && isStaffRelation(relation)
          ? Math.max(5, game.teacherScandalRisk)
          : game.teacherScandalRisk,
      stress: accept ? game.stress : clamp(game.stress + 2, 0, 100),
    }
    commit(next, 'week')
  }

  const confirmElectives = (acceptedIds: string[]) => {
    if (!game) return
    const electiveCourses = acceptedIds
      .map((id) => ELECTIVE_COURSE_BY_ID[id])
      .filter(Boolean)
    const next: GameState = {
      ...game,
      screen: 'plan',
      season: {
        ...game.season,
        courses: [...game.season.courses, ...electiveCourses],
      },
      electiveHistory: [
        ...new Set([
          ...game.electiveHistory,
          ...electiveCourses
            .filter((course) => course.electiveType !== 'politics')
            .map((course) => course.id),
        ]),
      ],
      electiveOffers: [],
      electiveSelectionDone: true,
      relationships:
        electiveCourses.length > 0 && game.player
          ? [
              ...game.relationships,
              createCourseFriend(game.player, electiveCourses[0].name),
            ]
          : game.relationships,
    }
    commit(next, 'plan')
  }

  const handlePlan = (plan: PlanId, habits: HabitId[]) => {
    if (!game) return
    const next: GameState = {
      ...game,
      screen: 'week',
      plan,
      habits,
      weekFocus: null,
      week: 1,
      selected: [],
      actionsUsed: 0,
    }
    commit(applyWeeklyOpeningTalent(next), 'week')
  }

  const toggleSelected = (prev: GameState, id: string, repeatable: boolean): GameState => {
    const count = getCount(prev.selected, id)
    if (repeatable) {
      const isFull = prev.selected.length >= 2
      // 已选中的可重复行动：选满时优先取消一次，而不是尝试再增加
      if (count > 0 && (isFull || count >= 2)) {
        return { ...prev, selected: prev.selected.filter((item) => item !== id) }
      }
      if (isFull) return prev
      return { ...prev, selected: [...prev.selected, id] }
    }
    if (count > 0) {
      return { ...prev, selected: prev.selected.filter((item) => item !== id) }
    }
    if (prev.selected.length >= 2) return prev
    return { ...prev, selected: [...prev.selected, id] }
  }

  const openWhoAmI = () => {
    if (!game) return
    setWhoamiReturn(view)
    setView('whoami')
  }

  const openWhoIs = () => {
    if (!game) return
    setWhoisReturn(view)
    setView('whois')
  }

  const arrangeDinner = (
    acceptedIds: string[],
    declinedIds: string[],
    cost: number,
  ) => {
    if (!game || game.selected.includes('social') || game.selected.length >= 2) {
      return
    }
    const summary = acceptedIds
      .map((id) => game.relationships.find((relation) => relation.id === id)?.name)
      .filter(Boolean) as string[]
    const next: GameState = {
      ...game,
      selected: [...game.selected, 'social'],
      dinnerPlan: { acceptedIds, declinedIds, cost, summary },
    }
    setGame(next)
    persist(next)
  }

  const autoPatTopRelations = (): string => {
    if (!game) return ''
    const remaining = patRemainingThisWeek(game)
    if (remaining <= 0) return '本周的拍一拍次数已经用完了。'
    const targets = game.relationships
      .filter((relation) => canPat(game, relation))
      .sort((a, b) => b.intimacy - a.intimacy)
      .slice(0, remaining)
    if (targets.length === 0) return '本周还没有可以拍的人。'
    let relationships = game.relationships
    for (const target of targets) {
      relationships = relationships.map((relation) =>
        relation.id === target.id
          ? patRelationship(relation, game)
          : relation,
      )
    }
    const next: GameState = { ...game, relationships }
    setGame(next)
    persist(next)
    return `已自动拍了拍：${targets.map((relation) => relation.name).join('、')}。`
  }

  const patRelation = (id: string) => {
    if (!game || patRemainingThisWeek(game) <= 0) return
    const relation = game.relationships.find((item) => item.id === id)
    if (!relation) return
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((item) =>
        item.id === id ? patRelationship(relation, game) : item,
      ),
    }
    setGame(next)
    persist(next)
  }

  const confessRelation = (id: string): string => {
    if (!game || !game.player) return '现在还不是时候。'
    const relation = game.relationships.find((item) => item.id === id)
    if (!relation) return '你找不到这个人。'
    if (relation.partner) return '你们已经在恋爱了。'
    if (!canConfess(game.player, relation)) {
      return `你和${relation.name}还没有熟到可以表白。再拍一拍，或者一起经历点什么。`
    }
    const chance = confessionChance(game.player, relation)
    const success = Math.random() < chance
    const updated = success
      ? {
          ...relation,
          partner: true,
          intimacy: Math.min(100, relation.intimacy + 5),
          ex: false,
          exWeek: 0,
          exPenalty: false,
          breakupRisk: 0,
        }
      : relation
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((item) =>
        item.id === id ? updated : item,
      ),
      romanceUnlocked: game.romanceUnlocked || success,
    }
    setGame(next)
    persist(next)
    return success
      ? `你向${relation.name}表白了。TA 愣了几秒，然后说：“那就试试吧。”恋爱模块已解锁。`
      : `你向${relation.name}表白了。TA 沉默了一会儿，说：“你是个好人，但我现在只想先把期末过了。”`
  }

  const withdrawElective = (courseId: string) => {
    if (!game || game.week !== 1) return
    const target = game.season.courses.find(
      (course) => course.id === courseId && course.electiveType,
    )
    if (!target) return
    const next: GameState = {
      ...game,
      season: {
        ...game.season,
        courses: game.season.courses.filter((course) => course.id !== courseId),
      },
      electiveHistory: game.electiveHistory.filter((id) => id !== courseId),
    }
    setGame(next)
    persist(next)
  }

  const abandonElective = (courseId: string) => {
    if (!game) return
    const target = game.results.find((result) => result.course.id === courseId)
    if (!target || !target.course.electiveType) return
    if (
      target.course.electiveType === 'group' ||
      target.course.electiveType === 'politics' ||
      target.score >= 60
    ) {
      return
    }
    const next: GameState = {
      ...game,
      results: game.results.filter((result) => result.course.id !== courseId),
      season: {
        ...game.season,
        courses: game.season.courses.filter((course) => course.id !== courseId),
      },
      electiveHistory: game.electiveHistory.filter((id) => id !== courseId),
    }
    setGame(next)
    persist(next)
  }

  const chooseWeekFocus = (focus: string, addLibrary = false) => {
    if (!game) return
    const selected =
      addLibrary &&
      game.selected.length < 2 &&
      !game.selected.includes('library')
        ? [...game.selected, 'library']
        : game.selected
    const next = { ...game, weekFocus: focus, selected }
    setGame(next)
    persist(next)
  }

  const toggleAction = (id: string) => {
    if (!game) return
    const next = toggleSelected(game, id, id === 'library')
    setGame(id === 'social' ? { ...next, dinnerPlan: null } : next)
    if (id === 'social') persist({ ...next, dinnerPlan: null })
  }

  const toggleVacationAction = (id: string) => {
    if (!game) return
    setGame(toggleSelected(game, id, false))
  }

  const endWeek = () => {
    if (!game || !game.plan || game.selected.length !== 2) return
    const player = game.player
    if (!player) return

    const sim = simulateWeek(game)
    const grown = growAttributes(
      sim.attrs,
      sim.constitutionGrowth,
      sim.appearanceGrowth,
      sim.socialGrowth,
    )
    const prepTotal = Object.values(sim.prep).reduce((sum, value) => sum + value, 0)
    const log = buildWeekLog(game, {
      energy: sim.energy,
      stress: sim.stress,
      money: sim.money,
      prep: prepTotal,
      studyCount: sim.studyCount,
      habitApplied: sim.habitApplied,
    })

    const researchProgress = clamp(
      game.researchProgress + sim.researchProgressGain,
      0,
      100,
    )
    const publishedNow = researchProgress >= 100 && !game.researchPublished
    const mentorProfile = game.mentorProfileId
      ? MENTOR_BY_ID[game.mentorProfileId]
      : null
    const publishedJournal =
      publishedNow && mentorProfile && mentorProfile.journals.length > 0
        ? mentorProfile.journals[
            Math.floor(Math.random() * mentorProfile.journals.length)
          ]
        : game.researchJournal

    const shouldPrepare = game.week >= 3
    const isCetEvent =
      (game.season.seasonLabel.endsWith('夏') || game.season.seasonLabel.endsWith('冬')) &&
      game.seasonIndex !== 19 &&
      game.week === 2 &&
      !game.cetEventDone
    const dinnerAccepted = game.dinnerPlan?.acceptedIds ?? []
    const dinnerIntimacyGain =
      dinnerAccepted.length > 0
        ? Math.max(1, Math.floor(6 / dinnerAccepted.length))
        : 0
    const relationships = game.relationships.map((relation) => {
      let updated = relation
      if (relation.kind === 'roommate') {
        updated = { ...updated, weeklyAction: nextRoommateAction() }
      }
      if (dinnerAccepted.includes(relation.id)) {
        updated = revealMaybe({
          ...updated,
          intimacy: Math.min(100, updated.intimacy + dinnerIntimacyGain),
        })
      }
      if (relation.kind === 'mentor' && sim.mentorIntimacyGain > 0) {
        updated = {
          ...updated,
          intimacy: Math.min(100, updated.intimacy + sim.mentorIntimacyGain),
        }
      }
      return updated
    })
    const next: GameState = {
      ...game,
      screen: isCetEvent ? 'cetEvent' : shouldPrepare ? 'prep' : 'week',
      relationships,
      dinnerPlan: null,
      player: { ...player, attrs: grown.attrs },
      week: shouldPrepare ? 4 : game.week + 1,
      energy: sim.energy,
      stress: sim.stress,
      money: sim.money,
      english: sim.english,
      composite: sim.composite,
      research: sim.research,
      prep: sim.prep,
      kaoyanPrep: sim.kaoyanPrep,
      constitutionGrowth: grown.constitutionGrowth,
      appearanceGrowth: grown.appearanceGrowth,
      socialGrowth: grown.socialGrowth,
      familyAffection: Math.min(
        100,
        game.familyAffection + sim.familyAffectionGain,
      ),
      researchProgress,
      researchPublished: game.researchPublished || publishedNow,
      researchJournal: publishedJournal,
      lastResearchWeek:
        game.researchStarted && game.selected.includes('research')
          ? absoluteWeek(game)
          : game.lastResearchWeek,
      weekFocus: null,
      selected: [],
      actionsUsed: 0,
      logs: [...game.logs, log],
    }

    const finalNext = applyWeeklyOpeningTalent(next)
    commit(
      finalNext,
      isCetEvent ? 'cetEvent' : shouldPrepare ? 'prep' : 'week',
    )
    if (publishedNow) {
      showResearchNotice({
        kind: 'published',
        title: '论文发表',
        text: `你的论文被正式接收了。导师在群里发了一个很克制的“恭喜”，随后把组会 PPT 的最后一页换成了你的文章截图。你盯着屏幕看了很久，决定今晚奖励自己一顿食堂小炒。`,
        journal:
          publishedJournal ??
          '待定期刊',
      })
    }
  }

  const chooseReview = (choice: ReviewChoice) => {
    if (!game || !game.plan || !game.player) return
    const effect = getReviewEffect(choice, game.season.courses, game.player.attrs, game.plan)
    const gains = Object.fromEntries(
      game.season.courses.map((course) => [
        course.id,
        (effect.gains[course.id] ?? 0) *
          prepGainMultiplier(game) *
          examReviewTalentMultiplier(game) *
          coursePrepTalentMultiplier(game, course) *
          examCoffeeMultiplier(game) *
          (game.examEnglishPrep ? 0.9 : 1),
      ]),
    )
    const energy = clamp(
      game.energy + effectiveEnergyCost(effect.energy, game.energy),
      0,
      100,
    )
    let stress = clamp(game.stress + effect.stress, 0, 100)
    const money = Math.max(0, game.money - WEEKLY_FIXED_COST)
    const prep = { ...game.prep }
    const rewardedCourses = [...game.stressRewardedCourses]

    const results = game.season.courses.map((course) => {
      prep[course.id] = clamp((prep[course.id] ?? 0) + (gains[course.id] ?? 0), 0, 100)
      const [rawMin, rawMax] = estimateRange(prep[course.id])
      const cap = effect.scoreCap ?? 100
      const expectedMin = Math.min(rawMin, cap)
      const expectedMax = Math.min(rawMax, cap)
      const expectedCenter = Math.min(estimateScore(prep[course.id]), cap)
      let rawScore =
        38 +
        prep[course.id] * 0.55 +
        (Math.random() * 2 * effect.variance - effect.variance)
      if (game.examAllNighter) {
        rawScore *= game.openingTalents.includes('caffeineImmune') ? 0.975 : 0.95
      }
      if (course.electiveType === 'interest') rawScore += 3
      const score = applyScoreRescue(
        game,
        Math.max(0, Math.min(cap, Math.min(100, Math.trunc(rawScore)))),
      )
      const rawGpa = gpaFromScore(score)
      const gpa = course.makeup
        ? score >= 60
          ? makeupGpa(course.originalGpa ?? 0, rawGpa)
          : rawGpa
        : rawGpa
      const rewardKey = course.makeup
        ? course.id.replace(/^makeup-/, '').replace(/-\d+$/, '')
        : course.id
      const eligible = score >= 60 && !rewardedCourses.includes(rewardKey)
      const stressRelief = eligible
        ? stressReliefForScore(score, expectedCenter)
        : 0
      if (eligible) rewardedCourses.push(rewardKey)
      return { course, score, gpa, expectedMin, expectedMax, stressRelief }
    })
    const totalStressRelief = results.reduce(
      (sum, result) => sum + result.stressRelief,
      0,
    )
    stress = clamp(stress - totalStressRelief, 0, 100)

    const passed = results.filter((result) => result.score >= 60)
    const failed = results.filter((result) => result.score < 60)
    const regularPassed = passed.filter((result) => !result.course.electiveType)
    const electivePassed = passed.filter(
      (result) => result.course.electiveType && result.course.electiveType !== 'politics',
    )
    const politicsPassed = passed.filter(
      (result) => result.course.electiveType === 'politics',
    )
    const regularCredits = regularPassed.reduce(
      (sum, result) => sum + result.course.credits,
      0,
    )
    const regularPoints = regularPassed.reduce(
      (sum, result) => sum + result.course.credits * result.gpa,
      0,
    )
    let electiveCreditRoom = Math.max(0, 10 - (game.electiveCredits ?? 0))
    let electiveCreditsGain = 0
    let electivePointsGain = 0
    for (const result of electivePassed) {
      const counted = Math.min(result.course.credits, electiveCreditRoom)
      if (counted <= 0) continue
      electiveCreditsGain += counted
      electivePointsGain += counted * result.gpa
      electiveCreditRoom -= counted
    }
    const politicsCreditsGain = politicsPassed.reduce(
      (sum, result) => sum + result.course.credits,
      0,
    )
    const politicsPointsGain = politicsPassed.reduce(
      (sum, result) => sum + result.course.credits * result.gpa,
      0,
    )
    const creditGain = regularCredits + electiveCreditsGain + politicsCreditsGain
    const pointGain = regularPoints + electivePointsGain + politicsPointsGain
    const pendingMakeups = failed
      .filter((result) => !result.course.electiveType)
      .map((result) =>
        result.course.makeup
          ? result.course
          : {
              ...result.course,
              id: `makeup-${result.course.id}-${game.seasonIndex}`,
              name: result.course.name,
              makeup: true,
              originalGpa: result.gpa,
              originalScore: result.score,
            },
      )
    const failedRequiredElectives = failed
      .filter(
        (result) =>
          result.course.electiveType === 'group' ||
          result.course.electiveType === 'politics',
      )
      .map((result) => result.course.id)
    const next: GameState = {
      ...game,
      screen: 'result',
      week: 4,
      energy,
      stress,
      money,
      prep,
      results,
      pendingMakeups,
      everFailed: game.everFailed || failed.length > 0,
      yearFailed: game.yearFailed || failed.length > 0,
      cumulativeCredits: game.cumulativeCredits + creditGain,
      cumulativePoints: game.cumulativePoints + pointGain,
      electiveCredits: Math.min(
        10,
        (game.electiveCredits ?? 0) + electiveCreditsGain,
      ),
      pendingElectiveRetakes: [
        ...new Set([...game.pendingElectiveRetakes, ...failedRequiredElectives]),
      ],
      politicsCompleted: [
        ...new Set([
          ...game.politicsCompleted,
          ...politicsPassed.map((result) => result.course.id),
        ]),
      ],
      politicsCredits: game.politicsCredits + politicsCreditsGain,
      courseRecords: [
        ...game.courseRecords,
        ...passed
          .filter(
            (result) =>
              !game.courseRecords.some(
                (record) => record.id === result.course.id,
              ),
          )
          .map((result) => ({
            id: result.course.id,
            name: result.course.name,
            credits: result.course.credits,
            gpa: result.gpa,
            score: result.score,
            category: result.course.electiveType
              ? result.course.electiveType === 'politics'
                ? ('politics' as const)
                : ('elective' as const)
              : ('professional' as const),
          })),
      ],
      stressRewardedCourses: rewardedCourses,
      selected: [],
      finalNote:
        failed.length === 0
          ? `${game.season.seasonLabel}结束。成绩单被收进档案，下一段日子已经在前面等你。`
          : `${game.season.seasonLabel}结束。成绩单上有一个不太好看的数字，补考在下一个学期等你。`,
    }

    commit(next, 'result')
  }

  const handleCoffee = () => {
    if (!game || game.examCoffee || game.money < 50) return
    const next: GameState = {
      ...game,
      money: game.money - 50,
      energy: clamp(game.energy + 10, 0, 100),
      stress: clamp(
        game.stress + (game.openingTalents.includes('caffeineImmune') ? 0 : 5),
        0,
        100,
      ),
      examCoffee: true,
    }
    setGame(next)
    persist(next)
  }

  const handleEnglishPrep = () => {
    if (!game || game.examEnglishPrep) return
    const next: GameState = {
      ...game,
      energy: clamp(game.energy + effectiveEnergyCost(-10, game.energy), 0, 100),
      stress: clamp(game.stress + 5, 0, 100),
      english: game.english + 5,
      cetAttemptBonus: game.cetWindow
        ? Math.min(0.5, game.cetAttemptBonus + 0.1)
        : game.cetAttemptBonus,
      examEnglishPrep: true,
    }
    setGame(next)
    persist(next)
  }

  const handleAllNighter = () => {
    if (!game || game.examAllNighter) return
    const prep = { ...game.prep }
    const gain = 15 * prepGainMultiplier(game) * examCoffeeMultiplier(game)
    for (const course of game.season.courses) {
      prep[course.id] = clamp((prep[course.id] ?? 0) + gain, 0, 100)
    }
    const next: GameState = {
      ...game,
      energy: clamp(game.energy + effectiveEnergyCost(-10, game.energy), 0, 100),
      stress: clamp(game.stress + 10, 0, 100),
      constitutionGrowth: Math.max(0, game.constitutionGrowth - 10),
      prep,
      examAllNighter: true,
    }
    setGame(next)
    persist(next)
  }

  const handleCetRegister4 = () => {
    if (!game) return
    const cet4Passed = (game.cet4Score ?? 0) >= CET.pass4
    if (cet4Passed || game.money < CET.registrationCost) return
    const next: GameState = {
      ...game,
      money: game.money - CET.registrationCost,
      cet4Registered: true,
      cetEventDone: true,
      cetWindow: game.season.seasonLabel.includes('冬') ? 'winter' : 'summer',
      cetAttemptBonus: game.cetAttemptBonus,
      screen: 'week',
    }
    commit(next, 'week')
  }

  const handleCetRegister6 = () => {
    if (!game) return
    const cet4Passed = (game.cet4Score ?? 0) >= CET.pass4
    if (!cet4Passed || game.money < CET.registrationCost) return
    const next: GameState = {
      ...game,
      money: game.money - CET.registrationCost,
      cet6Registered: true,
      cetEventDone: true,
      cetWindow: game.season.seasonLabel.includes('冬') ? 'winter' : 'summer',
      cetAttemptBonus: game.cetAttemptBonus,
      screen: 'week',
    }
    commit(next, 'week')
  }

  const handleCetSkip = () => {
    if (!game) return
    commit({ ...game, cetEventDone: true, screen: 'week' }, 'week')
  }

  const finalizeGraduation = (base: GameState) => {
    const failedPe = base.peResults.filter((item) => !item.passed)
    let peMakeupPassed = base.peMakeupPassed
    let peMakeupScore = base.peMakeupScore
    let current = base
    if (failedPe.length > 0) {
      peMakeupScore = peScoreFor(base.player!.attrs.constitution)
      peMakeupPassed = peMakeupScore >= 60
      if (peMakeupPassed) {
        const gpa = peGpaFor(peMakeupScore)
        current = {
          ...base,
          cumulativeCredits: base.cumulativeCredits + failedPe.length * 2,
          cumulativePoints: base.cumulativePoints + failedPe.length * 2 * gpa,
        }
      }
    }
    commit(
      { ...current, peMakeupPassed, peMakeupScore, screen: 'graduation' },
      'graduation',
    )
  }

  const withCetResults = (base: GameState): GameState => {
    const tookCet4 = base.cet4Registered
    const tookCet6 = base.cet6Registered
    const bonus = Math.max(0, Math.min(1, base.cetAttemptBonus))
    let cet4Score = base.cet4Score
    let cet6Score = base.cet6Score
    if (tookCet4) {
      cet4Score = cetScore('cet4', base.english, base.player!.attrs.memory)
      if (cet4Score < CET.pass4 && Math.random() < bonus) cet4Score = CET.pass4
    }
    if (tookCet6) {
      const attempt = cetScore('cet6', base.english, base.player!.attrs.memory)
      const adjusted =
        attempt < CET.pass6 && Math.random() < bonus ? CET.pass6 : attempt
      cet6Score = Math.max(base.cet6Score ?? 0, adjusted)
    }
    return {
      ...base,
      cet4Score,
      cet6Score,
      cet4Registered: false,
      cet6Registered: false,
      cetWindow: null,
      cetAttemptBonus: 0,
    }
  }

  const handleCetResultContinue = () => {
    if (!game) return
    if (game.seasonIndex > 0 && game.seasonIndex % 4 === 0) {
      const withScholarship = evaluateScholarship(game, game.seasonIndex)
      if (withScholarship) {
        commit({ ...withScholarship, screen: 'scholarship' }, 'scholarship')
        return
      }
    }
    if (game.seasonIndex === 14 && !game.postgradChoice) {
      commit(
        {
          ...game,
          screen: 'route',
          postgradChance: game.postgradChance ?? postgradChanceFor(game),
        },
        'route',
      )
      return
    }
    commit({ ...game, screen: 'plan' }, 'plan')
  }

  const beginSeason = (base: GameState, index: number) => {
    const prepared = prepareSeason(base, index)
    const pendingCet =
      (base.cetWindow === 'winter' && index % 4 === 2) ||
      (base.cetWindow === 'summer' && index % 4 === 0)
    if (pendingCet) {
      commit({ ...withCetResults(prepared), screen: 'cetResult' }, 'cetResult')
      return
    }
    if (index > 0 && index % 4 === 0) {
      const withScholarship = evaluateScholarship(prepared, index)
      if (withScholarship) {
        commit({ ...withScholarship, screen: 'scholarship' }, 'scholarship')
        return
      }
    }
    if (index === 14 && !base.postgradChoice) {
      commit(
        { ...prepared, screen: 'route', postgradChance: postgradChanceFor(prepared) },
        'route',
      )
      return
    }
    commit(prepared, 'plan')
  }

  const startSeason = (index: number) => {
    if (!game) return
    beginSeason(game, index)
  }

  const startVacation = (kind: VacationKind) => {
    if (!game) return
    commit(prepareVacation(game, kind), 'vacation')
  }

  const handleRouteChoice = (choice: PostgradChoice) => {
    if (!game) return
    commit(
      {
        ...game,
        postgradChoice: choice,
        postgradChance: game.postgradChance ?? postgradChanceFor(game),
        screen: 'plan',
      },
      'plan',
    )
  }

  const handleBaoyanContinue = () => {
    if (!game) return
    beginSeason(game, 17)
  }

  const handleKaoyanRegister = () => {
    if (!game) return
    beginSeason({ ...game, kaoyanRegistered: true, screen: 'plan' }, 17)
  }

  const handleBaoyanEmployment = () => {
    if (!game) return
    beginSeason({ ...game, postgradChoice: 'employment', screen: 'plan' }, 17)
  }

  const handleKaoyanExamContinue = () => {
    if (!game) return
    beginSeason(game, 18)
  }

  const handleKaoyanResultContinue = () => {
    if (!game) return
    beginSeason(game, 19)
  }

  const handleScholarshipContinue = () => {
    if (!game) return
    commit({ ...game, screen: 'plan' }, 'plan')
  }

  const handleResultContinue = () => {
    if (!game) return
    let current = game
    if (isYearFinal(current.seasonIndex)) current = settlePe(current)
    const index = current.seasonIndex

    // 大三临床前、大四夏：学年结算（大四无暑假）
    if (index === 11 || index === 15) {
      current = finalizeYear(current)
      commit({ ...current, screen: 'yearend', vacation: null }, 'yearend')
      return
    }

    // 大五夏：毕业结算 + 毕业生体育补考
    if (index === 19) {
      finalizeGraduation(current)
      return
    }

    // 非临床学年：夏/寒假
    if (index === 3 || index === 7) {
      commit(prepareVacation(current, 'summer'), 'vacation')
      return
    }
    if (index === 1 || index === 5 || index === 9) {
      commit(prepareVacation(current, 'winter'), 'vacation')
      return
    }

    // 大五秋：推免结果
    if (index === 16) {
      if (current.postgradChoice && current.postgradChoice !== 'employment') {
        const success =
          Math.random() < (current.postgradChance ?? postgradChanceFor(current))
        commit(
          {
            ...current,
            baoyanResult: success ? 'success' : 'fail',
            screen: 'baoyanResult',
          },
          'baoyanResult',
        )
        return
      }
      beginSeason(current, 17)
      return
    }

    // 大五冬：考研初试
    if (index === 17) {
      if (current.kaoyanRegistered) {
        commit(
          {
            ...current,
            kaoyanScore: kaoyanScoreFor(current),
            screen: 'kaoyanExam',
          },
          'kaoyanExam',
        )
        return
      }
      beginSeason(current, 18)
      return
    }

    // 大五春：考研结果
    if (index === 18) {
      if (current.kaoyanRegistered) {
        commit(
          {
            ...current,
            kaoyanResult:
              (current.kaoyanScore ?? 0) >= KAOYAN_PASS ? 'success' : 'fail',
            screen: 'kaoyanResult',
          },
          'kaoyanResult',
        )
        return
      }
      beginSeason(current, 19)
      return
    }

    // 临床年秋季/春季（无寒假、无暑假）
    beginSeason(current, index + 1)
  }

  const handleYearEndContinue = () => {
    if (!game) return
    const nextIndex = game.seasonIndex + 1
    if (nextIndex < SEASONS.length) startSeason(nextIndex)
  }

  const endVacationWeek = () => {
    if (!game || !game.vacation || !game.player || game.selected.length !== 2) return
    const player = game.player
    const habits = (game.habits ?? [])
      .map((id) => HABIT_BY_ID[id])
      .filter(Boolean)
    const habitApplied = habits.length > 0 && game.stress <= 60

    let energy = game.energy
    let stress = game.stress
    let money = game.money
    let english = game.english
    let composite = game.composite
    let research = game.research
    let constitutionGrowth = game.constitutionGrowth
    let appearanceGrowth = game.appearanceGrowth
    let socialGrowth = game.socialGrowth
    const attrs = { ...player.attrs }

    for (const id of game.selected) {
      const action = VACATION_ACTION_BY_ID[id]
      if (!action) continue
      energy += effectiveEnergyCost(action.energy, game.energy)
      stress += action.stress
      money += action.money
      english += action.english ?? 0
      composite += action.composite ?? 0
      research += action.research ?? 0
      if (action.growth === 'constitution') {
        constitutionGrowth += action.growthAmount ?? 0
      }
      if (action.growth === 'social') {
        socialGrowth += action.growthAmount ?? 0
      }
    }

    if (habitApplied) {
      for (const habitDef of habits) {
        energy += habitDef.energy ?? 0
        stress += habitDef.stress ?? 0
        money += habitDef.money ?? 0
        english += habitDef.english ?? 0
        research += habitDef.research ?? 0
        if (habitDef.growth === 'constitution') {
          constitutionGrowth += habitDef.growthAmount ?? 0
        }
        if (habitDef.growth === 'appearance') {
          appearanceGrowth += habitDef.growthAmount ?? 0
        }
      }
    }

    energy = clamp(energy + 15, 0, 100)
    stress = clamp(stress, 0, 100)
    // 假期在家，不扣学期内的每周固定开销

    const grown = growAttributes(attrs, constitutionGrowth, appearanceGrowth, socialGrowth)
    const log = buildVacationLog(game, { energy, stress, money, habitApplied })
    const isLastWeek = game.vacation.week >= game.vacation.totalWeeks
    const base: GameState = {
      ...game,
      player: { ...player, attrs: grown.attrs },
      energy,
      stress,
      money,
      english,
      composite,
      research,
      constitutionGrowth: grown.constitutionGrowth,
      appearanceGrowth: grown.appearanceGrowth,
      socialGrowth: grown.socialGrowth,
      selected: [],
      actionsUsed: 0,
      logs: [...game.logs, log],
    }

    if (!isLastWeek) {
      commit(
        {
          ...base,
          screen: 'vacation',
          vacation: { ...game.vacation, week: game.vacation.week + 1 },
        },
        'vacation',
      )
      return
    }

    if (game.vacation.kind === 'winter') {
      beginSeason(base, game.seasonIndex + 1)
    } else {
      const finalized = finalizeYear(base)
      commit({ ...finalized, screen: 'yearend', vacation: null }, 'yearend')
    }
  }

  const handleContinueSave = () => {
    const saved = readSave()
    if (!saved) return
    setCrisisKind(null)
    setGame(saved)
    setView(
      saved.screen === 'title' || saved.screen === 'randomEvent'
        ? 'week'
        : saved.screen,
    )
  }

  const saveNow = () => {
    if (game) {
      persist(game)
      setHasSave(true)
    }
  }

  const handleRestart = () => {
    setCrisisKind(null)
    setGame(null)
    setView('create')
  }

  if (view === 'title') {
    return (
      <TitleScreen
        hasSave={hasSave}
        onStart={startCreate}
        onContinue={handleContinueSave}
      />
    )
  }

  if (view === 'create') {
    return <CreateScreen onBack={goTitle} onConfirm={handleCreate} />
  }

  if (!game || !game.player) {
    return <TitleScreen hasSave={hasSave} onStart={startCreate} onContinue={handleContinueSave} />
  }

  if (view === 'crisis' && crisisKind) {
    return (
      <CrisisScreen
        state={game}
        kind={crisisKind}
        onDismiss={() => {
          setCrisisKind(null)
          setView(crisisReturn)
        }}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'talentSelect') {
    return (
      <TalentSelectScreen
        state={game}
        onConfirm={handleOpeningTalent}
        onBack={goTitle}
      />
    )
  }

  if (view === 'talentEvent') {
    return (
      <OpeningTalentEventScreen
        state={game}
        onContinue={handleTalentEventContinue}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'whoami') {
    return (
      <WhoAmIScreen
        state={game}
        onMain={() => setView(whoamiReturn)}
        onTA={openWhoIs}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'whois') {
    return (
      <WhoIsTAScreen
        state={game}
        onPat={patRelation}
        onAutoPat={autoPatTopRelations}
        onConfess={confessRelation}
        onMain={() => setView(whoisReturn)}
        onWho={() => setView('whoami')}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'cetEvent') {
    return (
      <CetEventScreen
        state={game}
        onRegister={(kind) => (kind === 'cet4' ? handleCetRegister4() : handleCetRegister6())}
        onSkip={handleCetSkip}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'cetResult') {
    return (
      <CetResultScreen
        state={game}
        nextLabel={game.season.seasonLabel}
        onContinue={handleCetResultContinue}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'scholarship') {
    const record = game.yearRecords[game.yearRecords.length - 1]
    return (
      <ScholarshipScreen
        state={game}
        record={record}
        onContinue={handleScholarshipContinue}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'route') {
    return (
      <RouteScreen
        state={game}
        onChoose={handleRouteChoice}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'baoyanResult') {
    return (
      <BaoyanResultScreen
        state={game}
        onContinue={handleBaoyanContinue}
        onKaoyan={handleKaoyanRegister}
        onEmployment={handleBaoyanEmployment}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'kaoyanExam') {
    return (
      <KaoyanExamScreen state={game} onContinue={handleKaoyanExamContinue} onTitle={goTitle} />
    )
  }

  if (view === 'kaoyanResult') {
    return (
      <KaoyanResultScreen
        state={game}
        onContinue={handleKaoyanResultContinue}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'graduation') {
    return <GraduationScreen state={game} onRestart={handleRestart} onTitle={goTitle} />
  }

  if (view === 'plan') {
    return (
      <PlanScreen
        player={game.player}
        seasonLabel={game.season.seasonLabel}
        initialPlan={game.plan}
        initialHabits={game.habits}
        courses={game.season.courses}
        state={game}
        onConfirmElectives={confirmElectives}
        onBack={() => setView('create')}
        onConfirm={handlePlan}
      />
    )
  }

  if (view === 'week') {
    return (
      <>
        <WeekScreen
          state={game}
          onToggleAction={toggleAction}
          onEndWeek={endWeek}
          onChooseFocus={chooseWeekFocus}
          onWithdrawElective={withdrawElective}
          onOpenWhoAmI={openWhoAmI}
          onOpenTA={openWhoIs}
          onArrangeDinner={arrangeDinner}
          onNpcConfession={handleNpcConfession}
          onSave={saveNow}
          onTitle={goTitle}
        />
        {game.pendingEvent && (
          <RandomEventModal
            state={game}
            event={game.pendingEvent}
            onContinue={handleRandomEventContinue}
          />
        )}
      </>
    )
  }

  if (view === 'prep') {
    return (
      <PrepScreen
        key={game.season.id}
        state={game}
        onChoose={chooseReview}
        onCoffee={handleCoffee}
        onAllNighter={handleAllNighter}
        onEnglishPrep={handleEnglishPrep}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'result') {
    return (
      <ResultScreen
        state={game}
        nextLabel={resultNextLabel(game.seasonIndex)}
        onContinue={handleResultContinue}
        onSave={saveNow}
        onAbandonElective={abandonElective}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'vacation') {
    return (
      <VacationScreen
        state={game}
        onToggleAction={toggleVacationAction}
        onEndWeek={endVacationWeek}
        onSave={saveNow}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'yearend') {
    const completedYear = yearNumber(game.seasonIndex)
    const nextSeason = SEASONS[game.seasonIndex + 1]
    const displayYear = yearName(game.seasonIndex)
    const descriptions: Record<number, string> = {
      1: '大一结束。你从解剖楼、图书馆和无数个早八里走过来，开始知道白大褂的重量。大二见。',
      2: '大二结束。基础课的骨架搭起来了，病理、药理和诊断开始把你往临床推。大三见。',
      3: '大三结束。临床前的门槛已经跨过，接下来是大四、大五的临床年。',
      4: '大四结束。见习的病房、第一次独立问诊、第一次被叫“医生”，都在这一年发生。大五见。',
    }
    const notes: Record<number, string> = {
      1: '下一站：大二。桥梁课程与四六级机会已经接入。',
      2: '下一站：大三。诊断学、临床基础课与临床前学期等你。',
      3: '大二、大三的课程与考试已经完成。大四、大五临床年、事件卡、人物关系、科研与奖学金会在后续版本接入。',
      4: '下一站：大五。临床实习、推免/考研与毕业条件将在这一年收束。',
    }
    return (
      <EndingScreen
        state={game}
        titleMain={`${displayYear}学年`}
        titleAccent="完"
        eyebrow={`END OF YEAR ${['ONE', 'TWO', 'THREE'][completedYear - 1]} / PROTOTYPE 00${completedYear}`}
        description={descriptions[completedYear] ?? game.finalNote ?? `${displayYear}结束。`}
        note={notes[completedYear]}
        continueLabel={nextSeason ? `继续：${nextSeason.seasonLabel}` : undefined}
        onContinue={nextSeason ? handleYearEndContinue : undefined}
        onRestart={handleRestart}
        onTitle={goTitle}
      />
    )
  }

  return (
    <EndingScreen
      state={game}
      description={game.finalNote ?? undefined}
      onRestart={handleRestart}
      onTitle={goTitle}
    />
  )
}

function goDemo(name: DemoName) {
  const url = new URL(window.location.href)
  url.searchParams.set('demo', name)
  window.location.href = url.toString()
}

function DemoWeek() {
  const [state, setState] = useState<GameState>(() => ({
    ...buildDemoState('week'),
    selected: ['library', 'social'],
  }))

  const toggle = (id: string) => {
    setState((prev) => {
      const count = getCount(prev.selected, id)
      if (id === 'library') {
        if (count >= 2) return { ...prev, selected: prev.selected.filter((item) => item !== id) }
        if (prev.selected.length >= 2) return prev
        return { ...prev, selected: [...prev.selected, id] }
      }
      if (count > 0) return { ...prev, selected: prev.selected.filter((item) => item !== id) }
      if (prev.selected.length >= 2) return prev
      return { ...prev, selected: [...prev.selected, id] }
    })
  }

  return (
    <WeekScreen
      state={state}
      onToggleAction={toggle}
      onEndWeek={() => goDemo('prep')}
      onChooseFocus={() => undefined}
      onSave={() => undefined}
      onTitle={() => goDemo('title')}
    />
  )
}

function DemoApp({ screen }: { screen: DemoName }) {
  if (screen === 'title') {
    return (
      <TitleScreen hasSave={false} onStart={() => goDemo('create')} onContinue={() => undefined} />
    )
  }
  if (screen === 'create') {
    return (
      <CreateScreen
        initialPlayer={demoPlayer}
        onBack={() => goDemo('title')}
        onConfirm={() => goDemo('plan')}
      />
    )
  }
  if (screen === 'plan') {
    return (
      <PlanScreen
        player={demoPlayer}
        initialPlan="B"
        initialHabits={["timeManagement", "earlySleep"]}
        courses={SEASONS[0].courses}
        onBack={() => goDemo('create')}
        onConfirm={() => goDemo('week')}
      />
    )
  }
  if (screen === 'week') return <DemoWeek />
  if (screen === 'prep') {
    return (
      <PrepScreen
        state={buildDemoState('prep')}
        initialChoice="mock"
        onChoose={() => goDemo('result')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'result') {
    return (
      <ResultScreen
        state={buildDemoState('result')}
        nextLabel="大一 · 冬"
        onContinue={() => goDemo('vacation')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'cetEvent') {
    return (
      <CetEventScreen
        state={buildDemoState('cetEvent')}
        onRegister={() => goDemo('week')}
        onSkip={() => goDemo('week')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'cetResult') {
    return (
      <CetResultScreen
        state={buildDemoState('cetResult')}
        onContinue={() => goDemo('yearend')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'vacation') {
    return (
      <VacationScreen
        state={buildDemoState('vacation')}
        onToggleAction={() => undefined}
        onEndWeek={() => goDemo('yearend')}
        onSave={() => undefined}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'yearend') {
    return (
      <EndingScreen
        state={buildDemoState('yearend')}
        titleMain="大一学年"
        titleAccent="完"
        description="大一结束。你从解剖楼、图书馆和无数个早八里走过来，开始知道白大褂的重量。大二见。"
        note="寒假、暑假与大一的四个学期已经走完。大二、临床年、事件卡、人物关系、科研与奖学金会在后续版本接入。"
        onRestart={() => goDemo('create')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  return (
    <EndingScreen
      state={buildDemoState('ending')}
      onRestart={() => goDemo('create')}
      onTitle={() => goDemo('title')}
    />
  )
}

export default function App() {
  const demo = new URLSearchParams(window.location.search).get('demo') as DemoName | null
  if (demo) return <DemoApp screen={demo} />
  return (
    <ResearchNoticeProvider>
      <EncounterProvider>
        <RealApp />
      </EncounterProvider>
    </ResearchNoticeProvider>
  )
}
