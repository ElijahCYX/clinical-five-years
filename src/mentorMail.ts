import { SEASONS } from './data'
import { buildTimetable } from './timetable'
import { clamp } from './game'
import type {
  GameEmail,
  GameEmailKind,
  GameState,
  MentorInterview,
  MentorProfile,
  ResearchStage,
} from './types'

let mailSeq = 0
function nextMailId(prefix: string): string {
  mailSeq += 1
  return `${prefix}-${Date.now().toString(36)}-${mailSeq}`
}

export const MAIL_WEEK_SLOTS = 21
export const MAIL_SEASON_SLOTS = 21 * 4

export function absoluteSlot(state: GameState): number {
  return (
    state.seasonIndex * MAIL_SEASON_SLOTS +
    (Math.max(1, Math.min(4, state.week)) - 1) * MAIL_WEEK_SLOTS +
    Math.max(0, Math.min(20, state.weekSlot))
  )
}

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const PHASES = ['早上', '下午', '晚上']

export function decodeAbs(abs: number): { seasonIndex: number; week: number; weekSlot: number } {
  const seasonIndex = Math.floor(abs / MAIL_SEASON_SLOTS)
  const within = abs - seasonIndex * MAIL_SEASON_SLOTS
  return {
    seasonIndex,
    week: Math.floor(within / MAIL_WEEK_SLOTS) + 1,
    weekSlot: within % MAIL_WEEK_SLOTS,
  }
}

export function formatAbsTime(state: GameState, abs: number): string {
  const seasonIndex = Math.floor(abs / MAIL_SEASON_SLOTS)
  const within = abs - seasonIndex * MAIL_SEASON_SLOTS
  const week = Math.floor(within / MAIL_WEEK_SLOTS) + 1
  const slot = within % MAIL_WEEK_SLOTS
  const season = SEASONS[seasonIndex] ?? state.season
  const day = DAYS[Math.floor(slot / 3)] ?? ''
  const phase = PHASES[slot % 3] ?? ''
  return `${season.seasonLabel} · 第 ${Math.min(4, week)} 周 · ${day} · ${phase}`
}

export function currentMailTimeLabel(state: GameState): string {
  return formatAbsTime(state, absoluteSlot(state))
}

export function currentWeekKey(state: GameState): string {
  return `${state.season.id}-w${state.week}`
}

export function currentYear(state: GameState): number {
  return Math.min(5, Math.floor(state.seasonIndex / 4) + 1)
}

export function currentGpa(state: GameState): number {
  return state.cumulativeCredits > 0
    ? clamp(state.cumulativePoints / state.cumulativeCredits, 0, 5)
    : 0.5
}

/** 积极回复判定：30% 基础 + 最多 40% 的阶段/GPA/人际加权。 */
export function positiveReplyProbability(state: GameState): number {
  const year = currentYear(state)
  const stageScore = clamp((year - 1) / 4, 0, 1)
  const gpaScore = clamp(currentGpa(state) / 5, 0, 1)
  const socialScore = clamp(((state.player?.attrs.social ?? 2) - 2) / 13, 0, 1)
  const judge = 40 * (0.3 * stageScore + 0.4 * gpaScore + 0.3 * socialScore)
  return Math.min(70, 30 + judge)
}

export type ReplyRoll = 'positive' | 'negative' | 'none'

/** 消极固定 20%，不回复吸收剩余概率。 */
export function rollMentorReply(state: GameState): ReplyRoll {
  const positive = positiveReplyProbability(state) / 100
  const roll = Math.random()
  if (roll < positive) return 'positive'
  if (roll < positive + 0.2) return 'negative'
  return 'none'
}

/**
 * 面谈成功率：
 *   基础 10%
 *   + 科研准备度 50%（0%→0，100%→50%）
 *   + 加权属性 40%（沿用原 4:3:2:1 曲线）
 */
export function interviewSuccessChance(state: GameState): number {
  const attrs = state.player?.attrs
  if (!attrs) return 0.1 + ((state.researchPreparation ?? 0) / 100) * 0.5
  const weighted =
    attrs.comprehension * 4 +
    attrs.dexterity * 3 +
    attrs.appearance * 2 +
    attrs.social
  const attrPart = Math.max(0, Math.min(1, (weighted - 20) / 130)) * 0.4
  const prepPart = (state.researchPreparation ?? 0) / 100 * 0.5
  return clamp(0.1 + prepPart + attrPart, 0, 1)
}

