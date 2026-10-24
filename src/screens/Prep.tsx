import { useMemo, useState } from 'react'
import { HABIT_BY_ID } from '../data'
import {
  clamp,
  courseK,
  coursePrepTalentMultiplier,
  effectiveEnergyCost,
  estimateRange,
  examReviewTalentMultiplier,
  getReviewEffect,
  isExamReviewCourse,
  prepGainMultiplier,
  reviewMultiplier,
} from '../game'
import type { GameState, ReviewChoice } from '../types'
import { Bar, Eyebrow, Pill, SectionLabel, TopBar } from '../ui'
import { PlayerRail } from './PlayerRail'

interface PrepScreenProps {
  state: GameState
  initialChoice?: ReviewChoice | null
  onChoose: (choice: ReviewChoice) => void
  onCoffee?: () => void
  onAllNighter?: () => void
  onEnglishPrep?: () => void
  onTitle?: () => void
}

export function PrepScreen({
  state,
  initialChoice = null,
  onChoose,
  onCoffee,
  onAllNighter,
  onEnglishPrep,
  onTitle,
}: PrepScreenProps) {
  const [choice, setChoice] = useState<ReviewChoice | null>(initialChoice)
  const player = state.player
  if (!player) return null

  const habits = (state.habits ?? [])
    .map((id) => HABIT_BY_ID[id])
    .filter(Boolean)
  const courses = state.season.courses
  const reviewCourses = courses.filter(isExamReviewCourse)
  const isBig = reviewCourses.length > 1
  const planId = state.plan ?? 'B'
  const multiplier = reviewMultiplier(planId)
  const caffeineImmune = state.openingTalents.includes('caffeineImmune')

  const focusOptions: Array<{
    id: ReviewChoice
    label: string
    en: string
    desc: string
    meta: string
  }> = reviewCourses.map((course, index) => ({
    id: `focus${index}` as ReviewChoice,
    label: `主攻 ${course.name}`,
    en: `FOCUS ${String.fromCharCode(65 + index)}`,
    desc: '把这一周的复习时间单独投给这门必修/思政课。',
    meta: '',
  }))

  const options: Array<{
    id: ReviewChoice
    label: string
    en: string
    desc: string
    meta: string
  }> = isBig
    ? [
        ...focusOptions,
        {
          id: 'balanced',
          label: '均衡复习',
          en: 'BALANCE',
          desc: '在可复习的必修/思政课程之间平均分配时间，其他选修课不参与。',
          meta: '',
        },
        {
          id: 'mock',
          label: '历年卷 + zsy 笔记',
          en: 'PAST PAPERS + NOTES',
          desc: '必修/思政各做一套历年卷，再对着 zsy 笔记补漏洞。收益等同均衡复习，但成绩上限 -5%。',
          meta: '',
        },
        {
          id: 'rest',
          label: '休息调整',
          en: 'REST',
          desc: '睡饱，散步，让脑子空一空。也许比多背两道题有用。',
          meta: '',
        },
      ]
    : [
        {
          id: 'full',
          label: '全力复习',
          en: 'FULL FOCUS',
          desc: '把这一周完整地交给这门必修/思政课。',
          meta: '',
        },
        {
          id: 'mock',
          label: '历年卷 + zsy 笔记',
          en: 'PAST PAPERS + NOTES',
          desc: '按考试时间做一套历年卷，再对着 zsy 笔记补漏洞。临场更稳，但成绩上限 -5%。',
          meta: '',
        },
        {
          id: 'rest',
          label: '休息调整',
          en: 'REST',
          desc: '睡饱，散步，让脑子空一空。也许比多背两道题有用。',
          meta: '',
        },
      ]

  const optionEffects = useMemo(
    () =>
      options.map((option) => {
        const rawEffect = getReviewEffect(option.id, courses, player.attrs, planId)
        const gainFactor =
          prepGainMultiplier(state) * (state.examEnglishPrep ? 0.9 : 1)
        const effect = {
          ...rawEffect,
          gains: Object.fromEntries(
            courses.map((course) => [
              course.id,
              (rawEffect.gains[course.id] ?? 0) *
                gainFactor *
                examReviewTalentMultiplier(state) *
                coursePrepTalentMultiplier(state, course),
            ]),
          ),
        }
        const projected = courses.reduce<Record<string, number>>((acc, course) => {
          acc[course.id] = Math.min(
            100,
            (state.prep[course.id] ?? 0) + (effect.gains[course.id] ?? 0),
          )
          return acc
        }, {})
        return { ...option, effect, projected }
      }),
    [
      state.prep,
      state.season.id,
      options.length,
      state.examEnglishPrep,
      state.stress,
      state.highPressureDebuff,
    ],
  )

  const selected = optionEffects.find((option) => option.id === choice)

  const effectSummary = (option: (typeof optionEffects)[number]) => {
    const parts = courses
      .map((course) => {
        const gain = Math.round(option.effect.gains[course.id] ?? 0)
        if (gain === 0) return null
        return `${course.name} +${gain}`
      })
      .filter(Boolean)
    return parts.length > 0 ? parts.join(' · ') : '没有直接准备度收益'
  }

  const metaSummary = (option: (typeof optionEffects)[number]) => {
    const adjustedEnergy = effectiveEnergyCost(option.effect.energy, state.energy)
    const energy =
      adjustedEnergy > 0
        ? `精力 +${adjustedEnergy}`
        : adjustedEnergy < 0
          ? `精力 ${adjustedEnergy}`
          : null
    const stress =
      option.effect.stress > 0
        ? `压力 +${option.effect.stress}`
        : option.effect.stress < 0
          ? `压力 ${option.effect.stress}`
          : null
    const cap = option.effect.scoreCap ? `成绩上限 ${option.effect.scoreCap}` : null
    return [energy, stress, cap].filter(Boolean).join(' · ')
  }

  return (
    <div className="screen prep-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={<span className="topbar-note">第 4 周 · 考前复习</span>}
        />

        <header className="prep-head">
          <div>
            <Eyebrow>WEEK 04 / PRE-EXAM REVIEW</Eyebrow>
            <h1 className="page-title">考前复习</h1>
            <p className="page-lede">
              这一周不排新的内容，只做一件事：把已经学过的东西，安放到考试那两天里。
            </p>
          </div>
          <div className="prep-week-mark">
            <span>04</span>
            <small>/ 04 周 · 考试周</small>
          </div>
        </header>

        <div className="prep-grid">
          <PlayerRail
            state={state}
            title="EXAM WEEK STATUS"
            titleRight="第 4 周"
            mode="exam"
            note="喝咖啡 / 刷夜会即时改变这里的数值。"
          />

          <main>
            <div className="paper-card prep-course-card">
              <div className="prep-course-head">
                <div>
                  <span className="exam-kind">{state.season.examKind}</span>
                  <h2>本季考试</h2>
                  <p>
                    {courses.reduce((sum, course) => sum + course.credits, 0)} 学分 ·{' '}
                    {courses.length} 门课程 · {state.season.yearLabel}
                  </p>
                </div>
                <div className="prep-estimate">
                  <span>{isBig ? '考试科目' : '预计卷面'}</span>
                  <strong>
                    {isBig
                      ? `${courses.length} 门`
                      : selected
                        ? `${estimateRange(selected.projected[courses[0].id])[0]}–${
                            estimateRange(selected.projected[courses[0].id])[1]
                          }`
                        : '—'}
                  </strong>
                  <small>
                    {isBig
                      ? `共 ${courses.reduce((sum, course) => sum + course.credits, 0)} 学分`
                      : '及格线 60'}
                  </small>
                </div>
              </div>

              <div className="prep-course-blocks">
                {courses.map((course) => {
                  const prep = state.prep[course.id] ?? 0
                  const k = courseK(course, player.attrs)
                  const projected = selected?.projected[course.id] ?? prep
                  const [min, max] = estimateRange(projected)
                  return (
                    <div className="prep-course-block" key={course.id}>
                      <div className="prep-course-block-top">
                        <div>
                          <strong>
                            {course.name}
                            {course.makeup && <span className="makeup-tag">补考</span>}
                          </strong>
                          <span>
                            {course.examType} · {course.credits} 学分 · 记忆力{' '}
                            {course.memory} · 悟性 {course.comprehension}
                          </span>
                        </div>
                        {isBig && (
                          <div className="prep-course-estimate">
                            <span>预计</span>
                            <b>
                              {min}–{max}
                            </b>
                          </div>
                        )}
                      </div>
                      <div className="prep-bar-line">
                        <span>准备度</span>
                        <div>
                          <Bar value={projected} tone={projected >= 60 ? 'green' : 'gold'} />
                        </div>
                        <strong>
                          {Math.round(projected)} / 100
                        </strong>
                      </div>
                      <div className="prep-k-row">
                        <span>匹配系数 K {k.toFixed(2)}</span>
                        <span>当前 {Math.round(prep)}</span>
                        {selected && (selected.effect.gains[course.id] ?? 0) > 0 && (
                          <span className="prep-gain">
                            +{Math.round(selected.effect.gains[course.id])}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="prep-k-row prep-plan-row">
                <span>计划倍率 ×{multiplier.toFixed(2)}</span>
                <span>
                  习惯：{habits.length > 0 ? habits.map((item) => item.name).join(' / ') : '无'} {habits.length > 0 && state.stress <= 60 ? '生效中' : '失效'}
                </span>
              </div>
            </div>

            <section>
              <SectionLabel right="选择一种复习方式">这一周怎么复习？</SectionLabel>
              <div className={`review-options ${isBig ? 'review-options-many' : ''}`}>
                {optionEffects.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`review-card ${choice === option.id ? 'is-selected' : ''}`}
                    onClick={() => setChoice(option.id)}
                  >
                    <div className="review-top">
                      <span className="review-en">{option.en}</span>
                      {choice === option.id && <span className="review-check">已选择</span>}
                    </div>
                    <h3>{option.label}</h3>
                    <p>{option.desc}</p>
                    <div className="review-effect">{effectSummary(option)}</div>
                    <div className="review-meta">{metaSummary(option)}</div>
                  </button>
                ))}
              </div>
            </section>

            <div className="prep-confirm">
              <div className="prep-summary">
                <span>当前选择</span>
                <strong>{selected?.label ?? '尚未选择复习方式'}</strong>
                {selected && (
                  <>
                    <i />
                    <span>预计</span>
                    {courses.map((course) => {
                      const [min, max] = estimateRange(selected.projected[course.id])
                      return (
                        <strong key={course.id}>
                          {courses.length > 1 ? `${course.name} ` : ''}
                          {min}–{max}
                        </strong>
                      )
                    })}
                  </>
                )}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!choice}
                onClick={() => choice && onChoose(choice)}
              >
                走进考场
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </main>

          <aside className="prep-aside">
            <div className="paper-card boost-card">
              <div className="card-head">
                <span>EXAM BOOSTS</span>
                <span>不消耗行动次数</span>
              </div>
              <div className="boost-title">
                <span>考前加餐</span>
                <Pill tone="gold">额外操作</Pill>
              </div>
              <div className="boost-row">
                <div>
                  <h4>喝咖啡</h4>
                  <p>一杯美式，续命不续成绩。</p>
                  <small>生活费 -10 · 精力 +10 · 压力 {caffeineImmune ? 0 : 2}</small>
                  {state.examCoffee ? (
                    <small className="boost-now">已生效 · 本场不可撤销</small>
                  ) : (
                    <div className="boost-deltas">
                      <div>
                        <span>精力</span>
                        <b>
                          {state.energy} → {clamp(state.energy + 10, 0, 100)}
                        </b>
                      </div>
                      <div>
                        <span>压力</span>
                        <b>
                          {state.stress} → {clamp(state.stress + 2, 0, 100)}
                        </b>
                      </div>
                      <div>
                        <span>生活费</span>
                        <b>
                          ¥{state.money} → ¥{Math.max(0, state.money - 10)}
                        </b>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="boost-btn"
                  onClick={onCoffee}
                  disabled={state.examCoffee || state.money < 10}
                >
                  {state.examCoffee ? '已喝过' : '来一杯'}
                </button>
              </div>
              <div className="boost-row">
                <div>
                  <h4>刷夜</h4>
                  <p>把重点塞进一夜：准备度 +15，成绩上限 {caffeineImmune ? '2.5' : '5'}%。</p>
                  <small>精力 {caffeineImmune ? -5 : -10} · 体质成长 {caffeineImmune ? -5 : -10} · 压力 +{caffeineImmune ? 5 : 10}</small>
                  {state.examAllNighter ? (
                    <small className="boost-now">已生效 · 本场不可撤销</small>
                  ) : (
                    <div className="boost-deltas">
                      <div>
                        <span>精力</span>
                        <b>
                          {state.energy} →{' '}
                          {clamp(
                            state.energy +
                              effectiveEnergyCost(caffeineImmune ? -5 : -10, state.energy),
                            0,
                            100,
                          )}
                        </b>
                      </div>
                      <div>
                        <span>压力</span>
                        <b>
                          {state.stress} →{' '}
                          {clamp(state.stress + (caffeineImmune ? 5 : 10), 0, 100)}
                        </b>
                      </div>
                      <div>
                        <span>准备度</span>
                        <b>+15</b>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="boost-btn boost-danger"
                  onClick={onAllNighter}
                  disabled={state.examAllNighter}
                >
                  {state.examAllNighter ? '已刷夜' : '刷一夜'}
                </button>
              </div>
              {state.season.examKind === '大考' && (
                <div className="boost-row">
                  <div>
                    <h4>英语备考</h4>
                    <p>用考试周的一部分时间背单词、刷 CET 真题，给下一场四六级加一点底。</p>
                    <small>
                      精力 -10 · 压力 +5 · 英语进度 +5 · 本次复习收益 -10%
                      {state.cetWindow ? ' · CET 通过率 +10%' : ' · 本季未报名 CET，通过率加成不生效'}
                    </small>
                    {state.examEnglishPrep ? (
                      <small className="boost-now">已生效 · 本场不可撤销</small>
                    ) : (
                      <div className="boost-deltas">
                        <div>
                          <span>精力</span>
                          <b>
                            {state.energy} →{' '}
                          {clamp(
                            state.energy +
                              effectiveEnergyCost(caffeineImmune ? -5 : -10, state.energy),
                            0,
                            100,
                          )}
                          </b>
                        </div>
                        <div>
                          <span>压力</span>
                          <b>
                            {state.stress} → {clamp(state.stress + 5, 0, 100)}
                          </b>
                        </div>
                        <div>
                          <span>英语</span>
                          <b>{state.english} → {state.english + 5}</b>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="boost-btn"
                    onClick={onEnglishPrep}
                    disabled={state.examEnglishPrep}
                  >
                    {state.examEnglishPrep ? '已备考' : '背一轮'}
                  </button>
                </div>
              )}

            </div>

            <div className="paper-card exam-table-card">
              <div className="card-head">
                <span>EXAM SHEET</span>
                <span>本季考试</span>
              </div>
              {courses.map((course) => (
                <div className="exam-row" key={course.id}>
                  <span>{course.name}</span>
                  <span>{course.credits} 学分</span>
                  <strong>{course.examType}</strong>
                </div>
              ))}
              <div className="exam-total">
                <span>合计学分</span>
                <strong>{courses.reduce((sum, course) => sum + course.credits, 0)}</strong>
              </div>
            </div>

            <div className="prep-quote">
              “考试周最公平的地方在于：你之前欠下的，都要在这一周还回来。”
            </div>
            <Pill tone={state.stress > 60 ? 'red' : 'green'}>
              {state.stress > 60 ? '压力过高，习惯已失效' : '压力正常，习惯生效中'}
            </Pill>
          </aside>
        </div>
      </div>
    </div>
  )
}
