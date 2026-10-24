import {
  ACTION_BY_ID,
  ATTRS,
  BACKGROUND_BY_ID,
  CET,
  FIRST_SEASON,
  HABIT_BY_ID,
  PLAN_BY_ID,
  TALENTS,
  TALENT_BY_ID,
} from './data'
import type {
  AttrKey,
  AwardLevel,
  Course,
  GameState,
  HabitId,
  Player,
  PlanId,
  ReviewChoice,
  ScholarshipScore,
  SkillTier,
  TalentId,
  YearRecord,
} from './types'

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const ATTR_KEYS = ATTRS.map((attr) => attr.key)

export const TOTAL_SEASONS = 21
export const RESULT_NEXT_LABEL = ['大一 · 冬', '寒假', '大一 · 夏', '暑假']

export const TIER_RULES: Record<SkillTier, { target: number; slope: number }> = {
  低: { target: 3, slope: 0.03 },
  中: { target: 5, slope: 0.04 },
  高: { target: 7, slope: 0.05 },
}

/** 课程匹配系数：高记忆/悟性要求的课，低天赋的人学得更慢。 */
export function courseK(course: Course, attrs: Record<AttrKey, number>): number {
  const memoryRule = TIER_RULES[course.memory]
  const comprehensionRule = TIER_RULES[course.comprehension]
  const k =
    1 +
    memoryRule.slope * (attrs.memory - memoryRule.target) +
    comprehensionRule.slope * (attrs.comprehension - comprehensionRule.target)
  return clamp(k, 0.6, 1.4)
}

export function planPassive(plan: PlanId): number {
  return { A: 10, B: 6, C: 2 }[plan]
}

export function planEnergyCost(plan: PlanId): number {
  return { A: 10, B: 6, C: 3 }[plan]
}

export function planStress(plan: PlanId): number {
  return { A: 1, B: 0, C: 0 }[plan]
}

export function reviewMultiplier(plan: PlanId): number {
  return { A: 1, B: 1.1, C: 1.25 }[plan]
}

export function reviewStress(plan: PlanId): number {
  return { A: 0, B: 2, C: 8 }[plan]
}

/** 卷面分估算：准备度越高，分数越高。正式考试再叠加少量随机波动。 */
export function estimateScore(prep: number): number {
  return Math.round(38 + prep * 0.55)
}

export function estimateRange(prep: number): [number, number] {
  return [estimateScore(prep) - 5, estimateScore(prep) + 5]
}

/**
 * 出成绩后的降压奖励：在预计区间下沿为 0，上沿为 10，挂科为 0。
 * 例如预计 80–90，考 80 → 0，考 90 → 10。
 */
export function stressReliefForScore(score: number, center: number): number {
  if (score < 60) return 0
  const min = clamp(center - 5, 0, 95)
  const max = clamp(center + 5, 5, 100)
  if (max <= min) return score >= max ? 10 : 0
  return clamp(Math.round(((score - min) / (max - min)) * 10), 0, 10)
}

export function gpaFromScore(rawScore: number): number {
  const score = Math.trunc(rawScore)
  if (score >= 95) return 5
  if (score < 60) return 0
  if (score >= 92) return 4.8
  if (score >= 89) return 4.5
  if (score >= 86) return 4.2
  if (score >= 83) return 3.9
  if (score >= 80) return 3.6
  if (score >= 77) return 3.3
  if (score >= 74) return 3
  if (score >= 71) return 2.7
  if (score >= 68) return 2.4
  if (score >= 65) return 2.1
  if (score >= 62) return 1.8
  return 1.5
}

export function evenAllocation(talentId: TalentId): Record<AttrKey, number> {
  const budget = TALENT_BY_ID[talentId].points
  const base = Math.max(2, Math.floor(budget / ATTR_KEYS.length))
  const attrs = Object.fromEntries(ATTR_KEYS.map((key) => [key, base])) as Record<
    AttrKey,
    number
  >
  let remaining = budget - base * ATTR_KEYS.length
  let index = 0
  while (remaining > 0) {
    const key = ATTR_KEYS[index % ATTR_KEYS.length]
    if (attrs[key] < 10) {
      attrs[key] += 1
      remaining -= 1
    }
    index += 1
    if (index > 200) break
  }
  return attrs
}

