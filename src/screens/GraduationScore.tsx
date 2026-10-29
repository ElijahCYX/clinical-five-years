import { useEffect, useMemo, useRef, useState } from 'react'
import type { GameState } from '../types'
import {
  designerScore,
  friendsScore,
  mentorScore,
  selfPerspective,
  selfScore,
  withTier,
  buildRecap,
  type PerspectiveScore,
  type SelfAnswers,
  type SelfMedicine,
  type SelfOverall,
  type SelfPeople,
} from '../graduationScore'
import { graduationReasons } from '../game'
import { Eyebrow, TopBar } from '../ui'

interface GraduationScoreProps {
  state: GameState
  onRestart: () => void
  onTitle?: () => void
}

function AnimatedScore({
  value,
  active,
  instant,
}: {
  value: number
  active: boolean
  instant: boolean
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!active) return
    if (instant) {
      setDisplay(value)
      return
    }
    let frame = 0
    const start = performance.now()
    const duration = 3400
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / duration))
      // Strong ease-out: the last digits crawl into place instead of
      // snapping past the final value.
      const eased = 1 - (1 - progress) ** 4
      setDisplay(
        progress >= 1 ? value : Math.max(0, Math.round(value * eased)),
      )
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, instant, value])

  return (
    <strong className="grad-big-score">
      {active ? String(display).padStart(5, '0') : '00000'}
    </strong>
  )
}

function ScoreCard({
  perspective,
  active,
  instant,
}: {
  perspective: PerspectiveScore
  active: boolean
  instant: boolean
}) {
  const score = withTier(perspective)
  return (
    <article className={`grad-score-card ${active ? 'is-revealed' : ''}`}>
      <div className="grad-score-kicker">
        <span>{perspective.title}</span>
        <span>{perspective.subtitle}</span>
      </div>
      <div className="grad-score-name">{perspective.name}</div>
      <AnimatedScore value={score.score} active={active} instant={instant} />
      <div className="grad-score-tier">{active ? score.tier : '正在翻阅五年档案…'}</div>
      <p>{perspective.line}</p>
    </article>
  )
}

interface TypedRecapProps {
  sections: Array<{ title: string; items: string[] }>
  instant: boolean
  onSectionDone: () => void
  onAllDone: () => void
}

function TypedSection({
  section,
  active,
  instant,
  onDone,
}: {
  section: { title: string; items: string[] }
  active: boolean
  instant: boolean
  onDone: () => void
}) {
  const [visibleItems, setVisibleItems] = useState<string[]>([])
  const [currentText, setCurrentText] = useState('')
  const [complete, setComplete] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!active || complete) return
    if (instant) {
      setVisibleItems(section.items)
      setCurrentText('')
      setComplete(true)
      doneRef.current()
      return
    }

    const chars = section.items.map((item) => Array.from(item))
    let itemIndex = 0
    let charIndex = 0
    setVisibleItems([])
    setCurrentText('')

    const tick = () => {
      if (itemIndex >= chars.length) {
        window.clearInterval(timer)
        setComplete(true)
        doneRef.current()
        return
      }
      const target = chars[itemIndex]
      charIndex += 1
      if (charIndex < target.length) {
        setCurrentText(target.slice(0, charIndex).join(''))
        return
      }
      setVisibleItems((previous) => [...previous, target.join('')])
      setCurrentText('')
      itemIndex += 1
      charIndex = 0
      if (itemIndex >= chars.length) {
        window.clearInterval(timer)
        setComplete(true)
        doneRef.current()
      }
    }

    const timer = window.setInterval(tick, 14)
    return () => window.clearInterval(timer)
  }, [active, complete, instant, section.items])

  return (
    <article className={`grad-recap-column ${active ? 'is-visible' : ''}`}>
      <h3>{section.title}</h3>
      <ul>
        {visibleItems.map((item, index) => (
          <li key={`${section.title}-${index}`}>{item}</li>
        ))}
        {!complete && currentText && (
          <li className="is-typing">
            {currentText}
            <span className="grad-typing-caret" aria-hidden="true">▋</span>
          </li>
        )}
      </ul>
    </article>
  )
}

