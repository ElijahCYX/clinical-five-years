import {
  ACTION_BY_ID,
  ATTRS,
  BACKGROUND_BY_ID,
  CET,
  ELECTIVE_COURSES,
  FIRST_SEASON,
  HABIT_BY_ID,
  PLAN_BY_ID,
  TALENTS,
  TALENT_BY_ID,
} from './data'
import type {
  AttrKey,
  Award,
  AwardLevel,
  Course,
  GameState,
  ElectiveType,
  HabitId,
  OpeningTalentId,
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

export const WEEKLY_FIXED_COST = 300

/** 每周英语行动的进度收益：记忆力 2→+4，10→+6。 */
export function englishGainForMemory(memory: number): number {
  return clamp(Math.round(4 + (memory - 2) * 0.25), 4, 6)
}

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

const TIER_WEIGHT: Record<Course['memory'], number> = {
  低: 0,
  中: 1,
  高: 2,
}

export function courseDifficulty(course: Course): {
  score: number
  stars: number
  label: string
} {
  const score =
    course.credits +
    (course.examType === '大考' ? 2 : 0) +
    TIER_WEIGHT[course.memory] +
    TIER_WEIGHT[course.comprehension]
  const stars = score <= 2 ? 1 : score <= 4 ? 2 : score <= 6 ? 3 : score <= 8 ? 4 : 5
  const labels = ['轻松', '普通', '偏难', '困难', '硬核']
  return { score, stars, label: labels[stars - 1] }
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

export function generateElectiveOffers(
  history: string[],
  completedPolitics: string[],
  retakes: string[],
): string[] {
  const order: ElectiveType[] = ['water', 'interest', 'group', 'politics']
  const excluded = new Set(retakes)
  const picked: string[] = []
  for (const type of order) {
    const pool = ELECTIVE_COURSES.filter((course) => {
      if (course.electiveType !== type) return false
      if (excluded.has(course.id)) return false
      if (type === 'politics') return !completedPolitics.includes(course.id)
      return !history.includes(course.id)
    })
    if (pool.length === 0) continue
    picked.push(pool[Math.floor(Math.random() * pool.length)].id)
  }
  return picked
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
    weekFocus: null,
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
    stressHearts: 3,
    stressHeartBreakWeek: 0,
    stressEndingText: null,
    stressEndingMethod: null,
    lowEnergyAlert: false,
    stressRewardedCourses: [],
    electiveHistory: [],
    electiveCredits: 0,
    electiveOffers: generateElectiveOffers([], [], []),
    electiveSelectionDone: false,
    pendingElectiveRetakes: [],
    politicsCompleted: [],
    politicsCredits: 0,
    openingTalents: [],
    mentorContactUnlocked: false,
    roommateBond: false,
    constitutionGrowth: 0,
    appearanceGrowth: 0,
    actionsUsed: 0,
    selected: [],
    logs: [],
    results: [],
    cumulativeCredits: 0,
    cumulativePoints: 0,
    finalNote: null,
    eventWeek: 0,
    eventHistory: [],
    pendingEvent: null,
    socialModuleUnlocked: false,
    relationships: [],
    dinnerPlan: null,
    dinnerInvites: null,
    romanceUnlocked: false,
    courseRecords: [],
    romanceRisk: 0,
    teacherScandalRisk: 0,
    pendingConfession: null,
    mentorProfileId: null,
    researchProgress: 0,
    researchPublished: false,
    researchJournal: null,
    publishedPapers: 0,
    awaitingNextProject: false,
    researchStarted: false,
    activeHypothesisId: null,
    activeHypothesisTitle: null,
    lastResearchWeek: 0,
    lastResearchWarningWeek: 0,
    lastHypothesisOfferSeason: null,
    familyAffection: 0,
    familyReliefWeek: 0,
    seenRelationIds: [],
    vacationTravel: null,
    pendingConsumption: null,
    consumptionEventWeek: 0,
  }
}

export interface ReviewEffect {
  energy: number
  stress: number
  gains: Record<string, number>
  variance: number
  /** 预期成绩上限；mock 卷面最高 90。 */
  scoreCap?: number
}

/** 考试周只有必修课和思政课可以单独复习；其他选修课不参与。 */
export function isExamReviewCourse(course: Course): boolean {
  return !course.electiveType || course.electiveType === 'politics'
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
  let scoreCap: number | undefined

  const reviewCourses = courses.filter(isExamReviewCourse)
  const gain = (course: Course, base: number) => {
    gains[course.id] = (gains[course.id] ?? 0) + base * courseK(course, attrs) * multiplier
  }

  if (reviewCourses.length <= 1) {
    const course = reviewCourses[0]
    if (!course) return { energy, stress, gains, variance, scoreCap }
    if (choice === 'mock') {
      gain(course, 20)
      energy = -10
      stress = 5
      variance = 1
      scoreCap = 95
    } else if (choice === 'rest') {
      gains[course.id] = 4
      energy = 20
      stress = 5
    } else {
      gain(course, 40)
      energy = -20
      stress = 10
    }
    return { energy, stress, gains, variance, scoreCap }
  }

  const focusIndex =
    choice.startsWith('focus') ? Number(choice.slice(5)) : -1
  if (focusIndex >= 0 && reviewCourses[focusIndex]) {
    gain(reviewCourses[focusIndex], 40)
    energy = -20
    stress = 10
  } else if (choice === 'balanced') {
    for (const course of reviewCourses) gain(course, 20)
    energy = -20
    stress = 8
  } else if (choice === 'mock') {
    for (const course of reviewCourses) gain(course, 20)
    energy = -10
    stress = 5
    variance = 1
    scoreCap = 95
  } else {
    for (const course of reviewCourses) gains[course.id] = 4
    energy = 20
    stress = 5
  }

  return { energy, stress, gains, variance, scoreCap }
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
  if (kind === 'cet4' && english >= 25) score = Math.max(score, CET.pass4)
  if (kind === 'cet6' && english >= 60) score = Math.max(score, CET.pass6)
  if (kind === 'cet6' && english >= 100) score = Math.max(score, CET.graduate6)
  const floor = kind === 'cet4' ? 200 : 150
  return clamp(Math.round(score), floor, CET.total)
}

export function examCoffeeMultiplier(
  state: Pick<GameState, 'examCoffee'>,
): number {
  return state.examCoffee ? 1.15 : 1
}

export function examReviewTalentMultiplier(
  state: Pick<GameState, 'openingTalents'>,
): number {
  return state.openingTalents.includes('cramKing') ? 1.1 : 1
}

export function coursePrepTalentMultiplier(
  state: Pick<GameState, 'openingTalents'>,
  course: Course,
): number {
  if (course.electiveType === 'water') return 1.25
  return state.openingTalents.includes('memoryBread') && course.memory === '高' ? 1.2 : 1
}

export function kaoyanPrepMultiplier(
  state: Pick<GameState, 'openingTalents'>,
): number {
  return state.openingTalents.includes('kaoyanChosen') ? 1.2 : 1
}

export function applyScoreRescue(
  state: Pick<GameState, 'openingTalents'>,
  score: number,
): number {
  if (
    state.openingTalents.includes('caiCaiLaoLao') &&
    score >= 55 &&
    score <= 59
  ) {
    return 60
  }
  return score
}

export function applyOpeningTalent(
  base: GameState,
  talents: OpeningTalentId[],
): GameState {
  const player = base.player
  let next: GameState = { ...base, openingTalents: [...talents] }
  if (!player) return next
  let attrs = { ...player.attrs }
  let english = next.english
  let mentorContactUnlocked = next.mentorContactUnlocked
  for (const talent of talents) {
    if (talent === 'accent') english += 25
    if (talent === 'medicalFamily') mentorContactUnlocked = true
    if (talent === 'modelMonster') {
      attrs = { ...attrs, appearance: Math.min(10, attrs.appearance + 1) }
    }
    if (talent === 'steadyHands') {
      attrs = { ...attrs, dexterity: Math.min(10, attrs.dexterity + 2) }
    }
    if (talent === 'memoryBread') {
      attrs = { ...attrs, memory: Math.min(10, attrs.memory + 2) }
    }
  }
  next = {
    ...next,
    english,
    mentorContactUnlocked,
    player: { ...player, attrs },
  }
  return next
}

/** 每周开场自动生效的开局天赋。 */
export function applyWeeklyOpeningTalent(base: GameState): GameState {
  let next = base
  if (base.openingTalents.includes('pressureCooker')) {
    next = { ...next, stress: clamp(Math.round(next.stress * 0.9), 0, 100) }
  }
  if (base.openingTalents.includes('energyMule')) {
    next = { ...next, energy: clamp(next.energy + 10, 0, 100) }
  }
  return next
}

export function focusAdjustedGains(
  nominal: Record<string, number>,
  focus: string | null,
  courses: Course[],
): Record<string, number> {
  if (courses.length <= 1 || !focus || focus === 'balanced') return nominal
  if (!courses.some((course) => course.id === focus)) return nominal
  const total = courses.reduce((sum, course) => sum + (nominal[course.id] ?? 0), 0)
  if (total <= 0) return nominal
  const main = Math.round(total * 0.75)
  const restCount = courses.length - 1
  const rest = (total - main) / restCount
  const result: Record<string, number> = {}
  for (const course of courses) {
    result[course.id] = course.id === focus ? main : Math.round(rest)
  }
  return result
}

export interface WeekSimulation {
  energy: number
  stress: number
  money: number
  english: number
  composite: number
  research: number
  researchProgressGain: number
  mentorIntimacyGain: number
  familyAffectionGain: number
  prep: Record<string, number>
  kaoyanPrep: number
  constitutionGrowth: number
  appearanceGrowth: number
  socialGrowth: number
  attrs: Record<AttrKey, number>
  studyCount: number
  habitApplied: boolean
}

/** 与 App.endWeek 共用同一套周结算公式，用于选择行动时预览。 */
/** 实验室打杂的精力消耗：-13 到 -7，悟性越高消耗越低。 */
export function labChoreEnergyCost(comprehension: number): number {
  const comp = Math.max(2, Math.min(10, comprehension))
  return -Math.round(13 - ((comp - 2) / 8) * 6)
}

/** 科研进度收益：2-6 点，悟性越高越容易抽到高值。 */
export function researchGainForComprehension(comprehension: number): number {
  const comp = Math.max(2, Math.min(10, comprehension))
  let weights: number[]
  if (comp <= 2) weights = [40, 30, 20, 8, 2]
  else if (comp <= 4) weights = [30, 28, 24, 13, 5]
  else if (comp <= 6) weights = [20, 26, 28, 18, 8]
  else if (comp <= 8) weights = [10, 20, 30, 25, 15]
  else weights = [5, 12, 25, 33, 25]
  const roll = Math.random() * weights.reduce((a, b) => a + b, 0)
  let acc = 0
  for (let i = 0; i < weights.length; i += 1) {
    acc += weights[i]
    if (roll < acc) return i + 2
  }
  return 4
}

export function simulateWeek(state: GameState): WeekSimulation {
  const player = state.player!
  const plan = state.plan ? PLAN_BY_ID[state.plan] : null
  const habits = (state.habits ?? [])
    .map((id) => HABIT_BY_ID[id])
    .filter(Boolean)
  const habitApplied = habits.length > 0 && state.stress <= 60
  const hasFitnessHabit = (state.habits ?? []).includes('fitness')
  const hasSportAction = state.selected.includes('sport')
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
  let researchProgressGain = 0
  let mentorIntimacyGain = 0
  let familyAffectionGain = 0
  let kaoyanPrep = state.kaoyanPrep
  let constitutionGrowth = state.constitutionGrowth
  let appearanceGrowth = state.appearanceGrowth
  let socialGrowth = state.socialGrowth
  const attrs = { ...player.attrs }
  const prep = { ...state.prep }
  let studyCount = 0

  for (const id of state.selected) {
    const action = ACTION_BY_ID[id]
    if (!action) continue
    if (action.id === 'library') {
      const costs = libraryCosts(state)
      energy += costs.energy
      stress += costs.stress
    } else if (action.id === 'social' && state.dinnerPlan?.committed) {
      // 吃饭收益在确认「就这顿」时已立即结算，周结算不重复计算。
      stress += 0
    } else if (
      action.id === 'research' &&
      state.labEntered &&
      !state.researchStarted
    ) {
      energy += labChoreEnergyCost(attrs.comprehension)
      stress += action.stress
    } else {
      energy += effectiveEnergyCost(action.energy, state.energy)
      stress += action.stress
    }
    money += action.money
    if (action.id === 'social' && !state.dinnerPlan?.committed) {
      money -= state.dinnerPlan?.cost ?? 50
    }
    english +=
      action.id === 'english'
        ? englishGainForMemory(attrs.memory)
        : action.english ?? 0
    composite += action.composite ?? 0
    research += action.research ?? 0
    kaoyanPrep += (action.kaoyanPrep ?? 0) * kaoyanPrepMultiplier(state)
    if (
      action.id === 'research' &&
      state.labEntered &&
      !state.researchPublished
    ) {
      if (state.researchStarted) {
        const researchGain = researchGainForComprehension(attrs.comprehension)
        researchProgressGain += researchGain
        // 科研页进度与左侧「科研」数值保持同步增长。
        research += researchGain
      } else {
        mentorIntimacyGain += 5
      }
    }
    if (action.id === 'electiveHomework') {
      for (const course of state.season.courses) {
        if (!course.electiveType) continue
        const gain = course.electiveType === 'politics' ? 15 : 20
        prep[course.id] = clamp((prep[course.id] ?? 0) + gain, 0, 100)
      }
    }
    if (action.study) {
      studyCount += 1
      const nominal = Object.fromEntries(
        state.season.courses.map((course) => [
          course.id,
          6 *
            courseK(course, attrs) *
            (1 + studyBonus) *
            prepMultiplier *
            coursePrepTalentMultiplier(state, course),
        ]),
      )
      const allocated = focusAdjustedGains(
        nominal,
        state.weekFocus,
        state.season.courses,
      )
      for (const course of state.season.courses) {
        prep[course.id] = clamp(
          (prep[course.id] ?? 0) + (allocated[course.id] ?? 0),
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
    const nominal = Object.fromEntries(
      state.season.courses.map((course) => [
        course.id,
        planPassive(state.plan!) *
          courseK(course, attrs) *
          prepMultiplier *
          coursePrepTalentMultiplier(state, course),
      ]),
    )
    const allocated = focusAdjustedGains(
      nominal,
      state.weekFocus,
      state.season.courses,
    )
    for (const course of state.season.courses) {
      prep[course.id] = clamp(
        (prep[course.id] ?? 0) + (allocated[course.id] ?? 0),
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
      if (habit.id === 'reading' && !state.labEntered) {
        if (state.relationships.some((relation) => relation.kind === 'mentor')) {
          mentorIntimacyGain += 2
        }
      } else {
        research += habit.research ?? 0
      }
      if (habit.id === 'familyCall') {
        familyAffectionGain += 5
      }
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
  if (!hasFitnessHabit && !hasSportAction) {
    constitutionGrowth = Math.max(0, constitutionGrowth - 5)
  }

  for (const course of state.season.courses) {
    if (course.electiveType === 'interest') {
      stress -= 5
      energy += 5
    }
    if (course.electiveType === 'group') {
      energy -= 5
      socialGrowth += 10
    }
  }

  energy = clamp(energy + 15 - planCost, 0, 100)
  stress = clamp(stress + (state.plan ? planStress(state.plan) : 0), 0, 100)
  money = Math.max(0, money - WEEKLY_FIXED_COST)

  return {
    energy,
    stress,
    money,
    english,
    composite,
    research,
    researchProgressGain,
    mentorIntimacyGain,
    familyAffectionGain,
    prep,
    kaoyanPrep,
    constitutionGrowth,
    appearanceGrowth,
    socialGrowth,
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

export const GRADUATION_CREDITS = 184
export const ELECTIVE_CREDITS_REQUIRED = 10

export function graduationReasons(state: GameState): string[] {
  const reasons: string[] = []
  if (state.cumulativeCredits < GRADUATION_CREDITS) {
    reasons.push(`总学分不足：${state.cumulativeCredits} / ${GRADUATION_CREDITS}`)
  }
  if (state.electiveCredits < ELECTIVE_CREDITS_REQUIRED) {
    reasons.push(
      `选修课学分不足：${state.electiveCredits} / ${ELECTIVE_CREDITS_REQUIRED}`,
    )
  }
  if ((state.politicsCompleted?.length ?? 0) < 5) {
    reasons.push(`思政课未修完：${state.politicsCompleted?.length ?? 0} / 5`)
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

/** 泡图书馆的成本随同时在修课程数增加，并受精力/抗压面板影响。 */
export function libraryCosts(state: GameState): {
  count: number
  costCount: number
  energy: number
  stress: number
} {
  const count = state.season.courses.filter(
    (course) => course.electiveType !== 'interest',
  ).length
  // 兴趣类课程不计入泡图书馆的计费课程数。
  // 消耗最多按 3 门课计算，超过 3 门不再继续增加。
  const costCount = Math.min(3, count)
  const baseEnergy = -(5 + costCount * 5)
  const baseStress = 5 + costCount * 5
  const energyAttr = state.player?.attrs.energy ?? 5
  const resilienceAttr = state.player?.attrs.resilience ?? 5
  const energyFactor = clamp(1.25 - energyAttr * 0.05, 0.75, 1.2)
  const stressFactor = clamp(1.25 - resilienceAttr * 0.05, 0.75, 1.2)
  return {
    count,
    costCount,
    energy: effectiveEnergyCost(baseEnergy * energyFactor, state.energy),
    stress: Math.round(baseStress * stressFactor),
  }
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

export const SCHOLARSHIP_REWARDS: Record<Award, number> = {
  national: 5000,
  provincial: 3000,
  school: 1000,
}

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
  const all = records.flatMap((record) =>
    record.awards?.length
      ? record.awards
      : record.award
        ? [record.award]
        : [],
  )
  if (all.includes('national')) return 'national'
  if (all.includes('provincial')) return 'provincial'
  if (all.includes('school')) return 'school'
  return null
}

export function scholarshipRewardFor(awards: Award[]): number {
  return awards.reduce((sum, award) => sum + SCHOLARSHIP_REWARDS[award], 0)
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
  let primary: Award | null = null
  if (total >= 80 && !everFailed) primary = 'national'
  else if (total >= 70 && !record.failed) primary = 'provincial'
  const awards: Award[] = []
  if (primary) awards.push(primary)
  if (total > 50) awards.push('school')
  const award: AwardLevel = primary ?? (awards.includes('school') ? 'school' : null)
  return {
    grade,
    composite,
    research,
    interview,
    legacy,
    total,
    award,
    awards,
    reward: scholarshipRewardFor(awards),
  }
}

export const DEFAULT_DEMO_TALENT: TalentId = 'bright'
export const DEFAULT_DEMO_ATTRS = evenAllocation(DEFAULT_DEMO_TALENT)

export const TALENT_LIST = TALENTS
