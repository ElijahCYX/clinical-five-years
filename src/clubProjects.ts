import type {
  ClubMembership,
  ClubProjectPersonalOutcome,
  ClubProjectState,
} from './types'
import { SEASONS } from './data'
import { INTEREST_PROJECTS } from './interestProjects'

export interface ClubProjectEffects {
  energy?: number
  stress?: number
  money?: number
  composite?: number
  socialGrowth?: number
  prep?: number
  english?: number
  intimacy?: number
}

export interface ClubProjectChoice {
  id: string
  label: string
  description: string
  contribution: number
  effects: ClubProjectEffects
}

export interface ClubProjectPhase {
  title: string
  description: string
  choices: ClubProjectChoice[]
}

export interface ClubProjectEventPhase {
  title: string
  description: string
}

export interface ClubProjectPersonalFeedback {
  title: string
  text: string
  effects: ClubProjectEffects
}

export interface ClubProjectDef {
  id: string
  orgId: string
  title: string
  subtitle: string
  /** The activity is announced in week 1; prep phases run in weeks 1..prepWeeks. */
  prepWeeks: number
  /** The final event happens in this week. */
  eventWeek: number
  /** Consecutive timetable slots reserved for the final event. */
  eventSlots: number[]
  stages: ClubProjectPhase[]
  eventPhases: ClubProjectEventPhase[]
  worldTitle: string
  worldText: string
  personalFeedback: Record<ClubProjectPersonalOutcome, ClubProjectPersonalFeedback>
}

const PHOTO_SEASON_EXHIBITION: ClubProjectDef = {
  id: 'photo-seasonal-exhibition',
  orgId: 'org-photo',
  title: '季节影展',
  subtitle: '把这一季的光，留在图书馆的一面墙上。',
  prepWeeks: 3,
  eventWeek: 3,
  eventSlots: [18, 19, 20],
  stages: [
    {
      title: '征集与选片',
      description:
        '第 1 周例会。摄影社宣布这一季要做一场「季节影展」，主题是“你最近一次停下来看的东西”。投稿比预想中多，活动室的桌上摊满了打印样片，负责人把最终活动定在第 3 周周日。',
      choices: [
        {
          id: 'curate',
          label: '做主要策展',
          description: '定主题、选片、写展签，把大家的照片串成一条线。',
          contribution: 3,
          effects: { stress: 4, composite: 2, socialGrowth: 4 },
        },
        {
          id: 'shoot',
          label: '补拍一组照片',
          description: '投稿不够，你背着相机在校园里转了一个下午。',
          contribution: 2,
          effects: { energy: -5, stress: -1, composite: 1, socialGrowth: 2 },
        },
        {
          id: 'log',
          label: '整理投稿',
          description: '登记、编号、联系作者，活儿很碎，但总得有人做。',
          contribution: 1,
          effects: { energy: -2, stress: -1, socialGrowth: 2 },
        },
      ],
    },
    {
      title: '布展与宣传',
      description:
        '第 2 周例会。照片已经定下来，接下来是把它们挂上墙。有人买材料，有人研究灯光，海报改了第七版，群里终于有人说“就这个吧”。影展仍然定在第 3 周周日。',
      choices: [
        {
          id: 'design',
          label: '设计展签和海报',
          description: '把照片背后的故事写成几句能让人停下来的话。',
          contribution: 3,
          effects: { stress: 3, composite: 2, socialGrowth: 3 },
        },
        {
          id: 'install',
          label: '现场布展',
          description: '搬展架、调水平、贴展签，手上沾了满胶。',
          contribution: 2,
          effects: { energy: -5, stress: 2, socialGrowth: 2 },
        },
        {
          id: 'promote',
          label: '负责宣传',
          description: '写推文、发群公告、去别的社团串门拉人来看。',
          contribution: 1,
          effects: { energy: -3, socialGrowth: 4 },
        },
      ],
    },
    {
      title: '开幕与导览',
      description:
        '第 3 周例会。明天就是影展，负责人做最后一次分工。来的人比想象中多，有人在一张照片前站了很久。你站在自己的作品旁边，忽然被问到：“这张是在哪里拍的？”',
      choices: [
        {
          id: 'guide',
          label: '主持导览',
          description: '带着观众走一圈，讲每张照片为什么被选中。',
          contribution: 3,
          effects: { stress: 4, composite: 3, socialGrowth: 4 },
        },
        {
          id: 'invite',
          label: '邀请朋友来看',
          description: '把熟悉的、很久没见的人都叫来，让影展开幕像一次小型重逢。',
          contribution: 2,
          effects: { energy: -2, socialGrowth: 3, intimacy: 2 },
        },
        {
          id: 'document',
          label: '拍照记录',
          description: '给开幕式留一份影像档案，也给自己留一张和展墙的合影。',
          contribution: 1,
          effects: { energy: -3, composite: 1, socialGrowth: 2 },
        },
      ],
    },
  ],
  eventPhases: [
    {
      title: '布展开幕',
      description:
        '周日早上，图书馆一楼还带着消毒水味。你们把最后一组照片挂上墙，调整灯光，摆好展签。九点整，影展正式开门。',
    },
    {
      title: '正式展出',
      description:
        '周日下午，来看展的人比预想中多。有人认真读完每一张展签，有人只是路过，也有人在一张照片前站了很久。',
    },
    {
      title: '收展庆功',
      description:
        '周日晚上，最后一位观众离开。你们把照片一张张取下来，在空出来的墙前拍了一张合影。有人提议去吃夜宵，所有人都没反对。',
    },
  ],
  worldTitle: '季节影展如期举办',
  worldText:
    '不管社员们各自来了几次，影展还是在第 3 周周日如期举办。照片被挂在图书馆一楼的墙上，有人停下来看，也有人拍下其中一张发给了朋友。活动结束后，社团群里刷满了现场照片。',
  personalFeedback: {
    core: {
      title: '影展核心成员',
      text:
        '从选片到布展，再到开幕当天的导览，你几乎参与了这场影展的每一个环节。有人记住的是一张照片，有人记住的是站在照片旁边讲解的你。',
      effects: { composite: 4, socialGrowth: 6, stress: -3 },
    },
    helper: {
      title: '影展帮手',
      text:
        '你不是这场影展最显眼的人，但有几件关键的小事确实是你做的。活动结束时，负责人拍了拍你的肩：“这次多亏你在。”',
      effects: { composite: 2, socialGrowth: 4, stress: -2 },
    },
    audience: {
      title: '影展观众',
      text:
        '你这次没有参与筹备，但还是去看了展。站在人群里，你忽然意识到，一场活动能顺利发生，背后有很多你没看见的手。',
      effects: { socialGrowth: 1 },
    },
    prepared: {
      title: '参与了筹备，但没到现场',
      text:
        '你参与了前期筹备，但活动当天没有出现。后来你在群里看到现场照片，事情办得不错；你认得其中几处细节，却说不清自己当时站在哪里。',
      effects: { socialGrowth: 1 },
    },
    absent: {
      title: '在群里看到影展',
      text:
        '你这次没有去。活动结束后，群里发了很多照片：挂在墙上的作品、开幕时的合影、被吃完的庆功蛋糕。影展如期发生了，只是你不在画面里。',
      effects: {},
    },
  },
}

