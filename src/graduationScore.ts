import type { AwardLevel, CareerStats, GameState, Relationship } from './types'
import { closeFriendCount, isSeniorRelation } from './social'
import { GRADUATION_CREDITS, graduationReasons } from './game'
import { roleLabel } from './organizations'

export interface ScoreBreakdown {
  academic: number
  research: number
  organization: number
  social: number
  life: number
  outcome: number
  achievement: number
}

export interface PerspectiveScore {
  key: 'designer' | 'mentor' | 'friends' | 'self'
  title: string
  name: string
  subtitle: string
  score: number
  tier: string
  line: string
  breakdown: ScoreBreakdown
}

export type SelfOverall = 'satisfied' | 'accept' | 'regret'
export type SelfMedicine = 'again' | 'unsure' | 'no'
export type SelfPeople = 'warm' | 'some' | 'apart'

export interface SelfAnswers {
  overall: SelfOverall | null
  medicine: SelfMedicine | null
  people: SelfPeople | null
}

const WEIGHTS = {
  designer: {
    academic: 0.3,
    research: 0.18,
    organization: 0.14,
    social: 0.14,
    life: 0.1,
    outcome: 0.08,
    achievement: 0.06,
  },
  mentor: {
    academic: 0.45,
    research: 0.3,
    organization: 0.07,
    social: 0.04,
    life: 0.02,
    outcome: 0.08,
    achievement: 0.04,
  },
  counselor: {
    academic: 0.18,
    research: 0.06,
    organization: 0.12,
    social: 0.2,
    life: 0.28,
    outcome: 0.1,
    achievement: 0.06,
  },
  friends: {
    academic: 0.08,
    research: 0.05,
    organization: 0.12,
    social: 0.35,
    life: 0.25,
    outcome: 0.05,
    achievement: 0.1,
  },
} satisfies Record<string, ScoreBreakdown>

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function norm(value: number, target: number): number {
  if (!Number.isFinite(value) || target <= 0) return 0
  return clamp01(value / target)
}

/** Diminishing return for repeated actions: 30 full, then 70/40/20/10%. */
export function effectiveActionCount(raw: number): number {
  const n = Math.max(0, raw)
  if (n <= 30) return n
  if (n <= 60) return 30 + (n - 30) * 0.7
  if (n <= 100) return 51 + (n - 60) * 0.4
  if (n <= 150) return 67 + (n - 100) * 0.2
  return Math.min(100, 77 + (n - 150) * 0.1)
}