function gpaLabel(state: GameState): string {
  return state.cumulativeCredits > 0
    ? (state.cumulativePoints / state.cumulativeCredits).toFixed(2)
    : '暂无累计成绩'
}

const APPLICATION_OPENINGS = [
  (mentor: MentorProfile) =>
    `尊敬的${mentor.alias}老师：\n\n您好！我是${stateLine()}，冒昧写信打扰您。`,
  (mentor: MentorProfile) =>
    `尊敬的${mentor.alias}老师：\n\n您好！我在学院官网读到您的教师主页，思考了很久，还是决定给您写这封信。`,
  (mentor: MentorProfile) =>
    `尊敬的${mentor.alias}老师：\n\n您好！我是${stateLine()}，目前正在寻找本科阶段的科研训练机会。`,
]

function stateLine(): string {
  return '临床医学五年制学生'
}

function applicationParagraphs(
  state: GameState,
  mentor: MentorProfile,
): string[] {
  const player = state.player
  const name = player?.name ?? '一名医学生'
  const year = currentYear(state)
  const gpa = gpaLabel(state)
  const social = player?.attrs.social ?? 2
  const comp = player?.attrs.comprehension ?? 2
  return [
    `我叫${name}，目前是${year}年级临床医学专业学生。${state.cumulativeCredits > 0 ? `累计 GPA 为 ${gpa}。` : '目前还没有累计 GPA，但每一门课我都在认真准备。'}我知道自己的履历还谈不上出色，但我愿意从最基础的工作做起，也愿意为课题组投入稳定的时间。`,
    `我尤其对您的研究方向「${mentor.field}」感兴趣。读您的代表论文时，我最先被${mentor.journals[0] ?? '您的工作'}中的问题意识吸引，后来又反复看了几遍。我觉得自己目前的理解还很浅，但非常想跟随您学习如何提出问题、设计实验、把结果讲清楚。`,
    `我的长处可能是${comp >= 8 ? '思考问题和自学能力' : '愿意下笨功夫，也能接受反复修改'}，以及${social >= 8 ? '与人沟通、协作推进事情' : '安静地把交代的事情做完'}。如果您愿意给我一个机会，我希望能从组会、文献整理、实验记录这些小事开始，向您和课题组的师兄师姐学习。`,
    `我知道一封邮件很难证明自己，也理解老师时间宝贵。如果我的条件暂时不符合课题组的要求，也请您不必勉强；如果还有一点可能，我非常希望能得到一次面谈或进一步考核的机会。\n\n感谢您读到这里。祝您工作顺利、身体健康！\n\n${name}`,
  ]
}

const APPLICATION_SUBJECTS = [
  (mentor: MentorProfile) => `关于加入${mentor.field}课题组的自荐信`,
  (mentor: MentorProfile) => `学生自荐：希望跟随您学习${mentor.field}`,
  (mentor: MentorProfile) => `科研训练申请 · ${mentor.alias}老师课题组`,
]

export function createApplicationEmail(
  state: GameState,
  mentor: MentorProfile,
): GameEmail {
  const opening = APPLICATION_OPENINGS[Math.floor(Math.random() * APPLICATION_OPENINGS.length)](mentor)
  const subject = APPLICATION_SUBJECTS[Math.floor(Math.random() * APPLICATION_SUBJECTS.length)](mentor)
  const body = [
    opening,
    applicationParagraphs(state, mentor).join('\n\n'),
  ].join('\n')
  return {
    id: nextMailId('mail-app'),
    direction: 'sent',
    kind: 'application',
    mentorId: mentor.id,
    senderName: state.player?.name ?? '我',
    recipientName: mentor.alias,
    subject,
    body,
    sentAtAbs: absoluteSlot(state),
    timeLabel: currentMailTimeLabel(state),
    read: true,
  }
}

