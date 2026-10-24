import { VACATION_ACTION_BY_ID, VACATION_ACTIONS, VACATIONS, HABIT_BY_ID, BACKGROUND_BY_ID, TALENT_BY_ID, SEASONS } from '../data'
import { archetypeFor, cetHint } from '../game'
import type { ActionDef, GameState } from '../types'
import { Bar, Dot, Eyebrow, Pill, StatBar, TopBar } from '../ui'

interface VacationScreenProps {
  state: GameState
  onToggleAction: (id: string) => void
  onEndWeek: () => void
  onSave?: () => void
  onTitle?: () => void
}

const VISIBLE_VACATION_ACTIONS = [
  'vacHome',
  'vacTravel',
  'vacPractice',
  'vacPartTime',
  'vacFitness',
  'vacEnglish',
  'vacRest',
  'vacFun',
]

export function VacationScreen({
  state,
  onToggleAction,
  onEndWeek,
  onSave,
  onTitle,
}: VacationScreenProps) {
  const player = state.player
  const vacation = state.vacation
  if (!player || !vacation) return null

  const meta = VACATIONS[vacation.kind]
  const yearPrefix = state.season.seasonLabel.split(' · ')[0] ?? ''
  const nextSeason = SEASONS[state.seasonIndex + 1]
  const nextLabel = nextSeason?.seasonLabel ?? '下一学年'
  const talent = TALENT_BY_ID[player.talent]
  const background = BACKGROUND_BY_ID[player.background]
  const habit = state.habit ? HABIT_BY_ID[state.habit] : null
  const habitActive = state.stress <= 60
  const latestLog = state.logs[state.logs.length - 1]
  const vacationLog = latestLog?.title.startsWith(meta.name) ? latestLog : null
  const remainingActions = Math.max(0, 2 - state.selected.length)
  const archetype = archetypeFor(player.attrs)

  const lockReason = (action: ActionDef): string | null => {
    if (action.energy < 0 && state.energy + action.energy < 0) return '精力不足'
    if (action.money < 0 && state.money + action.money < 0) return '生活费不足'
    return null
  }

  return (
    <div className="screen game-screen vacation-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <>
              <button className="text-btn" type="button" onClick={onSave}>
                保存
              </button>
              <span className="topbar-divider" />
              <button className="text-btn" type="button" onClick={onTitle}>
                返回标题
              </button>
            </>
          }
        />

        <header className="game-head">
          <div className="game-head-left">
            <Eyebrow>INTERLUDE / {meta.en}</Eyebrow>
            <h1>{meta.name}</h1>
            <p>
              {yearPrefix} · {meta.name}
              <span className="head-sep">/</span>
              没有考试
              <span className="head-sep">/</span>
              每周选两件事
            </p>
          </div>
          <div className="game-head-right">
            <span className="week-big">{String(vacation.week).padStart(2, '0')}</span>
            <span className="week-small">
              / {String(vacation.totalWeeks).padStart(2, '0')} 周
              <br />
              第 1 年
            </span>
          </div>
        </header>

        <main className="game-grid">
          <aside className="game-left">
            <div className="student-id">
              <div className="student-id-top">
                <span>STUDENT IDENTIFICATION</span>
              </div>
              <div className="student-name">{player.name}</div>
              <div className="student-sub">临床医学 · 五年制</div>
              <div className="id-divider" />
              <div className="id-line">
                <span>天赋</span>
                <strong>{talent.name}</strong>
              </div>
              <div className="id-line">
                <span>背景</span>
                <strong>{background.name}</strong>
              </div>
              <div className="id-line">
                <span>性别</span>
                <strong>{player.gender}</strong>
              </div>
              <div className="id-line">
                <span>月度生活费</span>
                <strong>{background.money}</strong>
              </div>
              <span className="id-stamp" aria-hidden="true">
                <span>臨江大學</span>
                <span>醫學院</span>
              </span>
            </div>

            <div className="paper-card status-card">
              <div className="card-head">
                <span>VACATION STATUS</span>
                <span>第 {vacation.week} 周</span>
              </div>
              <StatBar
                label="精力"
                value={state.energy}
                tone="green"
                sub="自然恢复 +15 / 周"
              />
              <StatBar
                label="压力"
                value={state.stress}
                tone="red"
                sub={habitActive ? '习惯生效中' : '压力过高，习惯已失效'}
              />
              <div className="money-row">
                <div>
                  <span>生活费</span>
                  <strong>¥ {state.money}</strong>
                </div>
                <small>每周固定开销 250</small>
              </div>
              <div className="mini-stats">
                <div>
                  <span>综合测评</span>
                  <strong>{state.composite}</strong>
                </div>
                <div>
                  <span>英语进度</span>
                  <strong>{state.english}</strong>
                  <small className="stat-hint">
                    {cetHint(state.cet4Score, state.cet6Score)}
                  </small>
                </div>
                <div>
                  <span>科研</span>
                  <strong>{state.research}</strong>
                </div>
              </div>
            </div>

            <div className="paper-card plan-card-mini">
              <div className="card-head">
                <span>VACATION</span>
                <span>假期</span>
              </div>
              <div className="plan-mini-row">
                <span>学习计划</span>
                <strong>不安排</strong>
              </div>
              <div className="plan-mini-row">
                <span>养成习惯</span>
                <strong>
                  {habit ? habit.name : '无'}
                  <Dot active={habitActive} />
                </strong>
              </div>
              <p>假期不设学习计划，但习惯会继续生效。</p>
            </div>

            <div className="left-progress">
              <div>
                <span>学年进度</span>
                <strong>{yearPrefix} · {meta.name}</strong>
              </div>
              <div>
                <span>假期进度</span>
                <strong>
                  {vacation.week} / {vacation.totalWeeks} 周
                </strong>
              </div>
              <div>
                <span>假期结束</span>
                <strong>{nextLabel}</strong>
              </div>
            </div>
          </aside>

          <section className="game-center">
            <div className="vacation-banner">
              <div>
                <span className="exam-label">NO EXAM / 没有考试</span>
                <strong>把时间花在你想花的地方</strong>
                <p>
                  这个假期有 {vacation.totalWeeks} 周。每周仍然只能认真做两件事，
                  但这一次，没有准备度追着你跑。
                </p>
              </div>
              <span className="vacation-mark">{meta.en}</span>
            </div>

            <div className="week-title-row">
              <div>
                <h2>这个假期，你想怎么过？</h2>
                <p>没有考试，也不代表时间不存在。</p>
              </div>
              <Pill tone={remainingActions === 0 ? 'green' : 'plain'}>
                剩余 {remainingActions} / 2 次行动
              </Pill>
            </div>

            <div className="actions-grid">
              {VISIBLE_VACATION_ACTIONS.map((id) => {
                const action = VACATION_ACTION_BY_ID[id]
                if (!action) return null
                const locked = lockReason(action)
                const selected = state.selected.includes(action.id)
                const disabled = Boolean(locked)
                return (
                  <button
                    key={action.id}
                    type="button"
                    className={`action-card ${selected ? 'is-selected' : ''} ${
                      disabled ? 'is-locked' : ''
                    }`}
                    onClick={() => !disabled && onToggleAction(action.id)}
                    disabled={disabled}
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
                      {selected && <span className="action-selected">已排入本周</span>}
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
                  state.selected.map((id) => (
                    <strong key={id}>{VACATION_ACTION_BY_ID[id]?.name}</strong>
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
          </section>

          <aside className="game-right">
            <div className="paper-card memo-card">
              <div className="card-head">
                <span>VACATION MEMO</span>
                <span>假期手记</span>
              </div>
              <h3>{vacationLog?.title ?? `${meta.name} · 第 ${vacation.week} 周`}</h3>
              <p className="memo-text">
                {vacationLog?.text ??
                  '终于没有早八了。你睡到自然醒，发现窗外的光线和学期里不太一样。假期很长，也很短。'}
              </p>
              {vacationLog && (
                <div className="delta-row memo-deltas">
                  {vacationLog.deltas.map((delta) => (
                    <span key={delta}>{delta}</span>
                  ))}
                </div>
              )}
              <blockquote className="memo-quote">
                “先把今天过完。明天的事，明天再想。”
              </blockquote>
            </div>

            <div className="paper-card course-card">
              <div className="card-head">
                <span>AFTER THE BREAK</span>
                <span>假期之后</span>
              </div>
              <div className="vacation-after">
                <span>{nextLabel}</span>
                <p>
                  {vacation.kind === 'winter'
                    ? `寒假结束后是${nextLabel}。新的课程在春天等你。`
                    : `暑假结束后先进行学年结算；${nextLabel}在结算后开始。`}
                </p>
              </div>
              <div className="vacation-habit">
                <span>当前习惯</span>
                <strong>
                  {habit ? habit.name : '无'}
                  <Dot active={habitActive} />
                </strong>
              </div>
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
                <span>假期余额</span>
                <strong>{Math.max(0, vacation.totalWeeks - vacation.week + 1)} 周</strong>
              </div>
              <div className="identity-art" aria-hidden="true">
                <span>✦</span>
              </div>
            </div>

            <div className="right-links">
              <button className="text-btn" type="button" onClick={onTitle}>
                返回报到页
              </button>
              <button className="text-btn" type="button" onClick={onSave}>
                保存进度
              </button>
            </div>
          </aside>
        </main>

        <footer className="game-footer">
          <span>
            {yearPrefix} · {meta.name} · 第 {vacation.week} / {vacation.totalWeeks} 周 · 没有考试
          </span>
          <span>假期结束后：{nextLabel}</span>
        </footer>
      </div>
    </div>
  )
}
