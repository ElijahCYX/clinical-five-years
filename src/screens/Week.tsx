import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ACTIONS,
  ATTRS,
  BACKGROUND_BY_ID,
  TALENT_BY_ID,
} from '../data'
import {
  effectiveEnergyCost,
  energyEffectText,
  labChoreEnergyCost,
  libraryCosts,
  estimateRange,
  courseDifficulty,
  simulateWeek,
} from '../game'
import type { ActionDef, DinnerInviteResult, GameState, SoloChatRecord, SoloInvite } from '../types'
import { Bar, Eyebrow, InterfaceNav, Pill, SectionLabel, TopBar } from '../ui'
import { PlayerRail } from './PlayerRail'
import { DinnerModal } from './Dinner'
import { SkipClassModal } from './SkipClass'
import { SkipRulesModal } from './SkipRules'
import { NpcConfessionModal } from './NpcConfession'
import { ConsumptionEventModal } from './ConsumptionEvent'
import { ClubActivityModal } from './ClubActivity'
import { CampusNoticeBoard } from './CampusNotice'
import { BondScreen } from './Bond'
import { SoloInviteModal } from './SoloInvite'
import { SoloDateOverlay } from './SoloDate'
import { ActionDoodle } from './ActionDoodle'
import { MENTOR_BY_ID, researchStage } from '../mentors'
import { ORG_BY_ID, roleLabel } from '../organizations'
import {
  buildTimetable,
  timetableCourseAt,
  timetableActivityAt,
  TIMETABLE_DAYS,
  TIMETABLE_SLOTS,
} from '../timetable'
import { soloInviteAt } from '../solo'
import { hasAvailableBond, hasUnusedLoverContact } from '../bonds'
import {
  currentWeekKey,
  academicYearForSeason,
  isDinnerFriend,
  orientationLabel,
  patRemainingThisWeek,
  relationshipKindLabel,
  relationshipStatsLine,
  unseenRelationCount,
} from '../social'

const VISIBLE_ACTIONS = [
  'library',
  'electiveHomework',
  'research',
  'club',
  'soloInvite',
  'social',
  'partTime',
  'sport',
  'english',
]

type GameTab =
  | 'timetable'
  | 'week'
  | 'people'
  | 'grades'
  | 'research'
  | 'club'
  | 'bond'
  | 'roommates'
  | 'diary'

interface WeekScreenProps {
  state: GameState
  onToggleAction: (id: string) => void
  onEndWeek: () => void
  onAttendCourse?: () => void
  onSkipCourse?: () => void
  onSkipResolved?: (success: boolean) => void
  onSlotAction?: (actionId: string) => void
  onSleepIn?: () => void
  onDrinkCoffee?: () => void
  onCampusRun?: () => void
  onDailySelfCare?: () => void
  onSoloAttempt?: (record: SoloChatRecord, invite?: SoloInvite) => void
  onResolveSoloDate?: (inviteId: string) => void
  onSlotLibraryFocus?: (focus: string) => void
  onSlotDinner?: (acceptedIds: string[], declinedIds: string[], cost: number) => void
  onSlotClubActivity?: (orgId: string, acceptedIds: string[], declinedIds: string[]) => void
  onAttendClubActivity?: () => void
  onLeaveClubActivity?: () => void
  onChooseFocus: (focus: string, addLibrary?: boolean) => void
  onWithdrawElective?: (courseId: string) => void
  onOpenWhoAmI?: () => void
  onOpenTA?: () => void
  onArrangeDinner?: (acceptedIds: string[], declinedIds: string[], cost: number) => void
  onSaveDinnerResults?: (results: DinnerInviteResult[]) => void
  onApplyClub?: () => void
  onArrangeClubActivity?: (orgId: string, acceptedIds: string[], declinedIds: string[]) => void
  onSaveClubInvites?: (results: DinnerInviteResult[], orgId: string) => void
  onQuitClub?: (orgId: string) => void
  onContactLover?: (relationshipId: string) => import('../types').LoverContactResult
  onBreakBond?: (relationshipId: string) => import('../types').BondActionResult
  onReconcileBond?: (relationshipId: string) => import('../types').BondActionResult
  onNpcConfession?: (accept: boolean) => void
  onResolveConsumption?: (accept: boolean) => void
  onSave?: () => void
  onTitle?: () => void
}

