import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Eyebrow, InterfaceNav, TopBar } from '../ui'
import { PlayerRail } from './PlayerRail'
import { CampusNoticeBoard } from './CampusNotice'
import { pickLateScoldingText } from '../lateScoldingTexts'
import { CLINICAL_EVENT_RULES } from '../clinicalEventRules'
import { pickOvertimeText } from '../overtimeTexts'
import { consumptionCoffeeCost, consumptionSelfCareCost } from '../consumption'
import { ACTION_BY_ID, ACTIONS } from '../data'
import {
  CLINICAL_QUESTION_BY_ID,
  CLINICAL_SKILLS,
  CLINICAL_TASK_BY_ID,
  ESCAPE_HIDEOUTS,
  ESCAPE_PURPOSES,
  blockAt,
  choicesForSkill,
  createClinicalState,
  createDayState,
  currentClinicalCourse,
  examineRotation,
  formatClinicalTaskForDay,
  randomQuestionFor,
  randomTaskFor,
  scheduleFor,
  skillLevelLabel,
  trainClinicalSkill,
  skillName,
} from '../clinical'
import type {
  ClinicalDayState,
  ClinicalSkillId,
  ClinicalState,
  ClinicalTodo,
  ClinicalTodoKind,
  GameState,
} from '../types'
import type {
  ClinicalBlock,
  ClinicalSkillDef,
  ClinicalQuestionDef,
  ClinicalTaskChoice,
  ClinicalTaskDef,
} from '../clinical'

interface ClinicalScreenProps {
  state: GameState
  onUpdateClinical: (clinical: ClinicalState) => void
  onFinishSeason: (clinical: ClinicalState) => void
  onGameEffect: (effect: {
    stress?: number
    energy?: number
    kaoyanPrep?: number
    courseId?: string
    coursePrep?: number
  }) => void
  onTitle: () => void
  onOpenWhoAmI: () => void
  onOpenTA: () => void
  onDrinkCoffee?: (dayKey?: string) => void
  onEatBreakfast?: (dayKey?: string) => void
  onDailySelfCare?: (dayKey?: string) => void
  onClinicalEveningAction?: (actionId: string) => void
}

interface EscapeEvent {
  id: string
  title: string
  text: string
  hideouts?: string[]
}

const ESCAPE_EVENTS: EscapeEvent[] = [
  { id: 'teacher', title: '有老师进值班室休息发现你', text: '门被推开，一位老师进来接水，看见你躺在床上，愣了一下。', hideouts: ['duty'] },
  { id: 'caught', title: '你被带教发现了', text: '带教在走廊尽头叫住你：“你今天上午去哪了？”你张了张嘴，知道这次躲不过去了。' },
]

interface MorningState {
  phase: 'alarm' | 'commute' | 'elevator' | 'dressing'
  clock: number
  startEnergy: number
  commuteElapsed: number
  commuteBoost: number
  elevatorWait: number
  snoozes: number
  lastSnooze: number
  energyGain: number
  arrivalClock: number
}

/** 睡眠不足越严重，越容易睡过头；精力 0→90%，精力 100→10%。 */
function oversleepChance(energy: number): number {
  return Math.max(0.1, Math.min(0.9, 0.9 - (Math.max(0, Math.min(100, energy)) / 100) * 0.8))
}

interface ClinicalChatMessage {
  id: string
  sender: string
  text: string
  time: string
  requiresResponse?: boolean
  responded?: boolean
  read?: boolean
  clock?: number
  todo?: { kind: ClinicalTodoKind; bed: number }
  todoDeferred?: boolean
  nurseVisitHandled?: boolean
}

interface ScheduledChatEvent {
  at: number
  kind: 'admission' | 'escort' | 'lecture'
  bed: number
}

const CLINICAL_DEPARTMENTS = [
  '心内科', '呼吸内科', '消化内科', '肾内科', '血液科', '内分泌科',
  '普外科', '骨科', '泌尿外科', '神经外科', '胸外科', '血管外科',
  '妇产科', '儿科', '急诊科', '皮肤科', '眼科', '耳鼻喉科',
  '神经内科', '精神科', '感染科', '肿瘤科', '麻醉科', '影像科',
  '病理科', '康复科', '全科', '老年医学科',
]

function randomBedNumber(): number {
  const candidates = Array.from({ length: 66 }, (_, index) => index + 1)
    .filter((value) => !String(value).includes('4'))
  return candidates[Math.floor(Math.random() * candidates.length)] ?? 1
}

function randomDepartment(): string {
  return CLINICAL_DEPARTMENTS[Math.floor(Math.random() * CLINICAL_DEPARTMENTS.length)] ?? '内科'
}

function nurseNoResponseText(): string {
  const bed = randomBedNumber()
  const templates = [
    () => `@管床医生：${bed} 床的医嘱开一下`,
    () => `@管床医生：${bed} 床的家属刚到，要找主管医生，在护士站等了`,
    () => `@管床医生：${bed} 床说便秘，想要开开塞露`,
    () => `@管床医生：${bed} 床问今天能不能吃东西了`,
    () => `@管床医生：${bed} 床想请个 ${randomDepartment()} 会诊`,
    () => `@管床医生：${bed} 床今天血糖不稳定`,
    () => '@管床医生：今天哪些床换药的敷贴用了多少报一下啊',
    () => `@管床医生：${bed} 床要开病假单`,
    () => `@管床医生：${bed} 床的出院小结赶紧给一下，家属急着走`,
    () => `@管床医生：${bed} 床的${['输血', '雾化', '血糖监测', '盐水'][Math.floor(Math.random() * 4)]}医嘱记得开一下`,
  ]
  return templates[Math.floor(Math.random() * templates.length)]?.() ?? `@管床医生：${bed} 床的医嘱开一下`
}

function residentNoResponseText(): string {
  const bed = randomBedNumber()
  if (Math.random() < 0.5) {
    return `${bed} 床的医嘱已开，麻烦老师执行。`
  }
  const operation = ['拔管换药', '拆线换药', '退管换药'][Math.floor(Math.random() * 3)]
  let values: number[] = [0, 0, 0, 0]
  for (let i = 0; i < 4; i += 1) values[i] = Math.floor(Math.random() * 4)
  if (values.every((value) => value === 0)) values = [1, 0, 0, 0]
  const codes = ['3663', '3665Y', '3666', '3669']
  const terms = codes
    .map((code, index) => `${code}*${values[index]}`)
    .filter((_, index) => values[index] !== 0)
  return `${bed} 床${operation}消耗${terms.join('，')}`
}

function residentReplyText(): string {
  const replies = ['收到', '好的', '来了', '马上到', '好，我去', '收到，这就去', '好嘞', '知道了，我处理一下']
  return replies[Math.floor(Math.random() * replies.length)] ?? '收到'
}

function randomFreeMinute(
  course: { scheduleKey: string },
  after: number,
): number {
  const blocks = scheduleFor({ scheduleKey: course.scheduleKey } as never).filter(
    (block) => block.kind === 'free' && block.end > after + 5,
  )
  const fallback = scheduleFor({ scheduleKey: course.scheduleKey } as never).find(
    (block) => block.kind === 'free',
  )
  const block = blocks[Math.floor(Math.random() * blocks.length)] ?? fallback
  if (!block) return Math.max(60, after)
  const start = Math.max(block.start, after)
  return Math.min(block.end - 1, start + Math.floor(Math.random() * Math.max(1, block.end - start)))
}

function createScheduledChats(
  course: { scheduleKey: string },
  admissions: number,
  escortCount: number,
  lecture: boolean,
): ScheduledChatEvent[] {
  const events: ScheduledChatEvent[] = []
  for (let index = 0; index < admissions; index += 1) {
    events.push({
      at: randomFreeMinute(course, 120),
      kind: 'admission',
      bed: randomBedNumber(),
    })
  }
  for (let index = 0; index < escortCount; index += 1) {
    events.push({
      at: randomFreeMinute(course, 120),
      kind: 'escort',
      bed: randomBedNumber(),
    })
  }
  if (lecture) {
    events.push({
      at: randomFreeMinute(course, 390),
      kind: 'lecture',
      bed: 0,
    })
  }
  return events.sort((a, b) => a.at - b.at)
}

function escapeSceneText(hideout: string): string {
  if (hideout === 'duty') {
    return '你躲在值班室，门外的脚步声一下近一下远。每一次有人经过，你都下意识把手机屏幕按灭。'
  }
  if (hideout === 'classroom') {
    return '示教室里很安静，窗帘只拉开一条缝。走廊偶尔有人经过，但没有人推门进来。你把手机调成静音，盯着群里的消息。'
  }
  return '你坐在医院外的便利店角落，面前放着一杯已经不怎么冰的饮料。玻璃门外没有人认识你，但手机里的工作群还在不断跳出消息。'
}