function TypedRecap({
  sections,
  instant,
  onSectionDone,
  onAllDone,
}: TypedRecapProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [finished, setFinished] = useState(false)
  const allDoneRef = useRef(onAllDone)
  allDoneRef.current = onAllDone

  useEffect(() => {
    if (!instant) return
    setActiveSection(sections.length)
    setFinished(true)
    allDoneRef.current()
  }, [instant, sections.length])

  const handleSectionDone = (index: number) => {
    if (index !== activeSection) return
    if (index + 1 >= sections.length) {
      setFinished(true)
      onAllDone()
      return
    }
    setActiveSection(index + 1)
    onSectionDone()
  }

  return (
    <>
      <div className="grad-recap-grid">
        {sections.map((section, index) => (
          <TypedSection
            key={section.title}
            section={section}
            active={index <= activeSection}
            instant={instant}
            onDone={() => handleSectionDone(index)}
          />
        ))}
      </div>
      {finished && (
        <p className="grad-final-note">
          别急着成为厉害的大人。先吃早饭，按时睡觉，记得求助，然后继续往前走。
          <br />
          你已经走了很远，接下来的路，可以走得慢一点。
        </p>
      )}
    </>
  )
}

const SELF_QUESTIONS: Array<{
  key: keyof SelfAnswers
  question: string
  options: Array<{ value: string; label: string }>
}> = [
  {
    key: 'overall',
    question: '这五年，你过成了自己想要的样子吗？',
    options: [
      { value: 'satisfied', label: '满意' },
      { value: 'accept', label: '接受' },
      { value: 'regret', label: '遗憾' },
    ],
  },
  {
    key: 'medicine',
    question: '如果重来一次，你还会选择医学吗？',
    options: [
      { value: 'again', label: '还会' },
      { value: 'unsure', label: '不确定' },
      { value: 'no', label: '不会' },
    ],
  },
  {
    key: 'people',
    question: '你和身边的人，现在还好吗？',
    options: [
      { value: 'warm', label: '温暖' },
      { value: 'some', label: '有遗憾' },
      { value: 'apart', label: '各自走散' },
    ],
  },
]

