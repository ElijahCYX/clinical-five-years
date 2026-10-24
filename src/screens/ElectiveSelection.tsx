import { useState } from 'react'
import { ELECTIVE_COURSE_BY_ID, ELECTIVE_COURSES } from '../data'
import { courseDifficulty } from '../game'
import { patRemainingThisWeek, unseenRelationCount } from '../social'
import type { Course, ElectiveType, GameState } from '../types'
import { Eyebrow, InterfaceNav, Pill, SectionLabel, TopBar } from '../ui'

interface ElectiveSelectionProps {
  state: GameState
  onConfirm: (acceptedIds: string[]) => void
  onBack?: () => void
  onWho?: () => void
  onTA?: () => void
}

const TYPE_LABELS: Record<ElectiveType, string> = {
  water: '水课',
  interest: '兴趣课',
  group: '小组作业课',
  politics: '思政课',
}

const TYPE_HINTS: Record<ElectiveType, string> = {
  water: '难度低、准备度收益高，适合冲 GPA。',
  interest: '每周固定 -5 压力 / +5 精力，给分普遍较好。',
  group: '每周固定 -5 精力，增加人际；可能触发社交事件（后续开发）。',
  politics: '毕业必修，选中率 100%，共 11 学分。',
}

const TOTAL_ELECTIVE_CREDITS = 10

