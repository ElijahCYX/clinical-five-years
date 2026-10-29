import { demoPlayer } from './demo'
import { SEASONS } from './data'
import { newGameState } from './game'
import type {
  CareerStats,
  CourseRecord,
  ExamResult,
  GameState,
  PeResult,
  Relationship,
  YearRecord,
} from './types'
import { createInitialRelationships } from './social'
import { createInitialNpcSocial } from './npcRelations'

const FINAL_PE: PeResult[] = [
  { year: 1, score: 86, gpa: 3.6, passed: true },
  { year: 2, score: 88, gpa: 3.7, passed: true },
  { year: 3, score: 90, gpa: 3.8, passed: true },
  { year: 4, score: 91, gpa: 3.9, passed: true },
  { year: 5, score: 93, gpa: 3.9, passed: true },
]

const CAREER: CareerStats = {
  library: 78,
  attend: 142,
  skip: 3,
  sleepIn: 9,
  coffee: 61,
  selfCare: 44,
  exercise: 28,
  social: 14,
  partTime: 6,
  research: 41,
  club: 35,
  english: 26,
  electiveHomework: 8,
  date: 13,
  campusRun: 24,
  dinner: 11,
  travel: 3,
  weeks: 84,
}

function yearRecord(
  year: number,
  award: YearRecord['award'],
  awards: YearRecord['awards'],
): YearRecord {
  return {
    year,
    gpa: 3.7 + year * 0.02,
    compositeGain: 30 + year * 4,
    researchGain: year * 7,
    papers: year >= 4 ? 1 : 0,
    failed: false,
    cumulativeCredits: year * 39,
    cumulativePoints: year * 39 * 3.8,
    cumulativeComposite: year * 36,
    cumulativeResearch: year * 8,
    evaluated: true,
    award,
    awards,
    score: null,
  }
}

export function createPreGraduationState(): GameState {
  const player = {
    ...demoPlayer,
    name: '顾行舟',
    background: 'middle' as const,
  }
  const finalSeason = SEASONS[SEASONS.length - 1]
  let state = newGameState(player)
  state.relationships = createInitialRelationships(player)
  state = createInitialNpcSocial(state)

  const base = state.relationships[0]
  const extraNames = ['许照野', '温予安', '江临川', '周晚晴']
  const extras: Relationship[] = extraNames.map((name, index) => ({
    ...base,
    id: `seed-friend-${index + 1}`,
    name,
    identity: index < 2 ? '朋友' : '同学',
    kind: index < 2 ? 'friend' : 'classmate',
    intimacy: 72 - index * 7,
  }))
  state.relationships = [
    ...state.relationships.map((relation, index) => {
      if (index === 0) {
        return {
          ...relation,
          name: '沈知遥',
          intimacy: 86,
          partner: true,
          bondType: 'lover' as const,
          bondNickname: '阿遥',
          bondOriginalName: '沈知遥',
          partnerSinceSeasonIndex: 4,
          partnerSinceWeek: 2,
          partnerSinceLabel: '大二 · 冬',
        }
      }
      if (index === 1) {
        return { ...relation, name: '林嘉树', intimacy: 68 }
      }
      return { ...relation, intimacy: index === 2 ? 57 : relation.intimacy }
    }),
    ...extras,
  ]

  const finalCourses = finalSeason.courses
  const resultScores = [92, 88, 90, 86, 94, 89]
  const results: ExamResult[] = finalCourses.map((course, index) => {
    const score = resultScores[index % resultScores.length]
    const gpa = Math.min(4, Math.max(2, (score - 50) / 10))
    return {
      course,
      score,
      gpa: Number(gpa.toFixed(2)),
      expectedMin: score - 5,
      expectedMax: score + 4,
      stressRelief: index % 3,
      usualScore: Math.min(100, score + 2),
      paperScore: score,
    }
  })

  const allCourses = SEASONS.flatMap((season) => season.courses)
  const courseRecords: CourseRecord[] = allCourses.slice(0, 24).map((course, index) => {
    const score = 82 + ((index * 7) % 16)
    return {
      id: course.id,
      name: course.name,
      credits: course.credits,
      gpa: Number(Math.min(4, Math.max(2, (score - 50) / 10)).toFixed(2)),
      score,
      category: course.electiveType === 'politics'
        ? 'politics'
        : course.electiveType
          ? 'elective'
          : 'professional',
    }
  })

  const finalCoursePrep = Object.fromEntries(
    finalCourses.map((course) => [course.id, 88]),
  )

  return {
    ...state,
    screen: 'result',
    player,
    season: finalSeason,
    seasonIndex: SEASONS.length - 1,
    week: 4,
    weekSlot: 20,
    plan: 'A',
    habits: ['fitness', 'earlySleep'],
    energy: 82,
    stress: 28,
    money: 2600,
    prep: finalCoursePrep,
    results,
    selected: [],
    actionsUsed: 0,
    weekSlotSkipped: false,
    weekSlotActions: [],
    careerStats: CAREER,
    cumulativeCredits: 196,
    cumulativePoints: 742,
    courseRecords,
    yearRecords: [
      yearRecord(1, 'school', ['school']),
      yearRecord(2, 'provincial', ['provincial']),
      yearRecord(3, 'school', ['school']),
      yearRecord(4, 'national', ['national']),
      yearRecord(5, 'provincial', ['provincial']),
    ],
    electiveCredits: 10,
    politicsCompleted: ['马原', '毛概', '思修', '军理', '形势与政策'],
    politicsCredits: 11,
    peCourseCount: 8,
    peCourseHistory: ['pe-1', 'pe-2', 'pe-3', 'pe-4', 'pe-5', 'pe-6', 'pe-7', 'pe-8'],
    peResults: FINAL_PE,
    peGraduationExempt: true,
    peMakeupPassed: null,
    peMakeupScore: null,
    cet4Score: 486,
    cet6Score: 572,
    cet4Registered: false,
    cet6Registered: false,
    cetEventDone: true,
    baoyanResult: 'success',
    postgradChoice: 'baoyan',
    postgradChance: 0.82,
    pendingMakeups: [],
    outstandingFails: {},
    everFailed: false,
    researchStage: 6,
    mentorProfileId: null,
    labEntered: true,
    researchStarted: true,
    researchProgress: 100,
    researchPublished: true,
    researchJournal: 'Journal of Clinical Medicine',
    publishedPapers: 2,
    activeHypothesisTitle: '睡眠碎片化与医学生注意力的关联',
    mentorRecognition: 8,
    stressHearts: 3,
    stressHeartBreakWeek: 0,
    familyAffection: 74,
    clubMemberships: [
      {
        orgId: 'debate',
        category: 'debate',
        role: 'president',
        joinedSeasonIndex: 2,
        totalActivities: 46,
        semesterActivities: 6,
        semesterLeaves: 0,
        roleSinceSeasonIndex: 6,
        presidentStartSeasonIndex: 10,
        memberIds: [],
        highestRole: 'president',
        activitySeasonIndex: 20,
        inactivityWarningIssued: false,
      },
    ],
    clubHistory: [],
    npcRelations: [],
    npcProfiles: {},
    npcClueAsked: {},
    gossipRecords: [],
    soloChatRecords: [],
    soloInvites: [],
    finalNote: '五年很长，但你已经走到了这里。',
  }
}
