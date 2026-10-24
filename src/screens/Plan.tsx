import { useState } from 'react'
import { HABITS, PLANS, SCHOOL_NAME } from '../data'
import type { Course, HabitId, PlanId, Player } from '../types'
import { courseDifficulty } from '../game'
import { Eyebrow, Footer, SectionLabel, TopBar } from '../ui'

interface PlanScreenProps {
  player: Player
  seasonLabel?: string
  initialPlan?: PlanId | null
  initialHabits?: HabitId[]
  courses?: Course[]
  onBack?: () => void
  onConfirm: (plan: PlanId, habits: HabitId[]) => void
}

export function PlanScreen({
  player,
  seasonLabel = '大一 · 秋',
  initialPlan = null,
  initialHabits = [],
  courses = [],
  onBack,
  onConfirm,
}: PlanScreenProps) {
  const [plan, setPlan] = useState<PlanId | null>(initialPlan)
  const [habits, setHabits] = useState<HabitId[]>(initialHabits)

  const canStart = plan !== null && habits.length === 2

  const toggleHabit = (id: HabitId) => {
    setHabits((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 2) return current
      return [...current, id]
    })
  }

  return (
    <div className="screen plan-screen">
      <div className="shell">
        <TopBar
          onTitle={onBack}
          right={
            <button className="text-btn" type="button" onClick={onBack}>
              ← 返回
            </button>
          }
        />

        <header className="plan-head">
          <div>
            <Eyebrow>SEMESTER PLAN / 01</Eyebrow>
            <h1 className="page-title">
              {seasonLabel}
              <span className="title-dot"> · </span>
              学期计划
            </h1>
            <p className="page-lede">
              {player.name}，欢迎来到{SCHOOL_NAME}。
              在正式开始之前，先决定这学期怎么过。计划会影响你每周能积累多少准备度，
              习惯则在你压力不太高的时候悄悄生效。这学期可以选两个习惯，让它们一起陪你。
            </p>
          </div>
          <div className="plan-seal">
            <span>尚未归档</span>
            <strong>PLAN / 001</strong>
          </div>
        </header>

        <div className="paper-card plan-sheet">
          {courses.length > 0 && (
            <section className="plan-courses-section">
              <SectionLabel right="难度按学分、考试类型与记忆/悟性估算">
                00 / 本学期课程
              </SectionLabel>
              <div className="plan-course-grid">
                {courses.map((course) => {
                  const difficulty = courseDifficulty(course)
                  return (
                    <div className="plan-course-card" key={course.id}>
                      <div className="plan-course-meta">
                        <span>{course.examType}</span>
                        <span>{course.credits} 学分</span>
                      </div>
                      <h3>{course.name}</h3>
                      <p>
                        记忆力 {course.memory} · 悟性 {course.comprehension}
                      </p>
                      <div className="plan-course-difficulty">
                        <span aria-label={`难度 ${difficulty.stars} 星`}>
                          {'★'.repeat(difficulty.stars)}
                          {'☆'.repeat(5 - difficulty.stars)}
                        </span>
                        <strong>{difficulty.label}</strong>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="plan-course-note">
                大考、学分高或记忆/悟性要求高的课程更难。先看清这学期要翻几座山，再决定计划。
              </p>
            </section>
          )}

          <section>
            <SectionLabel right="整季一套 · 影响所有课程">01 / 学习计划</SectionLabel>
            <div className="plan-grid">
              {PLANS.map((item) => {
                const selected = item.id === plan
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`plan-card ${selected ? 'is-selected' : ''}`}
                    onClick={() => setPlan(item.id)}
                  >
                    <div className="plan-card-top">
                      <span className="plan-code">{item.code}</span>
                      <span className="plan-en">{item.en}</span>
                      {selected && <span className="plan-check">已选择</span>}
                    </div>
                    <h3>{item.name}</h3>
                    <p className="plan-tagline">{item.tagline}</p>
                    <p className="plan-desc">{item.desc}</p>
                    <ul className="plan-effects">
                      {item.effects.map((effect) => (
                        <li key={effect}>{effect}</li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="habit-section">
            <SectionLabel
              right={<span className="muted-note">选 2 个 · 压力 &gt; 60 时当周失效</span>}
            >
              02 / 养成习惯
            </SectionLabel>
            <div className="habit-grid">
              {HABITS.map((item) => {
                const selected = habits.includes(item.id)
                const disabled = !selected && habits.length >= 2
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`habit-card ${selected ? 'is-selected' : ''} ${
                      disabled ? 'is-disabled' : ''
                    }`}
                    onClick={() => toggleHabit(item.id)}
                    disabled={disabled}
                  >
                    <span className="habit-en">{item.en}</span>
                    <span className="habit-name">
                      {item.name}
                      {selected && <span className="habit-check">已选</span>}
                    </span>
                    <span className="habit-desc">{item.desc}</span>
                    <span className="habit-effect">{item.effect}</span>
                  </button>
                )
              })}
            </div>
            <p className="habit-decay-note">
              注意：没有选择「健身」习惯，且本周行动没有选择「运动」时，体质成长每周 -5%。
            </p>
          </section>

          <div className="plan-footer">
            <div className="plan-summary">
              <span>本学期计划</span>
              <strong>{plan ? PLANS.find((item) => item.id === plan)?.name : '尚未选择'}</strong>
              <i />
              <span>养成习惯</span>
              <strong>
                {habits.length > 0
                  ? habits
                      .map((id) => HABITS.find((item) => item.id === id)?.name)
                      .filter(Boolean)
                      .join(' / ')
                  : '尚未选择'}
                <em className="habit-count">{habits.length} / 2</em>
              </strong>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canStart}
              onClick={() => plan && canStart && onConfirm(plan, habits)}
            >
              签下这份计划，开学
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