const ALL_PROJECT_DEFS: ClubProjectDef[] = [
  PHOTO_SEASON_EXHIBITION,
  ...INTEREST_PROJECTS,
]

const PROJECT_DEFS_BY_ID: Record<string, ClubProjectDef> = Object.fromEntries(
  ALL_PROJECT_DEFS.map((def) => [def.id, def]),
)

const PROJECT_DEFS_BY_ORG: Record<string, ClubProjectDef[]> = {}
for (const def of ALL_PROJECT_DEFS) {
  const list = PROJECT_DEFS_BY_ORG[def.orgId] ?? []
  list.push(def)
  PROJECT_DEFS_BY_ORG[def.orgId] = list
}

export function clubProjectDefsForOrg(orgId: string): ClubProjectDef[] {
  return PROJECT_DEFS_BY_ORG[orgId] ?? []
}

export function clubProjectDefForOrg(
  orgId: string,
  seasonId?: string,
): ClubProjectDef | null {
  const defs = PROJECT_DEFS_BY_ORG[orgId] ?? []
  if (defs.length === 0) return null
  if (!seasonId) return defs[0]
  const seasonIndex = SEASONS.findIndex((season) => season.id === seasonId)
  return defs[Math.max(0, seasonIndex) % defs.length]
}

export function clubProjectDefForProject(
  project: ClubProjectState | null | undefined,
): ClubProjectDef | null {
  if (!project) return null
  return PROJECT_DEFS_BY_ID[project.projectId] ?? null
}

export function createClubProjectState(
  orgId: string,
  seasonId: string,
): ClubProjectState | null {
  const def = clubProjectDefForOrg(orgId, seasonId)
  if (!def) return null
  return {
    projectId: def.id,
    seasonId,
    eventWeek: def.eventWeek,
    eventSlots: [...def.eventSlots],
    phaseChoices: def.stages.map(() => null),
    contribution: 0,
    attendance: def.eventSlots.map(() => false),
    settled: false,
    personalOutcome: null,
  }
}

export function clubProjectForSeason(
  membership: ClubMembership,
  seasonId: string,
): ClubProjectState | null {
  if (
    membership.project?.seasonId === seasonId &&
    Array.isArray(membership.project.phaseChoices) &&
    clubProjectDefForProject(membership.project)
  ) {
    return membership.project
  }
  return createClubProjectState(membership.orgId, seasonId)
}

export function currentPhaseFor(
  project: ClubProjectState,
  def: ClubProjectDef,
  week: number,
): { index: number; stage: ClubProjectDef['stages'][number] } | null {
  if (project.settled) return null
  const index = Math.max(0, Math.min(def.stages.length - 1, week - 1))
  const stage = def.stages[index]
  return stage ? { index, stage } : null
}

export function personalOutcomeFor(
  project: ClubProjectState,
): ClubProjectPersonalOutcome {
  const attended = project.attendance.some(Boolean)
  if (!attended) return project.contribution > 0 ? 'prepared' : 'absent'
  if (project.contribution >= 6) return 'core'
  if (project.contribution > 0) return 'helper'
  return 'audience'
}

export function projectEffectLine(effects: ClubProjectEffects): string[] {
  const lines: string[] = []
  const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`)
  if (effects.energy) lines.push(`精力 ${signed(effects.energy)}`)
  if (effects.stress) lines.push(`压力 ${signed(effects.stress)}`)
  if (effects.money) lines.push(`生活费 ${signed(effects.money)}`)
  if (effects.composite) lines.push(`综测 +${effects.composite}`)
  if (effects.socialGrowth) lines.push(`人际成长 +${effects.socialGrowth}`)
  if (effects.prep) lines.push(`准备度 +${effects.prep}`)
  if (effects.english) lines.push(`英语成长 +${effects.english}%`)
  if (effects.intimacy) lines.push(`亲密度 +${effects.intimacy}`)
  return lines
}