const POSITIVE_TEMPLATES = [
  (mentor: MentorProfile, interview: MentorInterview) =>
    `你好：\n\n邮件收到。你的经历和目前的状态我都了解了，整体情况比我在邮件里看到的更清楚。\n\n如果方便，${interview.label}来我办公室聊一聊。办公室在${mentor.department}，具体门牌我稍后发你。面谈大约会占用一个完整时间段，不需要提前准备很正式的汇报，但希望你提前读一读我最近的一篇论文，带着问题来。\n\n${mentor.alias}`,
  (mentor: MentorProfile, interview: MentorInterview) =>
    `同学你好：\n\n谢谢你这么认真地写信。你的 GPA 和表述让我愿意给你一次面谈机会。\n\n${interview.label}来一趟我办公室。我们可以聊聊你为什么对「${mentor.field}」感兴趣，以及你希望从本科阶段得到什么训练。面谈会占一个完整时间段，请提前留出时间。\n\n${mentor.alias}`,
  (mentor: MentorProfile, interview: MentorInterview) =>
    `你好：\n\n读完了你的自荐信。与其只看邮件，不如当面聊十分钟。\n\n${interview.label}来我办公室。不用紧张，我不会考你教科书上的名词，只想听听你真实的想法。面谈大约占一个完整时间段。\n\n${mentor.alias}`,
]

const NEGATIVE_TEMPLATES = [
  (mentor: MentorProfile) =>
    `同学你好：\n\n感谢你的来信和对「${mentor.field}」方向的关注。你写得认真，我能感受到你的诚意。\n\n不过课题组目前的名额和课题安排比较紧，暂时没有合适的本科科研训练位置给你。建议你先在课程和文献阅读上多积累，也可以留意学院后续的科研训练通知。祝学业顺利。\n\n${mentor.alias}`,
  (mentor: MentorProfile) =>
    `你好：\n\n来信收到。谢谢你对我的研究方向感兴趣，也谢谢你把个人情况交代得这么清楚。\n\n很抱歉，这学期课题组的安排已经满了，我暂时无法接收新的本科生。医学院的科研机会不只一条路，你可以先找课程老师做小课题，等等看明年的机会。\n\n${mentor.alias}`,
  (mentor: MentorProfile) =>
    `同学你好：\n\n你的邮件我读了。你的基础还比较早期，现阶段直接进课题组可能效果不一定好。建议先补齐统计和文献阅读，再考虑申请。抱歉这次不能给你一个位置。\n\n${mentor.alias}`,
]

export function createReplyEmail(
  state: GameState,
  mentor: MentorProfile,
  kind: 'positive' | 'negative',
  interview?: MentorInterview,
): GameEmail {
  const subject =
    kind === 'positive'
      ? `回复：${mentor.alias}老师约你面谈`
      : `回复：关于参与${mentor.field}课题组`
  let body = ''
  if (kind === 'positive' && interview) {
    const template = POSITIVE_TEMPLATES[Math.floor(Math.random() * POSITIVE_TEMPLATES.length)]
    body = template(mentor, interview)
  } else {
    const template = NEGATIVE_TEMPLATES[Math.floor(Math.random() * NEGATIVE_TEMPLATES.length)]
    body = template(mentor)
  }
  return {
    id: nextMailId(kind === 'positive' ? 'mail-positive' : 'mail-negative'),
    direction: 'inbox',
    kind: kind === 'positive' ? 'positiveReply' : 'negativeReply',
    mentorId: mentor.id,
    senderName: mentor.alias,
    recipientName: state.player?.name ?? '我',
    subject,
    body,
    sentAtAbs: absoluteSlot(state),
    timeLabel: currentMailTimeLabel(state),
    read: false,
    interview,
  }
}

export function createWelcomeEmail(
  state: GameState,
  mentor: MentorProfile,
): GameEmail {
  return {
    id: nextMailId('mail-welcome'),
    direction: 'inbox',
    kind: 'welcome',
    mentorId: mentor.id,
    senderName: mentor.alias,
    recipientName: state.player?.name ?? '我',
    subject: `欢迎加入${mentor.alias}课题组`,
    body: `你好：\n\n欢迎正式加入我的课题组。先把你的名字拉进课题组群，之后组会、文献分享和实验安排我都会在群里发。\n\n进来以后先从旁听组会和熟悉实验室开始，不用急着证明自己。遇到不懂的就问师兄师姐，但问之前先自己查一遍。\n\n${mentor.alias}`,
    sentAtAbs: absoluteSlot(state),
    timeLabel: currentMailTimeLabel(state),
    read: false,
  }
}

