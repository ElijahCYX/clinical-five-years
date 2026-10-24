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
  newGameState,
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
import { PrepScreen } from './screens/Prep'
import { ResultScreen } from './screens/Result'
import { TitleScreen } from './screens/Title'
import { VacationScreen } from './screens/Vacation'
import { WeekScreen } from './screens/Week'

const SAVE_KEY = 'clinical-five-years-save-v4'

type View = ScreenName

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
  if (index === 1 || index === 5 || index === 9) return '寒假'
  if (index === 3 || index === 7) return '暑假'
  if (index === 11) return '学年结算'
  return SEASONS[index + 1]?.seasonLabel ?? '继续'
}

function yearNumber(index: number): number {
  return Math.floor(index / 4) + 1
}

function yearName(index: number): string {
  return ['大一', '大二', '大三'][yearNumber(index) - 1] ?? `第 ${yearNumber(index)} 学年`
}

function prepareSeason(base: GameState, index: number): GameState {
  const season = SEASONS[index]
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
  return { attrs: nextAttrs, constitutionGrowth, appearanceGrowth }
}

function getCount(selected: string[], id: string): number {
  return selected.filter((item) => item === id).length
}

function RealApp() {
  const [view, setView] = useState<View>('title')
  const [game, setGame] = useState<GameState | null>(null)
  const [hasSave, setHasSave] = useState(false)

  useEffect(() => {
    setHasSave(Boolean(readSave()))
  }, [])

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
    setView('title')
  }

  const startCreate = () => {
    setGame(null)
    setView('create')
  }

  const handleCreate = (player: Player) => {
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
    const grown = growAttributes(sim.attrs, sim.constitutionGrowth, sim.appearanceGrowth)
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
      game.season.seasonLabel.endsWith('夏') &&
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
      constitutionGrowth: grown.constitutionGrowth,
      appearanceGrowth: grown.appearanceGrowth,
      selected: [],
      actionsUsed: 0,
      logs: [...game.logs, log],
    }

    commit(next, isCetEvent ? 'cetEvent' : shouldPrepare ? 'prep' : 'week')
  }

  const chooseReview = (choice: ReviewChoice) => {
    if (!game || !game.plan || !game.player) return
    const effect = getReviewEffect(choice, game.season.courses, game.player.attrs, game.plan)
    const energy = clamp(game.energy + effect.energy, 0, 100)
    const stress = clamp(game.stress + effect.stress, 0, 100)
    const money = Math.max(0, game.money - 250)
    const prep = { ...game.prep }

    const results = game.season.courses.map((course) => {
      prep[course.id] = clamp((prep[course.id] ?? 0) + (effect.gains[course.id] ?? 0), 0, 100)
      let rawScore =
        38 +
        prep[course.id] * 0.55 +
        (Math.random() * 2 * effect.variance - effect.variance)
      if (game.examAllNighter) rawScore *= 0.95
      const score = Math.max(0, Math.min(100, Math.trunc(rawScore)))
      return { course, score, gpa: gpaFromScore(score) }
    })

    const creditGain = results.reduce((sum, result) => sum + result.course.credits, 0)
    const pointGain = results.reduce(
      (sum, result) => sum + result.course.credits * result.gpa,
      0,
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
      cumulativeCredits: game.cumulativeCredits + creditGain,
      cumulativePoints: game.cumulativePoints + pointGain,
      selected: [],
      finalNote:
        results.every((result) => result.gpa > 0)
          ? `${game.season.seasonLabel}结束。成绩单被收进档案，下一段日子已经在前面等你。`
          : `${game.season.seasonLabel}结束。成绩单上有一个不太好看的数字，但故事还没写完。`,
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

  const handleAllNighter = () => {
    if (!game || game.examAllNighter) return
    const prep = { ...game.prep }
    for (const course of game.season.courses) {
      prep[course.id] = clamp((prep[course.id] ?? 0) + 15, 0, 100)
    }
    const next: GameState = {
      ...game,
      energy: clamp(game.energy - 10, 0, 100),
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
      screen: 'week',
    }
    commit(next, 'week')
  }

  const handleCetRegister6 = () => {
    if (!game) return
    const cet4Passed = (game.cet4Score ?? 0) >= CET.pass4
    const cet6Qualified = (game.cet6Score ?? 0) >= CET.graduate6
    if (!cet4Passed || cet6Qualified || game.money < CET.registrationCost) return
    const next: GameState = {
      ...game,
      money: game.money - CET.registrationCost,
      cet6Registered: true,
      cetEventDone: true,
      screen: 'week',
    }
    commit(next, 'week')
  }

  const handleCetSkip = () => {
    if (!game) return
    commit({ ...game, cetEventDone: true, screen: 'week' }, 'week')
  }

  const handleCetResultContinue = () => {
    if (!game) return
    commit({ ...game, screen: 'yearend', vacation: null }, 'yearend')
  }

  const startSeason = (index: number) => {
    if (!game) return
    commit(prepareSeason(game, index), 'plan')
  }

  const startVacation = (kind: VacationKind) => {
    if (!game) return
    commit(prepareVacation(game, kind), 'vacation')
  }

  const handleResultContinue = () => {
    if (!game) return
    const index = game.seasonIndex
    if (index === 11) {
      commit({ ...game, screen: 'yearend', vacation: null }, 'yearend')
      return
    }
    if (index === 1 || index === 5 || index === 9) {
      startVacation('winter')
      return
    }
    if (index === 3 || index === 7) {
      startVacation('summer')
      return
    }
    startSeason(index + 1)
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
    const attrs = { ...player.attrs }

    for (const id of game.selected) {
      const action = VACATION_ACTION_BY_ID[id]
      if (!action) continue
      energy += action.energy
      stress += action.stress
      money += action.money
      english += action.english ?? 0
      composite += action.composite ?? 0
      research += action.research ?? 0
      if (action.growth === 'constitution') {
        constitutionGrowth += action.growthAmount ?? 0
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

    const grown = growAttributes(attrs, constitutionGrowth, appearanceGrowth)
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
      commit(prepareSeason(base, game.seasonIndex + 1), 'plan')
    } else {
      const tookCet4 = base.cet4Registered
      const tookCet6 = base.cet6Registered
      let cet4Score = base.cet4Score
      let cet6Score = base.cet6Score
      if (tookCet4) {
        cet4Score = cetScore('cet4', base.english, base.player!.attrs.memory)
      }
      if (tookCet6) {
        cet6Score = cetScore('cet6', base.english, base.player!.attrs.memory)
      }
      if (tookCet4 || tookCet6) {
        commit(
          {
            ...base,
            screen: 'cetResult',
            cet4Score,
            cet6Score,
            cet4Registered: false,
            cet6Registered: false,
          },
          'cetResult',
        )
      } else {
        commit({ ...base, screen: 'yearend', vacation: null }, 'yearend')
      }
    }
  }

  const handleContinueSave = () => {
    const saved = readSave()
    if (!saved) return
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
        nextLabel={SEASONS[game.seasonIndex + 1]?.seasonLabel ?? '下一学年'}
        onContinue={handleCetResultContinue}
        onTitle={goTitle}
      />
    )
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
    }
    const notes: Record<number, string> = {
      1: '下一站：大二。桥梁课程与四六级机会已经接入。',
      2: '下一站：大三。诊断学、临床基础课与临床前学期等你。',
      3: '大二、大三的课程与考试已经完成。大四、大五临床年、事件卡、人物关系、科研与奖学金会在后续版本接入。',
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