export function WeekScreen({
  state,
  onToggleAction,
  onEndWeek,
  onAttendCourse,
  onSkipCourse,
  onSkipResolved,
  onSlotAction,
  onSleepIn,
  onDrinkCoffee,
  onCampusRun,
  onDailySelfCare,
  onSoloAttempt,
  onResolveSoloDate,
  onSlotLibraryFocus,
  onSlotDinner,
  onSlotClubActivity,
  onAttendClubActivity,
  onLeaveClubActivity,
  onChooseFocus,
  onWithdrawElective,
  onOpenWhoAmI,
  onOpenTA,
  onArrangeDinner,
  onSaveDinnerResults,
  onApplyClub,
  onArrangeClubActivity,
  onSaveClubInvites,
  onQuitClub,
  onContactLover,
  onBreakBond,
  onReconcileBond,
  onNpcConfession,
  onResolveConsumption,
  onSave,
  onTitle,
}: WeekScreenProps) {
  const [tab, setTab] = useState<GameTab>('week')
  const [focusPrompt, setFocusPrompt] = useState<'library' | 'adjust' | null>(null)
  const [dinnerOpen, setDinnerOpen] = useState(false)
  const [clubActivityOpen, setClubActivityOpen] = useState(false)
  const [clubPickerOpen, setClubPickerOpen] = useState(false)
  const [soloInviteOpen, setSoloInviteOpen] = useState(false)
  const [skipClassOpen, setSkipClassOpen] = useState(false)
  const [skipRulesOpen, setSkipRulesOpen] = useState(false)
  const [mobilePage, setMobilePage] = useState(0)
  const gameGridRef = useRef<HTMLElement | null>(null)
  const [selectedClubOrgId, setSelectedClubOrgId] = useState<string | null>(null)
  const [dayTransition, setDayTransition] = useState<{
    key: number
    dayLabel: string
    weekLabel: string
  } | null>(null)
  const previousSlotRef = useRef(state.weekSlot)
  const previousWeekRef = useRef(state.week)
  const dayTransitionTimerRef = useRef<number | null>(null)
  const player = state.player
  if (!player) return null

  const talent = TALENT_BY_ID[player.talent]
  const background = BACKGROUND_BY_ID[player.background]
  const latestLog = state.logs[state.logs.length - 1]
  const remainingActions = Math.max(0, 2 - state.selected.length)
  const archetype = player.archiveTitle
  const courses = state.season.courses
  const focusableCourses = courses.filter((course) => !course.electiveType)
  const focusCourse = courses.find((course) => course.id === state.weekFocus)
  const focusLabel =
    state.weekFocus === 'balanced'
      ? '全部课程均衡分配'
      : focusCourse?.name ?? '尚未选择'
  const showFocusModal = focusPrompt !== null
  const cumulativeGpa =
    state.cumulativeCredits > 0 ? state.cumulativePoints / state.cumulativeCredits : null

  const passedPe = state.peResults.filter((item) => item.passed)
  const failedPe = state.peResults.filter((item) => !item.passed)
  const peCredits =
    passedPe.length * 2 +
    (state.peMakeupPassed ? failedPe.length * 2 : 0)
  const academicProfessionalCredits = state.courseRecords
    .filter((record) => record.category === 'professional')
    .reduce((sum, record) => sum + record.credits, 0)
  const hasCourseRecords = state.courseRecords.length > 0
  const professionalEarned = hasCourseRecords
    ? academicProfessionalCredits + peCredits
    : Math.max(
        0,
        state.cumulativeCredits - state.politicsCredits - state.electiveCredits,
      )
  const politicsEarned = state.politicsCredits
  const electiveEarned = state.electiveCredits
  const graduationTargets = [
    { key: 'professional', label: '专业课', earned: professionalEarned, target: 167 },
    { key: 'politics', label: '思政课', earned: politicsEarned, target: 11 },
    { key: 'elective', label: '选修课', earned: electiveEarned, target: 10 },
    { key: 'pe', label: '体育课', earned: state.peCourseCredits, target: 8 },
  ]
  const passedRecords = [
    ...state.courseRecords,
    ...passedPe.map((item) => ({
      id: `pe-${item.year}`,
      name: `体测（${['一', '二', '三', '四', '五'][item.year - 1] ?? item.year}）`,
      credits: 2,
      gpa: item.gpa,
      score: item.score,
      category: 'professional' as const,
    })),
  ].sort((a, b) => {
    const order = { professional: 0, politics: 1, elective: 2, pe: 3 }
    return order[a.category] - order[b.category] || a.name.localeCompare(b.name)
  })
  const categoryLabel = (category: string) =>
    category === 'professional' ? '专业课' : category === 'politics' ? '思政课' : category === 'pe' ? '体育课' : '选修课'
  const selectedGroups = Array.from(new Set(state.selected)).map((id) => ({
    id,
    count: state.selected.filter((item) => item === id).length,
  }))
  const countOf = (id: string) => state.selected.filter((item) => item === id).length
  const clubYear = academicYearForSeason(state.seasonIndex)
  const clubMemberships = state.clubMemberships ?? []
  const existingClubs = clubMemberships.filter(
    (membership) =>
      membership.category === 'academic' ||
      membership.category === 'interest' ||
      membership.category === 'practice',
  )
  const canApplyClub =
    state.clubInitialRecruitmentDone &&
    clubYear <= 2 &&
    state.week === 1 &&
    (clubMemberships.length === 0 ||
      (clubMemberships.length === 1 && existingClubs.length === 1))
  const clubCommitted = Boolean(state.clubActivityPlan?.committed)
  const selectedMembership =
    clubMemberships.find((membership) => membership.orgId === selectedClubOrgId) ??
    null
  const clubMembers = selectedMembership
    ? (selectedMembership.memberIds
        .map((id) => state.relationships.find((relation) => relation.id === id))
        .filter(Boolean) as typeof state.relationships)
    : []
  const dinnerCommitted = Boolean(state.dinnerPlan?.committed)
  const handleActionClick = (id: string) => {
    if (id === 'club') {
      if (clubCommitted) return
      if (canApplyClub && clubMemberships.length === 0) {
        onApplyClub?.()
        return
      }
      if (clubMemberships.length === 1) {
        setSelectedClubOrgId(clubMemberships[0].orgId)
        setClubActivityOpen(true)
        return
      }
      if (clubMemberships.length === 2) {
        setClubPickerOpen(true)
      }
      return
    }
    if (id === 'social' && dinnerCommitted) return
    if (
      id === 'library' &&
      courses.length > 1 &&
      !state.weekFocus &&
      countOf('library') === 0 &&
      state.selected.length < 2
    ) {
      setFocusPrompt('library')
      return
    }
    if (id === 'social' && countOf('social') === 0) {
      if (state.selected.length >= 2) return
      setDinnerOpen(true)
      return
    }
    onToggleAction(id)
  }
  const chooseFocus = (focus: string) => {
    if (focusPrompt === 'library') {
      onSlotLibraryFocus?.(focus)
    } else {
      onChooseFocus(focus, false)
    }
    setFocusPrompt(null)
  }
  const handleSlotActionClick = (id: string) => {
    if (
      id === 'library' &&
      focusableCourses.length > 1 &&
      !state.weekFocus
    ) {
      setFocusPrompt('library')
      return
    }
    if (id === 'social') {
      setDinnerOpen(true)
      return
    }
    if (id === 'soloInvite') {
      if (
        timetableActivityAt(state, state.weekSlot) ||
        (!state.weekSlotSkipped && timetableCourseAt(state, state.weekSlot))
      ) {
        return
      }
      setSoloInviteOpen(true)
      return
    }
    if (id === 'club') {
      if (canApplyClub && clubMemberships.length === 0) {
        onApplyClub?.()
        return
      }
      if (clubMemberships.length === 1) {
        setSelectedClubOrgId(clubMemberships[0].orgId)
        setClubActivityOpen(true)
        return
      }
      if (clubMemberships.length === 2) {
        setClubPickerOpen(true)
        return
      }
    }
    onSlotAction?.(id)
  }

  const researchActionName = state.researchPublished
    ? '论文已发表'
    : !state.labEntered
      ? '科研相关'
      : !state.researchStarted
        ? '实验室打杂'
        : researchStage(state.researchProgress).name
  const clubActionName =
    canApplyClub && clubMemberships.length === 0
      ? '申请加入组织'
      : '组织活动'
  const displayActionName = (action: ActionDef) => {
    if (action.id === 'research') return researchActionName
    if (action.id === 'club') return clubActionName
    return action.name
  }

  const actionEffectText = (action: ActionDef) => {
    if (action.id === 'english') {
      return '英语成长值 +100% · 精力 -6 · 压力 +2'
    }
    if (action.id === 'sport' && state.habits.includes('fitness')) {
      return '健身习惯生效：正向收益减半 · 体质成长值 +5% · 精力 -5 · 压力 -5'
    }
    if (action.id === 'library') {
      const costs = libraryCosts(state)
      return `所有课程：准备度 +K${state.habits.includes('timeManagement') ? '（时间管理 +10%）' : ''}${state.energy < 40 ? '（低精力减半）' : ''} · 精力 ${costs.energy}${state.energy < 40 ? '（减半）' : ''} · 压力 +${costs.stress} · 当前 ${costs.count} 门计费课程（消耗按 ${costs.costCount} 门封顶）`
    }
    if (action.id === 'club') {
      if (canApplyClub && clubMemberships.length === 0) {
        return '消耗一次本周行动，浏览并申请加入组织'
      }
      if (selectedMembership) {
        const role = selectedMembership.role
        return `人际成长值 +${Math.round(5 * (role === 'officer' ? 1.15 : role === 'president' || role === 'honorary' ? 1.3 : 1))}% · 精力 -8 · 压力 +3 · 生活费 -5`
      }
      if (clubMemberships.length > 1) return '精力 -8 · 压力 +3 · 生活费 -5 · 先选择参加哪个社团'
      if (clubMemberships.length === 1) {
        const role = clubMemberships[0].role
        return `人际成长值 +${Math.round(5 * (role === 'officer' ? 1.15 : role === 'president' || role === 'honorary' ? 1.3 : 1))}% · 精力 -8 · 压力 +3 · 生活费 -5`
      }
      return '目前无法加入新的组织'
    }
    if (action.id === 'research') {
      if (!state.labEntered) return '等待导师允许进入实验室'
      if (!state.researchStarted) {
        return `导师亲密度 +5 · 精力 ${labChoreEnergyCost(state.player?.attrs.comprehension ?? 5)} · 压力 +3`
      }
      return '科研 +2~6 · 科研进度 +2~6（悟性越高越容易抽到高值）· 精力 -20 · 压力 +3'
    }
    return energyEffectText(action.effectText, action.energy, state.energy)
  }
  const preview = state.selected.length > 0 ? simulateWeek(state) : null
  const previewTransition = (
    current: number,
    target: number | null,
    goodWhenHigher: boolean,
  ) => {
    if (target === null) return null
    const tone =
      target === current
        ? 'is-flat'
        : goodWhenHigher
          ? target > current
            ? 'is-good'
            : 'is-bad'
          : target < current
            ? 'is-good'
            : 'is-bad'
    return (
      <em className={`mobile-hud-delta ${tone}`}>
        →{target}
      </em>
    )
  }
  const kaoyanWindow =
    (state.postgradChoice === 'both' &&
      ['大四 · 夏', '大五 · 秋', '大五 · 冬'].includes(state.season.seasonLabel)) ||
    (state.kaoyanRegistered && state.season.seasonLabel === '大五 · 冬')
  const visibleActions = kaoyanWindow
    ? [...VISIBLE_ACTIONS, 'kaoyan']
    : VISIBLE_ACTIONS
  const weekTimetable = buildTimetable(state)
  const weekSlot = Math.max(0, Math.min(20, state.weekSlot))
  const activeSoloInvite = soloInviteAt(state, weekSlot)
  const bondContactUnused = hasUnusedLoverContact(state)
  const currentSlotActivity = timetableActivityAt(state, weekSlot)
  const currentSlotCourse =
    !currentSlotActivity &&
    !state.weekSlotSkipped &&
    timetableCourseAt(state, weekSlot)
  const currentSlotDay = TIMETABLE_DAYS[Math.floor(weekSlot / 3)]
  const currentSlotPhase = TIMETABLE_SLOTS[weekSlot % 3]
  const currentSlotIsMorning = weekSlot % 3 === 0
  const currentCourseStars = currentSlotCourse
    ? courseDifficulty(currentSlotCourse).stars
    : 3
  const currentCourseEnergyCost =
    10 + (currentCourseStars >= 4 ? 2 : currentCourseStars <= 2 ? -2 : 0)
  const dailyKey = `${state.seasonIndex}-${state.week}-${Math.floor(weekSlot / 3)}`
  const coffeeUsedToday = state.coffeeDayKey === dailyKey
  const runUsedToday = state.campusRunDayKey === dailyKey
  const selfCareUsedToday = state.selfCareDayKey === dailyKey
  const coffeeCost = state.habits.includes('ledger') ? 5 : 10
  const selfCareCost = state.habits.includes('ledger') ? 15 : 30
  const earlyRiseBlocked =
    currentSlotIsMorning &&
    Math.floor(weekSlot / 3) <= 4 &&
    state.habits.includes('earlyRise')
  const morningActivityDone =
    currentSlotIsMorning && (coffeeUsedToday || runUsedToday)
  const sleepInDisabled = morningActivityDone || earlyRiseBlocked
  const hasPeCourse = Boolean(state.pendingPeCourseId)
  const runCap = state.peRunCount >= 24 ? 100 : state.peRunCount >= 12 ? 80 : 60
  const weekPhaseClass = ['morning', 'afternoon', 'evening'][weekSlot % 3]
  const pastPalette =
    weekPhaseClass === 'morning'
      ? { hue: 40, sat: 50, start: 27, end: 43 }
      : weekPhaseClass === 'afternoon'
        ? { hue: 154, sat: 26, start: 18, end: 37 }
        : { hue: 257, sat: 25, start: 22, end: 42 }
  const weekPhaseSymbol = weekPhaseClass === 'morning' ? '☀' : weekPhaseClass === 'afternoon' ? '◐' : '☾'

  useLayoutEffect(() => {
    const previousSlot = previousSlotRef.current
    const previousWeek = previousWeekRef.current
    const isEveningToNextDay =
      previousSlot % 3 === 2 &&
      (state.weekSlot === previousSlot + 1 ||
        (state.weekSlot === 0 && state.week !== previousWeek))
    previousSlotRef.current = state.weekSlot
    previousWeekRef.current = state.week

    if (!isEveningToNextDay || tab !== 'week') return
    const center = gameGridRef.current?.querySelector('.game-center') as HTMLElement | null
    center?.scrollTo({ top: 0 })
    const nextDay = TIMETABLE_DAYS[Math.floor(state.weekSlot / 3)]
    setDayTransition({
      key: Date.now(),
      dayLabel: state.weekSlot === 0 && state.week !== previousWeek ? '新的一周' : nextDay,
      weekLabel:
        state.weekSlot === 0 && state.week !== previousWeek
          ? `第 ${state.week} 周 · 周一`
          : `第 ${Math.floor(state.weekSlot / 3) + 1} 天 · ${nextDay}`,
    })
    document.body.classList.add('day-transitioning')
    if (dayTransitionTimerRef.current !== null) {
      window.clearTimeout(dayTransitionTimerRef.current)
    }
    dayTransitionTimerRef.current = window.setTimeout(() => {
      setDayTransition(null)
      document.body.classList.remove('day-transitioning')
      dayTransitionTimerRef.current = null
    }, 1800)
  }, [state.weekSlot, state.week, tab])

  useEffect(
    () => () => {
      if (dayTransitionTimerRef.current !== null) {
        window.clearTimeout(dayTransitionTimerRef.current)
      }
      document.body.classList.remove('day-transitioning')
    },
    [],
  )

  const lockReason = (action: ActionDef): string | null => {
    if (
      action.id === 'electiveHomework' &&
      !state.season.courses.some((course) => course.electiveType)
    ) {
      return '本学期没有选修课程'
    }
    if (action.id === 'social') {
      if (!state.relationships.some((relation) => isDinnerFriend(relation))) {
        return '还没有能叫出来组局的人'
      }
      if (state.money < 50) return '生活费不足'
    }
    if (action.id === 'research') {
      if (!state.mentorContactUnlocked) return '还没有导师'
      if (!state.labEntered) return '导师还没有允许你进实验室'
      if (state.researchPublished) return '论文已经发表'
    }
    if (action.requires === 'mentor' && action.id !== 'research') {
      return action.lockedNote ?? '尚未解锁'
    }
    if (action.id === 'club') {
      if (canApplyClub) return null
      if (clubMemberships.length > 0) {
        return clubCommitted ? '本周已参加组织活动' : null
      }
      if (!state.clubInitialRecruitmentDone) return '尚未完成入学招新'
      if (clubYear > 2) return '已错过加入时间'
      if (state.week !== 1) return '本学期申请时间已过'
      return '尚未加入社团学生会'
    }
    if (action.requires === 'club') return action.lockedNote ?? '尚未解锁'
    if (action.requires === 'partner') return action.lockedNote ?? '尚未解锁'
    const energyCost =
      action.id === 'library'
        ? libraryCosts(state).energy
        : action.id === 'research' && state.labEntered && !state.researchStarted
          ? labChoreEnergyCost(state.player?.attrs.comprehension ?? 5)
          : effectiveEnergyCost(action.energy, state.energy)
    if (energyCost < 0 && state.energy + energyCost < 0) return '精力不足'
    if (action.money < 0 && state.money + action.money < 0) return '生活费不足'
    return null
  }

  const renderAttributePanel = () => (
    <div className="tab-panel">
      <SectionLabel right={archetype}>人物档案</SectionLabel>
      <div className="identity-card identity-in-tab">
        <div className="identity-line">
          <span>入学档案称号</span>
          <strong>{archetype}</strong>
        </div>
        <div className="identity-line">
          <span>天赋档位</span>
          <strong>{talent.name}</strong>
        </div>
        <div className="identity-line">
          <span>当前学业</span>
          <strong>
            {cumulativeGpa === null ? '第一学期' : `GPA ${cumulativeGpa.toFixed(2)}`}
          </strong>
        </div>
        <div className="identity-line">
          <span>姓名 / 性别</span>
          <strong>{player.name} · {player.gender}</strong>
        </div>
        <div className="identity-line">
          <span>家庭背景</span>
          <strong>{background.name}</strong>
        </div>
      </div>
      <div className="attr-readonly">
        {ATTRS.map((attr) => (
          <div className="attr-readonly-row" key={attr.key}>
            <div className="attr-readonly-name">
              <span>{attr.name}</span>
              <small>{attr.en}</small>
            </div>
            <div className="segments">
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={`segment ${index < player.attrs[attr.key] ? 'segment-on' : ''}`}
                />
              ))}
            </div>
            <strong>{player.attrs[attr.key]}</strong>
          </div>
        ))}
      </div>
      <div className="people-meta">
        <div>
          <span>家庭背景</span>
          <strong>{background.name}</strong>
        </div>
        <div>
          <span>性别</span>
          <strong>{player.gender}</strong>
        </div>
        <div>
          <span>天赋</span>
          <strong>{talent.name}</strong>
        </div>
        <div>
          <span>体质成长</span>
          <strong>{Math.round(state.constitutionGrowth)}%</strong>
        </div>
        <div>
          <span>人际成长</span>
          <strong>{Math.round(state.socialGrowth)}%</strong>
        </div>
      </div>
      <p className="placeholder-note">人物关系与好感系统将在后续模块展开。</p>
    </div>
  )

  const renderTimetable = () => {
    const timetable = buildTimetable(state)
    const kindOf = (electiveType?: string) => {
      if (!electiveType) return 'professional'
      if (electiveType === 'pe') return 'pe'
      if (electiveType === 'politics') return 'politics'
      return 'elective'
    }
    return (
      <div className="tab-panel timetable-panel">
        <div className="week-title-row">
          <div>
            <h2>本周课表</h2>
            <p>按学分换算占格。先排专业课，再排选修课；优先工作日白天。</p>
          </div>
          <Pill tone={timetable.placedSlots === 21 ? 'green' : 'plain'}>
            已排 {timetable.placedSlots} / 21 格
          </Pill>
        </div>

        <section className="paper-card timetable-sheet">
          <div className="timetable-head">
            <div>
              <Eyebrow>WEEKLY TIMETABLE / 21 SLOTS</Eyebrow>
              <h3>七天 · 三个时段</h3>
            </div>
            <div className="timetable-legend">
              <span><i className="legend-dot professional" />专业课</span>
              <span><i className="legend-dot elective" />选修课</span>
              <span><i className="legend-dot pe" />体育课</span>
              <span><i className="legend-dot politics" />思政课</span>
              <span><i className="legend-dot club" />组织活动</span>
              <span><i className="legend-dot solo" />单独邀约</span>
            </div>
          </div>

          <div className="timetable-scroll">
            <div className="timetable-grid">
              <div className="timetable-cell timetable-corner">时段</div>
              {TIMETABLE_DAYS.map((day) => (
                <div className="timetable-cell timetable-day" key={day}>
                  {day}
                </div>
              ))}
              {TIMETABLE_SLOTS.flatMap((slot, slotIndex) => [
                <div className="timetable-cell timetable-slot-label" key={slot}>
                  {slot}
                </div>,
                ...TIMETABLE_DAYS.map((day, dayIndex) => {
                  const cell = timetable.cells[dayIndex * 3 + slotIndex]
                  const course = cell.course
                  const activity = cell.activity
                  const soloInvite = cell.soloInvite
                  return (
                    <div
                      className={`timetable-cell timetable-slot ${
                        activity
                          ? 'has-course kind-club'
                          : soloInvite
                            ? 'has-course kind-solo'
                            : course
                              ? `has-course kind-${kindOf(course.electiveType)}`
                              : 'is-empty'
                      }`}
                      key={`${day}-${slot}`}
                    >
                      {activity ? (
                        <>
                          <strong>{activity.name}</strong>
                          <small>组织活动 · 强制占格</small>
                        </>
                      ) : soloInvite ? (
                        <>
                          <strong>{soloInvite.eventName}</strong>
                          <small>{soloInvite.partnerName} · 单独邀约</small>
                        </>
                      ) : course ? (
                        <>
                          <strong>{course.name}</strong>
                          <small>{course.credits} 学分</small>
                        </>
                      ) : (
                        <span>空</span>
                      )}
                    </div>
                  )
                }),
              ])}
            </div>
          </div>

          <div className="timetable-footer">
            <p>
              1 学分占 1 格，2–3 学分占 2 格，4–5 学分占 3 格。
              临床前课程占满周一至周五的早上和下午。
            </p>
            <span>
              {timetable.blocks.filter((block) => block.course.credits >= 10).length > 0
                ? '临床前周 · 白天满课'
                : '工作日白天优先 · 晚上与周末作为补充'}
            </span>
          </div>
        </section>
      </div>
    )
  }

  const renderGrades = () => (
    <div className="tab-panel">
      <SectionLabel right="5 分制绩点">成绩档案</SectionLabel>
      <div className="grade-summary">
        <div>
          <span>累计 GPA</span>
          <strong>{cumulativeGpa === null ? '—' : cumulativeGpa.toFixed(2)}</strong>
        </div>
        <div>
          <span>已修学分</span>
          <strong>{state.cumulativeCredits}</strong>
        </div>
        <div>
          <span>毕业总要求</span>
          <strong>196</strong>
        </div>
      </div>

      <SectionLabel right="毕业资格审查">毕业进度</SectionLabel>
      <div className="grade-progress">
        {graduationTargets.map((item) => {
          const percent = Math.min(100, (item.earned / item.target) * 100)
          const remaining = Math.max(0, item.target - item.earned)
          return (
            <div className="grade-progress-row" key={item.key}>
              <div className="grade-progress-head">
                <span>{item.label}</span>
                <strong>
                  {item.earned} / {item.target} 学分
                </strong>
                <em>{remaining === 0 ? '已完成' : `还差 ${remaining} 学分`}</em>
              </div>
              <Bar value={percent} max={100} thin />
            </div>
          )
        })}
      </div>

      <SectionLabel right={`${passedRecords.length} 门已通过`}>已通过课程</SectionLabel>
      {passedRecords.length === 0 ? (
        <p className="placeholder-note">
          还没有已归档的通过课程。考试结算后，这里会按课程记录绩点与学分。
        </p>
      ) : (
        <div className="grade-record-list">
          {passedRecords.map((record) => (
            <div className="grade-record-row" key={record.id}>
              <div className="grade-record-main">
                <div className="grade-record-title">
                  <span>{record.name}</span>
                  <small>{categoryLabel(record.category)}</small>
                </div>
                <div className="grade-record-meta">
                  <span>{record.credits} 学分</span>
                  <span>{record.score} 分</span>
                </div>
              </div>
              <div className="grade-record-bar">
                <Bar value={record.gpa} max={5} thin />
              </div>
              <strong className="grade-record-gpa">{record.gpa.toFixed(1)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )


  const renderResearch = () => {
    const mentorRelation = state.relationships.find(
      (relation) => relation.kind === 'mentor',
    )
    const profile = state.mentorProfileId
      ? MENTOR_BY_ID[state.mentorProfileId]
      : null
    const stage = researchStage(state.researchProgress)

    if (!state.mentorContactUnlocked) {
      return (
        <div className="tab-panel">
          <SectionLabel right="LOCKED">科研</SectionLabel>
          <div className="locked-panel">
            <span className="lock-glyph">✳</span>
            <h3>还没有找到导师</h3>
            <p>
              科研系统需要通过随机事件结识一位导师才会解锁。
              先去过几周，留意讲台边、讲座后和实验室门口。
            </p>
          </div>
        </div>
      )
    }

    if (!state.labEntered) {
      return (
        <div className="tab-panel">
          <SectionLabel right="WAITING FOR LAB">科研</SectionLabel>
          <div className="research-locked-card">
            <span className="lock-glyph">⌁</span>
            <h3>导师已经联系上了</h3>
            <p>
              导师愿意先和你聊聊，但还没有允许你进入课题组。
              和导师的亲密度达到 40 后，TA 会通知你进实验室。
            </p>
            {mentorRelation && (
              <div className="research-mentor-line">
                <span>{mentorRelation.name}</span>
                <strong>亲密度 {mentorRelation.intimacy} / 40 · 认可度 {state.mentorRecognition}</strong>
              </div>
            )}
            {profile && (
              <p className="research-mentor-meta">
                {profile.department} · {profile.title} · {profile.field}
              </p>
            )}
          </div>
        </div>
      )
    }

    if (!state.researchStarted) {
      return (
        <div className="tab-panel">
          <SectionLabel right="LAB CHORES">科研</SectionLabel>
          <div className="research-locked-card">
            <span className="lock-glyph">⌁</span>
            <h3>实验室打杂中</h3>
            <p>
              你已经可以进出实验室，但还没有自己的课题。
              先帮师兄师姐跑跑胶、配配液、整理数据，顺便和导师混熟。
            </p>
            {mentorRelation && (
              <div className="research-mentor-line">
                <span>{mentorRelation.name}</span>
                <strong>亲密度 {mentorRelation.intimacy} / 60 · 认可度 {state.mentorRecognition}</strong>
              </div>
            )}
            <p className="research-mentor-meta">
              亲密度达到 60 后，导师会给你一个可以开始的课题。
              本周选择「实验室打杂」可以增加导师亲密度，并有概率收到导师分配课题的通知。
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="tab-panel">
        <SectionLabel
          right={
            state.researchPublished
              ? 'PUBLISHED'
              : state.researchStarted
                ? stage.name
                : 'LAB CHORES'
          }
        >
          课题组
        </SectionLabel>
        <div className="research-panel">
          <div className="research-panel-head">
            <div>
              <h3>{profile?.alias ?? mentorRelation?.name ?? '导师'}</h3>
              <p>
                {profile ? `${profile.department} · ${profile.title}` : '导师'} ·{' '}
                {profile?.field ?? '科研训练'}
              </p>
              {state.activeHypothesisTitle && (
                <p className="research-hypothesis">
                  当前课题：{state.activeHypothesisTitle}
                </p>
              )}
            </div>
            <Pill tone={state.researchPublished ? 'green' : 'gold'}>
              {state.researchPublished ? '已发表' : stage.name}
            </Pill>
          </div>

          <div className="research-progress-row">
            <div>
              <span>科研进度</span>
              <strong>{state.researchProgress} / 100</strong>
            </div>
            <div>
              <span>导师认可度</span>
              <strong>{state.mentorRecognition}</strong>
            </div>
            <Bar value={state.researchProgress} max={100} />
            <p>{stage.description}</p>
          </div>

          {state.researchPublished ? (
            <div className="research-published">
              <span>论文已刊登</span>
              <strong>{state.researchJournal ?? '待定期刊'}</strong>
              <p>科研阶段完成。之后可以继续以其他方式积累科研经历。</p>
            </div>
          ) : (
            <div className="research-action-note">
              <span>本周科研行动</span>
              <strong>
                {state.researchStarted ? '科研进度随机 +2–6' : '实验室打杂 · 导师亲密度 +5'}
              </strong>
              <p>
                {state.researchStarted
                  ? '悟性越高，抽出 4、5 点的概率越高。科研进度会显示在「本周安排」的科研相关行动中。'
                  : '你还在熟悉实验室。和导师亲密度达到 60 后，TA 会给你一个可以开始的课题。'}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }


  const renderClub = () => {
    if (clubMemberships.length === 0) {
      return (
        <div className="tab-panel">
          <SectionLabel right="NOT JOINED">组织</SectionLabel>
          <div className="locked-panel">
            <span className="lock-glyph">○</span>
            <h3>还没有加入组织</h3>
            <p>大一大二的每周行动第一周，可以选择「申请加入组织」。</p>
          </div>
        </div>
      )
    }
    return (
      <div className="tab-panel">
        <SectionLabel right={`${clubMemberships.length} 个组织`}>
          我的组织
        </SectionLabel>
        {clubMemberships.length === 2 && (
          <p className="club-panel-note">
            同时参与两个组织，每周活动与学期福利将按 80% 结算。
          </p>
        )}
        <div className="club-membership-list">
          {clubMemberships.map((membership) => {
            const org = ORG_BY_ID[membership.orgId]
            const members = membership.memberIds
              .map((id) =>
                state.relationships.find((relation) => relation.id === id),
              )
              .filter(Boolean) as typeof state.relationships
            const nextNeed =
              membership.role === 'member'
                ? 25
                : membership.role === 'officer'
                  ? 60
                  : null
            return (
              <div className="club-panel" key={membership.orgId}>
                <div className="club-panel-head">
                  <div>
                    <h3>{roleLabel(membership.category, membership.role)}</h3>
                    <p>{org?.description}</p>
                  </div>
                  <Pill tone="green">
                    {membership.semesterActivities} 次本学期活动
                  </Pill>
                </div>
                <div className="club-panel-stats">
                  <div>
                    <span>累计活动</span>
                    <strong>{membership.totalActivities}</strong>
                  </div>
                  <div>
                    <span>晋升进度</span>
                    <strong>
                      {nextNeed
                        ? `${membership.totalActivities} / ${nextNeed}`
                        : '已到最高职务'}
                    </strong>
                  </div>
                  <div>
                    <span>组织朋友</span>
                    <strong>{members.length} 人</strong>
                  </div>
                </div>
                <div className="club-panel-actions">
                  <p>
                    {org?.name} · 每学期第 3 周后可领取一次组织福利。
                  </p>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => onQuitClub?.(membership.orgId)}
                  >
                    退出组织
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {canApplyClub && (
          <p className="club-panel-note">
            本周第一周，仍可通过「申请加入第二个社团」继续报名。
          </p>
        )}
      </div>
    )
  }

  const renderRoommates = () => (
    <div className="tab-panel">
      <SectionLabel right={`${state.relationships.length} 人`}>
        舍友与认识的人
      </SectionLabel>
      {state.relationships.length === 0 ? (
        <p className="placeholder-note">还没有认识的人。下学期也许会遇见谁。</p>
      ) : (
        <div className="roommate-grid">
          {state.relationships.map((relation) => {
            const stats = relationshipStatsLine(relation)
            return (
              <article className="roommate-card" key={relation.id}>
                <div className="roommate-top">
                  <div className="roommate-avatar">{relation.name.slice(0, 1)}</div>
                  <div>
                    <h4>
                      {relation.name}
                      <span
                        className={`inline-gender ${relation.gender === '男' ? 'is-male' : 'is-female'}`}
                        title={relation.gender === '男' ? '男性' : '女性'}
                        aria-label={relation.gender === '男' ? '男性' : '女性'}
                      >
                        {relation.gender === '男' ? '♂' : '♀'}
                      </span>
                      {relation.intimacy >= 80 && (
                        <span
                          className="inline-orientation"
                          title={`性取向：${orientationLabel(relation.orientation)}`}
                        >
                          {orientationLabel(relation.orientation)}
                        </span>
                      )}
                    </h4>
                    <p>
                      {relation.identity}
                      {relationshipKindLabel(relation.kind) !== relation.identity
                        ? ` · ${relationshipKindLabel(relation.kind)}`
                        : ''}
                    </p>
                  </div>
                  <span className="roommate-intimacy">{relation.intimacy}</span>
                </div>
                <Bar value={relation.intimacy} thin />
                {relation.kind === 'roommate' && (
                  <p className="roommate-action">本周：{relation.weeklyAction}</p>
                )}
                <div className="roommate-stats">
                  {stats.length > 0 ? (
                    stats.map((line) => <span key={line}>{line}</span>)
                  ) : (
                    <span className="roommate-unknown">面板 ??? · 亲密度 100 后完全解锁</span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
      <button type="button" className="text-btn tab-link" onClick={onOpenTA}>
        去 TA 是谁看完整关系 →
      </button>
    </div>
  )

  const renderDiary = () => (
    <div className="tab-panel">
      <SectionLabel right={`${state.logs.length} 条记录`}>日记</SectionLabel>
      {state.logs.length === 0 ? (
        <p className="placeholder-note">第一周还没有结束。做点什么，再回来写日记。</p>
      ) : (
        <div className="diary-list">
          {state.logs.map((log) => (
            <article key={log.week} className="diary-item">
              <span className="diary-week">W{String(log.week).padStart(2, '0')}</span>
              <div>
                <h4>{log.title}</h4>
                <p>{log.text}</p>
                <div className="delta-row">
                  {log.deltas.map((delta) => (
                    <span key={delta}>{delta}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="screen game-screen">
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
            <Eyebrow>
              CHAPTER {state.season.chapterNo} / {state.season.chapterEn}
            </Eyebrow>
            <h1>{state.season.chapterTitle}</h1>
            <p>
              {state.season.seasonLabel}
              <span className="head-sep">/</span>
              {state.season.courses.map((item) => item.name).join(' + ')}
              <span className="head-sep">/</span>
              {state.season.examKind}
            </p>
          </div>
          <div className="game-head-right">
            <span className="week-big">{String(state.week).padStart(2, '0')}</span>
            <span className="week-small">
              / 04 周
              <br />
              {state.season.yearLabel}
            </span>
          </div>
        </header>

        <div className="mobile-hud">
          <div>
            <span>精力</span>
            <strong>
              {state.energy}
              {previewTransition(state.energy, preview?.energy ?? null, true)}
            </strong>
          </div>
          <div>
            <span>压力</span>
            <strong>
              {state.stress}
              {previewTransition(state.stress, preview?.stress ?? null, false)}
            </strong>
          </div>
          <div>
            <span>生活费</span>
            <strong>¥{state.money}</strong>
          </div>
          <div>
            <span>时间段</span>
            <strong>{weekSlot + 1}/21</strong>
          </div>
        </div>
        <div className="mobile-course-strip">
          {courses.map((course) => (
            <span key={course.id}>
              {course.name} <b>{Math.round(state.prep[course.id] ?? 0)}</b>
            </span>
          ))}
        </div>

        <nav className="mobile-page-tabs" aria-label="手机页面切换">
          {['状态', '本周', '通知'].map((label, index) => (
            <button
              key={label}
              type="button"
              className={mobilePage === index ? 'is-active' : ''}
              onClick={() => {
                const grid = gameGridRef.current
                if (!grid) return
                grid.scrollTo({
                  left: grid.clientWidth * index,
                  behavior: 'smooth',
                })
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <main
          ref={gameGridRef}
          className="game-grid"
          onScroll={() => {
            const grid = gameGridRef.current
            if (!grid) return
            const page = Math.round(grid.scrollLeft / Math.max(1, grid.clientWidth))
            setMobilePage(Math.max(0, Math.min(2, page)))
          }}
        >
          <PlayerRail
            state={state}
            title="WEEKLY STATUS"
            titleRight={`第 ${state.week} 周`}
            preview={preview}
            mode="week"
          />


          <section className={`game-center time-${weekPhaseClass} tab-${tab}`}>
            <div
              className={`time-phase-veil phase-${weekPhaseClass}`}
              key={weekPhaseClass}
              aria-hidden="true"
            >
              <span className="time-phase-orb" />
            </div>
            <nav className="tabs">
              {(
                [
                  ['timetable', '课表'],
                  ['week', '本周安排'],
                  ['people', '档案'],
                  ['grades', '成绩'],
                  ['research', '科研'],
                  ['club', '组织'],
                  ['bond', '羁绊'],
                  ['roommates', '相识'],
                  ['diary', '日记'],
                ] as Array<[GameTab, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`${tab === key ? 'is-active' : ''} ${
                    key === 'bond' && bondContactUnused ? 'bond-alert-button' : ''
                  }`}
                  onClick={() => setTab(key)}
                >
                  {label}
                  {key === 'bond' && bondContactUnused && (
                    <span
                      className="tab-alert"
                      aria-label="有尚未使用的联系 TA"
                      title="有尚未使用的联系 TA"
                    >
                      !
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {dayTransition && (
              <div
                key={dayTransition.key}
                className="day-transition-overlay"
                aria-hidden="true"
              >
                <span className="day-transition-sun" />
                <div className="day-transition-copy">
                  <Eyebrow>NEW DAY / WEEK {state.week}</Eyebrow>
                  <h2>{dayTransition.dayLabel}</h2>
                  <p>新的一天开始了</p>
                  <small>{dayTransition.weekLabel}</small>
                </div>
                <span className="day-transition-horizon" />
              </div>
            )}

            {tab === 'timetable' && renderTimetable()}

            {tab === 'week' && (
              <>
                <div className="week-title-row">
                  <div>
                    <h2>这周，你想怎么过？</h2>
                    <p>21 个时间段，每次选择都会推进时间。当前：{currentSlotDay} · {currentSlotPhase}。</p>
                  </div>
                  <div
                    className={`week-phase-badge mobile-week-badge phase-${weekPhaseClass}`}
                    key={`mobile-${weekPhaseClass}`}
                  >
                    <span className="week-phase-symbol" aria-hidden="true">
                      {weekPhaseSymbol}
                    </span>
                    <div>
                      <small>{currentSlotDay}</small>
                      <strong>{currentSlotPhase}</strong>
                    </div>
                    <em>{weekSlot + 1} / 21</em>
                  </div>
                  <div
                    className={`week-overview overview-palette-${weekPhaseClass}`}
                    aria-label="本周安排概览"
                  >
                    <div className="week-overview-head">
                      <span>本周概览</span>
                      <small>7 日 × 3 段</small>
                    </div>
                    <div className="week-overview-grid">
                      {TIMETABLE_SLOTS.flatMap((phase, slotIndex) =>
                        TIMETABLE_DAYS.map((day, dayIndex) => {
                          const index = dayIndex * 3 + slotIndex
                          const cell = weekTimetable.cells[index]
                          const hasPlan = Boolean(
                            cell.course ||
                              cell.activity ||
                              cell.soloInvite,
                          )
                          const isPast = index < state.weekSlot
                          const isCurrent = index === state.weekSlot
                          return (
                            <span
                              key={`${day}-${phase}`}
                              className={`week-overview-dot ${
                                hasPlan ? 'has-plan' : 'is-free'
                              } ${isPast ? 'is-past' : ''} ${
                                isCurrent ? 'is-current' : ''
                              }`}
                              title={`${day} · ${phase} · ${
                                cell.course?.name ??
                                cell.activity?.name ??
                                cell.soloInvite?.eventName ??
                                '空闲'
                              }`}
                            />
                          )
                        }),
                      )}
                    </div>
                  </div>
                </div>

                <div className="week-controls-row">
                  <div className="week-slot-strip" aria-label="本周时间段进度">
                    {TIMETABLE_DAYS.map((day, dayIndex) => (
                      <div className="week-slot-day" key={day}>
                        {TIMETABLE_SLOTS.map((phase, slotIndex) => {
                          const index = dayIndex * 3 + slotIndex
                          const cell = weekTimetable.cells[index]
                          const isPast = index < state.weekSlot
                          const isCurrent = index === state.weekSlot
                          const pastFill = isPast
                            ? {
                                background: `hsl(${pastPalette.hue} ${pastPalette.sat}% ${
                                  pastPalette.start +
                                  (pastPalette.end - pastPalette.start) *
                                    (index / 20)
                                }%)`,
                              }
                            : undefined
                          return (
                            <div
                              key={`${day}-${phase}`}
                              className={`week-slot-square ${
                                isPast
                                  ? 'is-past'
                                  : isCurrent
                                    ? 'is-current'
                                    : 'is-future'
                              } ${cell.course ? 'has-course' : ''}`}
                              style={pastFill}
                              title={`${day} · ${phase}${cell.course ? ` · ${cell.course.name}` : ''}`}
                            >
                              <span>{index + 1}</span>
                              <small>{day.replace('周', '')}{phase.slice(0, 1)}</small>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  <div
                    className={`week-phase-badge desktop-week-badge phase-${weekPhaseClass}`}
                    key={`desktop-${weekPhaseClass}`}
                  >
                    <span className="week-phase-symbol" aria-hidden="true">
                      {weekPhaseSymbol}
                    </span>
                    <div>
                      <small>{currentSlotDay}</small>
                      <strong>{currentSlotPhase}</strong>
                    </div>
                    <em>{weekSlot + 1} / 21</em>
                  </div>
                </div>

                <div className="daily-action-bar">
                  <div className="daily-action-label">
                    <span>每日行动</span>
                    <small>每天各一次 · 不消耗时间段</small>
                  </div>
                  <button
                    type="button"
                    className={`daily-action-btn ${coffeeUsedToday ? 'is-used' : ''}`}
                    disabled={coffeeUsedToday || state.money < coffeeCost || state.energy >= 100}
                    onClick={onDrinkCoffee}
                  >
                    <strong>喝咖啡</strong>
                    <small>精力 +10 · 生活费 -{coffeeCost}</small>
                    <em>{coffeeUsedToday ? '今日已喝' : '今日可执行'}</em>
                  </button>
                  {hasPeCourse && (
                    <button
                      type="button"
                      className={`daily-action-btn campus-run ${runUsedToday ? 'is-used' : ''}`}
                      disabled={runUsedToday || state.energy < 20 || state.peRunCount >= 24}
                      onClick={onCampusRun}
                    >
                      <strong>校园跑</strong>
                      <small>精力 -20 · 体质成长 +1</small>
                      <em>
                        {runUsedToday
                          ? '今日已跑'
                          : `${state.peRunCount} / 24 · 成绩上限 ${runCap}`}
                      </em>
                    </button>
                  )}
                  <button
                    type="button"
                    className={`daily-action-btn ${selfCareUsedToday ? 'is-used' : ''}`}
                    disabled={selfCareUsedToday || state.money < selfCareCost}
                    onClick={onDailySelfCare}
                  >
                    <strong>高碳日，爱你老己！</strong>
                    <small>精力 +10 · 压力 -15 · 生活费 -{selfCareCost} · 体质成长值 -5%</small>
                    <em>{selfCareUsedToday ? '今日已做' : '今日可执行'}</em>
                  </button>
                </div>

                {currentSlotActivity ? (
                  <section className="paper-card slot-course-panel slot-club-panel">
                    <div className="slot-course-meta">
                      <span>当前时间段 · {currentSlotDay} {currentSlotPhase}</span>
                      <Pill tone="gold">组织活动</Pill>
                    </div>
                    <h3>{currentSlotActivity.name} · 活动</h3>
                    <p>
                      这格时间被组织活动占住了。参加活动会消耗 5 点精力，并可能遇到一点组织里的事；
                      因故请假会把时间还给你，但请假记录会留在期末。
                    </p>
                    <div className="slot-course-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onAttendClubActivity}
                      >
                        参加活动 <small>精力 -5</small>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onLeaveClubActivity}
                      >
                        因故请假 <small>本学期已请假 {state.clubMemberships.find((m) => m.orgId === currentSlotActivity.orgId)?.semesterLeaves ?? 0} 次</small>
                      </button>
                    </div>
                  </section>
                ) : currentSlotCourse ? (
                  <section className="paper-card slot-course-panel">
                    <div className="slot-course-meta">
                      <span>当前时间段有课 · {currentSlotDay} {currentSlotPhase}</span>
                      <Pill>{currentSlotCourse.credits} 学分</Pill>
                    </div>
                    <h3>{currentSlotCourse.name}</h3>
                    <p>
                      这节课把你按在了座位上。去上课要花掉 {currentCourseEnergyCost} 点精力，
                      但能把这门课的准备度往前挪一点；翘课能换回一格自由时间，
                      至于老师会不会记住那个空座位，就交给缘分和抽查方式了。
                    </p>
                    <div className="slot-course-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onAttendCourse}
                      >
                        去上课 <small>精力 -{currentCourseEnergyCost} · 课程准备度 +{currentSlotIsMorning && Math.floor(weekSlot / 3) <= 4 && state.habits.includes('earlyRise') ? 6 : 5}</small>
                      </button>
                      <div className="skip-action-group">
                        <button
                          type="button"
                          className="btn btn-ghost skip-action-main"
                          onClick={() => setSkipClassOpen(true)}
                        >
                          翘课 <small>把时间抢回来 · 先过老师这一关</small>
                        </button>
                        <button
                          type="button"
                          className="skip-info-btn"
                          aria-label="查看翘课判定规则"
                          title="查看翘课判定规则"
                          onClick={() => setSkipRulesOpen(true)}
                        >
                          i
                        </button>
                      </div>
                    </div>
                  </section>
                ) : (
                  <>

                <div className="free-slot-heading">
                  <span>自由行动</span>
                  <p className="slot-free-note">
                    {state.weekSlotSkipped
                      ? '你翘掉了这节课，这个时间段现在归你自己安排。'
                      : '当前时间段没有课程，可以自由安排。'}
                  </p>
                  {canApplyClub && clubMemberships.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost slot-club-apply-btn"
                      onClick={onApplyClub}
                    >
                      申请第二个组织
                    </button>
                  )}
                </div>

                {state.week === 1 && courses.some((course) => course.electiveType) && (
                  <div className="withdraw-elective-panel">
                    <span>第一周退选窗口</span>
                    <div>
                      {courses
                        .filter((course) => course.electiveType)
                        .map((course) => (
                          <button
                            type="button"
                            key={course.id}
                            className="withdraw-elective-btn"
                            onClick={() => onWithdrawElective?.(course.id)}
                          >
                            退选 {course.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}


                {!state.habits.includes('fitness') && !state.weekSlotActions.includes('sport') && (
                  <p className="constitution-decay-note">
                    本周没有健身习惯或运动安排：周末体质成长 -5%。
                  </p>
                )}

                {courses.length > 1 && state.weekFocus && (
                  <button
                    type="button"
                    className="week-focus-bar"
                    onClick={() => setFocusPrompt('adjust')}
                  >
                    <span>本周主攻</span>
                    <strong>{focusLabel}</strong>
                    <span className="week-focus-adjust">点击调整 →</span>
                  </button>
                )}

                <div className="actions-grid">
                  {currentSlotIsMorning ? (
                    <div
                      className={`action-card sleep-in-card ${
                        sleepInDisabled ? 'is-locked' : ''
                      }`}
                      role="button"
                      tabIndex={sleepInDisabled ? -1 : 0}
                      aria-disabled={sleepInDisabled}
                      onClick={() => !sleepInDisabled && onSleepIn?.()}
                      onKeyDown={(event) => {
                        if (
                          !sleepInDisabled &&
                          (event.key === 'Enter' || event.key === ' ')
                        ) {
                          event.preventDefault()
                          onSleepIn?.()
                        }
                      }}
                    >
                      <ActionDoodle kind="sleepIn" />
                      <div className="action-meta">
                        <span>生活</span>
                        <span className="action-no">ZZZ</span>
                      </div>
                      <h3>睡懒觉</h3>
                      <p className="action-flavor">
                        {sleepInDisabled
                          ? earlyRiseBlocked
                            ? '早起习惯已经把身体叫醒了，工作日的早上不再适合回笼觉。'
                            : coffeeUsedToday && runUsedToday
                              ? '早上已经喝过咖啡、也跑完步了，现在躺下大概只会睁着眼。'
                              : coffeeUsedToday
                                ? '早上那杯咖啡还在起作用，回笼觉已经睡不回去了。'
                                : '早上已经跑过步，身体醒过来了，回笼觉接不上。'
                          : '把闹钟按掉，再睡一个回笼觉。'}
                      </p>
                      <p className="action-effect">
                        {sleepInDisabled
                          ? '当前不可用'
                          : '精力 +20 · 压力 -10'}
                      </p>
                      <div className="action-bottom">
                        <span className="action-en">SLEEP IN</span>
                        {sleepInDisabled ? (
                          <span className="action-locked">
                            {earlyRiseBlocked
                              ? '早起习惯生效'
                              : coffeeUsedToday && runUsedToday
                                ? '早上已喝咖啡并跑完步'
                                : coffeeUsedToday
                                  ? '早上已喝咖啡'
                                  : '早上已校园跑'}
                          </span>
                        ) : (
                          <span className="action-repeat">消耗 1 个时间段</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="action-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSlotActionClick('rest')}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleSlotActionClick('rest')
                        }
                      }}
                    >
                      <ActionDoodle kind="rest" />
                      <div className="action-meta">
                        <span>生活</span>
                        <span className="action-no">04</span>
                      </div>
                      <h3>躺平</h3>
                      <p className="action-flavor">把手机调成静音，今天不追任何进度。</p>
                      <p className="action-effect">精力 +15 · 压力 -10</p>
                      <div className="action-bottom">
                        <span className="action-en">REST</span>
                        <span className="action-repeat">消耗 1 个时间段</span>
                      </div>
                    </div>
                  )}
                  {visibleActions.map((id) => {
                    if (id === 'soloInvite') {
                      return (
                        <div
                          key="soloInvite"
                          className="action-card solo-invite-card"
                          role="button"
                          tabIndex={0}
                          onClick={() => setSoloInviteOpen(true)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setSoloInviteOpen(true)
                            }
                          }}
                        >
                          <ActionDoodle kind="soloInvite" />
                          <div className="action-meta">
                            <span>社交</span>
                            <span className="action-no">—</span>
                          </div>
                          <h3>单独邀约</h3>
                          <p className="action-flavor">
                            邀请一位恋人、兄弟或闺蜜单独出去。对方会决定约会时间。
                          </p>
                          <p className="action-effect">
                            赴约时间另行占用 · 每位羁绊每周最多成功 2 次
                          </p>
                          <div className="action-bottom">
                            <span className="action-en">SOLO</span>
                            <span className="action-repeat">约会时间另计</span>
                          </div>
                        </div>
                      )
                    }
                    const action = ACTIONS.find((item) => item.id === id)
                    if (!action) return null
                    const locked = lockReason(action)
                    const selectedCount = countOf(action.id)
                    const selected = selectedCount > 0
                    const disabled = Boolean(locked)
                    const committed =
                      (action.id === 'social' && dinnerCommitted) ||
                      (action.id === 'club' && clubCommitted)
                    return (
                      <div
                        key={action.id}
                        role="button"
                        tabIndex={disabled || committed ? -1 : 0}
                        aria-disabled={disabled || committed}
                        className={`action-card ${selected ? 'is-selected' : ''} ${
                          disabled ? 'is-locked' : ''
                        } ${committed ? 'is-committed' : ''}`}
                        onClick={() => !disabled && handleSlotActionClick(action.id)}
                        onKeyDown={(event) => {
                          if (
                            (event.key === 'Enter' || event.key === ' ') &&
                            !disabled
                          ) {
                            event.preventDefault()
                            handleSlotActionClick(action.id)
                          }
                        }}
                      >
                        <ActionDoodle kind={action.id} />
                        <div className="action-meta">
                          <span>{action.category}</span>
                          <span className="action-no">{action.no}</span>
                        </div>
                        <h3>{displayActionName(action)}</h3>
                        <p className="action-flavor">{action.flavor}</p>
                        <p className="action-effect">{actionEffectText(action)}</p>
                        <div className="action-bottom">
                          <span className="action-en">{action.en}</span>
                          {!locked && (
                            <span className="action-repeat">消耗 1 个时间段</span>
                          )}
                          {locked && <span className="action-locked">{locked}</span>}
                        </div>
                        {action.id === 'club' &&
                          canApplyClub &&
                          clubMemberships.length > 0 &&
                          !committed && (
                            <button
                              type="button"
                              className="action-mini-btn"
                              onClick={(event) => {
                                event.stopPropagation()
                                onApplyClub?.()
                              }}
                            >
                              申请第二个组织
                            </button>
                          )}
                      </div>
                    )
                  })}
                </div>

                <div className="action-footer">
                  <span className="slot-auto-note">选择行动后自动进入下一时间段</span>
                </div>

                <div className="coming-soon" aria-label="等待开发的功能">
                  <span>后续模块</span>
                  <span className="coming-soon-item">科研导师 · 等待开发</span>
                  <span className="coming-soon-item">奖学金 · 等待开发</span>
                  <span className="coming-soon-item">校园事件 · 等待开发</span>
                  <span className="coming-soon-item">人物关系 · 等待开发</span>
                </div>
                  </>
                )}
              </>
            )}

            {tab === 'people' && renderAttributePanel()}
            {tab === 'grades' && renderGrades()}
            {tab === 'research' && renderResearch()}
            {tab === 'club' && renderClub()}
            {tab === 'bond' && (
              <BondScreen
                state={state}
                onContact={(id) => onContactLover?.(id) ?? {
                  answered: false,
                  name: '',
                  title: '暂时联系不上',
                  text: '现在还不能联系 TA。',
                  lines: [],
                }}
                onBreakBond={(id) =>
                  onBreakBond?.(id) ?? {
                    success: false,
                    type: 'lover',
                    name: '',
                    text: '现在还不能解除羁绊。',
                  }
                }
                onReconcileBond={(id) =>
                  onReconcileBond?.(id) ?? {
                    success: false,
                    type: 'lover',
                    name: '',
                    text: '现在还不能复合。',
                  }
                }
              />
            )}
            {tab === 'roommates' && renderRoommates()}
            {tab === 'diary' && renderDiary()}
          </section>

          <aside className="game-right">
            <div className="paper-card memo-card">
              <div className="card-head">
                <span>WEEKLY MEMO</span>
                <span>手记</span>
              </div>
              <h3>{latestLog?.title ?? '开学第一周'}</h3>
              <p className="memo-text">
                {latestLog?.text ??
                  '九月的风把银杏叶吹进阶梯教室。你坐在最后一排，翻开崭新的课本，闻到纸和油墨的味道。五年很长，先从这一周开始。'}
              </p>
              {latestLog && (
                <div className="delta-row memo-deltas">
                  {latestLog.deltas.map((delta) => (
                    <span key={delta}>{delta}</span>
                  ))}
                </div>
              )}
              <blockquote className="memo-quote">
                “先把今天过完。明天的事，明天再想。”
              </blockquote>
            </div>

            <div className="exam-banner">
              <div className="exam-top">
                <div>
                  <span className="exam-label">本阶段学习</span>
                  <strong>
                    {state.season.examKind} ·{' '}
                    {state.season.courses.map((item) => item.name).join(' / ')}
                  </strong>
                </div>
                <span className="exam-count">距考试 {Math.max(1, 4 - state.week)} 周</span>
              </div>
              <div className="exam-course-list">
                {state.season.courses.map((item) => {
                  const prep = state.prep[item.id] ?? 0
                  const previewPrep = preview?.prep[item.id] ?? prep
                  const [min, max] = estimateRange(previewPrep)
                  return (
                    <div className="exam-course" key={item.id}>
                      <div className="exam-course-line">
                        <span>
                          {item.name}
                          {item.makeup && <span className="makeup-tag">补考</span>}
                        </span>
                        <span>
                          {previewPrep !== prep ? (
                            <>
                              准备度 {Math.round(prep)} → {Math.round(previewPrep)} / 100 · 预计{' '}
                              {min}–{max} 分
                            </>
                          ) : (
                            <>
                              准备度 {Math.round(prep)} / 100 · 预计 {min}–{max} 分
                            </>
                          )}
                        </span>
                      </div>
                      <Bar
                        value={prep}
                        tone={previewPrep >= 60 ? 'green' : 'gold'}
                        previewValue={previewPrep}
                      />
                    </div>
                  )
                })}
              </div>
              <p className="exam-note">
                非假期每周自动积累 · 第 4 周考前复习 · 行动结束后考试
              </p>
            </div>

            <CampusNoticeBoard state={state} />

            <div className="right-links">
              <button className="text-btn" type="button" onClick={onTitle}>
                返回报到页
              </button>
            </div>
          </aside>
          <InterfaceNav
            active="main"
            variant="bottom"
            bondAlert={hasAvailableBond(state)}
            onMain={() => undefined}
            onWho={onOpenWhoAmI ?? (() => undefined)}
            onTA={onOpenTA ?? (() => undefined)}
            badges={{
              ta:
                unseenRelationCount(state) > 0
                  ? '新'
                  : patRemainingThisWeek(state) || undefined,
            }}
          />
        </main>

        <footer className="game-footer">
          <span>
            {state.season.seasonLabel} · 第 {state.week} 周 ·{' '}
            {state.season.courses.map((item) => item.name).join(' / ')}
          </span>
          <span>每周结算后自动保存</span>
        </footer>
      </div>

      {showFocusModal && (
        <div className="focus-backdrop" role="presentation">
          <div className="focus-modal" role="dialog" aria-modal="true" aria-label="本周主攻课程">
            <Eyebrow>WEEKLY FOCUS / 第 {state.week} 周</Eyebrow>
            <h2>这周主要温习哪门课？</h2>
            <p className="focus-lede">
              主课程只能选必修课程；主课程拿 75% 的准备度收益，
              其余课程平分剩下的 25%；也可以选择全部课程均衡分配。
            </p>
            <div className="focus-options">
              {focusableCourses.map((course) => (
                <button
                  type="button"
                  key={course.id}
                  className={`focus-choice ${state.weekFocus === course.id ? 'is-selected' : ''}`}
                  onClick={() => chooseFocus(course.id)}
                >
                  <span className="focus-choice-en">MAIN / 75%</span>
                  <strong>{course.name}</strong>
                  <small>
                    {course.credits} 学分 · 记忆力 {course.memory} · 悟性 {course.comprehension}{course.operation ? ` · 操作 ${course.operation}` : ''}
                  </small>
                  <em>主攻</em>
                </button>
              ))}
              <button
                type="button"
                className={`focus-choice is-balanced ${
                  state.weekFocus === 'balanced' ? 'is-selected' : ''
                }`}
                onClick={() => chooseFocus('balanced')}
              >
                <span className="focus-choice-en">EVEN / 25% × ALL</span>
                <strong>全部课程均衡</strong>
                <small>每门课平分本周准备度收益，哪门都不落下。</small>
                <em>均衡</em>
              </button>
            </div>
            <p className="focus-note">
              {focusPrompt === 'library'
                ? '这次选择会同时把泡图书馆排进本周行动。本周内可以继续调整主攻课程。'
                : '本周选择只影响第 '}
              {focusPrompt === 'adjust' ? `${state.week} 周，下周会重新询问。` : null}
            </p>
          </div>
        </div>
      )}

      {state.pendingConfession && (
        <NpcConfessionModal
          confession={state.pendingConfession}
          onAccept={() => onNpcConfession?.(true)}
          onDecline={() => onNpcConfession?.(false)}
        />
      )}

      {state.pendingConsumption && (
        <ConsumptionEventModal
          event={state.pendingConsumption}
          money={state.money}
          onResolve={(accept) => onResolveConsumption?.(accept)}
        />
      )}

      {clubPickerOpen && (
        <div className="dinner-overlay" role="dialog" aria-modal="true">
          <div className="dinner-backdrop" onClick={() => setClubPickerOpen(false)} />
          <section className="dinner-modal club-picker-modal">
            <header className="dinner-head">
              <div>
                <span className="dinner-eyebrow">CHOOSE A CLUB / 选择组织</span>
                <h2>这周参加哪个组织的活动？</h2>
                <p>两个组织各自独立计算活动次数、晋升与学期福利。选择后，再邀请同组织的人一起共事。</p>
              </div>
            </header>
            <div className="club-picker-list">
              {clubMemberships.map((membership) => {
                const org = ORG_BY_ID[membership.orgId]
                return (
                  <button
                    key={membership.orgId}
                    type="button"
                    className="club-picker-item"
                    onClick={() => {
                      setSelectedClubOrgId(membership.orgId)
                      setClubPickerOpen(false)
                      setClubActivityOpen(true)
                    }}
                  >
                    <span>
                      <strong>{org?.name ?? membership.orgId}</strong>
                      <small>
                        {roleLabel(membership.category, membership.role)} · 累计活动{' '}
                        {membership.totalActivities} 次
                      </small>
                    </span>
                    <span className="club-picker-arrow">→</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {clubActivityOpen && selectedMembership && (
        <ClubActivityModal
          organizationName={ORG_BY_ID[selectedMembership.orgId]?.name ?? selectedMembership.orgId}
          members={clubMembers}
          initialResults={
            state.clubInvites?.weekKey === currentWeekKey(state) &&
            state.clubInvites.orgId === selectedMembership.orgId
              ? state.clubInvites.results
              : null
          }
          onSaveResults={(results) =>
            onSaveClubInvites?.(results, selectedMembership.orgId)
          }
          onCancel={() => setClubActivityOpen(false)}
          onConfirm={(acceptedIds, declinedIds) => {
            setClubActivityOpen(false)
            if (onSlotClubActivity) {
              onSlotClubActivity(
                selectedMembership.orgId,
                acceptedIds,
                declinedIds,
              )
            } else {
              onArrangeClubActivity?.(
                selectedMembership.orgId,
                acceptedIds,
                declinedIds,
              )
            }
          }}
        />
      )}

      {skipRulesOpen && currentSlotCourse && (
        <SkipRulesModal
          course={currentSlotCourse}
          onClose={() => setSkipRulesOpen(false)}
        />
      )}

      {skipClassOpen && currentSlotCourse && (
        <SkipClassModal
          course={currentSlotCourse}
          onResolved={(success) => {
            setSkipClassOpen(false)
            onSkipResolved?.(success)
          }}
        />
      )}

      {dinnerOpen && (
        <DinnerModal
          relationships={state.relationships}
          money={state.money}
          initialResults={
            state.dinnerInvites?.weekKey === currentWeekKey(state)
              ? state.dinnerInvites.results
              : null
          }
          onSaveResults={onSaveDinnerResults}
          onCancel={() => setDinnerOpen(false)}
          onConfirm={(acceptedIds, declinedIds, cost) => {
            setDinnerOpen(false)
            if (onSlotDinner) {
              onSlotDinner(acceptedIds, declinedIds, cost)
            } else {
              onArrangeDinner?.(acceptedIds, declinedIds, cost)
            }
          }}
        />
      )}

      {soloInviteOpen && (
        <SoloInviteModal
          state={state}
          onClose={() => setSoloInviteOpen(false)}
          onAttempt={(record, invite) => onSoloAttempt?.(record, invite)}
        />
      )}

      {activeSoloInvite && !soloInviteOpen && (
        <SoloDateOverlay
          state={state}
          invite={activeSoloInvite}
          onFinish={() => onResolveSoloDate?.(activeSoloInvite.id)}
        />
      )}
    </div>
  )
}
