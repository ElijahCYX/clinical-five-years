import { useState } from 'react'
import { HABITS, PLANS, SCHOOL_NAME } from '../data'
import type { HabitId, PlanId, Player } from '../types'
import { Eyebrow, Footer, SectionLabel, TopBar } from '../ui'

interface PlanScreenProps {
  player: Player
  seasonLabel?: string
  initialPlan?: PlanId | null
  initialHabit?: HabitId | null
  onBack?: () => void
  onConfirm: (plan: PlanId, habit: HabitId) => void
}

export function PlanScreen({
  player,
  seasonLabel = '大一 · 秋',
  initialPlan = null,
  initialHabit = null,
  onBack,
  onConfirm,
}: PlanScreenProps) {
  const [plan, setPlan] = useState<PlanId | null>(initialPlan)
  const [habit, setHabit] = useState<HabitId | null>(initialHabit)

  const canStart = plan !== null && habit !== null

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
              习惯则在你压力不太高的时候悄悄生效。
            </p>
          </div>
          <div className="plan-seal">
            <span>尚未归档</span>
            <strong>PLAN / 001</strong>
          </div>
        </header>

        <div className="paper-card plan-sheet">
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
              right={<span className="muted-note">压力 &gt; 60 时，习惯当周失效</span>}
            >
              02 / 养成习惯
            </SectionLabel>
            <div className="habit-grid">
              {HABITS.map((item) => {
                const selected = item.id === habit
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`habit-card ${selected ? 'is-selected' : ''}`}
                    onClick={() => setHabit(item.id)}
                  >
                    <span className="habit-en">{item.en}</span>
                    <span className="habit-name">{item.name}</span>
                    <span className="habit-desc">{item.desc}</span>
                    <span className="habit-effect">{item.effect}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="plan-footer">
            <div className="plan-summary">
              <span>本学期计划</span>
              <strong>{plan ? PLANS.find((item) => item.id === plan)?.name : '尚未选择'}</strong>
              <i />
              <span>养成习惯</span>
              <strong>{habit ? HABITS.find((item) => item.id === habit)?.name : '尚未选择'}</strong>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canStart}
              onClick={() => plan && habit && onConfirm(plan, habit)}
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
