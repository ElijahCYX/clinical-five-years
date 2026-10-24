export type AttrKey =
  | 'memory'
  | 'comprehension'
  | 'dexterity'
  | 'social'
  | 'appearance'
  | 'energy'
  | 'constitution'
  | 'resilience'

export type AttrGroup = '学习能力' | '社交' | '身心'

export type SkillTier = '低' | '中' | '高'

export type TalentId = 'plain' | 'bright' | 'elite' | 'genius'

export type PlanId = 'A' | 'B' | 'C'

export type HabitId =
  | 'fitness'
  | 'vocab'
  | 'reading'
  | 'earlyRise'
  | 'earlySleep'
  | 'meditation'
  | 'ledger'
  | 'familyCall'
  | 'timeManagement'
  | 'appearanceCare'
  | 'coffee'

export type BackgroundId = 'ordinary' | 'comfortable' | 'middle' | 'affluent'

export type Gender = '女' | '男'

export type ScreenName =
  | 'title'
  | 'create'
  | 'talentSelect'
  | 'talentEvent'
  | 'plan'
  | 'week'
  | 'prep'
  | 'result'
  | 'vacation'
  | 'cetEvent'
  | 'cetResult'
  | 'route'
  | 'baoyanResult'
  | 'kaoyanExam'
  | 'kaoyanResult'
  | 'scholarship'
  | 'yearend'
  | 'graduation'
  | 'ending'

export type ReviewChoice = 'full' | 'focus0' | 'focus1' | 'balanced' | 'mock' | 'rest'

export type VacationKind = 'winter' | 'summer'

export interface VacationState {
  kind: VacationKind
  week: number
  totalWeeks: number
}

export interface AttrDef {
  key: AttrKey
  name: string
  en: string
  group: AttrGroup
  blurb: string
}

export interface TalentDef {
  id: TalentId
  name: string
  points: number
  label: string
  blurb: string
}

export interface BackgroundDef {
  id: BackgroundId
  name: string
  en: string
  money: number
  blurb: string
}

export interface PlanDef {
  id: PlanId
  code: string
  name: string
  en: string
  tagline: string
  desc: string
  effects: string[]
}

export interface HabitDef {
  id: HabitId
  name: string
  en: string
  desc: string
  effect: string
  growth?: 'constitution' | 'appearance'
  growthAmount?: number
  energy?: number
  stress?: number
  money?: number
  english?: number
  research?: number
  studyBonus?: number
}

export interface ActionDef {
  id: string
  no: string
  name: string
  en: string
  category: '学习' | '科研' | '生活' | '社交'
  flavor: string
  energy: number
  stress: number
  money: number
  effectText: string
  study?: boolean
  english?: number
  composite?: number
  research?: number
  kaoyanPrep?: number
  growth?: 'constitution' | 'appearance' | 'social'
  growthAmount?: number
  requires?: 'club' | 'mentor' | 'partner' | 'lab'
  lockedNote?: string
}

export interface Course {
  id: string
  name: string
  examType: '小考' | '大考'
  credits: number
  memory: SkillTier
  comprehension: SkillTier
  /** 补考课程：继承原课程的学分与原始绩点，最终绩点取两次平均。 */
  makeup?: boolean
  originalGpa?: number
  originalScore?: number
}

export interface PeResult {
  year: number
  score: number
  gpa: number
  passed: boolean
}

export type PostgradChoice = 'baoyan' | 'both' | 'employment' | null

export type AwardLevel = 'national' | 'provincial' | 'school' | null
export type Award = Exclude<AwardLevel, null>

export interface ScholarshipScore {
  grade: number
  composite: number
  research: number
  interview: number
  legacy: number
  total: number
  award: AwardLevel
  awards: Award[]
  reward: number
}

export interface YearRecord {
  year: number
  gpa: number
  compositeGain: number
  researchGain: number
  papers: number
  failed: boolean
  cumulativeCredits: number
  cumulativePoints: number
  cumulativeComposite: number
  cumulativeResearch: number
  evaluated: boolean
  award: AwardLevel
  awards: Award[]
  score: ScholarshipScore | null
}

export interface Season {
  id: string
  yearLabel: string
  seasonLabel: string
  chapterNo: string
  chapterTitle: string
  chapterEn: string
  indexLabel: string
  examKind: '小考' | '大考'
  courses: Course[]
}

export type OpeningTalentId =
  | 'accent'
  | 'medicalFamily'
  | 'pressureCooker'
  | 'energyMule'
  | 'modelMonster'
  | 'caffeineImmune'
  | 'cramKing'
  | 'socialBeast'
  | 'steadyHands'
  | 'memoryBread'
  | 'kaoyanChosen'
  | 'caiCaiLaoLao'

export interface OpeningTalentDef {
  id: OpeningTalentId
  name: string
  en: string
  desc: string
  effectText: string
  implemented: boolean
}

export interface Player {
  name: string
  gender: Gender
  background: BackgroundId
  talent: TalentId
  attrs: Record<AttrKey, number>
  /** 入学时固定的档案称号，不随之后属性成长变化。 */
  archiveTitle: string
}

export interface WeekLog {
  week: number
  title: string
  text: string
  deltas: string[]
}

export interface ExamResult {
  course: Course
  score: number
  gpa: number
  expectedMin: number
  expectedMax: number
  stressRelief: number
}

export interface GameState {
  screen: ScreenName
  player: Player | null
  season: Season
  seasonIndex: number
  vacation: VacationState | null
  plan: PlanId | null
  habits: HabitId[]
  weekFocus: string | null
  week: number
  energy: number
  stress: number
  money: number
  english: number
  composite: number
  research: number
  cet4Score: number | null
  cet6Score: number | null
  cet4Registered: boolean
  cet6Registered: boolean
  cetEventDone: boolean
  cetWindow: 'winter' | 'summer' | null
  cetAttemptBonus: number
  examCoffee: boolean
  examAllNighter: boolean
  examEnglishPrep: boolean
  peResults: PeResult[]
  pendingMakeups: Course[]
  postgradChoice: PostgradChoice
  postgradChance: number | null
  baoyanResult: 'success' | 'fail' | null
  kaoyanRegistered: boolean
  kaoyanPrep: number
  kaoyanScore: number | null
  kaoyanResult: 'success' | 'fail' | null
  peMakeupPassed: boolean | null
  peMakeupScore: number | null
  yearRecords: YearRecord[]
  everFailed: boolean
  yearFailed: boolean
  socialGrowth: number
  mentorSelected: boolean
  labEntered: boolean
  highPressureDebuff: boolean
  lowEnergyAlert: boolean
  stressRewardedCourses: string[]
  openingTalents: OpeningTalentId[]
  mentorContactUnlocked: boolean
  roommateBond: boolean
  prep: Record<string, number>
  constitutionGrowth: number
  appearanceGrowth: number
  actionsUsed: number
  selected: string[]
  logs: WeekLog[]
  results: ExamResult[]
  cumulativeCredits: number
  cumulativePoints: number
  finalNote: string | null
}

export type DemoName =
  | 'title'
  | 'create'
  | 'talentSelect'
  | 'talentEvent'
  | 'plan'
  | 'week'
  | 'prep'
  | 'result'
  | 'vacation'
  | 'cetEvent'
  | 'cetResult'
  | 'yearend'
  | 'ending'