export function createLabAccessEmail(
  state: GameState,
  mentor: MentorProfile,
): GameEmail {
  return {
    id: nextMailId('mail-lab'),
    direction: 'inbox',
    kind: 'labAccess',
    mentorId: mentor.id,
    senderName: mentor.alias,
    recipientName: state.player?.name ?? '我',
    subject: `实验室门禁与安全培训安排`,
    body: `你好：\n\n你的实验室门禁已经开通。明天开始，你可以来实验室跟着师兄师姐学习基础操作。\n\n先完成安全培训和仪器使用规范，不要碰没有教过你的设备。实验室的钥匙不是特权，是责任。\n\n${mentor.alias}`,
    sentAtAbs: absoluteSlot(state),
    timeLabel: currentMailTimeLabel(state),
    read: false,
  }
}

export function createProjectOfferEmail(
  state: GameState,
  mentor: MentorProfile,
  hypothesis: { id: string; title: string },
  nextProject = false,
): GameEmail {
  return {
    id: nextMailId('mail-project'),
    direction: 'inbox',
    kind: 'projectOffer',
    mentorId: mentor.id,
    senderName: mentor.alias,
    recipientName: state.player?.name ?? '我',
    subject: `${nextProject ? '新课题邀请' : '课题邀请'}：${hypothesis.title}`,
    body: `你好：\n\n${nextProject ? '上一篇论文已经见刊。这段时间你在实验室的表现我看在眼里，第二篇我想让你接着做：' : '这段时间你在实验室的表现我看在眼里。现在有一个可以开始做的题目，我想交给你试试：'}\n\n「${hypothesis.title}」\n\n题目不算小，前期需要读一批文献，后面还要补实验。你如果愿意接，回复我就行；如果还没准备好，也可以直接告诉我。\n\n${mentor.alias}`,
    sentAtAbs: absoluteSlot(state),
    timeLabel: currentMailTimeLabel(state),
    read: false,
    project: {
      hypothesisId: hypothesis.id,
      title: hypothesis.title,
    },
  }
}

export function createMedicalFamilyGreeting(
  state: GameState,
  mentor: MentorProfile,
  parentHint: string,
): GameEmail {
  return {
    id: nextMailId('mail-family-hello'),
    direction: 'inbox',
    kind: 'medicalGreeting',
    mentorId: mentor.id,
    senderName: mentor.alias,
    recipientName: state.player?.name ?? '我',
    subject: `代我向你的家人问好`,
    body: `你好：\n\n我是${mentor.alias}。${parentHint}\n\n听说你今年开始读临床医学，专业课还跟得上吗？如果对「${mentor.field}」方向有兴趣，欢迎来办公室坐坐。\n\n${mentor.alias}`,
    sentAtAbs: absoluteSlot(state),
    timeLabel: currentMailTimeLabel(state),
    read: false,
  }
}

export function createMedicalFamilyAcceptance(
  state: GameState,
  mentor: MentorProfile,
): GameEmail {
  return {
    id: nextMailId('mail-family-accept'),
    direction: 'inbox',
    kind: 'medicalAcceptance',
    mentorId: mentor.id,
    senderName: mentor.alias,
    recipientName: state.player?.name ?? '我',
    subject: `欢迎加入${mentor.alias}课题组`,
    body: `你好：\n\n昨天和你聊过之后，我想了想，还是决定先把你收进课题组。\n\n从今天起，你就是我课题组的一员了。组会和实验室的规矩，师兄师姐会慢慢教你。不要因为是熟人介绍就松懈，也不要因为怕给我丢脸而不敢问问题。\n\n${mentor.alias}`,
    sentAtAbs: absoluteSlot(state),
    timeLabel: currentMailTimeLabel(state),
    read: false,
  }
}

