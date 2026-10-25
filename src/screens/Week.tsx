import { useState } from 'react'
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
  englishGainForMemory,
  estimateRange,
  simulateWeek,
} from '../game'
import type { ActionDef, DinnerInviteResult, GameState } from '../types'
import { Bar, Eyebrow, InterfaceNav, Pill, SectionLabel, TopBar } from '../ui'
import { PlayerRail } from './PlayerRail'
import { DinnerModal } from './Dinner'
import { NpcConfessionModal } from './NpcConfession'
import { ConsumptionEventModal } from './ConsumptionEvent'
import { ClubActivityModal } from './ClubActivity'
import { CampusNoticeBoard } from './CampusNotice'
import { BondScreen } from './Bond'
import { MENTOR_BY_ID, researchStage } from '../mentors'
import { ORG_BY_ID, roleLabel } from '../organizations'
import {
  currentWeekKey,
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
  'rest',
  'selfCare',
  'social',
  'partTime',
  'sport',
  'english',
]

type GameTab = 'week' | 'people' | 'grades' | 'research' | 'club' | 'bond' | 'roommates' | 'diary'

interface WeekScreenProps {
  state: GameState
  onToggleAction: (id: string) => void
  onEndWeek: () => void
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
  onNpcConfession?: (accept: boolean) => void
  onResolveConsumption?: (accept: boolean) => void
  onSave?: () => void
  onTitle?: () => void
}