export function GraduationScoreScreen({
  state,
  onRestart,
  onTitle,
}: GraduationScoreProps) {
  const [stage, setStage] = useState(0)
  const [instant, setInstant] = useState(false)
  const [recapUnlocked, setRecapUnlocked] = useState(false)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [answers, setAnswers] = useState<SelfAnswers>({
    overall: null,
    medicine: null,
    people: null,
  })

  useEffect(() => {
    if (instant) {
      setStage(4)
      return
    }
    const timers = [
      window.setTimeout(() => setStage(1), 300),
      window.setTimeout(() => setStage(2), 1200),
      window.setTimeout(() => setStage(3), 2100),
      window.setTimeout(() => setStage(4), 3000),
    ]
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [instant])

  const designer = useMemo(() => designerScore(state), [state])
  const mentor = useMemo(() => mentorScore(state), [state])
  const friends = useMemo(() => friendsScore(state), [state])
  const self = useMemo(() => selfPerspective(state, answers), [state, answers])
  const selfValue = selfScore(answers)
  const allAnswered = selfValue !== null
  const recap = useMemo(() => buildRecap(state), [state])
  const reasons = graduationReasons(state)
  const graduated = reasons.length === 0

  const scrollToBottom = () => {
    const shell = shellRef.current
    if (!shell) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    shell.scrollTo({
      top: shell.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  useEffect(() => {
    if (!allAnswered) {
      setRecapUnlocked(false)
      return
    }
    if (instant) {
      setRecapUnlocked(true)
      return
    }
    // The self score has its own 3.4s count-up. Only after it settles do we
    // mount the recap and start the smooth slide to the bottom.
    const timer = window.setTimeout(() => setRecapUnlocked(true), 3500)
    return () => window.clearTimeout(timer)
  }, [allAnswered, instant])

  useEffect(() => {
    if (!recapUnlocked) return
    const timer = window.setTimeout(scrollToBottom, 120)
    return () => window.clearTimeout(timer)
  }, [recapUnlocked])

  const answer = (key: keyof SelfAnswers, value: string) => {
    setAnswers((previous) => {
      if (key === 'overall') {
        return { ...previous, overall: value as SelfOverall }
      }
      if (key === 'medicine') {
        return { ...previous, medicine: value as SelfMedicine }
      }
      return { ...previous, people: value as SelfPeople }
    })
  }

  const skip = () => {
    setInstant(true)
    setAnswers((previous) => ({
      overall: previous.overall ?? 'accept',
      medicine: previous.medicine ?? 'again',
      people: previous.people ?? 'warm',
    }))
  }

  return (
    <div className="screen graduation-score-screen">
      <div className="shell" ref={shellRef}>
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />
        <main className="graduation-score-wrap">
          <header className="graduation-score-head">
            <div>
              <Eyebrow>GRADUATION / THE FIVE-YEAR SCORECARD</Eyebrow>
              <h1>
                {graduated ? '毕业快乐' : '延毕一年'}
                <em>，也辛苦了</em>
              </h1>
              <p>
                五年不是一张成绩单就能说完的。下面四个分数来自四种视角，
                它们不是判决，只是路过你的人，想对你说的几句话。
              </p>
            </div>
            <button type="button" className="grad-skip-btn" onClick={skip}>
              跳过动画，直接看结果
            </button>
          </header>

          {!graduated && (
            <div className="grad-reasons">
              {reasons.map((reason) => (
                <p key={reason}>{reason}</p>
              ))}
            </div>
          )}

          <section className="grad-score-grid" aria-label="四种毕业评分">
            <ScoreCard perspective={designer} active={stage >= 1} instant={instant} />
            <ScoreCard perspective={mentor} active={stage >= 2} instant={instant} />
            <ScoreCard perspective={friends} active={stage >= 3} instant={instant} />
            <article className={`grad-score-card grad-self-card ${stage >= 4 || allAnswered ? 'is-revealed' : ''}`}>
              <div className="grad-score-kicker">
                <span>你自己</span>
                <span>自我评价</span>
              </div>
              <div className="grad-score-name">五年后的你</div>
              <AnimatedScore value={self.score} active={allAnswered} instant={instant} />
              <div className="grad-score-tier">
                {allAnswered ? withTier(self).tier : '先回答三个问题，再给自己打分'}
              </div>
              <p>{self.line}</p>
              <div className="grad-self-questions">
                {SELF_QUESTIONS.map((item) => (
                  <div className="grad-self-question" key={item.key}>
                    <strong>{item.question}</strong>
                    <div>
                      {item.options.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          className={answers[item.key] === option.value ? 'is-selected' : ''}
                          onClick={() => answer(item.key, option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {recapUnlocked ? (
            <section className="grad-recap" aria-label="五年复盘">
              <div className="grad-recap-head">
                <div>
                  <Eyebrow>THE RECEIPT / 五年复盘</Eyebrow>
                  <h2>你做过的事，都算数</h2>
                </div>
                <p>
                  分数只统计到这里，故事还没结束。谢谢你没有在半路上把自己丢掉。
                </p>
              </div>
              <TypedRecap
                sections={recap}
                instant={instant}
                onSectionDone={() => {
                  window.setTimeout(scrollToBottom, 80)
                }}
                onAllDone={() => {
                  window.setTimeout(scrollToBottom, 100)
                }}
              />
            </section>
          ) : (
            <p className="grad-self-hint">
              {allAnswered
                ? '分数正在落定，马上就带你去五年复盘。'
                : '回答完最后一个问题后，这里会展开你的五年复盘。'}
            </p>
          )}

          <footer className="grad-score-actions">
            <button type="button" className="btn btn-primary" onClick={onRestart}>
              重新开始一局
              <span className="btn-arrow">→</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={onTitle}>
              回到标题
            </button>
          </footer>
        </main>
      </div>
    </div>
  )
}
