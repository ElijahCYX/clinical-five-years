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

export type BackgroundId = 'ordinary' | 'comfortable' | 'middle' | 'affluent'

export type Gender = '女' | '男'

export type SexualOrientation = 'heterosexual' | 'homosexual' | 'bisexual'

export type ScreenName =
  | 'title'
  | 'create'
  | 'talentSelect'
  | 'talentEvent'
  | 'electiveSelect'
  | 'plan'
  | 'clubRecruitment'
  | 'week'
  | 'prep'
  | 'result'
  | 'vacation'
  | 'cetEvent'
  | 'cetResult'
  | 'randomEvent'
  | 'route'
  | 'baoyanResult'
  | 'kaoyanExam'
  | 'kaoyanResult'
  | 'scholarship'
  | 'yearend'
  | 'graduation'
  | 'ending'
  | 'stressEnding'
  | 'expulsion'

export type ReviewChoice =
  | 'full'
  | 'balanced'
  | 'mock'
  | 'rest'
  | `focus${number}`

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
  mentorRecognition?: number
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

export type ElectiveType = 'water' | 'interest' | 'group' | 'politics' | 'pe'

export interface Course {
  id: string
  name: string
  examType: '小考' | '大考'
  credits: number
  memory: SkillTier
  comprehension: SkillTier
  electiveType?: ElectiveType
  operation?: SkillTier
  selectionChance?: number
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
  orientation: SexualOrientation
  background: BackgroundId
  talent: TalentId
  attrs: Record<AttrKey, number>
  /** 入学时固定的档案称号，不随之后属性成长变化。 */
  archiveTitle: string
}

export interface NoticeItem {
  id: string
  time: string
  title: string
  text: string
}

export interface WeekLog {
  week: number
  title: string
  text: string
  deltas: string[]
}

export interface SemesterStats {
  library: number
  attend: number
  skip: number
  sleepIn: number
  coffee: number
  selfCare: number
  exercise: number
  social: number
  partTime: number
  research: number
  club: number
  english: number
  electiveHomework: number
  date: number
}

export interface ExamResult {
  course: Course
  score: number
  gpa: number
  expectedMin: number
  expectedMax: number
  stressRelief: number
  usualScore?: number
  paperScore?: number
  scoreCap?: number
  forgetPenalty?: number
}

export type EventKind = 'scene' | 'attribute' | 'random' | 'romance' | 'consumption'

export interface EventEffect {
  stress?: number
  energy?: number
  money?: number
  prep?: number
  constitutionGrowth?: number
  socialGrowth?: number
  appearanceGrowth?: number
  research?: number
  english?: number
  composite?: number
  kaoyanPrep?: number
  socialUnlock?: boolean
  socialAttr?: number
  romanceBreak?: boolean
  teacherBreak?: boolean
  breakupRelationId?: string
  reconcileRelationId?: string
  mentorUnlock?: boolean
  mentorIntimacy?: number
}

export interface PendingEvent {
  id: string
  kind: EventKind
  title: string
  text: string
  effectLines: string[]
  effects: EventEffect
}


export type OrganizationCategory =
  | 'academic'
  | 'interest'
  | 'practice'
  | 'union'
  | 'debate'
export type OrganizationRole = 'member' | 'officer' | 'president' | 'honorary'
export type BondType = 'lover' | 'brother' | 'sister'

export type RelationshipKind =
  | 'roommate'
  | 'friend'
  | 'classmate'
  | 'mentor'
  | 'counselor'
  | 'romance'
  | 'club'
  | 'senior'

export interface RelationshipStats {
  talent: TalentId
  gpa: number
  attrs: Record<AttrKey, number>
}

