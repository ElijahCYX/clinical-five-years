import { useState } from 'react'
import { ELECTIVE_COURSE_BY_ID } from '../data'
import { courseDifficulty } from '../game'
import type { Course, ElectiveType, GameState } from '../types'
import { Eyebrow, Pill, SectionLabel, TopBar } from '../ui'

interface ElectiveSelectionProps {
  state: GameState
  onConfirm: (acceptedIds: string[]) => void
  onBack?: () => void
}

const TYPE_LABELS: Record<ElectiveType, string> = {
  water: '水课',
  interest: '兴趣课',
  group: '小组作业课',
}

const TYPE_HINTS: Record<ElectiveType, string> = {
  water: '难度低、准备度收益高，适合冲 GPA。',
  interest: '每周固定 -5 压力 / +5 精力，给分普遍较好。',
  group: '每周固定 -5 精力，增加人际；可能触发社交事件（后续开发）。',
}

const TOTAL_ELECTIVE_CREDITS = 10

export function ElectiveSelectionScreen({
  state,
  onConfirm,
  onBack,
}: ElectiveSelectionProps) {
  const offers = state.electiveOffers
    .map((id) => ELECTIVE_COURSE_BY_ID[id])
    .filter(Boolean) as Course[]
  const remainingCredits = Math.max(0, TOTAL_ELECTIVE_CREDITS - state.electiveCredits)
  const [selected, setSelected] = useState<string[]>([])
  const [accepted, setAccepted] = useState<string[] | null>(null)
  const [rejected, setRejected] = useState<string[]>([])

  const selectedCredits = selected.reduce(
    (sum, id) => sum + (ELECTIVE_COURSE_BY_ID[id]?.credits ?? 0),
    0,
  )

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

        <header className="elective-head">
          <Eyebrow>ELECTIVE COURSES / BEFORE SEMESTER PLAN</Eyebrow>
          <h1 className="page-title">选修课程</h1>
          <p className="page-lede">
            这学期有三门选修课向你招手。可以选 0–3 门，但每门课都要看运气：
            水课 50%、兴趣课 25%、小组作业课 75%。选上后会和必修课一起考试。
          </p>
          <div className="elective-meta">
            <Pill tone="green">已选 {selected.length} / 3</Pill>
            <Pill tone={selectedCredits > remainingCredits ? 'red' : 'plain'}>
              已选学分 {selectedCredits} · 毕业只计前 10 学分（已修 {state.electiveCredits}）
            </Pill>
            <Pill>选修毕业要求 10 学分</Pill>
          </div>
        </header>

        <section className="paper-card elective-sheet">
          <SectionLabel right={`已上过 ${state.electiveHistory.length} 门，不会重复出现`}>
            本学期抽到的课程
          </SectionLabel>
          {offers.length === 0 ? (
            <p className="elective-empty">本轮没有可抽的选修课，直接进入学期计划。</p>
          ) : (
            <div className="elective-grid">
              {offers.map((course) => {
                const type = course.electiveType ?? 'water'
                const isSelected = selected.includes(course.id)
                const difficulty = courseDifficulty(course)
                const disabled =
                  accepted !== null || (!isSelected && selected.length >= 3)
                return (
                  <button
                    type="button"
                    key={course.id}
                    className={`elective-card type-${type} ${isSelected ? 'is-selected' : ''} ${
                      disabled ? 'is-disabled' : ''
                    }`}
                    onClick={() => toggle(course)}
                    disabled={disabled}
                  >
                    <div className="elective-card-top">
                      <span className={`elective-type type-${type}`}>{TYPE_LABELS[type]}</span>
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
                  </button>
                )
              })}
            </div>
          )}

          {accepted === null ? (
            <div className="elective-footer">
              <p>选上与否要提交后才知道；没选上不会消耗学分，毕业最多计入 10 个选修学分。</p>
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