export function randomAllocation(talentId: TalentId): Record<AttrKey, number> {
  const budget = TALENT_BY_ID[talentId].points
  const attrs = Object.fromEntries(ATTR_KEYS.map((key) => [key, 2])) as Record<
    AttrKey,
    number
  >
  let remaining = budget - ATTR_KEYS.length * 2
  while (remaining > 0) {
    const key = ATTR_KEYS[Math.floor(Math.random() * ATTR_KEYS.length)]
    if (attrs[key] < 10) {
      attrs[key] += 1
      remaining -= 1
    }
  }
  return attrs
}

const SINGLE_ARCHETYPES: Record<AttrKey, string> = {
  memory: '行走的课本',
  comprehension: '一点就通',
  dexterity: '天生一双稳手',
  social: '人脉路由器',
  appearance: '被医学耽误的模特',
  energy: '高精力人群',
  constitution: '黑/白皮体育生',
  resilience: '压力绝缘体',
}

const ARCHETYPE_PAIRS: Array<{ keys: [AttrKey, AttrKey]; title: string }> = [
  { keys: ['memory', 'comprehension'], title: '人形复印机' },
  { keys: ['memory', 'dexterity'], title: '背完就上手' },
  { keys: ['memory', 'social'], title: '行走的题库' },
  { keys: ['memory', 'appearance'], title: '背书也好看' },
  { keys: ['memory', 'energy'], title: '永动背书机' },
  { keys: ['memory', 'constitution'], title: '脑体双修' },
  { keys: ['memory', 'resilience'], title: '越背越勇' },
  { keys: ['comprehension', 'dexterity'], title: '临床推理派' },
  { keys: ['comprehension', 'social'], title: '带教宠儿' },
  { keys: ['comprehension', 'appearance'], title: '聪明好看型选手' },
  { keys: ['comprehension', 'energy'], title: '越学越精神' },
  { keys: ['comprehension', 'constitution'], title: '脑力与体力并存' },
  { keys: ['comprehension', 'resilience'], title: '想得开' },
  { keys: ['dexterity', 'social'], title: '手术室社交家' },
  { keys: ['dexterity', 'appearance'], title: '手好看的人' },
  { keys: ['dexterity', 'energy'], title: '手脚不停' },
  { keys: ['dexterity', 'constitution'], title: '外科好苗子' },
  { keys: ['dexterity', 'resilience'], title: '手稳心也稳' },
  { keys: ['social', 'appearance'], title: '人群焦点' },
  { keys: ['social', 'energy'], title: '社交永动机' },
  { keys: ['social', 'constitution'], title: '饭局主力' },
  { keys: ['social', 'resilience'], title: '情绪价值供应商' },
  { keys: ['appearance', 'energy'], title: '精神小伙 / 小姑娘' },
  { keys: ['appearance', 'constitution'], title: '体育生门面' },
  { keys: ['appearance', 'resilience'], title: '好看且想得开' },
  { keys: ['energy', 'constitution'], title: '精力旺盛的体育生' },
  { keys: ['energy', 'resilience'], title: '夜班战神' },
  { keys: ['constitution', 'resilience'], title: '铁人候补' },
]

export function archetypeFor(attrs: Record<AttrKey, number>): string {
  const values = ATTR_KEYS.map((key) => attrs[key])
  if (Math.max(...values) - Math.min(...values) <= 1) return '六边形新兵'
  const sorted = [...ATTR_KEYS].sort((a, b) => attrs[b] - attrs[a])
  const top = sorted[0]
  const second = sorted[1]
  if (attrs[top] - attrs[second] >= 2 || attrs[top] >= 9) return SINGLE_ARCHETYPES[top]
  const pair = ARCHETYPE_PAIRS.find(
    (item) =>
      (item.keys[0] === top && item.keys[1] === second) ||
      (item.keys[0] === second && item.keys[1] === top),
  )
  return pair?.title ?? SINGLE_ARCHETYPES[top]
}