export interface Relationship {
  id: string
  name: string
  gender: Gender
  orientation: SexualOrientation
  kind: RelationshipKind
  identity: string
  intimacy: number
  statsKnown: boolean
  knownStats: RelationshipStats | null
  stats: RelationshipStats
  weeklyAction: string
  lastPatKey: string
  lastPatAbsWeek: number
  birthYear: number
  birthdayMonth: number
  birthdayGiftYear: number
  birthdayContactType: 'gift' | 'blessing' | null
  birthdayNextYear: number
  patBlockedUntilWeek: number
  clubOrgId?: string
  partner: boolean
  bondType?: BondType
  confessRejected?: boolean
  intimacyFrozenSeason?: string
  frozenIntimacy?: number
  partnerSinceSeasonIndex?: number
  partnerSinceWeek?: number
  partnerSinceLabel?: string
  lastContactKey?: string
  metAbsWeek?: number
  brokenBondType?: BondType
  bondBreakWeek?: number
  bondCalmUntilWeek?: number
  bondReconcileAttempted?: boolean
  intimacyFrozenUntilWeek?: number
  confessionRisk: number
  breakupRisk: number
  ex: boolean
  exWeek: number
  exPenalty: boolean
}

export interface PeCourseResult {
  courseId: string
  name: string
  score: number
  gpa: number
  credits: number
}

export interface PendingConfession {
  relationshipId: string
  name: string
  identity: string
  staff: boolean
  text: string
}

export interface DinnerPlan {
  acceptedIds: string[]
  declinedIds: string[]
  cost: number
  summary: string[]
  committed?: boolean
}

export interface DinnerInviteResult {
  id: string
  accepted: boolean
  reason?: string
}

export interface DinnerInvites {
  weekKey: string
  results: DinnerInviteResult[]
}

export type CourseCategory = 'professional' | 'politics' | 'elective' | 'pe'

export interface CourseRecord {
  id: string
  name: string
  credits: number
  gpa: number
  score: number
  category: CourseCategory
}

export interface MentorProfile {
  id: string
  alias: string
  department: string
  title: string
  field: string
  level: number
  journals: string[]
  confidence: string
}

export interface Hypothesis {
  id: string
  mentorId: string
  title: string
}

export type ResearchStage = 1 | 2 | 3 | 4 | 5 | 6

export type GameEmailKind =
  | 'application'
  | 'positiveReply'
  | 'negativeReply'
  | 'welcome'
  | 'labAccess'
  | 'projectOffer'
  | 'medicalGreeting'
  | 'medicalAcceptance'

export interface MentorInterview {
  mentorId: string
  atAbs: number
  seasonIndex: number
  week: number
  weekSlot: number
  label: string
  rescheduled: boolean
  prompted: boolean
}

export interface MentorInterviewRecord {
  mentorId: string
  seasonIndex: number
  week: number
  weekSlot: number
  label: string
  success: boolean
}

export interface MentorApplication {
  mentorId: string
  sentAtAbs: number
  sentWeekKey: string
  replyKind: 'positive' | 'negative' | 'none' | null
  replyAtAbs: number | null
  replyEmailId: string | null
  noReplyWeekKey: string | null
}

export interface GameEmail {
  id: string
  direction: 'inbox' | 'sent'
  kind: GameEmailKind
  mentorId: string | null
  senderName: string
  recipientName: string
  subject: string
  body: string
  sentAtAbs: number
  timeLabel: string
  read: boolean
  interview?: MentorInterview
  project?: {
    hypothesisId: string
    title: string
  }
}

export interface EncounterChatOption {
  text: string
  response: string
  intimacy: number
}

export interface EncounterChat {
  id: string
  intro: string
  options: EncounterChatOption[]
}

export interface VacationTravelPlan {
  companionIds: string[]
  declinedIds: string[]
  cost: number
  summary: string[]
  committed?: boolean
}

export type AutoPatMode = 'close' | 'longtime'

export interface PatEvent {
  id: string
  name: string
  title: string
  text: string
  lines: string[]
}

export interface PatResult {
  message: string
  events: PatEvent[]
}

export interface ConfessionResult {
  success: boolean
  name: string
  text: string
  bondType?: BondType
}

export interface BondActionResult {
  success: boolean
  type: BondType
  name: string
  text: string
  chance?: number
}

export interface LoverContactResult {
  answered: boolean
  name: string
  title: string
  text: string
  lines: string[]
}