export function createMentorEmail(
  state: GameState,
  mentor: MentorProfile,
  kind: GameEmailKind,
  options: {
    interview?: MentorInterview
    hypothesis?: { id: string; title: string }
    parentHint?: string
  } = {},
): GameEmail {
  switch (kind) {
    case 'application':
      return createApplicationEmail(state, mentor)
    case 'positiveReply':
      return createReplyEmail(state, mentor, 'positive', options.interview)
    case 'negativeReply':
      return createReplyEmail(state, mentor, 'negative')
    case 'welcome':
      return createWelcomeEmail(state, mentor)
    case 'labAccess':
      return createLabAccessEmail(state, mentor)
    case 'projectOffer':
      return createProjectOfferEmail(
        state,
        mentor,
        options.hypothesis ?? { id: 'hypothesis', title: '待定课题' },
      )
    case 'medicalGreeting':
      return createMedicalFamilyGreeting(
        state,
        mentor,
        options.parentHint ?? '你家里人和我提过你。',
      )
    case 'medicalAcceptance':
      return createMedicalFamilyAcceptance(state, mentor)
    default:
      return createWelcomeEmail(state, mentor)
  }
}

export function normalWeekStartAbs(seasonIndex: number, week: number): number {
  return seasonIndex * MAIL_SEASON_SLOTS + (week - 1) * MAIL_WEEK_SLOTS
}

export function seasonWeekKey(seasonIndex: number, week: number): string {
  const season = SEASONS[seasonIndex]
  return season ? `${season.id}-w${week}` : ''
}

export function nextNormalWeek(state: GameState): { seasonIndex: number; week: number; abs: number; key: string } | null {
  if (state.week < 3) {
    return {
      seasonIndex: state.seasonIndex,
      week: state.week + 1,
      abs: normalWeekStartAbs(state.seasonIndex, state.week + 1),
      key: seasonWeekKey(state.seasonIndex, state.week + 1),
    }
  }
  const nextSeason = state.seasonIndex + 1
  if (!SEASONS[nextSeason]) return null
  return {
    seasonIndex: nextSeason,
    week: 1,
    abs: normalWeekStartAbs(nextSeason, 1),
    key: seasonWeekKey(nextSeason, 1),
  }
}

export function nextNormalWeekKey(state: GameState): string | null {
  return nextNormalWeek(state)?.key ?? null
}

function freeSlotsForWeek(
  state: GameState,
  seasonIndex: number,
  week: number,
): number[] {
  const season = SEASONS[seasonIndex]
  if (!season) return []
  const temp: GameState = {
    ...state,
    seasonIndex,
    season,
    week,
    weekSlot: 0,
  }
  const timetable = buildTimetable(temp)
  return timetable.cells
    .map((cell, index) => (cell.course === null && !cell.activity ? index : -1))
    .filter((index) => index >= 0)
}

/** 从当前时间之后找第一个/随机一个可用的正常行动周空闲时间段。 */
export function chooseFreeSlotAfter(state: GameState, minAbs = absoluteSlot(state)): number {
  for (let offset = 0; offset <= 5; offset += 1) {
    const seasonIndex = state.seasonIndex + offset
    if (!SEASONS[seasonIndex]) break
    const startWeek = offset === 0 ? state.week : 1
    for (let week = startWeek; week <= 3; week += 1) {
      const weekStart = normalWeekStartAbs(seasonIndex, week)
      if (weekStart + 20 < minAbs) continue
      const free = freeSlotsForWeek(state, seasonIndex, week)
        .map((slot) => weekStart + slot)
        .filter((abs) => abs > minAbs)
      if (free.length > 0) {
        return free[Math.floor(Math.random() * free.length)]
      }
    }
  }
  return minAbs
}

export function nextGameDayStartAbs(state: GameState): number {
  const day = Math.floor(state.weekSlot / 3)
  if (day < 6) {
    return normalWeekStartAbs(state.seasonIndex, state.week) + (day + 1) * 3
  }
  const next = nextNormalWeek(state)
  return next?.abs ?? absoluteSlot(state)
}

export function testSlotLabel(state: GameState, abs: number): string {
  return formatAbsTime(state, abs)
}

export function stageLabel(stage: ResearchStage): string {
  return {
    1: '未联系导师',
    2: '已联系，等待面谈',
    3: '面谈当天',
    4: '已进入课题组',
    5: '实验室学习中',
    6: '科学研究中',
  }[stage]
}