function formatOvertimeClock(minutes: number): string {
  const total = 7 * 60 + Math.max(0, minutes)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatClock(minutes: number): string {
  const total = 7 * 60 + Math.max(0, Math.min(600, minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function shuffledQuestion(question: ClinicalQuestionDef): ClinicalQuestionDef {
  const options = [...question.options]
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }
  const correctIndex = options.findIndex((option) => option.correct)
  if (correctIndex === 0 && options.length > 1) {
    const swapWith = 1 + Math.floor(Math.random() * (options.length - 1))
    ;[options[0], options[swapWith]] = [options[swapWith], options[0]]
  }
  return { ...question, options }
}

function skillRows(skills: ClinicalState['skills']) {
  return CLINICAL_SKILLS.map((skill) => ({
    ...skill,
    level: skills[skill.id]?.level ?? 0,
    xp: skills[skill.id]?.xp ?? 0,
  }))
}

function skillKindLabel(kind: ClinicalSkillDef['kind']): string {
  return kind === 'common' ? '普通' : kind === 'medium' ? '中等' : '困难'
}

function ClinicalSkillTree({ skills }: { skills: ClinicalState['skills'] }) {
  const groups: Array<{ kind: ClinicalSkillDef['kind']; label: string }> = [
    { kind: 'common', label: '普通操作' },
    { kind: 'medium', label: '中等操作' },
    { kind: 'difficult', label: '困难操作' },
  ]
  return (
    <div className="clinical-skill-columns">
      {groups.map((group) => (
        <div className="clinical-skill-column" key={group.kind}>
          <h3>{group.label}</h3>
          {CLINICAL_SKILLS.filter((skill) => skill.kind === group.kind).map((skill) => (
            <div key={skill.id} className="clinical-skill-row">
              <span>{skill.name}</span>
              <strong>Lv{skills[skill.id]?.level ?? 0} · {skillLevelLabel(skills[skill.id]?.level ?? 0)}</strong>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

interface ClinicalSceneDef {
  art: 'commute' | 'handover' | 'round' | 'lecture' | 'lunch' | 'nap' | 'skills' | 'records' | 'escape' | 'free'
  text: string
}

function sceneForBlock(block: ClinicalBlock | null): ClinicalSceneDef {
  const title = block?.title ?? ''
  if (title.includes('通勤')) {
    return { art: 'commute', text: '早高峰的地铁里，你抓着扶手，脑子里还在过昨晚没看完的病程。车窗外的城市一站一站退后。' }
  }
  if (title.includes('更衣') || title.includes('准备交班')) {
    return { art: 'handover', text: '更衣室里有消毒水和洗衣液混在一起的味道。你把胸牌别正，深吸一口气，准备开始今天的班。' }
  }
  if (title.includes('预查房')) {
    return { art: 'records', text: '电脑屏幕一排排亮着。你点开自己负责的床位，把夜间新出的化验和护理记录一条条看过去，在纸上记下待会要汇报的重点。' }
  }
  if (title.includes('查房') || title.includes('交班')) {
    return { art: 'round', text: '带教走在前面，白大褂的下摆扫过病房门口。你抱着病历夹跟在后面，努力让自己的汇报声听起来稳一点。' }
  }
  if (title.includes('讲课') || title.includes('病例讨论') || title.includes('教学')) {
    return { art: 'lecture', text: '示教室的投影亮起来，带教在白板上画下一个又一个箭头。你一边记，一边发现昨晚背过的鉴别诊断终于连成了一条线。' }
  }
  if (title.includes('午饭')) {
    return { art: 'lunch', text: '食堂的窗口排着长队。你端着餐盘找了个角落坐下，吃到一半，手机群里又弹出一条新消息。' }
  }
  if (title.includes('午休')) {
    return { art: 'nap', text: '值班室的灯关了一半。你靠在椅背上闭了会儿眼，走廊里推车的轮子声从很远的地方经过。' }
  }
  if (title.includes('操作') || title.includes('手术')) {
    return { art: 'skills', text: '带教把手套和器械摆到你面前：“先看我做一遍，下一次你来。”你把手放在台下，悄悄跟着比划。' }
  }
  if (title.includes('机动') || title.includes('收尾') || title.includes('写病历')) {
    return { art: 'records', text: '病房暂时安静下来。你回到示教室，把今天的病程和待办一条条补上，偶尔抬头看一眼时间。' }
  }
  return { art: 'free', text: '你在病房和走廊之间来回，消毒水、脚步声和呼叫铃填满了这段空白。' }
}

function ClinicalSceneArt({ art }: { art: ClinicalSceneDef['art'] }) {
  const paths: Record<ClinicalSceneDef['art'], React.ReactNode> = {
    commute: <><path d="M8 72h84M16 72V38l30-16 30 16v34M46 38h20M58 22v16M30 52h40" /><circle cx="30" cy="78" r="4" /><circle cx="70" cy="78" r="4" /></>,
    handover: <><rect x="20" y="22" width="44" height="56" rx="3" /><path d="M32 22v-6h20v6M30 40h24M30 52h18M30 64h22" /><path d="M72 34h20v40H72M78 46h8M78 56h8" /></>,
    round: <><path d="M12 48h42v28H12zM54 56h34M74 56v20M28 48V34h14v14M31 34v-8h8v8" /><circle cx="34" cy="76" r="4" /><circle cx="66" cy="76" r="4" /><path d="M72 30v12M76 36h-8" /></>,
    lecture: <><rect x="18" y="18" width="74" height="46" rx="2" /><path d="M28 32h34M28 42h25M28 52h30M58 66v10h16M48 66h36" /><path d="M72 32l8 4-8 4z" /></>,
    lunch: <><path d="M20 46h52c0 18-10 26-26 26S20 64 20 46zM30 38c4-8 8-8 12-2M48 34c4-8 8-8 12-2M76 34v34M82 34v34" /><path d="M88 50c8 0 8 12 0 12" /></>,
    nap: <><path d="M16 58h52v18H16zM16 58V42h14v16M68 58V44h14v14" /><path d="M82 26h14M79 34h17M76 42h20M88 26l-8 16M94 26l-8 16" /></>,
    skills: <><path d="M18 34c10-8 20-8 30 0M18 62c10-8 20-8 30 0M52 34h28v28H52zM58 48h16M66 40v16" /><path d="M86 34v28M92 34v28M78 48h20" /></>,
    records: <><path d="M22 20h42v60H22zM32 30h22M32 42h22M32 54h16M68 30h22v50H68zM76 40h8M76 50h8M76 60h8" /><path d="M30 72l6 6 10-12" /></>,
    escape: <><path d="M16 30h34v48H16zM50 38h34v40H50zM58 54h18M58 64h12" /><path d="M84 24h14v56H84M92 52h6" /><circle cx="88" cy="54" r="2" /></>,
    free: <><path d="M20 20h70v58H20zM30 32h50M30 44h34M30 56h44M52 78v8M32 86h40" /><path d="M78 32l8 8-8 8" /></>,
  }
  return (
    <svg className={`clinical-scene-art art-${art}`} viewBox="0 0 120 96" aria-hidden="true">
      {paths[art]}
    </svg>
  )
}


function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setShown(text.slice(0, index))
      if (index >= text.length) window.clearInterval(timer)
    }, 26)
    return () => window.clearInterval(timer)
  }, [text])
  return (
    <span className="clinical-typewriter">
      {shown}
      {shown.length < text.length && <i aria-hidden="true" />}
    </span>
  )
}

function ClinicalModalPortal({ children }: { children: ReactNode }) {
  return createPortal(<>{children}</>, document.body)
}

export function ClinicalScreen({
  state,
  onUpdateClinical,
  onFinishSeason,
  onGameEffect,
  onTitle,
  onOpenWhoAmI,
  onOpenTA,
  onDrinkCoffee,
  onEatBreakfast,
  onDailySelfCare,
  onClinicalEveningAction,
}: ClinicalScreenProps) {
  const [clinical, setClinical] = useState<ClinicalState>(
    () => state.clinical ?? createClinicalState(state.season.courses),
  )
  const [day, setDay] = useState<ClinicalDayState | null>(clinical.currentDay)
  const [escapeSetup, setEscapeSetup] = useState(false)
  const [escapePurpose, setEscapePurpose] = useState<'study' | 'exam' | 'rest'>('exam')
  const [escapeHideout, setEscapeHideout] = useState(ESCAPE_HIDEOUTS[0].id)
  const [escapeDelegate, setEscapeDelegate] = useState<string | null>(null)
  const [escapeEvent, setEscapeEvent] = useState<EscapeEvent | null>(null)
  const [question, setQuestion] = useState<ClinicalQuestionDef | null>(null)
  const [questionPressure, setQuestionPressure] = useState(false)
  const [pressureFading, setPressureFading] = useState(false)
  const [scoldAnimation, setScoldAnimation] = useState(false)
  const [task, setTask] = useState<ClinicalTaskDef | null>(null)
  const [taskResult, setTaskResult] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [questionResult, setQuestionResult] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [speed, setSpeed] = useState<1 | 2 | 4 | 8>(1)
  const [timeJump, setTimeJump] = useState<string | null>(null)
  const [suspicionWarning, setSuspicionWarning] = useState(false)
  const [morning, setMorning] = useState<MorningState | null>(null)
  const [lateScolding, setLateScolding] = useState<string | null>(null)
  const [lateScoldingSeen, setLateScoldingSeen] = useState(false)
  const [clinicalTab, setClinicalTab] = useState<'day' | 'skills' | 'chat'>('day')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatUnread, setChatUnread] = useState(0)
  const [chatMentions, setChatMentions] = useState(0)
  const [chatMessages, setChatMessages] = useState<ClinicalChatMessage[]>([])
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null)
  const [nurseTodo, setNurseTodo] = useState<ClinicalTodo | null>(null)
  const [escapeTodo, setEscapeTodo] = useState<ClinicalTodo | null>(null)
  const escalatedTodosRef = useRef<Set<string>>(new Set())
  const deferredTodoMessagesRef = useRef<ClinicalChatMessage[]>([])
  const previousBlockKindRef = useRef<string | null>(null)
  const blockNoticeTimerRef = useRef<number | null>(null)
  const blockTransitionTimerRef = useRef<number | null>(null)
  const questionPressureTimerRef = useRef<number | null>(null)
  const questionPressureRef = useRef(false)
  const recordWarningShownRef = useRef(false)
  const lunchKnownTodoIdsRef = useRef<Set<string>>(new Set())
  const lunchForcedRef = useRef(false)
  const lunchAngryTimerRef = useRef<number | null>(null)
  const admissionFallbackRef = useRef(false)
  const admissionArrivalsSentRef = useRef(0)
  const admissionsForcedRef = useRef(false)
  const autoSpeedRef = useRef(false)
  const pressureFadeTimerRef = useRef<number | null>(null)
  const scoldAnimationTimerRef = useRef<number | null>(null)
  const idleDecayRef = useRef(0)
  const [escortPlan, setEscortPlan] = useState<{ total: number; ct: number; mri: number; ultrasound: number } | null>(null)
  const [escortNoticed, setEscortNoticed] = useState(false)
  const [overtimeOpen, setOvertimeOpen] = useState(false)
  const [overtime, setOvertime] = useState(false)
  const [overtimeMinutes, setOvertimeMinutes] = useState(0)
  const [overtimeSettlement, setOvertimeSettlement] = useState<string | null>(null)
  const [eveningAction, setEveningAction] = useState<string | null>(null)
  const [recordWarning, setRecordWarning] = useState<string | null>(null)
  const [lunchPhase, setLunchPhase] = useState<'none' | 'eating' | 'napPrompt' | 'napping' | 'declined' | 'done'>('none')
  const [lunchStartClock, setLunchStartClock] = useState(0)
  const [napStartClock, setNapStartClock] = useState(0)
  const [lunchLateNotice, setLunchLateNotice] = useState<string | null>(null)
  const [lunchAngry, setLunchAngry] = useState(false)
  const [nurseChatMessage, setNurseChatMessage] = useState<ClinicalChatMessage | null>(null)
  const [blockNotice, setBlockNotice] = useState<string | null>(null)
  const [blockTransition, setBlockTransition] = useState(false)
  const chatOpenRef = useRef(false)
  const chatListRef = useRef<HTMLDivElement | null>(null)
  const scheduledChatsRef = useRef<ScheduledChatEvent[]>([])
  const whereAskedRef = useRef(false)
  const chatCounterRef = useRef(0)
  chatOpenRef.current = chatOpen
  const dayClockRef = useRef(0)
  dayClockRef.current = day?.clock ?? 0
  const holdActionRef = useRef<ClinicalDayState['holdAction']>(null)
  const suspicionRef = useRef(0)
  const escapeRef = useRef(false)
  const watchProbabilityRef = useRef(0)
  const watchActiveRef = useRef(false)
  const watchStartedAtRef = useRef(0)
  const lastWatchRollRef = useRef(0)
  const watchPausedAtRef = useRef(0)
  holdActionRef.current = day?.holdAction ?? null
  suspicionRef.current = day?.suspicion ?? 0
  escapeRef.current = Boolean(day?.escape)
  const skillGainRef = useRef<Record<string, number>>({})

  const clinicalPaused = clinicalTab !== 'day' || chatOpen
  const course = currentClinicalCourse(clinical)
  const dayCount = course?.clinicalDays ?? 0
  const skillRowsList = useMemo(() => skillRows(clinical.skills), [clinical.skills])
  const currentBlock = day && course ? blockAt(course, day.clock) : null
  const earliestTodoMinute = (() => {
    if (!course) return 60
    const blocks = scheduleFor(course)
    const roundEnd = Math.max(
      60,
      ...blocks
        .filter((block) => block.kind === 'fixed' && (block.title.includes('查房') || block.title.includes('交班')))
        .map((block) => block.end),
    )
    const freeAfterRounds = blocks
      .filter((block) => block.kind === 'free' && block.start >= roundEnd)
      .sort((a, b) => a.start - b.start)[0]
    return freeAfterRounds?.start ?? roundEnd
  })()
  const canCreateTodoNow = Boolean(
    day && currentBlock?.kind === 'free' && day.clock >= earliestTodoMinute,
  )
  const pendingTodos = (clinical.todos ?? []).filter((todo) => todo.status === 'pending')
  const pendingTodoTaskIds = pendingTodos.map((todo) =>
    todo.kind === 'admission' ? 'admission' : todo.kind === 'ecg' ? 'ecg' : 'accompany',
  )
  const deferredChatCount = chatMessages.filter((message) => message.todoDeferred).length
  const clockPaused =
    clinical.mode !== 'day' ||
    !day ||
    Boolean(morning) ||
    Boolean(day.currentTaskId || day.currentQuestionId || day.fixedPromptId) ||
    Boolean(escapeEvent) ||
    Boolean(taskResult || questionResult || escapeSetup || task || lateScolding || nurseTodo || escapeTodo || clinicalPaused || questionPressure || scoldAnimation || recordWarning || overtimeSettlement || blockTransition || lunchPhase === 'eating' || lunchPhase === 'napping' || lunchPhase === 'napPrompt' || lunchAngry || nurseChatMessage)
  const clockPausedRef = useRef(clockPaused)
  const pendingTodoTaskIdsRef = useRef<string[]>(pendingTodoTaskIds)
  clockPausedRef.current = clockPaused
  pendingTodoTaskIdsRef.current = pendingTodoTaskIds
  const todoLocked = Boolean(day && !day.escape && currentBlock?.kind === 'fixed')
  const clinicalDailyKey = course ? `clinical-${course.courseId}-${clinical.dayIndex}` : ''
  const coffeeCost = consumptionCoffeeCost(state, state.habits.includes('ledger') ? 5 : 10)
  const selfCareCost = consumptionSelfCareCost(state, state.habits.includes('ledger') ? 15 : 30)
  const coffeeUsedToday = state.coffeeDayKey === clinicalDailyKey
  const selfCareCountToday = state.selfCareDayKey === clinicalDailyKey ? (state.selfCareDayCount ?? 0) : 0
  const breakfastUsedToday = state.breakfastDayKey === clinicalDailyKey
  const breakfastEligible = morning ? morning.arrivalClock < 50 : Boolean(day?.arrivedBefore750)

  const persistClinical = (next: ClinicalState) => {
    setClinical(next)
    onUpdateClinical(next)
  }

  const updateDay = (patch: Partial<ClinicalDayState>) => {
    setDay((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const openTodoTask = (todo: ClinicalTodo, force = false) => {
    if (todoLocked && !force) return
    const taskDef = CLINICAL_TASK_BY_ID[todo.taskId]
    if (!taskDef) return
    if (morning && morning.clock < 55 && taskDef.duration > 55 - morning.clock) {
      setTaskResult(`现在离 07:55 只剩 ${Math.max(0, 55 - morning.clock)} 分钟，来不及完成「${todo.title}」。先去做别的，或者等下班。`)
      return
    }
    const currentProgresses = day?.holdProgresses ?? { phone: 0, exam: 0, study: 0, nap: 0 }
    updateDay({
      holdAction: null,
      holdProgresses: {
        phone: Math.max(0, (currentProgresses.phone ?? 0) - 5),
        exam: Math.max(0, (currentProgresses.exam ?? 0) - 5),
        study: Math.max(0, (currentProgresses.study ?? 0) - 5),
        nap: Math.max(0, (currentProgresses.nap ?? 0) - 5),
      },
    })
    setActiveTodoId(todo.id)
    setTask(formatClinicalTaskForDay(taskDef, day?.dayIndex ?? clinical.dayIndex))
    setNurseTodo(null)
  }

  const delegateTodo = (todo: ClinicalTodo, friendName: string) => {
    const next: ClinicalState = {
      ...clinical,
      todos: (clinical.todos ?? []).map((item) =>
        item.id === todo.id ? { ...item, status: 'delegated' as const } : item,
      ),
    }
    persistClinical(next)
    updateDay({ dayLog: [...(day?.dayLog ?? []), `委托${friendName}帮忙处理：${todo.title}，欠下一次人情。`] })
    setEscapeTodo(null)
  }

  const returnForTodo = () => {
    const todo = escapeTodo
    if (!todo) return
    endEscape()
    setEscapeTodo(null)
    setNurseTodo(todo)
  }

  const askTeacherQuestion = () => {
    if (!course || questionPressureRef.current) return
    questionPressureRef.current = true
    watchActiveRef.current = false
    watchProbabilityRef.current = 0
    setSuspicionWarning(false)
    setQuestionPressure(true)
    onGameEffect({ stress: 5, energy: -5 })
    updateDay({
      holdAction: null,
      suspicion: 0,
      dayLog: [...(day?.dayLog ?? []), '提问风险满值，主任盯上了你。'],
    })
    if (questionPressureTimerRef.current) window.clearTimeout(questionPressureTimerRef.current)
    questionPressureTimerRef.current = window.setTimeout(() => {
      if (!course) return
      const nextQuestion = shuffledQuestion(randomQuestionFor(course))
      questionPressureRef.current = false
      updateDay({ currentQuestionId: nextQuestion.id })
      setQuestion(nextQuestion)
    }, 3000)
  }


  const beginDay = () => {
    if (!course) return
    const nextDay = createDayState(course, clinical.dayIndex)
    const next = {
      ...clinical,
      mode: 'day' as const,
      currentDay: nextDay,
      lastDaySummary: null,
    }
    setDay(nextDay)
    setMorning({
      phase: 'alarm',
      clock: 0,
      startEnergy: state.energy,
      commuteElapsed: 0,
      commuteBoost: 0,
      elevatorWait: 0,
      snoozes: 0,
      lastSnooze: 0,
      energyGain: 0,
      arrivalClock: 0,
    })
    persistClinical(next)
    skillGainRef.current = {}
    setLateScolding(null)
    setLateScoldingSeen(false)
    if (questionPressureTimerRef.current) window.clearTimeout(questionPressureTimerRef.current)
    questionPressureRef.current = false
    if (pressureFadeTimerRef.current) window.clearTimeout(pressureFadeTimerRef.current)
    setPressureFading(false)
    setQuestionPressure(false)
    if (scoldAnimationTimerRef.current) window.clearTimeout(scoldAnimationTimerRef.current)
    setScoldAnimation(false)
    setSuspicionWarning(false)
    deferredTodoMessagesRef.current = []
    watchProbabilityRef.current = 0
    watchActiveRef.current = false
    watchStartedAtRef.current = 0
    lastWatchRollRef.current = 0
    const total = Math.floor(Math.random() * 4)
    let ct = Math.floor(Math.random() * (total + 1))
    let mri = Math.floor(Math.random() * (total - ct + 1))
    const ultrasound = total - ct - mri
    const plan = { total, ct, mri, ultrasound }
    setEscortPlan(plan)
    setEscortNoticed(false)
    setOvertimeOpen(false)
    setOvertime(false)
    setOvertimeMinutes(0)
    setOvertimeSettlement(null)
    setEveningAction(null)
    setRecordWarning(null)
    recordWarningShownRef.current = false
    setLunchPhase('none')
    setLunchStartClock(0)
    setNapStartClock(0)
    setLunchLateNotice(null)
    if (lunchAngryTimerRef.current) window.clearTimeout(lunchAngryTimerRef.current)
    setLunchAngry(false)
    setNurseChatMessage(null)
    admissionFallbackRef.current = false
    admissionArrivalsSentRef.current = 0
    admissionsForcedRef.current = false
    lunchKnownTodoIdsRef.current = new Set()
    lunchForcedRef.current = false
    if (blockTransitionTimerRef.current) window.clearTimeout(blockTransitionTimerRef.current)
    setBlockTransition(false)
    scheduledChatsRef.current = createScheduledChats(
      course,
      nextDay.tasks.expectedAdmissions,
      0,
      Math.random() < 0.1,
    )
    whereAskedRef.current = false
    setChatOpen(false)
    setChatUnread(0)
    setChatMentions(0)
    setChatMessages([])
  }

  const wakeUp = () => {
    if (!morning || morning.phase !== 'alarm') return
    const energyGain = Math.floor(morning.clock / 5) * 2
    if (energyGain > 0) onGameEffect({ energy: energyGain })
    setMorning({ ...morning, phase: 'commute', energyGain })
  }

  const snoozeAlarm = () => {
    setMorning((prev) => {
      if (!prev || prev.phase !== 'alarm') return prev
      // 大多数时候会睡过头 20–30 分钟；偶尔只是拖到下一次 5 分钟闹铃。
      const oversleep = Math.random() < oversleepChance(prev.startEnergy)
      const extra = oversleep ? 20 + Math.floor(Math.random() * 11) : 5
      const nextAlarm = Math.ceil((prev.clock + extra) / 5) * 5
      return {
        ...prev,
        clock: nextAlarm,
        snoozes: prev.snoozes + 1,
        lastSnooze: nextAlarm - prev.clock,
      }
    })
  }

  // 2 秒内不决定，自动选择赖床。
  useEffect(() => {
    if (!morning || morning.phase !== 'alarm') return
    const timer = window.setTimeout(() => snoozeAlarm(), 2000)
    return () => window.clearTimeout(timer)
  }, [morning?.phase, morning?.clock])

  const rushCommute = () => {
    setMorning((prev) =>
      prev && prev.phase === 'commute'
        ? { ...prev, commuteBoost: Math.min(7, prev.commuteBoost + 0.5) }
        : prev,
    )
  }

  // 通勤进度自动推进；快跑点击额外增加进度，最多节省 7 分钟。
  useEffect(() => {
    if (!morning || morning.phase !== 'commute') return
    const timer = window.setInterval(() => {
      setMorning((prev) => {
        if (!prev || prev.phase !== 'commute') return prev
        const elapsed = prev.commuteElapsed + 1
        const total = elapsed + prev.commuteBoost
        if (total >= 20) {
          return {
            ...prev,
            phase: 'elevator',
            clock: prev.clock + elapsed,
            commuteElapsed: elapsed,
            elevatorWait: 3 + Math.floor(Math.random() * 8),
          }
        }
        return { ...prev, commuteElapsed: elapsed }
      })
    }, 250)
    return () => window.clearInterval(timer)
  }, [morning?.phase])

  const leaveElevator = () => {
    setMorning((prev) => {
      if (!prev || prev.phase !== 'elevator') return prev
      const arrived = prev.clock + prev.elevatorWait + 5
      return { ...prev, phase: 'dressing', clock: arrived, arrivalClock: arrived }
    })
  }

  const finishMorning = () => {
    if (!day || !morning) return
    const late = morning.clock > 60
    const startClock = late ? Math.max(60, morning.clock) : 60
    const nextDay: ClinicalDayState = {
      ...day,
      clock: startClock,
      phaseId: 'preround',
      suspicionBlockId: 'preround',
      attendedBlocks: ['commute', 'prep'],
      lateArrival: late,
      arrivedBefore750: morning.arrivalClock < 50,
      dayLog: [
        ...day.dayLog,
        `早上 07:00 起床，${morning.snoozes > 0 ? `赖床 ${morning.snoozes} 次，` : ''}通勤到医院并完成更衣。`,
      ],
    }
    let nextClinical = clinical
    if (late) {
      nextDay.dayLog.push(`你到科室时已经 ${formatClock(morning.clock)}，被判定为迟到。`)
      onGameEffect({ stress: 5 })
      nextClinical = {
        ...clinical,
        recognition: Math.max(0, clinical.recognition - 5),
      }
    }
    setDay(nextDay)
    setMorning(null)
    persistClinical({ ...nextClinical, currentDay: nextDay })
  }

  const finishDay = () => {
    if (!day || !course || finishing) return
    setFinishing(true)
    const escapedMinutes = day.escape
      ? Math.max(0, day.clock - day.escape.startedClock)
      : 0
    const carryOverTodos = (clinical.todos ?? []).filter(
      (todo) => todo.status === 'pending' && !todo.urgent,
    )
    const todoPenalty = Math.min(10, carryOverTodos.length * 2)
    let nextClinical: ClinicalState = {
      ...clinical,
      mode: 'summary',
      currentDay: null,
      dayIndex: day.dayIndex,
      recognition: Math.max(0, clinical.recognition - todoPenalty),
      escapeMinutes: clinical.escapeMinutes + escapedMinutes,
      lastDaySummary: {
        title: `${course.department} · 第 ${day.dayIndex + 1} / ${course.clinicalDays} 天`,
        lines: [
          ...day.dayLog,
          escapedMinutes > 0 ? `今天逃离临床 ${Math.round(escapedMinutes / 60 * 10) / 10} 小时。` : '今天一直在岗。',
          carryOverTodos.length > 0
            ? `有 ${carryOverTodos.length} 项普通待办未完成，顺延到明天，科室认可度 -${todoPenalty}。`
            : '今日待办全部处理完毕。',
        ],
        skills: Object.entries(skillGainRef.current).map(([skillId, gained]) => ({
          skillId: skillId as ClinicalSkillId,
          gained,
        })),
        recognition: day.recognition,
        escapeMinutes: escapedMinutes,
      },
    }
    if (day.escape && escapedMinutes > 0) {
      const units = Math.max(1, Math.round(escapedMinutes / 30))
      if (day.escape.purpose === 'study') {
        onGameEffect({ kaoyanPrep: 0.2 * units, stress: -1 })
      } else if (day.escape.purpose === 'exam') {
        onGameEffect({ courseId: course.courseId, coursePrep: 0.2 * units, stress: -1 })
      } else {
        onGameEffect({ stress: -5, energy: 8 })
      }
    }
    if (day.escape?.safeLeave) {
      nextClinical = { ...nextClinical, recognition: Math.min(100, nextClinical.recognition + 2) }
    }
    persistClinical(nextClinical)
    setFinishing(false)
  }

  // 医院日时钟：独立计时，不被其他界面状态的重渲染重置。
  useEffect(() => {
    if (clinical.mode !== 'day' || morning) return
    const timer = window.setInterval(() => {
      if (clockPausedRef.current) return
      setDay((prev) => {
        if (!prev || prev.clock >= 600) return prev
        const clock = Math.min(600, prev.clock + 1)
        const next = { ...prev, clock }
        if (course) {
          const block = blockAt(course, clock)
          if (block && block.id !== prev.suspicionBlockId) {
            next.suspicionBlockId = block.id
            next.suspicion = 0
            next.holdAction = null
          }
        }
        if (!prev.escape && course) {
          const block = blockAt(course, clock)
          if (
            block?.kind === 'fixed' &&
            !prev.attendedBlocks.includes(block.id) &&
            !prev.fixedPromptId
          ) {
            next.fixedPromptId = block.id
            next.holdAction = null
          }
          if (block?.kind === 'free' && !prev.currentTaskId && Math.random() < 0.035) {
            const nextTask = randomTaskFor(course, pendingTodoTaskIdsRef.current)
            next.currentTaskId = nextTask.id
          }
        }
        if (prev.escape) {
          const risk = Math.min(100, prev.escape.risk + 0.12 + Math.random() * 0.28)
          next.escape = { ...prev.escape, risk }
          if (risk >= 100) {
            setEscapeEvent(ESCAPE_EVENTS.find((event) => event.id === 'caught') ?? null)
          } else if (Math.random() < 0.018) {
            const hideout = prev.escape.hideout
            const available = ESCAPE_EVENTS.filter(
              (event) =>
                event.id !== 'caught' &&
                (!event.hideouts || event.hideouts.includes(hideout)),
            )
            if (available.length > 0) {
              setEscapeEvent(available[Math.floor(Math.random() * available.length)])
            }
          }
        }
        return next
      })
    }, Math.round(480 / speed))
    return () => window.clearInterval(timer)
  }, [clinical.mode, speed, morning, course?.courseId])

  // 任务 id 写入 day 后，再由这里装载任务弹窗内容，避免在状态更新函数里制造副作用。
  useEffect(() => {
    if (!day?.currentTaskId || task) return
    const nextTask = CLINICAL_TASK_BY_ID[day.currentTaskId]
    if (nextTask) setTask(formatClinicalTaskForDay(nextTask, day.dayIndex))
  }, [day?.currentTaskId, day?.dayIndex, task])

  const appendChatMessage = (
    message: Omit<ClinicalChatMessage, 'id' | 'time'> & { time?: string },
    incrementUnread = true,
  ) => {
    const id = `chat-${Date.now()}-${chatCounterRef.current++}`
    const time = message.time ?? formatClock(dayClockRef.current)
    setChatMessages((prev) => [...prev, { ...message, id, time }].slice(-40))
    if (incrementUnread && !chatOpenRef.current) {
      setChatUnread((count) => count + 1)
    }
    if (message.text.includes('@你')) {
      setChatMentions((count) => count + 1)
    }
  }

  const scheduleResidentReply = () => {
    const sender = Math.random() < 0.5 ? '规培师兄' : '规培师姐'
    window.setTimeout(() => {
      appendChatMessage({ sender, text: residentReplyText() })
    }, 2600)
  }

  const respondToChat = (messageId: string) => {
    setChatMessages((prev) => {
      const target = prev.find((message) => message.id === messageId)
      if (!target || target.responded) return prev
      const next = prev.map((message) =>
        message.id === messageId ? { ...message, responded: true } : message,
      )
      return [
        ...next,
        {
          id: `chat-${Date.now()}-${chatCounterRef.current++}`,
          sender: '你',
          text: '收到',
          time: formatClock(dayClockRef.current),
        },
      ]
    })
  }

  // 群聊：每 10–20 秒随机出现一条无需玩家回应的消息；护士 @管床医生 后规培几秒后回一句。
  useEffect(() => {
    if (clinical.mode !== 'day' || morning) return
    let timer = 0
    const scheduleNext = () => {
      timer = window.setTimeout(() => {
        if (Math.random() < 0.56) {
          const text = nurseNoResponseText()
          appendChatMessage({ sender: '护士站', text })
          if (text.startsWith('@管床医生')) scheduleResidentReply()
        } else {
          const sender = Math.random() < 0.5 ? '规培师兄' : '规培师姐'
          appendChatMessage({ sender, text: residentNoResponseText() })
        }
        scheduleNext()
      }, 10000 + Math.random() * 10000)
    }
    scheduleNext()
    return () => window.clearTimeout(timer)
  }, [clinical.mode, morning])

  // 需要玩家回应的定时消息：新病人、陪检、临时小讲课。
  useEffect(() => {
    if (clinical.mode !== 'day' || morning || !day) return
    const due = scheduledChatsRef.current.filter((event) => event.at <= day.clock)
    if (due.length === 0) return
    scheduledChatsRef.current = scheduledChatsRef.current.filter(
      (event) => event.at > day.clock,
    )
    due.forEach((event) => {
      const time = formatClock(event.at)
      if (event.kind === 'admission') {
        admissionArrivalsSentRef.current += 1
        appendChatMessage({ sender: '护士站', text: '@你，新病人来了，在护士站', time, clock: event.at, requiresResponse: true, todo: { kind: 'admission', bed: event.bed } })
        appendChatMessage({ sender: '护士站', text: '@你，新病人心电图记得拉', time, clock: event.at, requiresResponse: true, todo: { kind: 'ecg', bed: event.bed } })
      } else if (event.kind === 'escort') {
        appendChatMessage({ sender: '护士站', text: `@你，工人来了，${event.bed} 床的检查可以去陪了`, time, clock: event.at, requiresResponse: true, todo: { kind: 'escort', bed: event.bed } })
      } else if (event.kind === 'lecture') {
        appendChatMessage({ sender: '带教', text: '@你，来示教室，临时开个小讲课', time, requiresResponse: true })
      }
    })
  }, [clinical.mode, morning, day?.clock])

  // 新病人数量必须有对应的护士 @ 消息；如果全天定时事件结束仍未出现，补一条。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day || morning || !course) return
    if (admissionFallbackRef.current || day.tasks.expectedAdmissions <= 0) return
    if (day.clock < earliestTodoMinute) return
    if (chatMessages.some((message) => message.todo?.kind === 'admission')) return
    if (scheduledChatsRef.current.some((event) => event.kind === 'admission')) return
    admissionFallbackRef.current = true
    admissionArrivalsSentRef.current += 1
    const bed = randomBedNumber()
    appendChatMessage({ sender: '护士站', text: '@你，新病人来了，在护士站', clock: day.clock, requiresResponse: true, todo: { kind: 'admission', bed } })
    appendChatMessage({ sender: '护士站', text: '@你，新病人心电图记得拉', clock: day.clock, requiresResponse: true, todo: { kind: 'ecg', bed } })
  }, [clinical.mode, day?.clock, day?.tasks.expectedAdmissions, morning, course, chatMessages])

  // 护士 @你 超过 30 分钟未查看，会来办公室提醒。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day || morning || nurseChatMessage) return
    const overdue = chatMessages.find(
      (message) =>
        message.sender === '护士站' &&
        message.todo &&
        !message.read &&
        !message.nurseVisitHandled &&
        typeof message.clock === 'number' &&
        day.clock >= message.clock + 30,
    )
    if (overdue) setNurseChatMessage(overdue)
  }, [clinical.mode, day?.clock, morning, chatMessages, nurseChatMessage])

  // 16:00 保证今日预计入院的患者都有对应待办，不再依赖群里是否点开。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day || morning || !course) return
    if (day.clock < 540 || admissionsForcedRef.current) return
    admissionsForcedRef.current = true
    scheduledChatsRef.current = scheduledChatsRef.current.filter((event) => event.kind !== 'admission')
    const expected = day.tasks.expectedAdmissions
    const admissionMessages = chatMessages.filter(
      (message) => message.sender === '护士站' && message.todo?.kind === 'admission',
    )
    const existingTodos = clinical.todos ?? []
    const additions: ClinicalTodo[] = []
    const markReadIds = new Set<string>()
    admissionMessages.forEach((message) => {
      const bed = message.todo?.bed ?? randomBedNumber()
      const admissionId = `todo-${message.id}`
      if (!existingTodos.some((todo) => todo.id === admissionId)) {
        additions.push({
          id: admissionId,
          kind: 'admission',
          title: `收病人 · ${bed} 床`,
          bed,
          taskId: 'admission',
          courseId: course.courseId,
          dayIndex: day.dayIndex,
          createdAtClock: day.clock,
          dueAtClock: null,
          urgent: false,
          status: 'pending',
        })
      }
      const ecgMessage = chatMessages.find(
        (item) => item.todo?.kind === 'ecg' && item.todo.bed === bed,
      )
      const ecgId = `todo-${ecgMessage?.id ?? `ecg-${message.id}`}`
      if (!existingTodos.some((todo) => todo.id === ecgId)) {
        additions.push({
          id: ecgId,
          kind: 'ecg',
          title: `拉心电图 · ${bed} 床`,
          bed,
          taskId: 'ecg',
          courseId: course.courseId,
          dayIndex: day.dayIndex,
          createdAtClock: day.clock,
          dueAtClock: null,
          urgent: false,
          status: 'pending',
        })
      }
      markReadIds.add(message.id)
    })
    const represented = Math.max(admissionArrivalsSentRef.current, admissionMessages.length)
    const missing = Math.max(0, expected - represented)
    for (let index = 0; index < missing; index += 1) {
      const bed = randomBedNumber()
      const key = `${day.dayIndex}-${day.clock}-${index}-${bed}`
      additions.push({
        id: `todo-late-admission-${key}`,
        kind: 'admission',
        title: `收病人 · ${bed} 床`,
        bed,
        taskId: 'admission',
        courseId: course.courseId,
        dayIndex: day.dayIndex,
        createdAtClock: day.clock,
        dueAtClock: null,
        urgent: false,
        status: 'pending',
      })
      additions.push({
        id: `todo-late-ecg-${key}`,
        kind: 'ecg',
        title: `拉心电图 · ${bed} 床`,
        bed,
        taskId: 'ecg',
        courseId: course.courseId,
        dayIndex: day.dayIndex,
        createdAtClock: day.clock,
        dueAtClock: null,
        urgent: false,
        status: 'pending',
      })
    }
    if (additions.length > 0) {
      persistClinical({ ...clinical, todos: [...existingTodos, ...additions] })
    }
    if (markReadIds.size > 0) {
      setChatMessages((prev) => prev.map((message) =>
        markReadIds.has(message.id)
          ? { ...message, read: true, nurseVisitHandled: true, requiresResponse: false }
          : message,
      ))
    }
    setBlockNotice(`16:00 · 今日预计入院 ${expected} 人已全部到院，相关收病人/心电图任务已加入待办。`)
    if (blockNoticeTimerRef.current) window.clearTimeout(blockNoticeTimerRef.current)
    blockNoticeTimerRef.current = window.setTimeout(() => setBlockNotice(null), 5000)
  }, [clinical.mode, day?.clock, morning, course, chatMessages, clinical.todos])

  // “在哪呢”只在逃实习风险超过 80 时出现一次。
  useEffect(() => {
    if (clinical.mode !== 'day' || morning || !day || whereAskedRef.current) return
    const risky = (day.escape?.risk ?? 0) > 80
    if (!risky) return
    whereAskedRef.current = true
    appendChatMessage({
      sender: '带教',
      text: '@你，在哪呢？',
      requiresResponse: true,
    })
  }, [clinical.mode, morning, day?.escape?.risk])

  useEffect(() => {
    if (!chatOpen) return
    const frame = requestAnimationFrame(() => {
      const list = chatListRef.current
      if (list) list.scrollTop = list.scrollHeight
    })
    return () => cancelAnimationFrame(frame)
  }, [chatOpen, chatMessages.length])

  const todoFromMessage = (message: ClinicalChatMessage): ClinicalTodo | null => {
    if (!message.todo || !day) return null
    const { kind, bed } = message.todo
    const taskId = kind === 'admission' ? 'admission' : kind === 'ecg' ? 'ecg' : 'accompany'
    return {
      id: `todo-${message.id}`,
      kind,
      title: kind === 'admission' ? `收病人 · ${bed} 床` : kind === 'ecg' ? `拉心电图 · ${bed} 床` : `陪检查 · ${bed} 床`,
      bed,
      taskId,
      courseId: course?.courseId ?? '',
      dayIndex: day.dayIndex,
      createdAtClock: day.clock,
      dueAtClock: kind === 'escort' ? day.clock + 30 : null,
      urgent: kind === 'escort',
      status: 'pending',
    }
  }

  const resolveNurseChatMessage = (immediate: boolean) => {
    const message = nurseChatMessage
    if (!message || !day) return
    const baseTodo = todoFromMessage(message)
    const todo = baseTodo
      ? { ...baseTodo, dueAtClock: baseTodo.urgent ? day.clock + 30 : null }
      : null
    if (todo) {
      const exists = (clinical.todos ?? []).some((item) => item.id === todo.id)
      const nextTodos = exists ? (clinical.todos ?? []) : [...(clinical.todos ?? []), todo]
      persistClinical({ ...clinical, todos: nextTodos })
      if (immediate) {
        setActiveTodoId(todo.id)
        const taskDef = CLINICAL_TASK_BY_ID[todo.taskId]
        if (taskDef) setTask(formatClinicalTaskForDay(taskDef, day.dayIndex))
      }
    }
    setChatMessages((prev) => prev.map((item) =>
      item.id === message.id
        ? { ...item, read: true, nurseVisitHandled: true, requiresResponse: false }
        : item,
    ))
    setChatMentions((count) => Math.max(0, count - 1))
    setChatUnread((count) => Math.max(0, count - 1))
    setNurseChatMessage(null)
  }

  // 打开群聊后把消息标记为已读，并把护士 @你 的消息转成待办。
  useEffect(() => {
    if (!chatOpen || !day) return
    const unread = chatMessages.filter((message) => !message.read)
    if (unread.length === 0) return
    const additions: ClinicalTodo[] = []
    const deferredIds = new Set<string>()
    unread.forEach((message) => {
      if (!message.todo) return
      const existing = (clinical.todos ?? []).some((todo) => todo.id === `todo-${message.id}`)
      if (existing) return
      if (!canCreateTodoNow) {
        if (!deferredTodoMessagesRef.current.some((item) => item.id === message.id)) {
          deferredTodoMessagesRef.current.push(message)
          deferredIds.add(message.id)
        }
        return
      }
      const todo = todoFromMessage(message)
      if (todo) additions.push(todo)
    })
    if (additions.length > 0) {
      persistClinical({ ...clinical, todos: [...(clinical.todos ?? []), ...additions] })
    }
    setChatMessages((prev) =>
      prev.map((message) => {
        const next = message.read ? message : { ...message, read: true }
        return deferredIds.has(message.id) ? { ...next, todoDeferred: true } : next
      }),
    )
  }, [chatOpen, chatMessages, clinical.todos, day])

  // 只有自由时间、且已经查完房之后，待办才真正生成。
  useEffect(() => {
    if (!day || !course || !canCreateTodoNow || deferredTodoMessagesRef.current.length === 0) return
    const pending = deferredTodoMessagesRef.current
    deferredTodoMessagesRef.current = []
    const additions: ClinicalTodo[] = []
    pending.forEach((message) => {
      if (!message.todo) return
      if ((clinical.todos ?? []).some((todo) => todo.id === `todo-${message.id}`)) return
      const todo = todoFromMessage(message)
      if (todo) additions.push(todo)
    })
    if (additions.length > 0) {
      persistClinical({ ...clinical, todos: [...(clinical.todos ?? []), ...additions] })
    }
    const processedIds = new Set(pending.map((message) => message.id))
    setChatMessages((prev) =>
      prev.map((message) =>
        processedIds.has(message.id) ? { ...message, todoDeferred: false } : message,
      ),
    )
  }, [day?.clock, day?.dayIndex, currentBlock?.kind, clinical.todos, canCreateTodoNow])

  // 修复旧存档里异常偏大的陪检倒计时，新的陪检最多只显示 30 分钟。
  useEffect(() => {
    if (!day) return
    const needsClamp = (clinical.todos ?? []).some(
      (todo) =>
        todo.status === 'pending' &&
        todo.urgent &&
        todo.dayIndex === day.dayIndex &&
        todo.dueAtClock !== null &&
        todo.dueAtClock - day.clock > 30,
    )
    if (!needsClamp) return
    persistClinical({
      ...clinical,
      todos: (clinical.todos ?? []).map((todo) =>
        todo.status === 'pending' &&
        todo.urgent &&
        todo.dayIndex === day.dayIndex &&
        todo.dueAtClock !== null &&
        todo.dueAtClock - day.clock > 30
          ? { ...todo, dueAtClock: day.clock + 30 }
          : todo,
      ),
    })
  }, [day?.dayIndex, day?.clock, clinical.todos])

  // 紧急陪检超时：在院内直接叫护士来，逃实习则把风险拉到 80 并要求决策。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day || morning) return
    const pending = (clinical.todos ?? []).find((todo) => {
      if (!todo.urgent || todo.status !== 'pending' || escalatedTodosRef.current.has(todo.id)) return false
      if (todo.dayIndex < day.dayIndex) return true
      return todo.dayIndex === day.dayIndex && todo.dueAtClock !== null && day.clock >= todo.dueAtClock
    })
    if (!pending) return
    // 玩家正在参加固定事件时，先不打断，等固定事件结束后再处理。
    if (!day.escape && currentBlock?.kind === 'fixed') return
    escalatedTodosRef.current.add(pending.id)
    if (day.escape) {
      whereAskedRef.current = true
      updateDay({ escape: { ...day.escape, risk: 80 } })
      appendChatMessage({ sender: '带教', text: '@你，在哪呢？', requiresResponse: true })
      setEscapeTodo(pending)
    } else {
      setNurseTodo(pending)
    }
  }, [clinical.mode, morning, day?.clock, day?.escape, clinical.todos, currentBlock?.kind])

  // 到达 17:00：有待办时让玩家决定加班或直接下班。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day || day.clock < 600 || finishing || overtime) return
    if (overtimeOpen || task || taskResult || question) return
    const pending = (clinical.todos ?? []).filter((todo) => todo.status === 'pending')
    if (pending.length > 0) setOvertimeOpen(true)
    else finishDay()
  }, [clinical.mode, day?.clock, clinical.todos, finishing, overtime, overtimeOpen, task, taskResult, question])

  // 长按偷闲
  useEffect(() => {
    if (!day?.holdAction || day.currentTaskId || day.currentQuestionId || day.fixedPromptId || clinicalPaused) return
    const timer = window.setInterval(() => {
      setDay((prev) => {
        if (!prev || !prev.holdAction) return prev
        const action = prev.holdAction
        const progress = prev.holdProgresses?.[action] ?? 0
        const block = course ? blockAt(course, prev.clock + 1) : null
        const inFixedBlock = !prev.escape && block?.kind === 'fixed'
        // 1× 下各场景的填满时间；进度条每 100ms 更新一次。
        const fillSeconds = prev.escape
          ? { phone: 10, study: 12, exam: 15, nap: 17 }
          : inFixedBlock
            ? { phone: 5, study: 20, nap: 20, exam: 17 }
            : { phone: 10, study: 15, nap: 10, exam: 17 }
        const ticksToFill = (fillSeconds[action] ?? 10) * 10
        const nextProgress = Math.min(100, progress + (100 / ticksToFill) * speed)
        const progresses = {
          ...(prev.holdProgresses ?? { phone: 0, exam: 0, study: 0, nap: 0 }),
          [action]: nextProgress,
        }
        const next = { ...prev, holdProgresses: progresses }
        if (nextProgress >= 100) {
          next.holdProgresses = { ...progresses, [action]: 0 }
          if (action === 'phone') onGameEffect({ stress: -4 })
          else if (action === 'nap') onGameEffect({ energy: 4 })
          else if (action === 'exam') {
            if (course) onGameEffect({ courseId: course.courseId, coursePrep: 0.5 })
          }
          else onGameEffect({ kaoyanPrep: 0.5 })
        }
        return next
      })

    }, 100)
    return () => window.clearInterval(timer)
  }, [day?.holdAction, day?.currentTaskId, day?.currentQuestionId, day?.fixedPromptId, day?.escape, course, speed, clinicalPaused])

  // 打开群聊时暂停游戏时间；如果主任正在看，注视计时也一起暂停。
  useEffect(() => {
    if (clinicalPaused) {
      watchPausedAtRef.current = Date.now()
      return
    }
    if (watchPausedAtRef.current > 0) {
      const pausedFor = Date.now() - watchPausedAtRef.current
      if (watchActiveRef.current) watchStartedAtRef.current += pausedFor
      lastWatchRollRef.current = Date.now()
      watchPausedAtRef.current = 0
    }
  }, [clinicalPaused])

  // 自由/固定时间：长按偷闲每满 1 秒自动升一级，最高 8×；松手回到 1×。
  useEffect(() => {
    const isHold = Boolean(day?.holdAction) && (currentBlock?.kind === 'free' || currentBlock?.kind === 'fixed')
    if (!isHold) {
      if (autoSpeedRef.current) {
        autoSpeedRef.current = false
        setSpeed(1)
      }
      return
    }
    const timer = window.setTimeout(() => {
      autoSpeedRef.current = true
      setSpeed((previous) => (previous === 1 ? 2 : previous === 2 ? 4 : previous === 4 ? 8 : previous))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [day?.holdAction, currentBlock?.kind, speed])

  // 隐藏的“主任注意概率”与“主任正在看你”状态。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day || morning) return
    if (day.currentTaskId || day.currentQuestionId || day.fixedPromptId || task || taskResult || questionResult || escapeSetup || nurseTodo || escapeTodo || clinicalPaused || questionPressure) return
    const timer = window.setInterval(() => {
      const now = Date.now()
      const currentBlock = course ? blockAt(course, dayClockRef.current) : null
      const holding = Boolean(holdActionRef.current) && !escapeRef.current
      const inFixed = currentBlock?.kind === 'fixed'

      if (watchActiveRef.current) {
        const elapsed = now - watchStartedAtRef.current
        // 1× 固定 2 秒共 +20%；倍速下按同一游戏时间缩放。
        const increment = (1 + (holding ? 4 : 0)) * speed
        const nextRisk = suspicionRef.current + increment
        if (nextRisk >= 100) {
          askTeacherQuestion()
          return
        }
        suspicionRef.current = nextRisk
        setDay((prev) => (prev ? { ...prev, suspicion: nextRisk } : prev))
        if (elapsed >= 2000 / speed) {
          watchActiveRef.current = false
          watchProbabilityRef.current = 0
          setSuspicionWarning(false)
        }
        return
      }

      if (holding && inFixed) {
        // 1× 下持续长按 5 秒从 0 涨到 100%。
        watchProbabilityRef.current = Math.min(100, watchProbabilityRef.current + 2 * speed)
        if (now - lastWatchRollRef.current >= 500 / speed) {
          lastWatchRollRef.current = now
          if (Math.random() * 100 < watchProbabilityRef.current) {
            watchActiveRef.current = true
            watchStartedAtRef.current = now
            watchProbabilityRef.current = 0
            lastWatchRollRef.current = now
            setSuspicionWarning(true)
          }
        }
      } else {
        // 松手后隐藏触发概率快速衰减。
        watchProbabilityRef.current = Math.max(0, watchProbabilityRef.current - 20 * speed)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [clinical.mode, morning, course, day?.escape, day?.currentTaskId, day?.currentQuestionId, day?.fixedPromptId, speed, clinicalPaused, questionPressure, taskResult, questionResult, escapeSetup, nurseTodo, escapeTodo])

  // 停止偷玩后，老师的怀疑会连续回落；闲置越久，回落越快。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day) return
    // 只有“主任没在看”且“玩家没有长按”时，提问风险才回落。
    if (day.holdAction || suspicionWarning || watchActiveRef.current) {
      idleDecayRef.current = 0
      return
    }
    if (day.currentTaskId || day.currentQuestionId || day.fixedPromptId) {
      idleDecayRef.current = 0
      return
    }
    if (taskResult || questionResult || escapeSetup || task || escapeEvent || nurseTodo || escapeTodo || clinicalPaused || questionPressure) {
      idleDecayRef.current = 0
      return
    }
    const timer = window.setInterval(() => {
      idleDecayRef.current += 0.1 * speed
      const decayPerSecond = Math.min(22, 7 + idleDecayRef.current * 0.35)
      setDay((prev) =>
        prev
          ? { ...prev, suspicion: Math.max(0, prev.suspicion - decayPerSecond * 0.1 * speed) }
          : prev,
      )
    }, 100)
    return () => window.clearInterval(timer)
  }, [clinical.mode, day?.holdAction, day?.currentTaskId, day?.currentQuestionId, day?.fixedPromptId, taskResult, questionResult, escapeSetup, task, escapeEvent, nurseTodo, escapeTodo, suspicionWarning, speed, clinicalPaused, questionPressure])

  // 午休阶段自动开始/结束。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day || morning || day.escape) return
    if (task || taskResult || question || escapeEvent || lateScolding || recordWarning || nurseTodo || escapeTodo) return
    if (lunchPhase === 'none' && day.clock >= 300 && day.clock < 420) startLunch()
    if (lunchPhase === 'eating' && day.clock >= lunchStartClock + 30) {
      setLunchPhase('napPrompt')
    }
    if (lunchPhase === 'napping' && day.clock >= 420) {
      const gain = Math.max(0, Math.floor((420 - napStartClock) / 4))
      if (gain > 0) onGameEffect({ energy: gain })
      setLunchPhase('done')
    }
  }, [clinical.mode, morning, day?.clock, day?.escape, lunchPhase, lunchStartClock, napStartClock, task, taskResult, question, escapeEvent, lateScolding, recordWarning, nurseTodo, escapeTodo])

  // 吃饭/午休强制 8× 推进，主时钟暂停。
  useEffect(() => {
    if (clinical.mode !== 'day' || !day || morning) return
    if (lunchPhase !== 'eating' && lunchPhase !== 'napping') return
    if (clinicalPaused || task || taskResult || nurseTodo || escapeTodo || recordWarning || nurseChatMessage) return
    const target = lunchPhase === 'eating' ? lunchStartClock + 30 : 420
    const timer = window.setInterval(() => {
      setDay((prev) => (prev ? { ...prev, clock: Math.min(target, prev.clock + 1) } : prev))
    }, 60)
    return () => window.clearInterval(timer)
  }, [clinical.mode, morning, lunchPhase, lunchStartClock, napStartClock, clinicalPaused, task, taskResult, nurseTodo, escapeTodo, recordWarning, nurseChatMessage])

  // 吃饭/午休期间新触发的护士待办会强制把玩家拉回工作状态，不进入待办卡片。
  useEffect(() => {
    if (!day || (lunchPhase !== 'eating' && lunchPhase !== 'napping')) return

    const newMessage = chatMessages.find(
      (message) =>
        message.sender === '护士站' &&
        Boolean(message.todo) &&
        !message.read &&
        !message.nurseVisitHandled &&
        typeof message.clock === 'number' &&
        message.clock >= lunchStartClock,
    )
    let forced = (clinical.todos ?? []).find(
      (todo) => todo.status === 'pending' && !lunchKnownTodoIdsRef.current.has(todo.id),
    )
    if (newMessage?.todo) {
      const { kind, bed } = newMessage.todo
      forced = {
        id: `todo-${newMessage.id}`,
        kind,
        title: kind === 'admission' ? `收病人 · ${bed} 床` : kind === 'ecg' ? `拉心电图 · ${bed} 床` : `陪检查 · ${bed} 床`,
        bed,
        taskId: kind === 'admission' ? 'admission' : kind === 'ecg' ? 'ecg' : 'accompany',
        courseId: course?.courseId ?? '',
        dayIndex: day.dayIndex,
        createdAtClock: day.clock,
        dueAtClock: kind === 'escort' ? day.clock + 30 : null,
        urgent: kind === 'escort',
        status: 'pending',
      }
      setChatMessages((prev) => prev.map((message) =>
        message.id === newMessage.id
          ? { ...message, read: true, nurseVisitHandled: true, requiresResponse: false }
          : message,
      ))
      setChatMentions((count) => Math.max(0, count - 1))
      setChatUnread((count) => Math.max(0, count - 1))
    }
    if (!forced) return
    lunchKnownTodoIdsRef.current.add(forced.id)
    const napGain = lunchPhase === 'napping'
      ? Math.max(0, Math.floor((day.clock - napStartClock) / 4))
      : 0
    if (!newMessage) {
      persistClinical({
        ...clinical,
        todos: (clinical.todos ?? []).filter((todo) => todo.id !== forced!.id),
      })
    }
    if (napGain > 0) onGameEffect({ energy: napGain })
    onGameEffect({ stress: 10, energy: -5 })
    lunchForcedRef.current = true
    setLunchPhase('done')
    setLunchAngry(true)
    if (lunchAngryTimerRef.current) window.clearTimeout(lunchAngryTimerRef.current)
    lunchAngryTimerRef.current = window.setTimeout(() => {
      setLunchAngry(false)
      setNurseTodo(forced!)
    }, 2300)
  }, [clinical.todos, chatMessages, day, lunchPhase, napStartClock, lunchStartClock, course])

  // 固定安排结束进入自由时间时给玩家一个明确提示。
  useEffect(() => {
    const kind = currentBlock?.kind ?? null
    const previous = previousBlockKindRef.current
    previousBlockKindRef.current = kind
    if (previous === 'fixed' && kind === 'free') {
      setBlockNotice('固定安排结束 · 现在可以处理待办，也可以偷偷摸鱼了。')
      if (blockNoticeTimerRef.current) window.clearTimeout(blockNoticeTimerRef.current)
      blockNoticeTimerRef.current = window.setTimeout(() => setBlockNotice(null), 4200)
      setBlockTransition(true)
      if (blockTransitionTimerRef.current) window.clearTimeout(blockTransitionTimerRef.current)
      blockTransitionTimerRef.current = window.setTimeout(() => setBlockTransition(false), 1900)
    }
  }, [currentBlock?.kind, day?.dayIndex])

  const startLunch = () => {
    if (!day || lunchPhase !== 'none' || day.clock >= 420) return
    setLunchStartClock(day.clock)
    setLunchPhase('eating')
    lunchKnownTodoIdsRef.current = new Set(
      (clinical.todos ?? []).filter((todo) => todo.status === 'pending').map((todo) => todo.id),
    )
    updateDay({
      holdAction: null,
      dayLog: [...day.dayLog, `去吃饭（${formatClock(day.clock)}）。`],
    })
  }

  const attendSeriously = () => {
    if (!day || !course || currentBlock?.kind !== 'fixed') return
    const target = Math.min(600, currentBlock.end)
    setTimeJump('认真听讲 · 直接跳过本段固定安排')
    window.setTimeout(() => setTimeJump(null), 1400)
    updateDay({
      clock: target,
      holdAction: null,
      suspicion: 0,
      dayLog: [...day.dayLog, `认真听讲，跳过${currentBlock.title}。`],
    })
  }

  const answerFixedBlock = (go: boolean) => {
    if (!day || !course || !day.fixedPromptId) return
    const block = scheduleFor(course).find((item) => item.id === day.fixedPromptId)
    if (!block) return
    if (!go) {
      setEscapeSetup(true)
      return
    }
    const isRound = block.title.includes('查房') || block.title.includes('交班')
    if (isRound && !escortNoticed) {
      setEscortNoticed(true)
      // 陪检消息要等查房时听到安排之后才会出现。
      if (escortPlan && escortPlan.total > 0) {
        const escortEvents = Array.from({ length: escortPlan.total }, () => ({
          at: randomFreeMinute(course, Math.max(day.clock + 5, 120)),
          kind: 'escort' as const,
          bed: randomBedNumber(),
        }))
        scheduledChatsRef.current = [...scheduledChatsRef.current, ...escortEvents].sort(
          (a, b) => a.at - b.at,
        )
      }
    }
    if (isRound && !recordWarningShownRef.current) {
      const missed = (clinical.todos ?? []).filter(
        (todo) => todo.status === 'pending' && todo.dayIndex < day.dayIndex && (todo.kind === 'admission' || todo.kind === 'ecg'),
      )
      if (missed.length > 0) {
        recordWarningShownRef.current = true
        const hasAdmission = missed.some((todo) => todo.kind === 'admission')
        const hasEcg = missed.some((todo) => todo.kind === 'ecg')
        setRecordWarning(
          hasAdmission && hasEcg
            ? '主任翻着病历，脸色沉下来：“昨天交代的病人没收到，心电图也没拉，你昨天到底在干什么？”'
            : hasAdmission
              ? '主任翻到一页空白的入院记录：“这个病人昨天为什么还没收？病历上写的是让我自己收吗？”'
              : '主任把心电图报告拍在桌上：“昨天交代的心电图呢？病人等了一晚上，你等到下班？”',
        )
        onGameEffect({ stress: 10 })
        updateDay({
          dayLog: [...(day?.dayLog ?? []), '第二天查房：主任发现昨天的病人/心电图待办未完成，严厉批评。'],
        })
        persistClinical({
          ...clinical,
          recognition: Math.max(0, clinical.recognition - 5),
        })
      }
    }
    if (day.lateArrival && isRound && !lateScoldingSeen) {
      setLateScoldingSeen(true)
      setLateScolding(pickLateScoldingText())
    }
    updateDay({
      fixedPromptId: null,
      attendedBlocks: [...day.attendedBlocks, block.id],
      dayLog: [...day.dayLog, `参加了${block.title}。`],
    })
    persistClinical({
      ...clinical,
      dayAttendance: clinical.dayAttendance + 1,
      recognition: Math.min(100, clinical.recognition + 1),
    })
  }

  const startEscape = () => {
    if (!day) return
    const hideout = ESCAPE_HIDEOUTS.find((item) => item.id === escapeHideout) ?? ESCAPE_HIDEOUTS[0]
    updateDay({
      fixedPromptId: null,
      attendedBlocks: day.fixedPromptId ? [...day.attendedBlocks, day.fixedPromptId] : day.attendedBlocks,
      escape: {
        purpose: escapePurpose,
        hideout: hideout.id,
        startedClock: day.clock,
        risk: hideout.risk * 100 * (escapeDelegate ? 0.55 : 1),
        minutes: 0,
        delegatedTo: escapeDelegate,
        safeLeave: false,
      },
      dayLog: [...day.dayLog, `你选择不去，躲进了${hideout.label}。`],
    })
    setEscapeSetup(false)
    persistClinical({
      ...clinical,
      dayAbsences: clinical.dayAbsences + 1,
      recognition: Math.max(0, clinical.recognition - 3),
    })
  }

  const endEscape = () => {
    if (!day?.escape) return
    const minutes = Math.max(0, day.clock - day.escape.startedClock)
    updateDay({
      escape: null,
      dayLog: [...day.dayLog, `你从${ESCAPE_HIDEOUTS.find((h) => h.id === day.escape?.hideout)?.label ?? '藏身处'}回到了科室。`],
    })
    persistClinical({
      ...clinical,
      escapeMinutes: clinical.escapeMinutes + minutes,
    })
  }

  const caughtEscape = () => {
    if (!day) return
    updateDay({
      escape: null,
      dayLog: [...day.dayLog, '逃实习被带教发现，科室认可度下降。'],
    })
    setEscapeEvent(null)
    persistClinical({
      ...clinical,
      recognition: Math.max(0, clinical.recognition - 12),
      dayAbsences: clinical.dayAbsences + 1,
    })
  }

  const chooseTaskChoice = (choice: ClinicalTaskChoice) => {
    if (!day || !course || !task) return
    const mode = choice.mode ?? 'observe'
    const trained = trainClinicalSkill(clinical.skills, task.skillId, mode)
    const recognitionChange = 4
    const eventRule = CLINICAL_EVENT_RULES[task.id]?.[mode]
    const duration = Math.max(5, eventRule?.duration ?? task.duration + choice.timeBonus)
    const energyCost = eventRule?.energy ?? 0
    const stressGain = eventRule?.stress ?? 0
    if (morning) {
      const nextClinical: ClinicalState = {
        ...clinical,
        skills: trained.skills,
        recognition: Math.max(0, Math.min(100, clinical.recognition + recognitionChange)),
        todos: activeTodoId
          ? (clinical.todos ?? []).map((todo) =>
              todo.id === activeTodoId ? { ...todo, status: 'done' as const } : todo,
            )
          : (clinical.todos ?? []),
      }
      onGameEffect({ energy: energyCost, stress: stressGain })
      persistClinical(nextClinical)
      setMorning({ ...morning, clock: Math.min(55, morning.clock + duration) })
      setActiveTodoId(null)
      setTaskResult(`你提前完成了「${task.title}」。方式：${choice.label}。精力 ${energyCost}、压力 ${stressGain >= 0 ? '+' : ''}${stressGain}。${trained.leveledUp ? '技能等级提升！' : '技能经验已记录。'}科室认可度 +4。`)
      return
    }
    const nextClinical: ClinicalState = {
      ...clinical,
      skills: trained.skills,
      todos: activeTodoId
        ? (clinical.todos ?? []).map((todo) =>
            todo.id === activeTodoId ? { ...todo, status: 'done' as const } : todo,
          )
        : (clinical.todos ?? []),
      recognition: Math.max(0, Math.min(100, clinical.recognition + recognitionChange)),
      taskRecords: [
        ...clinical.taskRecords,
        {
          taskId: task.id,
          title: task.title,
          skillId: task.skillId,
          success: true,
          duration,
          courseId: course.courseId,
        },
      ],
    }
    skillGainRef.current[task.skillId] =
      (skillGainRef.current[task.skillId] ?? 0) + (trained.leveledUp ? 1 : 0)
    if (overtime) {
      setOvertimeMinutes((minutes) => minutes + duration)
      setTimeJump('加班处理中 · 时间不再推进')
    } else {
      setTimeJump(`时间向前推进 ${duration} 分钟`)
    }
    window.setTimeout(() => setTimeJump(null), 1400)
    updateDay({
      currentTaskId: null,
      clock: overtime ? day.clock : Math.min(600, day.clock + duration),
      tasks: {
        ...day.tasks,
        admitted: day.tasks.admitted + (task.id === 'admission' ? 1 : 0),
        completedTasks: day.tasks.completedTasks + 1,
      },
      recognition: nextClinical.recognition,
      dayLog: [
        ...day.dayLog,
        `${task.title} · ${choice.label} · 完成 · ${duration} 分钟。`,
      ],
    })
    if (lunchForcedRef.current) {
      const projected = overtime ? day.clock : Math.min(600, day.clock + duration)
      if (projected >= 420) {
        setLunchLateNotice('你处理完这项工作后已经错过了下午实践操作的开场，迟到了。带教看了你一眼，没有追究。')
      }
      lunchForcedRef.current = false
    }
    onGameEffect({ energy: energyCost, stress: stressGain })
    setTaskResult(
      `你完成了「${task.title}」。方式：${choice.label}。精力 ${energyCost}、压力 ${stressGain >= 0 ? '+' : ''}${stressGain}。${trained.leveledUp ? '技能等级提升！' : '技能经验已记录。'}科室认可度 +4。`,
    )
    setActiveTodoId(null)
    persistClinical(nextClinical)
  }

  const answerLateQuestion = () => {
    if (!course) return
    const nextQuestion = shuffledQuestion(randomQuestionFor(course))
    setLateScolding(null)
    onGameEffect({ stress: 5, energy: -5 })
    setQuestion(nextQuestion)
    updateDay({
      currentQuestionId: nextQuestion.id,
      dayLog: [...(day?.dayLog ?? []), '迟到后被主任/带教点名回答问题。'],
    })
  }

  const chooseAnswer = (index: number) => {
    if (!day || !course || !question) return
    const selected = question.options[index]
    const success = Boolean(selected?.correct)
    const recognitionChange = success ? 3 : (Math.random() < 0.5 ? -3 : -5)
    const nextClinical: ClinicalState = {
      ...clinical,
      recognition: Math.max(0, Math.min(100, clinical.recognition + recognitionChange)),
    }
    updateDay({
      currentQuestionId: null,
      recognition: nextClinical.recognition,
      dayLog: [
        ...day.dayLog,
        success ? `回答「${question.category}」问题，得到主任认可。` : `回答「${question.category}」问题失败，被主任数落了一通。`,
      ],
    })
    if (!success) {
      setQuestion(null)
      setScoldAnimation(true)
      if (scoldAnimationTimerRef.current) window.clearTimeout(scoldAnimationTimerRef.current)
      scoldAnimationTimerRef.current = window.setTimeout(() => {
        setScoldAnimation(false)
        setQuestionResult(`回答错误。压力 +5、精力 -5，科室认可度 ${recognitionChange}。`)
        if (questionPressure) {
          setPressureFading(true)
          if (pressureFadeTimerRef.current) window.clearTimeout(pressureFadeTimerRef.current)
          pressureFadeTimerRef.current = window.setTimeout(() => {
            setQuestionPressure(false)
            setPressureFading(false)
          }, 900)
        }
      }, 2600)
    } else {
      setQuestionResult(`回答正确。压力 +5、精力 -5，科室认可度 +3。`)
      if (questionPressure) {
        setPressureFading(true)
        if (pressureFadeTimerRef.current) window.clearTimeout(pressureFadeTimerRef.current)
        pressureFadeTimerRef.current = window.setTimeout(() => {
          setQuestionPressure(false)
          setPressureFading(false)
        }, 1000)
      }
    }
    persistClinical(nextClinical)
  }

  const takeExam = () => {
    if (!course) return
    const result = examineRotation(clinical, course)
    persistClinical({
      ...clinical,
      mode: 'exam',
      lastRotation: result,
      rotationResults: [
        ...clinical.rotationResults.filter((item) => item.courseId !== result.courseId),
        result,
      ],
    })
  }

  const nextCourse = () => {
    if (!course) return
    const nextIndex = clinical.courseIndex + 1
    if (nextIndex >= clinical.courses.length) {
      persistClinical({ ...clinical, mode: 'done' })
      return
    }
    persistClinical({
      ...clinical,
      courseIndex: nextIndex,
      dayIndex: 0,
      mode: 'intro',
      recognition: 50,
      dayAttendance: 0,
      dayAbsences: 0,
      escapeMinutes: 0,
      currentDay: null,
      lastDaySummary: null,
      lastRotation: null,
    })
  }


  if (!course) {
    return (
      <div className="screen clinical-screen">
        <div className="shell">
          <p className="placeholder-note">这个学期没有临床轮转课程。</p>
        </div>
      </div>
    )
  }

  const clinicalDailyRail = (
    <aside className="clinical-daily-rail">
      <div className="clinical-daily-head">
        <strong>每日行动</strong>
        <span>每天各一次 · 不消耗时间段</span>
      </div>
      <button
        type="button"
        className={`clinical-daily-action ${coffeeUsedToday ? 'is-used' : ''}`}
        disabled={coffeeUsedToday || state.money < coffeeCost || state.energy >= 100}
        onClick={() => onDrinkCoffee?.(clinicalDailyKey)}
      >
        <strong>喝咖啡</strong>
        <span>精力 +10 · {coffeeCost === 0 ? '免费' : `生活费 -${coffeeCost}`}</span>
        <em>{coffeeUsedToday ? '今日已喝' : '可执行'}</em>
      </button>
      <button
        type="button"
        className={`clinical-daily-action ${breakfastUsedToday ? 'is-used' : ''}`}
        disabled={!breakfastEligible || breakfastUsedToday || state.money < 10}
        onClick={() => onEatBreakfast?.(clinicalDailyKey)}
      >
        <strong>吃早饭</strong>
        <span>压力 -10 · 生活费 -10</span>
        <em>
          {breakfastUsedToday
            ? '今日已吃'
            : !breakfastEligible
              ? '需 07:50 前到院'
              : '可执行'}
        </em>
      </button>
      <button
        type="button"
        className={`clinical-daily-action ${selfCareCountToday >= 2 ? 'is-used' : ''}`}
        disabled={selfCareCountToday >= 2 || state.money < selfCareCost}
        onClick={() => onDailySelfCare?.(clinicalDailyKey)}
      >
        <strong>爱你老己</strong>
        <span>精力 +10 · 压力 -15 · 生活费 -{selfCareCost} · 今日 {selfCareCountToday}/2</span>
        <em>{selfCareCountToday >= 2 ? '今日已做满' : `可执行 ${2 - selfCareCountToday}/2`}</em>
      </button>
    </aside>
  )

  return (
    <div className="screen game-screen clinical-game-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />
        <header className="game-head">
          <div className="game-head-left">
            <Eyebrow>CLINICAL ROTATION / {state.season.seasonLabel}</Eyebrow>
            <h1>{course.department} · {course.name}</h1>
            <p>
              {course.clinicalDays} 个临床日
              <span className="head-sep">/</span>
              第 {clinical.dayIndex + 1} 天
              <span className="head-sep">/</span>
              科室认可度 {clinical.recognition} / 100
            </p>
          </div>
          <div className="game-head-right">
            <span className="week-big">{String((day?.dayIndex ?? clinical.dayIndex) + 1).padStart(2, '0')}</span>
            <span className="week-small">
              / {String(course.clinicalDays).padStart(2, '0')} 临床日
              <br />
              {state.season.yearLabel}
            </span>
          </div>
        </header>

        <main className="game-grid">
          <PlayerRail
            state={state}
            title="CLINICAL STATUS"
            titleRight={`第 ${(day?.dayIndex ?? clinical.dayIndex) + 1} 天`}
            preview={null}
            mode="week"
          />
          <section className="game-center clinical-center">
            <nav className="tabs clinical-tabs">
              {([
                ['day', '牛马的一天'],
                ['skills', '技能树'],
                ['chat', '群聊'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={clinicalTab === key ? 'is-active' : ''}
                  onClick={() => {
                    setClinicalTab(key)
                    setChatOpen(key === 'chat')
                    if (key === 'chat') {
                      setChatUnread(0)
                      setChatMentions(0)
                    }
                  }}
                >
                  {label}
                  {key === 'chat' && chatMentions > 0 && <span className="tab-alert">@</span>}
                  {key === 'chat' && chatUnread > 0 && <span className="tab-alert">{chatUnread}</span>}
                </button>
              ))}
            </nav>
            {clinicalTab === 'day' && (
              <>
                {blockNotice && <div className="clinical-block-notice">{blockNotice}</div>}
                {lunchLateNotice && <div className="clinical-lunch-late-notice">{lunchLateNotice}</div>}
        {clinical.mode === 'intro' && (
          <section className="paper-card clinical-card">
            <div className="clinical-intro-top">
              <div>
                <h2>{course.name} · 轮转开始</h2>
                <p>今天由带教老师带你进入医疗组。固定查房、教学课不能随便缺席，但你可以选择偷偷摸鱼，或者干脆逃掉。</p>
              </div>
              <div className="clinical-tag">大{state.seasonIndex >= 17 ? '五' : '四'}</div>
            </div>
            <div className="clinical-intro-grid">
              <div>
                <strong>本次轮转</strong>
                <p>{course.clinicalDays} 个临床日 + 1 个出科日，共 {course.clinicalDays + 1} 天。</p>
                <p>每天 07:00—17:00，固定排班、随机任务、偷闲与被抓。</p>
              </div>
              <div>
                <strong>出科目标</strong>
                <p>提升技能树、积累科室认可度，尽可能完成临床任务。</p>
              </div>
            </div>
            <button type="button" className="btn btn-primary clinical-main-btn" onClick={beginDay}>
              开始第 {clinical.dayIndex + 1} 天 <span className="btn-arrow">→</span>
            </button>
          </section>
        )}

        {clinical.mode === 'day' && day && morning && (
          <div className="clinical-primary-layout">
          <section className="paper-card clinical-card clinical-morning-card">
            <span className="clinical-small-label">MORNING / 07:00</span>
            <h2>上班前</h2>
            <div className="clinical-morning-clock">
              {formatClock(morning.phase === 'commute' ? morning.clock + morning.commuteElapsed : morning.clock)}
            </div>

            {morning.phase === 'alarm' && (
              <>
                <div className="clinical-alarm">
                  <span className="clinical-alarm-ring">{formatClock(morning.clock)}</span>
                  <div>
                    <strong>闹钟响了。</strong>
                    <p>手机在枕边震动。你昨晚设的闹钟是 7:00，今天要去{morning.snoozes > 0 ? '科室' : '医院'}。</p>
                    {morning.snoozes > 0 && (
                      <p className="clinical-alarm-note">
                        你按掉了 {morning.snoozes} 次闹钟，这次多睡了 {morning.lastSnooze} 分钟。
                        下一次闹铃在 {formatClock(Math.ceil(morning.clock / 5) * 5)}。
                      </p>
                    )}
                    <p className="clinical-alarm-gain">
                      每多赖床 5 分钟，恢复 2 点精力 · 当前赖床收益 +{Math.floor(morning.clock / 5) * 2}
                    </p>
                    <p className="clinical-alarm-gain">
                      7:00 起床时精力 {morning.startEnergy} · 睡过头概率约 {Math.round(oversleepChance(morning.startEnergy) * 100)}%
                    </p>
                    <div className="clinical-alarm-deadline" key={morning.clock}>
                      <span>2 秒内决定，否则自动赖床</span>
                      <i />
                    </div>
                  </div>
                </div>
                <div className="clinical-modal-actions">
                  <button type="button" className="btn btn-primary" onClick={wakeUp}>起床</button>
                  <button type="button" className="btn btn-ghost" onClick={snoozeAlarm}>暂时关闭闹钟，多睡一会儿</button>
                </div>
              </>
            )}

            {morning.phase === 'commute' && (
              <>
                <p className="clinical-morning-lede">洗漱、出门、挤上地铁。正常通勤需要 20 分钟，但你可以在路上跑快一点。</p>
                {morning.energyGain > 0 && (
                  <p className="clinical-morning-gain">赖床让你恢复了 {morning.energyGain} 点精力。</p>
                )}
                <div className="clinical-morning-progress">
                  <span>通勤进度</span>
                  <strong>
                    {Math.max(0, Math.ceil(20 - morning.commuteElapsed - morning.commuteBoost))} 分钟
                  </strong>
                  <div><i style={{ width: `${Math.min(100, ((morning.commuteElapsed + morning.commuteBoost) / 20) * 100)}%` }} /></div>
                </div>
                <p className="clinical-commute-note">
                  进度条会自动往前走。你每次点击快跑，最多节省 0.5 分钟；目前节省 {morning.commuteBoost.toFixed(1)} 分钟，最多 7 分钟。
                </p>
                <div className="clinical-modal-actions">
                  <button type="button" className="btn btn-primary clinical-sprint-btn" onClick={rushCommute} disabled={morning.commuteBoost >= 7}>
                    牛马快跑 <small>连续点击，缩短通勤时间</small>
                  </button>
                </div>
              </>
            )}

            {morning.phase === 'elevator' && (
              <div className="clinical-elevator">
                <span className="clinical-elevator-light" />
                <strong>等电梯中</strong>
                <p>你冲进住院部大厅，电梯数字一格一格地跳。等了 {morning.elevatorWait} 分钟，电梯终于到了。电梯上行还要 5 分钟。</p>
                <div className="clinical-modal-actions">
                  <button type="button" className="btn btn-primary" onClick={leaveElevator}>上电梯</button>
                </div>
              </div>
            )}

            {morning.phase === 'dressing' && (
              <>
                {morning.clock <= 55 ? (
                  <>
                    <p className="clinical-morning-lede">
                      你到得有点早。更衣室还没几个人，你在示教室坐了一会儿，等到 07:55 才去换衣服。
                    </p>
                    <div className="clinical-morning-progress">
                      <span>更衣准备</span>
                      <strong>07:55 — 08:00</strong>
                      <div><i style={{ width: '100%' }} /></div>
                    </div>
                    {morning.clock < 55 && pendingTodos.length > 0 && (
                      <div className="clinical-morning-todos">
                        <div className="clinical-morning-todos-head">
                          <strong>07:55 前还能处理</strong>
                          <span>剩余 {55 - morning.clock} 分钟</span>
                        </div>
                        {pendingTodos.map((todo) => {
                          const taskDuration = CLINICAL_TASK_BY_ID[todo.taskId]?.duration ?? 0
                          const remaining = 55 - morning.clock
                          const tooLong = taskDuration > remaining
                          return (
                            <button
                              key={todo.id}
                              type="button"
                              className={`clinical-morning-todo ${tooLong ? 'is-too-late' : ''}`}
                              disabled={tooLong}
                              onClick={() => openTodoTask(todo)}
                            >
                              <strong>{todo.title}</strong>
                              <span>
                                {tooLong
                                  ? `需要 ${taskDuration} 分钟 · 只剩 ${remaining} 分钟，来不及`
                                  : `预计 ${taskDuration} 分钟 · 剩余 ${remaining} 分钟`}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    <div className="clinical-modal-actions">
                      <button type="button" className="btn btn-primary" onClick={finishMorning}>换好衣服，进科室</button>
                    </div>
                  </>
                ) : morning.clock <= 60 ? (
                  <>
                    <p className="clinical-morning-lede">
                      你到科室时正好 {formatClock(morning.clock)}。更衣室里已经有人换好衣服，你赶紧套上白大褂。
                    </p>
                    <div className="clinical-morning-progress">
                      <span>更衣准备</span>
                      <strong>07:55 — 08:00</strong>
                      <div><i style={{ width: '100%' }} /></div>
                    </div>
                    <div className="clinical-modal-actions">
                      <button type="button" className="btn btn-primary" onClick={finishMorning}>换好衣服，进科室</button>
                    </div>
                  </>
                ) : (
                  <div className="clinical-dressing-late">
                    <span className="clinical-late-stamp">迟到</span>
                    <p className="clinical-late-title">坏了。</p>
                    <p>
                      更衣室的门在你身后合上。走廊尽头已经传来交班的声音，你一边套白大褂，
                      一边假装没看见墙上那个已经走到 {formatClock(morning.clock)} 的时钟。
                    </p>
                    <p className="clinical-late-whisper">
                      带教的声音从医生办公室飘出来，好像正好念到了你的名字。
                    </p>
                    <div className="clinical-late-scramble" aria-hidden="true">
                      <span>白大褂</span><span>胸牌</span><span>听诊器</span><span>病历夹</span>
                    </div>
                    <div className="clinical-modal-actions">
                      <button type="button" className="btn btn-primary" onClick={finishMorning}>
                        抓起胸牌，冲进科室
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
          {clinicalDailyRail}
          </div>
        )}

        {clinical.mode === 'day' && day && !morning && (
          <>
            <div className="clinical-primary-layout">
            <section className="clinical-day-card">
              <div className="clinical-day-top">
                <div>
                  <span className="clinical-small-label">临床日 {day.dayIndex + 1} / {course.clinicalDays}</span>
                  <strong className="clinical-clock">{overtime ? formatOvertimeClock(600 + overtimeMinutes) : formatClock(day.clock)}</strong>
                  <span className="clinical-phase">{blockAt(course, day.clock)?.title ?? '收尾中'}</span>
                  {day.lateArrival && <span className="clinical-late-badge">迟到</span>}
                </div>
                <div className="clinical-day-status">
                  <span className="clinical-speed-control">
                    播放
                    {([1, 2, 4, 8] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={speed === value ? 'is-active' : ''}
                        onClick={() => setSpeed(value)}
                      >
                        {value}×
                      </button>
                    ))}
                  </span>
                  <button
                    type="button"
                    className={`clinical-chat-btn ${chatUnread > 0 ? 'has-unread' : ''} ${chatMentions > 0 ? 'has-mention' : ''}`}
                    onClick={() => {
                      setClinicalTab('chat')
                      setChatOpen(true)
                      setChatUnread(0)
                      setChatMentions(0)
                    }}
                  >
                    群聊
                    {chatMentions > 0 && <span className="clinical-chat-mention">@</span>}
                    {chatUnread > 0 && <span className="clinical-chat-badge">{chatUnread}</span>}
                  </button>
                </div>
              </div>
              <div className="clinical-timeline">
                <div className="clinical-timeline-fill" style={{ width: `${(day.clock / 600) * 100}%` }} />
                {scheduleFor(course).filter((block) => block.kind !== 'routine').map((block) => (
                  <span
                    key={block.id}
                    className={`clinical-timeline-mark ${block.kind}`}
                    style={{ left: `${(block.start / 600) * 100}%` }}
                    title={block.title}
                  />
                ))}
              </div>
              {(() => {
                const block = blockAt(course, day.clock)
                const scene = day.escape
                  ? {
                      art: 'escape' as const,
                      text: escapeSceneText(day.escape?.hideout ?? 'duty'),
                    }
                  : sceneForBlock(block)
                return (
                  <div className="clinical-day-scene" key={day.escape ? 'escape' : block?.id ?? 'free'}>
                    <ClinicalSceneArt art={scene.art} />
                    <div className="clinical-scene-copy">
                      <span className="clinical-phase-caption">
                        {day.escape ? '躲藏中' : block?.title ?? '机动中'} · {formatClock(day.clock)}
                      </span>
                      <p className="clinical-scene-text"><Typewriter text={scene.text} /></p>
                    </div>
                  </div>
                )
              })()}
              {timeJump && <div className="clinical-time-jump">{timeJump}</div>}
              <div className="clinical-day-meta">
                  <span>今日预计入院 {day.tasks.expectedAdmissions} 人 · 已入 {day.tasks.admitted} 人 · 剩余约 {Math.max(0, day.tasks.expectedAdmissions - day.tasks.admitted)} 人</span>
                  <span>已完成任务 {day.tasks.completedTasks} / {day.tasks.totalTasks}</span>
                  {day.escape && <span className="clinical-risk">逃实习中 · 被发现风险 {Math.round(day.escape.risk)}</span>}
                </div>
              {escortPlan && escortNoticed && (
                <div className="clinical-escort-notice">
                  <strong>今日陪检安排</strong>
                  <span>
                    {escortPlan.total === 0
                      ? '今天没有需要陪检查的病人。'
                      : `共 ${escortPlan.total} 人：CT ${escortPlan.ct} 人、MRI ${escortPlan.mri} 人、B 超 ${escortPlan.ultrasound} 人。`}
                  </span>
                </div>
              )}
              {overtime && (
                <div className="clinical-overtime-bar">
                  <div><strong>{formatOvertimeClock(600 + overtimeMinutes)} · 加班中</strong><span>已处理 {overtimeMinutes} 分钟 · 时间不再自动推进</span></div>
                  <button type="button" className="btn btn-ghost" onClick={() => setOvertimeSettlement(pickOvertimeText(formatOvertimeClock(600 + overtimeMinutes)))}>收工</button>
                </div>
              )}
              <div className="clinical-day-actions">
                {!overtime && lunchPhase === 'none' && day.clock >= 240 && day.clock < 300 && (
                  <button type="button" className="clinical-lunch-btn" onClick={startLunch}>
                    去吃饭 <span>消耗 30 分钟 · 12:00 自动</span>
                  </button>
                )}
                {overtime ? (
                  <p className="clinical-action-hint">加班中不再提供偷闲操作。把待办收尾，或者点右上角「收工」。</p>
                ) : day.escape ? (
                  <>
                    <button type="button" className="btn btn-ghost" onClick={endEscape}>回科室</button>
                    <div className="clinical-escape-holds">
                      <button
                        type="button"
                        className={`clinical-hold-btn ${day.holdAction === 'phone' ? 'is-holding' : ''}`}
                        onPointerDown={() => updateDay({ holdAction: 'phone' })}
                        onPointerUp={() => updateDay({ holdAction: null })}
                        onPointerLeave={() => updateDay({ holdAction: null })}
                        onPointerCancel={() => updateDay({ holdAction: null })}
                      >
                        放松休息
                        <i className="clinical-hold-meter"><b style={{ width: `${Math.round(day.holdProgresses?.phone ?? 0)}%` }} /></i>
                        <span>压力 -4 · 约 10 秒填满</span>
                      </button>
                      <button
                        type="button"
                        className={`clinical-hold-btn ${day.holdAction === 'exam' ? 'is-holding' : ''}`}
                        onPointerDown={() => updateDay({ holdAction: 'exam' })}
                        onPointerUp={() => updateDay({ holdAction: null })}
                        onPointerLeave={() => updateDay({ holdAction: null })}
                        onPointerCancel={() => updateDay({ holdAction: null })}
                      >
                        复习考试
                        <i className="clinical-hold-meter"><b style={{ width: `${Math.round(day.holdProgresses?.exam ?? 0)}%` }} /></i>
                        <span>当前课程准备度 +0.5% · 约 15 秒填满</span>
                      </button>
                      <button
                        type="button"
                        className={`clinical-hold-btn ${day.holdAction === 'study' ? 'is-holding' : ''}`}
                        onPointerDown={() => updateDay({ holdAction: 'study' })}
                        onPointerUp={() => updateDay({ holdAction: null })}
                        onPointerLeave={() => updateDay({ holdAction: null })}
                        onPointerCancel={() => updateDay({ holdAction: null })}
                      >
                        备战考研
                        <i className="clinical-hold-meter"><b style={{ width: `${Math.round(day.holdProgresses?.study ?? 0)}%` }} /></i>
                        <span>考研准备度 +0.5% · 约 12 秒填满</span>
                      </button>
                    </div>
                  </>
                ) : currentBlock?.kind === 'routine' ? (
                  <p className="clinical-action-hint">通勤和准备时间不提供这些操作，先把自己送到医院。</p>
                ) : (
                  <>
                    {currentBlock?.kind === 'fixed' ? (
                    <div className="clinical-action-status">
                      {suspicionWarning ? (
                        <div className="clinical-teacher-warning" role="status">
                          <span className="clinical-teacher-warning-icon">!</span>
                          <div>
                            <strong>主任正在看你</strong>
                            <small>主任已经注意到你，提问风险会继续上升。</small>
                          </div>
                        </div>
                      ) : (
                        <div className="clinical-suspicion">
                          <span>提问风险</span>
                          <div className="clinical-suspicion-track">
                            <i style={{ width: `${Math.round(day.suspicion)}%` }} />
                          </div>
                          <em>{Math.round(day.suspicion)}</em>
                        </div>
                      )}
                    </div>
                    ) : (
                      <p className="clinical-free-note">自由时间 · 做这些不会增加提问风险</p>
                    )}
                    {currentBlock?.kind === 'fixed' && (
                      <button type="button" className="clinical-attend-btn" onClick={attendSeriously}>
                        认真听讲 <span>放弃偷闲收益 · 跳过本段固定安排</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className={`clinical-hold-btn ${day.holdAction === 'phone' ? 'is-holding' : ''}`}
                      onPointerDown={() => updateDay({ holdAction: 'phone' })}
                      onPointerUp={() => updateDay({ holdAction: null })}
                      onPointerLeave={() => updateDay({ holdAction: null })}
                      onPointerCancel={() => updateDay({ holdAction: null })}
                    >
                      {currentBlock?.kind === 'fixed' ? '偷偷玩手机' : '玩手机'}
                      <i className="clinical-hold-meter"><b style={{ width: `${Math.round(day.holdProgresses?.phone ?? 0)}%` }} /></i>
                      <span>压力 -4 · {currentBlock?.kind === 'fixed' ? '约 5 秒填满' : '约 10 秒填满'}</span>
                    </button>
                    <button
                      type="button"
                      className={`clinical-hold-btn ${day.holdAction === 'study' ? 'is-holding' : ''}`}
                      onPointerDown={() => updateDay({ holdAction: 'study' })}
                      onPointerUp={() => updateDay({ holdAction: null })}
                      onPointerLeave={() => updateDay({ holdAction: null })}
                      onPointerCancel={() => updateDay({ holdAction: null })}
                    >
                      {currentBlock?.kind === 'fixed' ? '偷偷备考' : '备战考研'}
                      <i className="clinical-hold-meter"><b style={{ width: `${Math.round(day.holdProgresses?.study ?? 0)}%` }} /></i>
                      <span>考研准备度 +0.5% · {currentBlock?.kind === 'fixed' ? '约 20 秒填满' : '约 15 秒填满'}</span>
                    </button>
                    <button
                      type="button"
                      className={`clinical-hold-btn ${day.holdAction === 'nap' ? 'is-holding' : ''}`}
                      onPointerDown={() => updateDay({ holdAction: 'nap' })}
                      onPointerUp={() => updateDay({ holdAction: null })}
                      onPointerLeave={() => updateDay({ holdAction: null })}
                      onPointerCancel={() => updateDay({ holdAction: null })}
                    >
                      {currentBlock?.kind === 'fixed' ? '合眼小憩' : '趴着眯一会儿'}
                      <i className="clinical-hold-meter"><b style={{ width: `${Math.round(day.holdProgresses?.nap ?? 0)}%` }} /></i>
                      <span>精力 +4 · {currentBlock?.kind === 'fixed' ? '约 20 秒填满' : '约 10 秒填满'}</span>
                    </button>
                  </>
                )}
              </div>
            </section>
            {clinicalDailyRail}
            </div>

            <ClinicalModalPortal>
            {lunchAngry && (
              <div className="clinical-lunch-angry" role="alert" aria-live="assertive">
                <div className="clinical-lunch-angry-bg" aria-hidden="true" />
                <div className="clinical-lunch-angry-copy">
                  <span className="clinical-lunch-angry-kicker">午饭/午休被打断</span>
                  <h2>饭都不让人吃完？</h2>
                  <p>你刚把饭盒放下，或刚在折叠床上闭眼，护士站的声音就把你拽了起来。</p>
                  <div className="clinical-lunch-angry-face" aria-hidden="true">
                    <i /><i /><b />
                  </div>
                  <small>你压着火，站起来往病房走。</small>
                </div>
              </div>
            )}
            {(lunchPhase === 'eating' || lunchPhase === 'napping') && (
              <div className="clinical-lunch-overlay" role="status" aria-live="polite">
                <div className="clinical-lunch-orb" aria-hidden="true"><i /><i /><i /></div>
                <div className="clinical-lunch-copy">
                  <span className="clinical-lunch-speed">8×</span>
                  <h2>{lunchPhase === 'eating' ? '去吃饭' : '午休中'}</h2>
                  <p>{lunchPhase === 'eating' ? '午餐时间，暂时离开病房。' : '把接下来的时间交给一张折叠床。'}</p>
                  <div className="clinical-lunch-progress"><i style={{ width: `${Math.min(100, ((day.clock - (lunchPhase === 'eating' ? lunchStartClock : napStartClock)) / (lunchPhase === 'eating' ? 30 : Math.max(1, 420 - napStartClock))) * 100)}%` }} /></div>
                  <small>{formatClock(day.clock)} · 时间以 8× 推进</small>
                </div>
              </div>
            )}
            {lunchPhase === 'napPrompt' && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal clinical-lunch-prompt">
                  <span className="clinical-small-label">午饭结束 · {formatClock(day.clock)}</span>
                  <h2>要午休吗？</h2>
                  <p>现在距离 14:00 还有 {Math.max(0, 420 - day.clock)} 分钟。午休会以 8× 速度推进到 14:00，每 4 分钟恢复 1 点精力。</p>
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={() => { setNapStartClock(day.clock); setLunchPhase('napping') }}>
                      午休 · 恢复 {Math.max(0, Math.floor((420 - day.clock) / 4))} 精力
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setLunchPhase('declined')}>不午休，自由安排</button>
                  </div>
                </div>
              </div>
            )}
            {nurseChatMessage && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal clinical-nurse-message">
                  <span className="clinical-small-label">护士站 · 未回复提醒</span>
                  <h2>“群里 @你 半小时了。”</h2>
                  <p>护士站的人站到办公室门口：“看到消息没有？{nurseChatMessage.text.replace('@你，', '')}先记着，待会儿别忘了。”</p>
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={() => resolveNurseChatMessage(false)}>待会儿做</button>
                    <button type="button" className="btn btn-ghost" onClick={() => resolveNurseChatMessage(true)}>现在去处理</button>
                  </div>
                </div>
              </div>
            )}
            {blockTransition && (
              <div className="clinical-block-transition" role="status" aria-live="polite">
                <div className="clinical-block-transition-sweep" aria-hidden="true" />
                <div className="clinical-block-transition-copy">
                  <span>固定安排结束</span>
                  <h2>进入自由时间</h2>
                  <p>查房和教学结束了。时间暂停一秒，接下来怎么安排，由你决定。</p>
                </div>
              </div>
            )}
            {scoldAnimation && (
              <div className="clinical-scold-cinematic" role="alert" aria-live="assertive">
                <div className="scold-flash" aria-hidden="true" />
                <div className="scold-copy">
                  <span className="scold-kicker">回答错误</span>
                  <h2>你在说什么？</h2>
                  <p>主任把病历夹往桌上一放，声音不大，却让整个病房安静下来。</p>
                  <div className="scold-quote">“这是你思考过的答案吗？”</div>
                  <small>你感觉所有人的目光都落在自己身上。</small>
                </div>
                <span className="scold-stamp">批评</span>
              </div>
            )}
            {questionPressure && (
              <div className={`clinical-pressure-overlay ${question ? 'is-question-open' : ''} ${pressureFading ? 'is-fading' : ''}`} role="alert" aria-live="assertive">
                <div className="clinical-pressure-vignette" />
                <div className="clinical-pressure-eye" aria-hidden="true"><span /></div>
                <div className="clinical-pressure-copy">
                  <span className="clinical-pressure-kicker">提问风险 · 100%</span>
                  <h2>主任盯上你了。</h2>
                  <p>整个病房突然安静下来。<br />你听见自己的心跳，白大褂下的后背开始发凉。</p>
                  <div className="clinical-pressure-meter"><i /></div>
                  <small>你被主任盯上了，准备回答问题。</small>
                </div>
              </div>
            )}
            {recordWarning && (
              <div className="clinical-modal-backdrop clinical-record-warning-backdrop">
                <div className="clinical-modal clinical-record-warning">
                  <span className="clinical-small-label">第二天查房 · 主任查阅病历</span>
                  <h2>病历夹被摔在桌上。</h2>
                  <p>{recordWarning}</p>
                  <div className="clinical-record-penalty">压力 +10 · 科室认可度 -5</div>
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={() => setRecordWarning(null)}>低头认错</button>
                  </div>
                </div>
              </div>
            )}
            {overtimeOpen && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal clinical-overtime-modal">
                  <span className="clinical-small-label">17:00 · 下班时间</span>
                  <h2>还有 {pendingTodos.length} 项待办没完成</h2>
                  <p>护士站的交班已经开始了。你可以留下来加班处理，也可以直接下班，把普通待办留到明天。</p>
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={() => { setOvertimeOpen(false); setOvertime(true); setOvertimeMinutes(0) }}>加班完成</button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setOvertimeOpen(false); finishDay() }}>直接下班</button>
                  </div>
                </div>
              </div>
            )}
            {overtimeSettlement && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal clinical-overtime-settlement">
                  <span className="clinical-small-label">收工结算 · 加班 {overtimeMinutes} 分钟</span>
                  <h2>你加班到了 {formatOvertimeClock(600 + overtimeMinutes)}。</h2>
                  <p className="clinical-overtime-sarcasm">{overtimeSettlement}</p>
                  {pendingTodos.length > 0 && (
                    <div className="clinical-overtime-pending">
                      <strong>还有 {pendingTodos.length} 项待办没完成</strong>
                      <p>明天早一点到医院，趁查房前处理掉。主任翻病历的时候不会等你。</p>
                    </div>
                  )}
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={() => { setOvertimeSettlement(null); finishDay() }}>收工下班</button>
                  </div>
                </div>
              </div>
            )}
            {nurseTodo && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal clinical-urgent-modal">
                  <span className="clinical-small-label">{lunchForcedRef.current ? '午休被打断' : '紧急陪检 · 已超时'}</span>
                  <h2>{lunchForcedRef.current ? '护士来叫你了' : '护士来医生办公室找你了'}</h2>
                  {lunchForcedRef.current ? (
                    <p>“先别休息了，{nurseTodo.title}还没处理，跟我来一趟。”你的午饭/午休被工作按下了暂停键。</p>
                  ) : (
                    <p>“你怎么还坐在这儿？{nurseTodo.bed} 床的检查工人已经等了很久了，赶紧去陪一下。”</p>
                  )}
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={() => openTodoTask(nurseTodo, true)}>跟护士去处理</button>
                  </div>
                </div>
              </div>
            )}
            {escapeTodo && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal clinical-urgent-modal">
                  <span className="clinical-small-label">紧急陪检 · 逃实习中</span>
                  <h2>带教在群里 @你</h2>
                  <p>“{escapeTodo.bed} 床的检查还没人陪，你在哪？”群里的消息停在那里。逃跑风险已经拉到 80，你需要马上决定。</p>
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={returnForTodo}>主动回医院</button>
                  </div>
                  <div className="clinical-escape-decision">
                    <span>或者委托朋友帮忙：</span>
                    {state.relationships
                      .filter((relation) => ['roommate', 'classmate', 'senior'].includes(relation.kind))
                      .slice(0, 3)
                      .map((relation) => (
                        <button
                          key={relation.id}
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => delegateTodo(escapeTodo, relation.name)}
                        >
                          {relation.name} · {relation.identity}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}
            {lateScolding && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal clinical-scold-modal">
                  <span className="clinical-small-label">查房现场 · 迟到追问</span>
                  <h2>“你终于来了。”</h2>
                  <p>{lateScolding}</p>
                  <div className="clinical-scold-stamp">迟到</div>
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={answerLateQuestion}>
                      硬着头皮回答问题
                    </button>
                  </div>
                </div>
              </div>
            )}
            {day.fixedPromptId && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal">
                  <span className="clinical-small-label">固定安排</span>
                  <h2>{scheduleFor(course).find((b) => b.id === day.fixedPromptId)?.fixedTitle ?? '该去参加固定安排了'}</h2>
                  <p>{scheduleFor(course).find((b) => b.id === day.fixedPromptId)?.title} · {formatClock(day.clock)}</p>
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={() => answerFixedBlock(true)}>去</button>
                    <button type="button" className="btn btn-ghost" onClick={() => answerFixedBlock(false)}>不去，摸鱼/逃实习</button>
                  </div>
                </div>
              </div>
            )}

            {escapeSetup && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal clinical-escape-modal">
                  <span className="clinical-small-label">逃实习准备</span>
                  <h2>你要逃多久？</h2>
                  <p>三个问题分别选一下。进度条不会停，只有到 17:00 才真正安全。</p>
                  <div className="escape-columns">
                    <section className="escape-column">
                      <h3><span>01</span>逃跑目的</h3>
                      <p className="escape-column-note">逃掉的时间拿来做什么？</p>
                      <div className="clinical-choice-list">
                        {ESCAPE_PURPOSES.map((purpose) => (
                          <button key={purpose.id} type="button" className={`clinical-choice ${escapePurpose === purpose.id ? 'is-selected' : ''}`} onClick={() => setEscapePurpose(purpose.id)}>
                            <strong>{purpose.label}</strong>
                            <span>{purpose.desc}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="escape-column">
                      <h3><span>02</span>躲在哪里</h3>
                      <p className="escape-column-note">离科室越近，被发现风险越高。</p>
                      <div className="clinical-choice-list">
                        {ESCAPE_HIDEOUTS.map((hideout) => (
                          <button key={hideout.id} type="button" className={`clinical-choice ${escapeHideout === hideout.id ? 'is-selected' : ''}`} onClick={() => setEscapeHideout(hideout.id)}>
                            <strong>{hideout.label}</strong>
                            <span>{hideout.desc}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="escape-column">
                      <h3><span>03</span>找人代班</h3>
                      <p className="escape-column-note">可选；有人帮你留意群消息会降低风险。</p>
                      <div className="clinical-choice-list">
                        <button type="button" className={`clinical-choice ${escapeDelegate === null ? 'is-selected' : ''}`} onClick={() => setEscapeDelegate(null)}>
                          <strong>不找人代班</strong>
                          <span>自己承担全部风险。</span>
                        </button>
                        {state.relationships
                          .filter((relation) => ['roommate', 'classmate', 'senior'].includes(relation.kind))
                          .slice(0, 3)
                          .map((relation) => (
                            <button
                              key={relation.id}
                              type="button"
                              className={`clinical-choice ${escapeDelegate === relation.id ? 'is-selected' : ''}`}
                              onClick={() => setEscapeDelegate(relation.id)}
                            >
                              <strong>{relation.name} · {relation.identity}</strong>
                              <span>请 TA 帮你留意群消息和临时任务，被发现风险降低。</span>
                            </button>
                          ))}
                      </div>
                    </section>
                  </div>
                  <div className="clinical-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={startEscape}>开始逃</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setEscapeSetup(false)}>算了，回去</button>
                  </div>
                </div>
              </div>
            )}

            {escapeEvent && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal">
                  <span className="clinical-small-label">风险事件</span>
                  <h2>{escapeEvent.title}</h2>
                  <p>{escapeEvent.text}</p>
                  <div className="clinical-modal-actions">
                    {escapeEvent.id === 'caught' ? (
                      <button type="button" className="btn btn-primary" onClick={caughtEscape}>回科室认错</button>
                    ) : (
                      <>
                        <button type="button" className="btn btn-primary" onClick={() => { endEscape(); setEscapeEvent(null) }}>回科室</button>
                        <button type="button" className="btn btn-ghost" onClick={() => { updateDay({ escape: day.escape ? { ...day.escape, safeLeave: true, risk: 0 } : null }); setEscapeEvent(null) }}>让朋友顶班</button>
                        <button type="button" className="btn btn-ghost" onClick={() => { setEscapeEvent(null); updateDay({ escape: day.escape ? { ...day.escape, risk: Math.min(100, day.escape.risk + 5) } : null }) }}>继续躲</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {task && !taskResult && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal">
                  <span className="clinical-small-label">临床任务 · 预计 {task.duration} 分钟</span>
                  <h2>{task.title}</h2>
                  <p>{task.description}</p>
                  <div className="clinical-choice-list">
                    {choicesForSkill(task, clinical.skills[task.skillId]).map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        className={`clinical-choice ${choice.recommended ? 'is-recommended' : ''} ${choice.disabled ? 'is-disabled' : ''}`}
                        disabled={choice.disabled}
                        onClick={() => chooseTaskChoice(choice)}
                      >
                        <strong>
                          {choice.label}
                          {choice.recommended && <em className="clinical-choice-recommend">推荐</em>}
                        </strong>
                        {(() => {
                          const rule = CLINICAL_EVENT_RULES[task.id]?.[choice.mode ?? 'observe']
                          return <span>预计 {rule?.duration ?? Math.max(5, task.duration + choice.timeBonus)} 分钟 · 精力 {rule?.energy ?? 0} · 压力 {(rule?.stress ?? 0) >= 0 ? '+' : ''}{rule?.stress ?? 0}</span>
                        })()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {taskResult && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal">
                  <span className="clinical-small-label">任务结算</span>
                  <p>{taskResult}</p>
                  <button type="button" className="btn btn-primary" onClick={() => { setTask(null); setTaskResult(null) }}>继续</button>
                </div>
              </div>
            )}

            {question && !questionResult && (
              <div className="clinical-modal-backdrop clinical-question-backdrop">
                <div className="clinical-modal">
                  <span className="clinical-small-label">带教提问 · {skillName(question.skillId)} Lv{clinical.skills[question.skillId]?.level ?? 0}</span>
                  <h2>{question.text}</h2>
                  <p className="clinical-question-hint">选对即答对；答对科室认可度 +3，答错 -3 或 -5。</p>
                  <div className="clinical-choice-list">
                    {question.options.map((option, index) => (
                      <button type="button" key={option.text} className="clinical-choice" onClick={() => { setSelectedAnswer(index); chooseAnswer(index) }}>
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {questionResult && (
              <div className="clinical-modal-backdrop">
                <div className="clinical-modal">
                  <span className="clinical-small-label">回答结果</span>
                  <p>{questionResult}</p>
                  <button type="button" className="btn btn-primary" onClick={() => { setQuestion(null); setQuestionResult(null); setSelectedAnswer(null) }}>继续</button>
                </div>
              </div>
            )}
            </ClinicalModalPortal>
          </>
        )}

        {clinical.mode === 'evening' && (
          <section className="clinical-evening-board">
            <div className="week-title-row clinical-evening-title">
              <div>
                <h2>今晚的安排</h2>
                <p>下班后只有一个时间段。选一件想做的事，或者直接躺平。</p>
              </div>
              <span className="clinical-evening-slot-label">晚间 · 1 / 1</span>
            </div>
            {eveningAction ? (
              <div className="clinical-evening-result">
                <strong>{ACTION_BY_ID[eveningAction]?.name ?? '今晚的行动'}</strong>
                <p>{ACTION_BY_ID[eveningAction]?.effectText ?? ''}</p>
                <button type="button" className="btn btn-primary" onClick={() => {
                  if (clinical.dayIndex + 1 < course.clinicalDays) {
                    persistClinical({ ...clinical, dayIndex: clinical.dayIndex + 1, mode: 'intro', currentDay: null, lastDaySummary: null })
                  } else {
                    takeExam()
                  }
                }}>睡觉，迎接第二天</button>
              </div>
            ) : (
              <div className="actions-grid clinical-evening-grid">
                {['rest', 'library', 'english', 'kaoyan', 'sport', 'entertainment', 'partTime', 'research'].map((actionId) => {
                  const action = ACTION_BY_ID[actionId]
                  if (!action) return null
                  const disabled = actionId === 'research' && !state.mentorContactUnlocked
                  return (
                    <div
                      key={actionId}
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      aria-disabled={disabled}
                      className={`action-card ${disabled ? 'is-locked' : ''}`}
                      onClick={() => {
                        if (disabled) return
                        setEveningAction(actionId)
                        onClinicalEveningAction?.(actionId)
                      }}
                      onKeyDown={(event) => {
                        if (disabled) return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setEveningAction(actionId)
                          onClinicalEveningAction?.(actionId)
                        }
                      }}
                    >
                      <div className="action-meta">
                        <span>{action.category}</span>
                        <span className="action-no">{action.no}</span>
                      </div>
                      <h3>{action.name}</h3>
                      <p className="action-flavor">{action.flavor}</p>
                      <p className="action-effect">{action.effectText}</p>
                      <div className="action-bottom">
                        <span className="action-en">{action.en}</span>
                        <span className="action-repeat">{disabled ? '尚未进入实验室' : '消耗晚间时间段'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}
        {clinical.mode === 'summary' && clinical.lastDaySummary && (
          <section className="paper-card clinical-card">
            <span className="clinical-small-label">17:00 · 下班结算</span>
            <h2>{clinical.lastDaySummary.title}</h2>
            <div className="clinical-summary-lines">
              {clinical.lastDaySummary.lines.map((line) => <p key={line}>{line}</p>)}
            </div>
            <p>科室认可度 {clinical.lastDaySummary.recognition} / 100</p>
            <button
              type="button"
              className="btn btn-primary clinical-main-btn"
              onClick={() => persistClinical({ ...clinical, mode: 'evening', currentDay: null })}
            >
              下班，开始晚上 <span className="btn-arrow">→</span>
            </button>
          </section>
        )}

        {clinical.mode === 'exam' && clinical.lastRotation && (
          <section className="paper-card clinical-card">
            <span className="clinical-small-label">出科成绩单</span>
            <h2>{clinical.lastRotation.name}</h2>
            <div className="clinical-exam-score">
              <strong>{clinical.lastRotation.score}</strong>
              <span>分 · GPA {clinical.lastRotation.gpa.toFixed(1)}</span>
            </div>
            <p>科室认可度 {clinical.lastRotation.recognition} · 任务 {clinical.lastRotation.taskCount} 次 · 缺勤 {clinical.lastRotation.absences} 次 · 逃实习 {Math.round(clinical.lastRotation.escapeMinutes)} 分钟</p>
            <ClinicalSkillTree skills={clinical.skills} />
            <button type="button" className="btn btn-primary clinical-main-btn" onClick={nextCourse}>
              {clinical.courseIndex + 1 >= clinical.courses.length ? '结束本学期' : '进入下一门轮转'} <span className="btn-arrow">→</span>
            </button>
          </section>
        )}

        {clinical.mode === 'done' && (
          <section className="paper-card clinical-card">
            <h2>本学期临床轮转结束</h2>
            <p>你完成了本学期的见习/实习。成绩、技能和科室认可度已经写入档案。</p>
            <button type="button" className="btn btn-primary clinical-main-btn" onClick={() => onFinishSeason(clinical)}>
              查看学期结算 <span className="btn-arrow">→</span>
            </button>
          </section>
        )}

        {clinical.mode === 'day' && day && !morning && (
          <section className="paper-card clinical-todo-card">
            <div className="clinical-todo-head">
              <strong>待办事项</strong>
              <span>{pendingTodos.length} 项待处理</span>
            </div>
            <div className="clinical-todo-columns">
              {([
                { key: 'document', label: '文书工作', kinds: ['admission'] },
                { key: 'ward', label: '病房操作', kinds: ['ecg'] },
                { key: 'escort', label: '陪检查', kinds: ['escort'] },
              ] as const).map((group) => {
                const todos = pendingTodos.filter((todo) => (group.kinds as readonly string[]).includes(todo.kind))
                return (
                  <section className="clinical-todo-column" key={group.key}>
                    <div className="clinical-todo-column-head">
                      <h3>{group.label}</h3>
                      <span>{todos.length}</span>
                    </div>
                    <div className="clinical-todo-list">
                      {todos.length === 0 ? (
                        <p className="clinical-todo-column-empty">暂无</p>
                      ) : todos.map((todo) => {
                        const remaining = todo.dueAtClock === null
                          ? null
                          : Math.max(0, Math.min(30, todo.dueAtClock - day.clock))
                        const overdue = todo.dayIndex < day.dayIndex || (remaining !== null && remaining <= 0)
                        return (
                          <button
                            key={todo.id}
                            type="button"
                            className={`clinical-todo-item ${todo.urgent ? 'is-urgent' : ''} ${todoLocked ? 'is-locked' : ''}`}
                            disabled={todoLocked}
                            onClick={() => openTodoTask(todo)}
                          >
                            <strong>{todo.title}</strong>
                            <span>
                              {todoLocked
                                ? '固定安排中 · 结束后再处理'
                                : todo.urgent
                                  ? overdue
                                    ? '已超时 · 点击立即处理'
                                    : `紧急 · 剩余 ${remaining} 分钟`
                                  : '今天完成即可'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          </section>
        )}
              </>
            )}
            {clinicalTab === 'skills' && (
              <section className="paper-card clinical-skill-card">
                <div className="clinical-skill-head">
                  <strong>临床技能树</strong>
                  <span>所有操作通过临床任务与带教教学升级 · 独立操作需达到 Lv3</span>
                </div>
                <ClinicalSkillTree skills={clinical.skills} />
              </section>
            )}
            {clinicalTab === 'chat' && (
              <div className="tab-panel chat-panel clinical-chat-panel">
                <div className="chat-shell clinical-group-chat">
                  <aside className="solo-contacts chat-contacts">
                    <div className="solo-contacts-head">
                      <span>科室群聊</span>
                      <small>1 个群</small>
                    </div>
                    <div className="solo-contact-list">
                      <button type="button" className="solo-contact is-active">
                        <span className="solo-avatar">群</span>
                        <span className="solo-contact-copy">
                          <strong>{course.department} · 医疗组</strong>
                          <small>科室工作群 · {chatMessages.length} 条消息</small>
                          <em>{chatMessages[chatMessages.length - 1]?.text ?? '还没有新消息'}</em>
                        </span>
                      </button>
                    </div>
                    <p className="clinical-chat-side-note">护士站的 @你 消息会自动进入待办事项。</p>
                  </aside>
                  <main className="solo-chat chat-main clinical-chat-main">
                    <header className="solo-chat-head chat-head">
                      <div>
                        <strong>{course.department} · 医疗组</strong>
                        <small>科室工作群 · 聊天不会推进游戏时间</small>
                      </div>
                    </header>
                    <div className="solo-messages chat-messages clinical-group-messages" ref={chatListRef}>
                      {chatMessages.length === 0 && (
                        <div className="chat-empty-note">
                          <span>群里暂时安静</span>
                          <p>护士站和规培的消息会在这里出现。</p>
                        </div>
                      )}
                      {chatMessages.map((message) => {
                        const mine = message.sender === '你'
                        return (
                          <div className={`solo-message ${mine ? 'is-me' : 'is-them'} clinical-group-message ${message.text.includes('@你') ? 'is-mentioned' : ''}`} key={message.id}>
                            <span className="solo-message-avatar">{mine ? '我' : message.sender.slice(0, 1)}</span>
                            <div className="clinical-group-bubble">
                              {!mine && (
                                <div className="clinical-chat-meta">
                                  <strong>{message.sender}</strong>
                                  <span>{message.time}</span>
                                </div>
                              )}
                              <p>{message.text}</p>
                              {message.todoDeferred && (
                                <small className="clinical-chat-deferred">已读 · 查房后进入待办</small>
                              )}
                              {message.requiresResponse && (
                                <button
                                  type="button"
                                  className={`clinical-chat-reply ${message.responded ? 'is-done' : ''}`}
                                  disabled={message.responded}
                                  onClick={() => respondToChat(message.id)}
                                >
                                  {message.responded ? '已回复' : '回复收到'}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="clinical-chat-composer">
                      {deferredChatCount > 0
                        ? `有 ${deferredChatCount} 条 @你 消息将在查房结束后进入待办。`
                        : '群聊中暂时只能回复 @你 的消息。'}
                    </div>
                  </main>
                </div>
              </div>
            )}
          </section>
          <aside className="game-right">
            <div className="exam-banner clinical-right-card">
              <div className="exam-top">
                <div>
                  <span className="exam-label">当前轮转</span>
                  <strong>{course.department} · {course.name}</strong>
                </div>
                <span className="exam-count">{clinical.mode === 'exam' ? '已出科' : `第 ${clinical.dayIndex + 1} 天`}</span>
              </div>
              <div className="clinical-right-lines">
                <div><span>科室认可度</span><strong>{clinical.recognition} / 100</strong></div>
                <div><span>今日任务</span><strong>{day ? `${day.tasks.completedTasks} / ${day.tasks.totalTasks}` : '—'}</strong></div>
                <div><span>出科成绩</span><strong>{clinical.lastRotation ? `${clinical.lastRotation.score} 分` : '尚未出科'}</strong></div>
              </div>
              <p className="exam-note">固定节点需要到场；不到场会进入逃实习，并承担被发现风险。</p>
            </div>
            <CampusNoticeBoard state={state} />
            <div className="right-links">
              <button className="text-btn" type="button" onClick={onTitle}>
                返回报到页
              </button>
            </div>
          </aside>
        </main>
        <InterfaceNav
          active="main"
          onMain={() => undefined}
          onWho={onOpenWhoAmI}
          onTA={onOpenTA}
          mainLabel="临床日"
        />
      </div>
    </div>
  )
}