export interface BirthdayGiftResult {
  message: string
  gain: number
  before: number
  after: number
}

export interface ConsumptionEffects {
  stress?: number
  energy?: number
  prep?: number
  constitutionGrowth?: number
}

export type ConsumptionDuration = 'permanent' | 'year' | 'semester'

export interface ConsumptionInstallment {
  weeks: number
  amount: number
}

export interface ConsumptionEvent {
  id: string
  kind: 'consumption'
  title: string
  text: string
  cost: number
  duration: ConsumptionDuration
  effects: ConsumptionEffects
  benefitLines: string[]
  installment?: ConsumptionInstallment
}

export interface ConsumptionPurchase {
  id: string
  eventId: string
  title: string
  duration: ConsumptionDuration
  purchasedYear: number
  purchasedSeasonIndex: number
  purchasedDayIndex: number
  expiresYear?: number
  expiresSeasonIndex?: number
  installmentWeeks: number
  installmentAmount: number
  installmentRemaining: number
}

export interface OrganizationBenefit {
  prep?: number
  stress?: number
  energy?: number
  composite?: number
  socialGrowth?: number
  english?: number
  allPrep?: number
}

export interface Organization {
  id: string
  name: string
  category: OrganizationCategory
  description: string
  benefit: OrganizationBenefit
}

export interface ClubMembership {
  orgId: string
  category: OrganizationCategory
  role: OrganizationRole
  joinedSeasonIndex: number
  totalActivities: number
  semesterActivities: number
  semesterLeaves: number
  roleSinceSeasonIndex: number
  presidentStartSeasonIndex: number | null
  memberIds: string[]
  highestRole: OrganizationRole
  activitySeasonIndex: number
  inactivityWarningIssued: boolean
}

export interface ClubHistoryEntry {
  orgId: string
  orgName: string
  highestRole: OrganizationRole
  joinedSeasonIndex: number
  leftSeasonIndex: number
  reason: 'quit' | 'expelled'
}

export interface ClubInvites {
  weekKey: string
  orgId?: string
  results: DinnerInviteResult[]
}

export interface ClubActivityPlan {
  mode: 'application' | 'activity'
  orgId?: string
  acceptedIds: string[]
  declinedIds: string[]
  committed: boolean
}

export interface SoloChatLine {
  from: 'me' | 'them' | 'system'
  text: string
}

export interface SoloChatRecord {
  id: string
  relationshipId: string
  partnerName: string
  bondType: BondType
  eventId: string
  eventName: string
  weekKey: string
  attemptSlot: number
  outcome: 'accepted' | 'declined' | 'no-slot'
  inviteSlot?: number
  chat: SoloChatLine[]
}