function avg(values: number[]): number {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function emptyCareer(): CareerStats {
  return {
    library: 0, attend: 0, skip: 0, sleepIn: 0, coffee: 0, selfCare: 0,
    exercise: 0, social: 0, partTime: 0, research: 0, club: 0,
    english: 0, electiveHomework: 0, date: 0, campusRun: 0, dinner: 0,
    travel: 0, weeks: 0,
  }
}

function career(state: GameState): CareerStats {
  return { ...emptyCareer(), ...(state.careerStats ?? {}) }
}

function mentor(state: GameState): Relationship | null {
  return (
    state.relationships.find((relation) => relation.kind === 'mentor') ??
    state.relationships.find((relation) => relation.kind === 'counselor') ??
    null
  )
}

function organizationScore(state: GameState): number {
  const memberships = state.clubMemberships ?? []
  const history = state.clubHistory ?? []
  if (memberships.length === 0 && history.length === 0) return 0
  const roleRank: Record<string, number> = {
    member: 0.2,
    officer: 0.55,
    president: 0.9,
    honorary: 1,
  }
  const currentHighest = Math.max(
    0,
    ...memberships.map((item) => roleRank[item.highestRole] ?? 0),
    ...history.map((item) => roleRank[item.highestRole] ?? 0),
  )
  const activities = memberships.reduce((sum, item) => sum + item.totalActivities, 0)
  const breadth = new Set([...memberships.map((m) => m.orgId), ...history.map((h) => h.orgId)]).size
  return clamp01(
    0.45 * currentHighest +
      0.35 * norm(effectiveActionCount(activities), 60) +
      0.2 * norm(breadth, 3),
  )
}

function computeBreakdown(state: GameState): ScoreBreakdown {
  const credits = state.cumulativeCredits
  const gpa = credits > 0 ? state.cumulativePoints / credits : 0
  const courseAvg = avg(state.courseRecords.map((course) => course.score))
  const failedCourses = state.courseRecords.filter((course) => course.score < 60).length
  const failPenalty = norm(failedCourses + state.pendingMakeups.length, 6)
  const cet = state.cet6Score != null
    ? norm(state.cet6Score, 550)
    : state.cet4Score != null
      ? Math.min(0.6, norm(state.cet4Score, 550))
      : 0
  const pePassed = state.peGraduationExempt
    ? 5
    : state.peResults.filter((result) => result.passed).length
  const academic = clamp01(
    0.45 * norm(gpa, 4) +
      0.2 * norm(credits, GRADUATION_CREDITS) +
      0.15 * norm(courseAvg, 100) +
      0.1 * cet +
      0.1 * norm(pePassed, 5) -
      0.15 * failPenalty,
  )

  const hasMentor = state.relationships.some((relation) => relation.kind === 'mentor')
  const papers = state.publishedPapers ?? 0
  const research = clamp01(
    0.35 * norm(state.researchStage, 6) +
      0.3 * norm(state.researchProgress, 100) +
      0.35 * norm(papers, 3),
  )

  const organization = organizationScore(state)
  const bonds = state.relationships.filter((relation) => relation.bondType || relation.partner)
  const partners = state.relationships.filter((relation) => relation.partner)
  const coreIntimacy = avg(
    state.relationships
      .slice()
      .sort((a, b) => b.intimacy - a.intimacy)
      .slice(0, 8)
      .map((relation) => relation.intimacy),
  )
  const stats = career(state)
  const social = clamp01(
    0.25 * norm(bonds.length, 3) +
      0.2 * norm(closeFriendCount(state), 5) +
      0.15 * norm(partners.length, 2) +
      0.2 * norm(coreIntimacy, 100) +
      0.15 * norm(
        effectiveActionCount(stats.date + stats.dinner + stats.social),
        80,
      ) +
      0.05 * norm(state.familyAffection, 100),
  )

  const exercise = stats.exercise + stats.campusRun
  const selfCare = stats.selfCare + stats.coffee
  const stressHearts = Math.max(0, 3 - state.stressHearts)
  const life = clamp01(
    0.25 * norm(effectiveActionCount(exercise), 100) +
      0.2 * norm(effectiveActionCount(selfCare), 120) +
      0.15 * norm(state.habits.length, 2) +
      0.2 * clamp01(1 - stressHearts / 3 - (state.stress >= 80 ? 0.15 : 0)) +
      0.2 * norm(stats.travel + state.eventHistory.length, 40),
  )

  const graduated = graduationReasons(state).length === 0
  const destination =
    state.baoyanResult === 'success'
      ? 1
      : state.kaoyanResult === 'success'
        ? 0.88
        : state.postgradChoice === 'employment'
          ? 0.7
          : 0.5
  const clean = state.everFailed ? 0.35 : 1
  const outcome = clamp01(
    0.55 * destination +
      0.25 * (graduated ? 1 : 0.4) +
      0.2 * clean,
  )

  const awardScore = state.yearRecords.reduce((sum, record) => {
    const awards = new Set<AwardLevel>(record.awards)
    if (awards.has('national')) sum += 1
    else if (awards.has('provincial')) sum += 0.65
    else if (awards.has('school')) sum += 0.3
    return sum
  }, 0)
  const achievement = clamp01(
    norm(awardScore + papers * 0.25 + (state.peGraduationExempt ? 0.1 : 0), 1.8),
  )

  return {
    academic,
    research,
    organization,
    social,
    life,
    outcome,
    achievement,
  }
}

function weightedScore(
  breakdown: ScoreBreakdown,
  weights: typeof WEIGHTS.designer,
): number {
  return Math.round(
    Math.max(
      0,
      Math.min(
        100000,
        100000 *
          (breakdown.academic * weights.academic +
            breakdown.research * weights.research +
            breakdown.organization * weights.organization +
            breakdown.social * weights.social +
            breakdown.life * weights.life +
            breakdown.outcome * weights.outcome +
            breakdown.achievement * weights.achievement),
      ),
    ),
  )
}

export function scoreTier(score: number): string {
  if (score >= 90000) return '校园传奇'
  if (score >= 80000) return '杏林人物'
  if (score >= 70000) return '优秀毕业生'
  if (score >= 60000) return '合格毕业生'
  return '平凡但完整的五年'
}

export function designerScore(state: GameState): PerspectiveScore {
  const breakdown = computeBreakdown(state)
  return {
    key: 'designer',
    title: '游戏设计师',
    name: 'Dingihyon',
    subtitle: '均衡视角',
    score: weightedScore(breakdown, WEIGHTS.designer),
    tier: '',
    line: '我不只看你飞得多高，也看看你这五年有没有好好落地。',
    breakdown,
  }
}

export function mentorScore(state: GameState): PerspectiveScore {
  const breakdown = computeBreakdown(state)
  const hasMentor = state.relationships.some((relation) => relation.kind === 'mentor')
  const relation = mentor(state)
  const score = weightedScore(breakdown, hasMentor ? WEIGHTS.mentor : WEIGHTS.counselor)
  return {
    key: 'mentor',
    title: hasMentor ? '你的导师' : '你的辅导员',
    name: relation?.name ?? '学院老师',
    subtitle: hasMentor ? '学业科研视角' : '身心健康与综合发展视角',
    score,
    tier: '',
    line: hasMentor
      ? '论文、成绩和实验记录会说话，但我也记得你第一次进实验室时的手忙脚乱。'
      : '先别急着成为厉害的人。能好好吃饭、睡觉、求助和继续走，也是医学生的本事。',
    breakdown,
  }
}

export function friendsScore(state: GameState): PerspectiveScore {
  const breakdown = computeBreakdown(state)
  return {
    key: 'friends',
    title: '你的朋友们',
    name: '关系网',
    subtitle: '生活关系视角',
    score: weightedScore(breakdown, WEIGHTS.friends),
    tier: '',
    line: '你考了多少分我们记不太清，但你有没有出现、有没有好好吃饭，我们记得。',
    breakdown,
  }
}

const SELF_POINTS = {
  overall: { satisfied: 40000, accept: 30000, regret: 18000 },
  medicine: { again: 35000, unsure: 25000, no: 15000 },
  people: { warm: 25000, some: 18000, apart: 10000 },
} as const

export function selfScore(answers: SelfAnswers): number | null {
  if (!answers.overall || !answers.medicine || !answers.people) return null
  return (
    SELF_POINTS.overall[answers.overall] +
    SELF_POINTS.medicine[answers.medicine] +
    SELF_POINTS.people[answers.people]
  )
}

export function selfPerspective(state: GameState, answers: SelfAnswers): PerspectiveScore {
  const score = selfScore(answers) ?? 0
  const breakdown = computeBreakdown(state)
  return {
    key: 'self',
    title: '你自己',
    name: '五年后的你',
    subtitle: '自我评价',
    score,
    tier: '',
    line: '这五年里那些没人看见的坚持，只有你自己有资格打分。',
    breakdown,
  }
}

export function withTier(score: PerspectiveScore): PerspectiveScore {
  return { ...score, tier: scoreTier(score.score) }
}

export interface RecapSection {
  title: string
  items: string[]
}

export function buildRecap(state: GameState): RecapSection[] {
  const stats = career(state)
  const credits = state.cumulativeCredits
  const gpa = credits > 0 ? state.cumulativePoints / credits : 0
  const failed = state.courseRecords.filter((course) => course.score < 60).length
  const bonds = state.relationships.filter((relation) => relation.bondType || relation.partner)
  const partners = state.relationships.filter((relation) => relation.partner)
  const mentorRel = state.relationships.find((relation) => relation.kind === 'mentor')
  const counselorRel = state.relationships.find((relation) => relation.kind === 'counselor')
  const orgs = state.clubMemberships ?? []
  const highestRole = orgs
    .slice()
    .sort((a, b) => {
      const rank = { member: 0, officer: 1, president: 2, honorary: 3 }
      return (rank[b.highestRole] ?? 0) - (rank[a.highestRole] ?? 0)
    })[0]
  const activities = orgs.reduce((sum, item) => sum + item.totalActivities, 0)
  const pePassed = state.peGraduationExempt
    ? 5
    : state.peResults.filter((result) => result.passed).length
  const gossipTold = (state.gossipRecords ?? []).filter((record) => record.told).length
  const topNames = state.relationships
    .slice()
    .sort((a, b) => b.intimacy - a.intimacy)
    .slice(0, 3)
    .map((relation) => relation.name)
    .join('、')

  return [
    {
      title: '学业',
      items: [
        `总学分 ${credits} / ${GRADUATION_CREDITS} · 累计 GPA ${gpa.toFixed(2)}`,
        `CET-4 ${state.cet4Score ?? '未参加'} · CET-6 ${state.cet6Score ?? '未参加'}`,
        `课程记录 ${state.courseRecords.length} 门 · 挂科 ${failed} 门 · 补考 ${state.pendingMakeups.length} 门`,
        `图书馆 ${stats.library} 次 · 到课 ${stats.attend} 次 · 翘课 ${stats.skip} 次`,
        pePassed > 0 ? `体测合格 ${pePassed} / 5 次` : '体测记录还在路上',
      ],
    },
    {
      title: '科研与组织',
      items: [
        `导师：${mentorRel?.name ?? '没有导师'}`,
        `科研阶段 ${state.researchStage} / 6 · 论文 ${state.publishedPapers} 篇`,
        orgs.length > 0
          ? `组织 ${orgs.length} 个 · 活动 ${activities} 次 · 最高职务 ${highestRole ? roleLabel(highestRole.category, highestRole.highestRole) : '成员'}`
          : '没有加入组织，但你把时间留给了别的选择',
        `兼职 ${stats.partTime} 次 · 英语学习 ${stats.english} 次`,
        `独立科研进度 ${state.researchProgress} / 100`,
        ...(state.debateHonors.length > 0
          ? [`辩论荣誉：${state.debateHonors.map((item) => item.label).join(' / ')}`]
          : []),
        ...(state.healthHistory?.length > 0
          ? [
              `健康记录：${state.healthHistory
                .slice(-6)
                .map((item) => `${item.weekLabel} ${item.label}`)
                .join(' / ')}`,
            ]
          : []),
      ],
    },
    {
      title: '人际、羁绊与生活',
      items: [
        `认识 ${state.relationships.length} 人 · 羁绊 ${bonds.length} 段 · 交心朋友 ${closeFriendCount(state)} / 5`,
        `恋人 ${partners.length} 人 · 单独邀约 ${stats.date} 次 · 组局 ${stats.dinner} 次`,
        topNames ? `最熟悉的人：${topNames}` : '最熟悉的人还在未来等你',
        `跑步/运动 ${stats.exercise + stats.campusRun} 次 · 咖啡 ${stats.coffee} 杯 · 自爱 ${stats.selfCare} 次`,
        `旅行 ${stats.travel} 次 · 随机事件 ${state.eventHistory.length} 次 · 八卦 ${gossipTold} 条`,
      ],
    },
    {
      title: '毕业与未来',
      items: [
        `去向：${state.baoyanResult === 'success' ? '保研' : state.kaoyanResult === 'success' ? '考研上岸' : state.postgradChoice === 'employment' ? '就业' : '继续寻找'}`,
        `毕业状态：${graduationReasons(state).length === 0 ? '顺利毕业' : '延毕一年'}`,
        `心力：${state.stressHearts} / 3 · 压力：${state.stress} / 100`,
        `辅导员：${counselorRel?.name ?? '学院老师'} 也在这五年里见过你的很多面`,
        '分数只是到这为止的脚印，不是接下来要背着的行李。',
      ],
    },
  ]
}