export function WeekScreen({
  state,
  onToggleAction,
  onEndWeek,
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
  const [selectedClubOrgId, setSelectedClubOrgId] = useState<string | null>(null)
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
    { key: 'professional', label: '专业课', earned: professionalEarned, target: 163 },
    { key: 'politics', label: '思政课', earned: politicsEarned, target: 11 },
    { key: 'elective', label: '选修课', earned: electiveEarned, target: 10 },
  ]
  const passedRecords = [
    ...state.courseRecords,
    ...passedPe.map((item) => ({
      id: `pe-${item.year}`,
      name: `体育（第 ${item.year} 年）`,
      credits: 2,
      gpa: item.gpa,
      score: item.score,
      category: 'professional' as const,
    })),
  ].sort((a, b) => {
    const order = { professional: 0, politics: 1, elective: 2 }
    return order[a.category] - order[b.category] || a.name.localeCompare(b.name)
  })
  const categoryLabel = (category: string) =>
    category === 'professional' ? '专业课' : category === 'politics' ? '思政课' : '选修课'
  const selectedGroups = Array.from(new Set(state.selected)).map((id) => ({
    id,
    count: state.selected.filter((item) => item === id).length,
  }))
  const countOf = (id: string) => state.selected.filter((item) => item === id).length
  const clubYear = Math.floor(state.seasonIndex / 4) + 1
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
      if (canApplyClub) {
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
    onChooseFocus(focus, focusPrompt === 'library')
    setFocusPrompt(null)
  }
  const researchActionName = state.researchPublished
    ? '论文已发表'
    : !state.labEntered
      ? '科研相关'
      : !state.researchStarted
        ? '实验室打杂'
        : researchStage(state.researchProgress).name
  const clubActionName = canApplyClub
    ? clubMemberships.length > 0
      ? '申请加入第二个社团'
      : '申请加入社团学生会'
    : '社团活动'
  const displayActionName = (action: ActionDef) => {
    if (action.id === 'research') return researchActionName
    if (action.id === 'club') return clubActionName
    return action.name
  }

  const actionEffectText = (action: ActionDef) => {
    if (action.id === 'english') {
      return action.effectText.replace(
        '英语进度 +5',
        `英语进度 +${englishGainForMemory(player.attrs.memory)}`,
      )
    }
    if (action.id === 'library') {
      const costs = libraryCosts(state)
      return `所有课程：准备度 +6 × K${state.energy < 40 ? '（低精力减半）' : ''} · 精力 ${costs.energy}${state.energy < 40 ? '（减半）' : ''} · 压力 +${costs.stress} · 当前 ${costs.count} 门计费课程（消耗按 ${costs.costCount} 门封顶）`
    }
    if (action.id === 'club') {
      if (canApplyClub) return '消耗一次本周行动，浏览新组织或申请第二个社团'
      if (selectedMembership) {
        const role = selectedMembership.role
        return `人际成长 +${Math.round(5 * (role === 'officer' ? 1.15 : role === 'president' || role === 'honorary' ? 1.3 : 1))} · 精力 -12 · 压力 +5 · 生活费 -20`
      }
      if (clubMemberships.length > 1) return '精力 -12 · 压力 +5 · 生活费 -20 · 先选择参加哪个社团'
      if (clubMemberships.length === 1) {
        const role = clubMemberships[0].role
        return `人际成长 +${Math.round(5 * (role === 'officer' ? 1.15 : role === 'president' || role === 'honorary' ? 1.3 : 1))} · 精力 -12 · 压力 +5 · 生活费 -20`
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
  const kaoyanWindow =
    (state.postgradChoice === 'both' &&
      ['大四 · 夏', '大五 · 秋', '大五 · 冬'].includes(state.season.seasonLabel)) ||
    (state.kaoyanRegistered && state.season.seasonLabel === '大五 · 冬')
  const visibleActions = kaoyanWindow
    ? [...VISIBLE_ACTIONS, 'kaoyan']
    : VISIBLE_ACTIONS

  const lockReason = (action: ActionDef): string | null => {
    if (
      action.id === 'electiveHomework' &&
      !state.season.courses.some((course) => course.electiveType)
    ) {
      return '本学期没有选修课程'
    }
    if (action.id === 'social') {
      if (!state.relationships.some((relation) => isDinnerFriend(relation))) {
        return '还没有可以一起吃饭的朋友'
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
      <SectionLabel right={archetype}>天赋面板</SectionLabel>
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
          <strong>184</strong>
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
                <strong>亲密度 {mentorRelation.intimacy} / 40</strong>
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
                <strong>亲密度 {mentorRelation.intimacy} / 60</strong>
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
          <SectionLabel right="NOT JOINED">社团</SectionLabel>
          <div className="locked-panel">
            <span className="lock-glyph">○</span>
            <h3>还没有加入组织</h3>
            <p>大一大二的每周行动第一周，可以选择「申请加入社团学生会」。</p>
          </div>
        </div>
      )
    }
    return (
      <div className="tab-panel">
        <SectionLabel right={`${clubMemberships.length} 个组织`}>
          社团与学生会
        </SectionLabel>
        {clubMemberships.length === 2 && (
          <p className="club-panel-note">
            同时参与两个社团，每周活动与学期福利将按 80% 结算。
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
                ? 6
                : membership.role === 'officer'
                  ? 12
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

        <InterfaceNav
          active="main"
          onMain={() => undefined}
          onWho={onOpenWhoAmI ?? (() => undefined)}
          onTA={onOpenTA ?? (() => undefined)}
          badges={{
            main: state.selected.length < 2 ? 2 - state.selected.length : undefined,
            ta:
              unseenRelationCount(state) > 0
                ? '新'
                : patRemainingThisWeek(state) || undefined,
          }}
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
            <strong>{state.energy}</strong>
          </div>
          <div>
            <span>压力</span>
            <strong>{state.stress}</strong>
          </div>
          <div>
            <span>生活费</span>
            <strong>¥{state.money}</strong>
          </div>
          <div>
            <span>行动</span>
            <strong>{remainingActions}/2</strong>
          </div>
        </div>
        <div className="mobile-course-strip">
          {courses.map((course) => (
            <span key={course.id}>
              {course.name} <b>{Math.round(state.prep[course.id] ?? 0)}</b>
            </span>
          ))}
        </div>

        <main className="game-grid">
          <PlayerRail
            state={state}
            title="WEEKLY STATUS"
            titleRight={`第 ${state.week} 周`}
            preview={preview}
            mode="week"
          />


          <section className="game-center">
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

            <nav className="tabs">
              {(
                [
                  ['week', '本周安排'],
                  ['people', '人物'],
                  ['grades', '成绩'],
                  ['research', '科研'],
                  ['club', '社团'],
                  ['bond', '羁绊'],
                  ['roommates', '舍友'],
                  ['diary', '日记'],
                ] as Array<[GameTab, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={tab === key ? 'is-active' : ''}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </nav>

            {tab === 'week' && (
              <>
                <div className="week-title-row">
                  <div>
                    <h2>这周，你想怎么过？</h2>
                    <p>一周只能认真做两件事。选好之后，时间会替你结算。</p>
                  </div>
                  <Pill tone={remainingActions === 0 ? 'green' : 'plain'}>
                    剩余 {remainingActions} / 2 次行动
                  </Pill>
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

                {!state.habits.includes('fitness') && !state.selected.includes('sport') && (
                  <p className="constitution-decay-note">
                    本周没有健身习惯或运动安排：周末体质成长 -5%。
                  </p>
                )}

                {courses.length > 1 && state.weekFocus && (
                  <div className="week-focus-bar">
                    <span>本周主攻</span>
                    <strong>{focusLabel}</strong>
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => setFocusPrompt('adjust')}
                    >
                      调整
                    </button>
                  </div>
                )}

                <div className="actions-grid">
                  {visibleActions.map((id) => {
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
                      <button
                        key={action.id}
                        type="button"
                        className={`action-card ${selected ? 'is-selected' : ''} ${
                          disabled ? 'is-locked' : ''
                        } ${committed ? 'is-committed' : ''}`}
                        onClick={() =>
                          !disabled &&
                          !committed &&
                          handleActionClick(action.id)
                        }
                        disabled={disabled || committed}
                      >
                        <div className="action-meta">
                          <span>{action.category}</span>
                          <span className="action-no">{action.no}</span>
                        </div>
                        <h3>{displayActionName(action)}</h3>
                        <p className="action-flavor">{action.flavor}</p>
                        <p className="action-effect">{actionEffectText(action)}</p>
                        <div className="action-bottom">
                          <span className="action-en">{action.en}</span>
                          {(action.id === 'library' || action.id === 'research') &&
                            selectedCount > 0 &&
                            state.selected.length >= 2 && (
                              <span className="action-repeat">再点取消</span>
                            )}
                          {(action.id === 'library' || action.id === 'research') &&
                            selectedCount < 2 &&
                            state.selected.length < 2 && (
                              <span className="action-repeat">可重复选择</span>
                            )}
                          {selected && (
                            <span className="action-selected">
                              已选{selectedCount > 1 ? ` ×${selectedCount}` : ''}
                            </span>
                          )}
                          {committed && (
                            <span className="action-repeat">
                              {action.id === 'club' ? '本周已参与 · 不可取消' : '已约好 · 不可取消'}
                            </span>
                          )}
                          {locked && <span className="action-locked">{locked}</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="action-footer">
                  <div className="selected-summary">
                    <span>本周已选</span>
                    {state.selected.length === 0 ? (
                      <strong className="muted">还没有选择行动</strong>
                    ) : (
                      selectedGroups.map((group) => (
                        <strong key={group.id}>
                          {displayActionName(ACTIONS.find((item) => item.id === group.id) ?? ACTIONS[0])}
                          {group.count > 1 ? ` ×${group.count}` : ''}
                        </strong>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={state.selected.length !== 2}
                    onClick={onEndWeek}
                  >
                    结束本周
                    <span className="btn-arrow">→</span>
                  </button>
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

            <div className="paper-card identity-card">
              <div className="card-head">
                <span>IDENTITY</span>
                <span>档案</span>
              </div>
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
              <div className="identity-art" aria-hidden="true">
                <span>✦</span>
              </div>
            </div>

            <CampusNoticeBoard state={state} />

            <div className="right-links">
              <button className="text-btn" type="button" onClick={onTitle}>
                返回报到页
              </button>
            </div>
          </aside>
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
                    {course.credits} 学分 · 记忆力 {course.memory} · 悟性 {course.comprehension}
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
                <h2>这周参加哪个社团的活动？</h2>
                <p>两个社团各自独立计算活动次数、晋升与学期福利。选择后，再邀请同组织的人一起共事。</p>
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
            onArrangeClubActivity?.(
              selectedMembership.orgId,
              acceptedIds,
              declinedIds,
            )
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
            onArrangeDinner?.(acceptedIds, declinedIds, cost)
          }}
        />
      )}
    </div>
  )
}