export interface SoloInvite {
  id: string
  relationshipId: string
  partnerName: string
  bondType: BondType
  eventId: string
  eventName: string
  slot: number
  weekKey: string
  resolved: boolean
  attemptSlot?: number
  chat?: SoloChatLine[]
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
  englishGrowth: number
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
  outstandingFails: Record<string, number>
  semesterStats: SemesterStats
  expulsionText: string | null
  expulsionCredits: number
  expulsionCourses: string[]
  postgradChoice: PostgradChoice
  postgradChance: number | null
  baoyanResult: 'success' | 'fail' | null
  kaoyanRegistered: boolean
  kaoyanPrep: number
  kaoyanScore: number | null
  kaoyanResult: 'success' | 'fail' | null
  peMakeupPassed: boolean | null
  peMakeupScore: number | null
  peGraduationExempt: boolean
  yearRecords: YearRecord[]
  everFailed: boolean
  yearFailed: boolean
  socialGrowth: number
  mentorSelected: boolean
  labEntered: boolean
  highPressureDebuff: boolean
  stressHearts: number
  stressHeartBreakWeek: number
  stressEndingText: string | null
  stressEndingMethod: string | null
  lowEnergyAlert: boolean
  stressRewardedCourses: string[]
  electiveHistory: string[]
  electiveCredits: number
  electiveOffers: string[]
  pendingPeCourseId: string | null
  pendingPePairKey: string | null
  peCourseHistory: string[]
  peCourseResults: PeCourseResult[]
  peCourseCredits: number
  peCourseCount: number
  electiveSelectionDone: boolean
  pendingElectiveRetakes: string[]
  politicsCompleted: string[]
  politicsCredits: number
  openingTalents: OpeningTalentId[]
  mentorContactUnlocked: boolean
  roommateBond: boolean
  prep: Record<string, number>
  constitutionGrowth: number
  appearanceGrowth: number
  actionsUsed: number
  selected: string[]
  weekSlot: number
  weekSlotSkipped: boolean
  weekSlotActions: string[]
  skipCaught: Record<string, number>
  coffeeDayKey: string | null
  selfCareDayKey: string | null
  eveningCoffeeDayKey: string | null
  campusRunDayKey: string | null
  peRunCount: number
  logs: WeekLog[]
  results: ExamResult[]
  cumulativeCredits: number
  cumulativePoints: number
  finalNote: string | null
  eventWeek: number
  eventHistory: string[]
  pendingEvent: PendingEvent | null
  socialModuleUnlocked: boolean
  relationships: Relationship[]
  dinnerPlan: DinnerPlan | null
  dinnerInvites: DinnerInvites | null
  romanceUnlocked: boolean
  courseRecords: CourseRecord[]
  romanceRisk: number
  teacherScandalRisk: number
  pendingConfession: PendingConfession | null
  mentorProfileId: string | null
  researchStage: ResearchStage
  mentorApplication: MentorApplication | null
  mentorInterview: MentorInterview | null
  mentorInterviewHistory: MentorInterviewRecord[]
  failedMentorIds: string[]
  emails: GameEmail[]
  mailSentWeekKey: string | null
  medicalFamilyMentorId: string | null
  medicalFamilyAcceptanceAtAbs: number | null
  welcomeMailSent: boolean
  seniorsGenerated: boolean
  labAccessMailSent: boolean
  labAccessPendingAtAbs: number | null
  projectOfferMailSent: boolean
  researchProgress: number
  researchPublished: boolean
  researchJournal: string | null
  publishedPapers: number
  awaitingNextProject: boolean
  researchStarted: boolean
  activeHypothesisId: string | null
  activeHypothesisTitle: string | null
  lastResearchWeek: number
  lastResearchWarningWeek: number
  lastHypothesisOfferSeason: string | null
  familyAffection: number
  familyCrisisRescued: boolean
  soloInvites: SoloInvite[]
  soloChatRecords: SoloChatRecord[]
  soloRefusals: Record<string, string>
  mentorRecognition: number
  walkEncounterWeekKey: string | null
  walkEncounterDayKey: string | null
  walkEncounterCount: number
  familyReliefWeek: number
  seenRelationIds: string[]
  vacationTravel: VacationTravelPlan | null
  vacationTravelInvites: DinnerInvites | null
  clubMemberships: ClubMembership[]
  clubHistory: ClubHistoryEntry[]
  clubInitialRecruitmentDone: boolean
  clubInvites: ClubInvites | null
  clubActivityPlan: ClubActivityPlan | null
  clubLastBenefitSeason: string | null
  clubLastPromotionSeason: string | null
  clubAnnualBonusSeason: string | null
  noticeFeed: NoticeItem[]
  pendingConsumption: ConsumptionEvent | null
  consumptionEventWeek: number
  consumptionPurchases: ConsumptionPurchase[]
  consumptionConcertDays: number
  consumptionConcertStartDay: number
  sleepInDayKey: string | null
}

export type DemoName =
  | 'title'
  | 'create'
  | 'talentSelect'
  | 'talentEvent'
  | 'electiveSelect'
  | 'plan'
  | 'clubRecruitment'
  | 'week'
  | 'prep'
  | 'result'
  | 'vacation'
  | 'cetEvent'
  | 'cetResult'
  | 'randomEvent'
  | 'yearend'
  | 'ending'
  | 'stressEnding'
  | 'expulsion'