export function talentName(id: TalentId): string {
  return TALENT_BY_ID[id].name
}

export function totalPoints(attrs: Record<AttrKey, number>): number {
  return ATTR_KEYS.reduce((sum, key) => sum + attrs[key], 0)
}

export function startingMoney(player: Player): number {
  return BACKGROUND_BY_ID[player.background].money
}

export function planName(plan: PlanId): string {
  return PLAN_BY_ID[plan].name
}

export function habitName(habit: HabitId): string {
  return HABIT_BY_ID[habit].name
}

export function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`
}

export function newGameState(player: Player): GameState {
  return {
    screen: 'plan',
    player,
    season: FIRST_SEASON,
    seasonIndex: 0,
    vacation: null,
    plan: null,
    habits: [],
    week: 1,
    energy: 100,
    stress: 22,
    money: startingMoney(player),
    english: 0,
    composite: 0,
    research: 0,
    prep: Object.fromEntries(FIRST_SEASON.courses.map((course) => [course.id, 0])),
    cet4Score: null,
    cet6Score: null,
    cet4Registered: false,
    cet6Registered: false,
    cetEventDone: false,
    cetWindow: null,
    cetAttemptBonus: 0,
    examCoffee: false,
    examAllNighter: false,
    examEnglishPrep: false,
    peResults: [],
    pendingMakeups: [],
    postgradChoice: null,
    postgradChance: null,
    baoyanResult: null,
    kaoyanRegistered: false,
    kaoyanPrep: 0,
    kaoyanScore: null,
    kaoyanResult: null,
    peMakeupPassed: null,
    peMakeupScore: null,
    yearRecords: [],
    everFailed: false,
    yearFailed: false,
    socialGrowth: 0,
    mentorSelected: false,
    labEntered: false,
    highPressureDebuff: false,
    lowEnergyAlert: false,
    stressRewardedCourses: [],
    constitutionGrowth: 0,
    appearanceGrowth: 0,
    actionsUsed: 0,
    selected: [],
    logs: [],
    results: [],
    cumulativeCredits: 0,
    cumulativePoints: 0,
    finalNote: null,
  }
}

export interface ReviewEffect {
  energy: number
  stress: number
  gains: Record<string, number>
  variance: number
}

/** 考前复习的选择效果：小考 3 选 1，大考 5 选 1。 */
export function getReviewEffect(
  choice: ReviewChoice,
  courses: Course[],
  attrs: Record<AttrKey, number>,
  plan: PlanId,
): ReviewEffect {
  const multiplier = reviewMultiplier(plan)
  const gains: Record<string, number> = {}
  let energy = 0
  let stress = 0
  let variance = 3

  const gain = (course: Course, base: number) => {
    gains[course.id] = (gains[course.id] ?? 0) + base * courseK(course, attrs) * multiplier
  }

  if (courses.length <= 1) {
    const course = courses[0]
    if (choice === 'mock') {
      gain(course, 20)
      energy = -10
      stress = 5
      variance = 1
    } else if (choice === 'rest') {
      gains[course.id] = 4
      energy = 20
      stress = 5
    } else {
      gain(course, 40)
      energy = -20
      stress = 10
    }
    return { energy, stress, gains, variance }
  }

  if (choice === 'focus0' || choice === 'focus1') {
    const target = choice === 'focus0' ? courses[0] : courses[1]
    gain(target, 40)
    for (const course of courses) {
      if (!(course.id in gains)) gains[course.id] = 0
    }
    energy = -20
    stress = 10
  } else if (choice === 'balanced') {
    for (const course of courses) gain(course, 20)
    energy = -15
    stress = 8
  } else if (choice === 'mock') {
    for (const course of courses) gain(course, 10)
    energy = -10
    stress = 5
    variance = 1
  } else {
    for (const course of courses) gains[course.id] = 4
    energy = 20
    stress = 5
  }

  return { energy, stress, gains, variance }
}

export function backgroundAllowance(player: Player): number {
  return BACKGROUND_BY_ID[player.background].money
}

export type CetStage = 'cet4' | 'cet6' | 'qualified'

export function cetStage(cet4Score: number | null, cet6Score: number | null): CetStage {
  if (cet4Score === null || cet4Score < CET.pass4) return 'cet4'
  if (cet6Score === null || cet6Score < CET.graduate6) return 'cet6'
  return 'qualified'
}

export function cetHint(cet4Score: number | null, cet6Score: number | null): string {
  const stage = cetStage(cet4Score, cet6Score)
  if (stage === 'cet4') return '备考 CET-4'
  if (stage === 'cet6') return '备考 CET-6'
  return '已合格'
}

/** 四六级赋分：英语进度保证下限，记忆力提高上限与期望。 */
export function cetScore(
  kind: 'cet4' | 'cet6',
  english: number,
  memory: number,
): number {
  const cappedEnglish = Math.min(english, 120)
  const base =
    kind === 'cet4'
      ? 280 + 3.6 * cappedEnglish + (memory - 5) * 8
      : 300 + 2.4 * cappedEnglish + (memory - 5) * 6
  let score = base + (Math.random() * 20 - 10)
  if (kind === 'cet4' && english >= 40) score = Math.max(score, CET.pass4)
  if (kind === 'cet6' && english >= 75) score = Math.max(score, CET.pass6)
  if (kind === 'cet6' && english >= 100) score = Math.max(score, CET.graduate6)
  const floor = kind === 'cet4' ? 200 : 150
  return clamp(Math.round(score), floor, CET.total)
}

export interface WeekSimulation {
  energy: number
  stress: number
  money: number
  english: number
  composite: number
  research: number
  prep: Record<string, number>
  kaoyanPrep: number
  constitutionGrowth: number
  appearanceGrowth: number
  attrs: Record<AttrKey, number>
  studyCount: number
  habitApplied: boolean
}

/** 与 App.endWeek 共用同一套周结算公式，用于选择行动时预览。 */
export function simulateWeek(state: GameState): WeekSimulation {
  const player = state.player!
  const plan = state.plan ? PLAN_BY_ID[state.plan] : null
  const habits = (state.habits ?? [])
    .map((id) => HABIT_BY_ID[id])
    .filter(Boolean)
  const habitApplied = habits.length > 0 && state.stress <= 60
  const studyBonus = habitApplied
    ? habits.reduce((sum, habit) => sum + (habit.studyBonus ?? 0), 0)
    : 0
  const prepMultiplier = prepGainMultiplier(state)

  let energy = state.energy
  let stress = state.stress
  let money = state.money
  let english = state.english
  let composite = state.composite
  let research = state.research
  let kaoyanPrep = state.kaoyanPrep
  let constitutionGrowth = state.constitutionGrowth
  let appearanceGrowth = state.appearanceGrowth
  const attrs = { ...player.attrs }
  const prep = { ...state.prep }
  let studyCount = 0

  for (const id of state.selected) {
    const action = ACTION_BY_ID[id]
    if (!action) continue
    energy += effectiveEnergyCost(action.energy, state.energy)
    stress += action.stress
    money += action.money
    english += action.english ?? 0
    composite += action.composite ?? 0
    research += action.research ?? 0
    kaoyanPrep += action.kaoyanPrep ?? 0
    if (action.study) {
      studyCount += 1
      for (const course of state.season.courses) {
        prep[course.id] = clamp(
          (prep[course.id] ?? 0) +
            8 * courseK(course, attrs) * (1 + studyBonus) * prepMultiplier,
          0,
          100,
        )
      }
    }
    if (action.growth === 'constitution') {
      constitutionGrowth += action.growthAmount ?? 0
    }
  }

  if (plan) {
    for (const course of state.season.courses) {
      prep[course.id] = clamp(
        (prep[course.id] ?? 0) +
          planPassive(state.plan!) * courseK(course, attrs) * prepMultiplier,
        0,
        100,
      )
    }
  }

  if (habitApplied) {
    for (const habit of habits) {
      energy += habit.energy ?? 0
      stress += habit.stress ?? 0
      money += habit.money ?? 0
      english += habit.english ?? 0
      research += habit.research ?? 0
      if (habit.growth === 'constitution') {
        constitutionGrowth += habit.growthAmount ?? 0
      }
      if (habit.growth === 'appearance') {
        appearanceGrowth += habit.growthAmount ?? 0
      }
    }
  }

  const planCost = state.plan
    ? -effectiveEnergyCost(-planEnergyCost(state.plan), state.energy)
    : 0
  energy = clamp(energy + 15 - planCost, 0, 100)
  stress = clamp(stress + (state.plan ? planStress(state.plan) : 0), 0, 100)
  money = Math.max(0, money - 250)

  return {
    energy,
    stress,
    money,
    english,
    composite,
    research,
    prep,
    kaoyanPrep,
    constitutionGrowth,
    appearanceGrowth,
    attrs,
    studyCount,
    habitApplied,
  }
}

/** 体育课：体质 10 给满分；体质 2 为 50 分。 */
export function peScoreFor(constitution: number): number {
  return clamp(Math.round(50 + (constitution - 2) * 6.25), 0, 100)
}

export function peGpaFor(score: number): number {
  if (score >= 90) return 5
  if (score >= 80) return 4
  if (score >= 70) return 3
  if (score >= 60) return 2
  return 0
}

/** 补考最终绩点：原绩点与补考绩点取平均，向下取整到 1 位小数。 */
export function makeupGpa(originalGpa: number, newGpa: number): number {
  return Math.floor(((originalGpa + newGpa) / 2) * 10) / 10
}

export function postgradChanceFor(state: GameState): number {
  const gpa =
    state.cumulativeCredits > 0 ? state.cumulativePoints / state.cumulativeCredits : 0
  const cet6 = state.cet6Score ?? 0
  const cetBonus =
    cet6 >= 550
      ? 0.22 + Math.min((cet6 - 550) / 500, 0.15)
      : cet6 >= 425
        ? 0.08
        : 0
  const base =
    0.1 +
    Math.max(0, gpa - 2.5) * 0.22 +
    cetBonus +
    Math.min(state.composite, 60) / 400 +
    Math.min(state.research, 100) / 800
  return clamp(Number(base.toFixed(2)), 0.05, 0.95)
}

export function kaoyanScoreFor(state: GameState): number {
  const player = state.player!
  const gpa =
    state.cumulativeCredits > 0 ? state.cumulativePoints / state.cumulativeCredits : 0
  return clamp(
    Math.round(
      160 +
        gpa * 34 +
        Math.min(state.english, 150) * 1.2 +
        player.attrs.memory * 12 +
        player.attrs.resilience * 8 +
        Math.min((state.cet6Score ?? 0) * 0.12, 90) +
        state.kaoyanPrep * 18,
    ),
    0,
    500,
  )
}

export const GRADUATION_CREDITS = 163

export function graduationReasons(state: GameState): string[] {
  const reasons: string[] = []
  if (state.cumulativeCredits < GRADUATION_CREDITS) {
    reasons.push(`总学分不足：${state.cumulativeCredits} / ${GRADUATION_CREDITS}`)
  }
  if ((state.cet6Score ?? 0) < 550) {
    reasons.push(`CET-6 未达到 550：${state.cet6Score ?? '未参加'}`)
  }
  if (state.pendingMakeups.length > 0) {
    reasons.push(`仍有 ${state.pendingMakeups.length} 门补考未通过`)
  }
  if (state.peMakeupPassed === false) {
    reasons.push('毕业生体育素质补考未通过')
  }
  const failedPe = state.peResults.filter((item) => !item.passed)
  if (failedPe.length > 0 && state.peMakeupPassed === null) {
    reasons.push('仍有体育课未通过')
  }
  return reasons
}

export const KAOYAN_PASS = 300

export function energyCostMultiplier(energy: number): number {
  if (energy < 20) return 1.4
  if (energy < 40) return 1.2
  if (energy < 60) return 1.1
  return 1
}

/** 负精力消耗按当前状态放大；恢复类行动不受影响。 */
export function effectiveEnergyCost(raw: number, currentEnergy: number): number {
  if (raw >= 0) return raw
  return -Math.ceil(Math.abs(raw) * energyCostMultiplier(currentEnergy))
}

export function energyTone(energy: number): 'green' | 'orange' | 'red' | 'black' {
  if (energy < 20) return 'black'
  if (energy < 40) return 'red'
  if (energy < 60) return 'orange'
  return 'green'
}

export function stressTone(stress: number): 'green' | 'orange' | 'red' | 'black' {
  if (stress > 80) return 'black'
  if (stress > 79) return 'red'
  if (stress > 60) return 'orange'
  return 'green'
}

export function prepGainMultiplier(state: Pick<GameState, 'stress' | 'highPressureDebuff'>): number {
  if (state.highPressureDebuff) return 0.7
  if (state.stress > 70) return 0.9
  return 1
}

export function energyEffectText(
  text: string,
  rawEnergy: number,
  currentEnergy: number,
): string {
  if (rawEnergy >= 0) return text
  const next = effectiveEnergyCost(rawEnergy, currentEnergy)
  return text.replace(`精力 ${rawEnergy}`, `精力 ${next}`)
}


export const SCHOLARSHIP_COMPOSITE_BENCHMARK = 40

export const AWARD_LABELS: Record<Exclude<AwardLevel, null>, string> = {
  national: '国家奖学金',
  provincial: '省级奖学金',
  school: '校级奖学金',
}

function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - p : p
}

/** 按 3.9 前 30%、4.5 前 5% 的近正态分布折算 40 分成绩项。 */
export function gradeScoreFor(gpa: number): number {
  const mean = 3.619
  const sd = 0.5355
  const below = normalCdf((gpa - mean) / sd)
  const fromTopFive = (below - 0.05) / 0.95
  return clamp(fromTopFive * 40, 0, 40)
}

export function researchScoreFor(papers: number): number {
  if (papers <= 0) return 0
  if (papers === 1) return 5
  if (papers === 2) return 8
  return 10
}

export function interviewScoreFor(player: Player): number {
  const avg = (player.attrs.appearance + player.attrs.social) / 2
  return clamp(((avg - 2) / 8) * 20, 0, 20)
}

export function bestAward(records: YearRecord[]): AwardLevel {
  if (records.some((record) => record.award === 'national')) return 'national'
  if (records.some((record) => record.award === 'provincial')) return 'provincial'
  if (records.some((record) => record.award === 'school')) return 'school'
  return null
}

export function legacyScoreFor(records: YearRecord[]): number {
  const award = bestAward(records)
  if (award === 'national') return 10
  if (award === 'provincial') return 6
  if (award === 'school') return 3
  return 0
}

export function scholarshipFor(
  record: YearRecord,
  player: Player,
  priorRecords: YearRecord[],
  everFailed: boolean,
): ScholarshipScore {
  const grade = gradeScoreFor(record.gpa)
  const composite = clamp(
    (record.compositeGain / SCHOLARSHIP_COMPOSITE_BENCHMARK) * 20,
    0,
    20,
  )
  const research = researchScoreFor(record.papers)
  const interview = interviewScoreFor(player)
  const legacy = legacyScoreFor(priorRecords)
  const total = grade + composite + research + interview + legacy
  const award: AwardLevel =
    total >= 80 && !everFailed
      ? 'national'
      : total >= 70 && !record.failed
        ? 'provincial'
        : total >= 60
          ? 'school'
          : null
  return {
    grade,
    composite,
    research,
    interview,
    legacy,
    total,
    award,
  }
}

export const DEFAULT_DEMO_TALENT: TalentId = 'bright'
export const DEFAULT_DEMO_ATTRS = evenAllocation(DEFAULT_DEMO_TALENT)

export const TALENT_LIST = TALENTS
