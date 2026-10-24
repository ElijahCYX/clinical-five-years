import { useEffect, useState } from 'react'
import {
  ACTION_BY_ID,
  CET,
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
  prepGainMultiplier,
  planEnergyCost,
  planPassive,
  planStress,
  simulateWeek,
  signed,
} from './game'
import type {
  AttrKey,
  DemoName,
  GameState,
  HabitId,
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

const SAVE_KEY = 'clinical-five-years-save-v10'

type View = ScreenName | 'crisis'

function persist(game: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ game, savedAt: Date.now() }))
  } catch {
    /* localStorage may be unavailable */
  }
}

function readSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { game?: GameState }
    return parsed.game ?? null
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
    yearRecords: base.yearRecords.map((item) =>
      item === record
        ? { ...item, evaluated: true, award: score.award, score }
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
  const season = pending.length > 0
    ? { ...baseSeason, courses: [...baseSeason.courses, ...pending] }
    : baseSeason
  return {
    ...base,
    screen: 'plan',
    season,
    seasonIndex: index,
    plan: null,
    habit: null,
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

function RealApp() {
  const [view, setView] = useState<View>('title')
  const [game, setGame] = useState<GameState | null>(null)
  const [hasSave, setHasSave] = useState(false)
  const [crisisKind, setCrisisKind] = useState<CrisisKind | null>(null)
  const [crisisReturn, setCrisisReturn] = useState<View>('week')

  useEffect(() => {
    setHasSave(Boolean(readSave()))
  }, [])

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
    commit(newGameState(player), 'plan')
  }

  const handlePlan = (plan: PlanId, habit: HabitId) => {
    if (!game) return
    const next: GameState = {
      ...game,
      screen: 'week',
      plan,
      habit,
      week: 1,
      selected: [],
      actionsUsed: 0,
    }
    commit(next, 'week')
  }

  const toggleSelected = (prev: GameState, id: string, repeatable: boolean): GameState => {
    const count = getCount(prev.selected, id)
    if (repeatable) {
      if (count >= 2) {
        return { ...prev, selected: prev.selected.filter((item) => item !== id) }
      }
      if (prev.selected.length >= 2) return prev
      return { ...prev, selected: [...prev.selected, id] }
    }
    if (count > 0) {
      return { ...prev, selected: prev.selected.filter((item) => item !== id) }
    }
    if (prev.selected.length >= 2) return prev
    return { ...prev, selected: [...prev.selected, id] }
  }

  const toggleAction = (id: string) => {
    if (!game) return
    setGame(toggleSelected(game, id, id === 'library'))
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
      game.socialGrowth,
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

    const shouldPrepare = game.week >= 3
    const isCetEvent =
      (game.season.seasonLabel.endsWith('夏') || game.season.seasonLabel.endsWith('冬')) &&
      game.seasonIndex !== 19 &&
      game.week === 2 &&
      !game.cetEventDone
    const next: GameState = {
      ...game,
      screen: isCetEvent ? 'cetEvent' : shouldPrepare ? 'prep' : 'week',
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
      selected: [],
      actionsUsed: 0,
      logs: [...game.logs, log],
    }

    commit(next, isCetEvent ? 'cetEvent' : shouldPrepare ? 'prep' : 'week')
  }

  const chooseReview = (choice: ReviewChoice) => {
    if (!game || !game.plan || !game.player) return
    const effect = getReviewEffect(choice, game.season.courses, game.player.attrs, game.plan)
    const gains = Object.fromEntries(
      Object.entries(effect.gains).map(([id, gain]) => [
        id,
        gain * prepGainMultiplier(game) * (game.examEnglishPrep ? 0.9 : 1),
      ]),
    )
    const energy = clamp(
      game.energy + effectiveEnergyCost(effect.energy, game.energy),
      0,
      100,
    )
    const stress = clamp(game.stress + effect.stress, 0, 100)
    const money = Math.max(0, game.money - 250)
    const prep = { ...game.prep }

    const results = game.season.courses.map((course) => {
      prep[course.id] = clamp((prep[course.id] ?? 0) + (gains[course.id] ?? 0), 0, 100)
      let rawScore =
        38 +
        prep[course.id] * 0.55 +
        (Math.random() * 2 * effect.variance - effect.variance)
      if (game.examAllNighter) rawScore *= 0.95
      const score = Math.max(0, Math.min(100, Math.trunc(rawScore)))
      const rawGpa = gpaFromScore(score)
      const gpa = course.makeup
        ? score >= 60
          ? makeupGpa(course.originalGpa ?? 0, rawGpa)
          : rawGpa
        : rawGpa
      return { course, score, gpa }
    })

    const passed = results.filter((result) => result.score >= 60)
    const failed = results.filter((result) => result.score < 60)
    const creditGain = passed.reduce((sum, result) => sum + result.course.credits, 0)
    const pointGain = passed.reduce(
      (sum, result) => sum + result.course.credits * result.gpa,
      0,
    )
    const pendingMakeups = failed.map((result) =>
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
      selected: [],
      finalNote:
        failed.length === 0
          ? `${game.season.seasonLabel}结束。成绩单被收进档案，下一段日子已经在前面等你。`
          : `${game.season.seasonLabel}结束。成绩单上有一个不太好看的数字，补考在下一个学期等你。`,
    }

    commit(next, 'result')
  }

  const handleCoffee = () => {
    if (!game || game.examCoffee || game.money < 10) return
    const next: GameState = {
      ...game,
      money: game.money - 10,
      energy: clamp(game.energy + 10, 0, 100),
      stress: clamp(game.stress + 2, 0, 100),
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
    const gain = 15 * prepGainMultiplier(game)
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
    const habit = game.habit
    const habitApplied = game.stress <= 60

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

    if (habitApplied && habit) {
      const habitDef = HABIT_BY_ID[habit]
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

    energy = clamp(energy + 15, 0, 100)
    stress = clamp(stress, 0, 100)
    money = Math.max(0, money - 250)

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
    setView(saved.screen === 'title' ? 'week' : saved.screen)
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
        initialHabit={game.habit}
        onBack={() => setView('create')}
        onConfirm={handlePlan}
      />
    )
  }

  if (view === 'week') {
    return (
      <WeekScreen
        state={game}
        onToggleAction={toggleAction}
        onEndWeek={endWeek}
        onSave={saveNow}
        onTitle={goTitle}
      />
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
        initialHabit="timeManagement"
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
  return <RealApp />
}