export function ElectiveSelectionScreen({
  state,
  onConfirm,
  onBack,
  onWho,
  onTA,
}: ElectiveSelectionProps) {
  const [slots, setSlots] = useState<string[]>(state.electiveOffers)
  const [selected, setSelected] = useState<string[]>([])
  const [accepted, setAccepted] = useState<string[] | null>(null)
  const [rejected, setRejected] = useState<string[]>([])

  const courses = slots
    .map((id) => ELECTIVE_COURSE_BY_ID[id])
    .filter(Boolean) as Course[]
  const selectedCredits = selected.reduce((sum, id) => {
    const course = ELECTIVE_COURSE_BY_ID[id]
    return course?.electiveType === 'politics' ? sum : sum + (course?.credits ?? 0)
  }, 0)
  const politicsDone = state.politicsCompleted.length

  const poolFor = (type: ElectiveType): string[] =>
    ELECTIVE_COURSES.filter((course) => {
      if (course.electiveType !== type) return false
      if (state.pendingElectiveRetakes.includes(course.id)) return false
      if (type === 'politics') return !state.politicsCompleted.includes(course.id)
      return !state.electiveHistory.includes(course.id)
    }).map((course) => course.id)

  const refresh = (index: number) => {
    if (accepted !== null) return
    const current = slots[index]
    const course = ELECTIVE_COURSE_BY_ID[current]
    if (!course?.electiveType) return
    const pool = poolFor(course.electiveType)
    if (pool.length === 0) return
    const nextIndex = (pool.indexOf(current) + 1) % pool.length
    const next = pool[nextIndex]
    setSlots((currentSlots) =>
      currentSlots.map((id, i) => (i === index ? next : id)),
    )
    setSelected((currentSelected) =>
      currentSelected.filter((id) => id !== current),
    )
  }

  const toggle = (course: Course) => {
    if (accepted !== null) return
    setSelected((current) => {
      if (current.includes(course.id)) return current.filter((id) => id !== course.id)
      if (current.length >= 3) return current
      return [...current, course.id]
    })
  }

  const submit = () => {
    if (accepted !== null) return
    const won: string[] = []
    const lost: string[] = []
    for (const id of selected) {
      const course = ELECTIVE_COURSE_BY_ID[id]
      if (!course) continue
      if (Math.random() < (course.selectionChance ?? 0.5)) won.push(id)
      else lost.push(id)
    }
    setAccepted(won)
    setRejected(lost)
  }

  return (
    <div className="screen elective-screen">
      <div className="shell">
        <TopBar
          onTitle={onBack}
          right={
            <button className="text-btn" type="button" onClick={onBack}>
              返回标题
            </button>
          }
        />
        <InterfaceNav
          active="main"
          onMain={() => undefined}
          onWho={onWho ?? (() => undefined)}
          onTA={onTA ?? (() => undefined)}
          badges={{
            ta:
              unseenRelationCount(state) > 0
                ? '新'
                : patRemainingThisWeek(state) || undefined,
          }}
        />

        <header className="elective-head">
          <Eyebrow>ELECTIVE COURSES / BEFORE SEMESTER PLAN</Eyebrow>
          <h1 className="page-title">选修课程</h1>
          <p className="page-lede">
            这学期四类课程各向你展示一门。可以选 0–3 门；每张卡下方的刷新不限次数，
            可以翻看对应类型的完整备选库。水课 50%、兴趣课 25%、小组作业课 75%、
            思政课 100%。
          </p>
          <p className="elective-exclusion-note">
            兴趣类课程不计入泡图书馆的计费课程数，不会增加图书馆的精力与压力消耗。
          </p>
          <div className="elective-meta">
            <Pill tone="green">
              选修已通过 {state.electiveCredits} / 10 学分
            </Pill>
            <Pill>本次已选 {selected.length} / 3 门 · {selectedCredits} 学分</Pill>
            <Pill>思政进度 {politicsDone} / 5</Pill>
          </div>
        </header>

        <section className="paper-card elective-sheet">
          <SectionLabel right="每类一门 · 刷新可见全部备选">
            本学期四类课程
          </SectionLabel>
          {courses.length === 0 ? (
            <p className="elective-empty">本轮没有可抽的选修课，直接进入学期计划。</p>
          ) : (
            <div className="elective-grid">
              {courses.map((course, index) => {
                const type = course.electiveType ?? 'water'
                const isSelected = selected.includes(course.id)
                const difficulty = courseDifficulty(course)
                const disabled =
                  accepted !== null || (!isSelected && selected.length >= 3)
                return (
                  <div
                    key={`${course.id}-${index}`}
                    className={`elective-card type-${type} ${
                      isSelected ? 'is-selected' : ''
                    } ${disabled ? 'is-disabled' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => !disabled && toggle(course)}
                    onKeyDown={(event) => {
                      if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                        toggle(course)
                      }
                    }}
                  >
                    <div className="elective-card-top">
                      <span className={`elective-type type-${type}`}>
                        {TYPE_LABELS[type]}
                      </span>
                      <span>{Math.round((course.selectionChance ?? 0.5) * 100)}% 概率</span>
                    </div>
                    <h3>{course.name}</h3>
                    <p className="elective-hint">{TYPE_HINTS[type]}</p>
                    <div className="elective-card-meta">
                      <span>{course.credits} 学分</span>
                      <span>{course.examType}</span>
                      <span>
                        {'★'.repeat(difficulty.stars)}
                        {'☆'.repeat(5 - difficulty.stars)} {difficulty.label}
                      </span>
                    </div>
                    <span className="elective-pick">
                      {isSelected ? '已加入选课清单' : '点选'}
                    </span>
                    <button
                      type="button"
                      className="elective-refresh-btn"
                      onClick={(event) => {
                        event.stopPropagation()
                        refresh(index)
                      }}
                    >
                      刷新本类（不限次数）
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {accepted === null ? (
            <div className="elective-footer">
              <p>选上与否要提交后才知道；没选上不消耗学分，毕业最多计入 10 个选修学分。</p>
              <button type="button" className="btn btn-primary" onClick={submit}>
                提交选课
                <span className="btn-arrow">→</span>
              </button>
            </div>
          ) : (
            <div className="elective-result">
              <div className="elective-result-head">
                <Eyebrow>ELECTIVE RESULT</Eyebrow>
                <strong>
                  {accepted.length > 0
                    ? `选上了 ${accepted.length} 门`
                    : '这次一门都没选上'}
                </strong>
              </div>
              <div className="elective-result-list">
                {accepted.map((id) => (
                  <span className="is-win" key={id}>
                    {ELECTIVE_COURSE_BY_ID[id]?.name} · 已加入本学期
                  </span>
                ))}
                {rejected.map((id) => (
                  <span className="is-lose" key={id}>
                    {ELECTIVE_COURSE_BY_ID[id]?.name} · 没选上
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onConfirm(accepted)}
              >
                进入学期计划
                <span className="btn-arrow">→</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
