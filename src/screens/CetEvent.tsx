import { useState } from 'react'
import { CET } from '../data'
import { cetHint } from '../game'
import type { GameState } from '../types'
import { Eyebrow, Pill, TopBar } from '../ui'

interface CetEventScreenProps {
  state: GameState
  onRegister: (kind: 'cet4' | 'cet6') => void
  onSkip: () => void
  onTitle?: () => void
}

type Choice = 'cet4' | 'cet6' | 'skip' | null

export function CetEventScreen({ state, onRegister, onSkip, onTitle }: CetEventScreenProps) {
  const [choice, setChoice] = useState<Choice>(null)
  const player = state.player
  if (!player) return null

  const cet4Passed = (state.cet4Score ?? 0) >= CET.pass4
  const cet6Qualified = (state.cet6Score ?? 0) >= CET.graduate6
  const canCet4 = !cet4Passed
  const canCet6 = cet4Passed
  const canAfford = state.money >= CET.registrationCost

  const confirm = () => {
    if (choice === 'cet4') onRegister('cet4')
    else if (choice === 'cet6') onRegister('cet6')
    else if (choice === 'skip') onSkip()
  }

  return (
    <div className="screen event-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />

        <main className="event-wrap">
          <div className="paper-card event-card">
            <span className="tape" aria-hidden="true" />
            <Eyebrow>NOTICE / CET REGISTRATION</Eyebrow>
            <div className="event-title-row">
              <div>
                <h1 className="event-title">英语四六级报名</h1>
                <p className="event-sub">
                  {state.season.seasonLabel} · 第 3 周 · 考试周前一周
                </p>
              </div>
              <Pill tone="gold">限本周事件</Pill>
            </div>
            <p className="event-lede">
              全国大学英语四、六级考试报名开始。报名费 {CET.registrationCost} 元。
              {state.season.seasonLabel.includes('冬')
                ? '本次冬季考试成绩将在春季学期初公布。'
                : '本次夏季考试成绩将在秋季学期初公布。'}
              这是毕业与保研简历上都会用到的一张成绩单。
            </p>

            <div className="event-info">
              <div>
                <span>英语能力</span>
                <strong>{state.english}</strong>
                <small>成长 {Math.round(state.englishGrowth)}% · {cetHint(state.cet4Score, state.cet6Score)}</small>
              </div>
              <div>
                <span>记忆力</span>
                <strong>{player.attrs.memory}</strong>
                <small>影响赋分上限</small>
              </div>
              <div>
                <span>报名费</span>
                <strong>-{CET.registrationCost}</strong>
                <small>从生活费扣除</small>
              </div>
            </div>

            <div className="cet-cards">
              <button
                type="button"
                className={`cet-option ${choice === 'cet4' ? 'is-selected' : ''} ${
                  !canCet4 ? 'is-disabled' : ''
                }`}
                disabled={!canCet4}
                onClick={() => setChoice('cet4')}
              >
                <span className="cet-code">CET-4</span>
                <h3>报名四级</h3>
                <p>总分 750，425 分通过。</p>
                <ul>
                  <li>英语能力 ≥ 10：四级保底 425</li>
                  <li>报名费 {CET.registrationCost} 元</li>
                </ul>
                <small>
                  {canCet4
                    ? '你还没有通过四级。'
                    : `已通过：${state.cet4Score} 分`}
                </small>
              </button>

              <button
                type="button"
                className={`cet-option ${choice === 'cet6' ? 'is-selected' : ''} ${
                  !canCet6 ? 'is-disabled' : ''
                }`}
                disabled={!canCet6}
                onClick={() => setChoice('cet6')}
              >
                <span className="cet-code">CET-6</span>
                <h3>报名六级</h3>
                <p>总分 750，425 分通过。</p>
                <ul>
                  <li>英语能力 ≥ 60：六级保底 425</li>
                  <li>英语能力 ≥ 100：六级保底 550</li>
                  <li>报名费 {CET.registrationCost} 元</li>
                </ul>
                <small>
                  {!cet4Passed
                    ? '需要先通过 CET-4。'
                    : cet6Qualified
                      ? `已达到毕业线：${state.cet6Score} 分，可继续刷分`
                      : `四级已通过：${state.cet4Score} 分`}
                </small>
              </button>
            </div>

            {!canCet4 && !canCet6 && (
              <p className="event-done">
                你的英语已经达到毕业要求（CET-6 ≥ 550），这次不需要再报名。
              </p>
            )}

            {!canAfford && (
              <p className="event-warn">生活费不足 10 元，无法报名。可以先不参加，明年再考。</p>
            )}

            <p className="cet-note">
              只有 CET-4 ≥ 425 才能报名 CET-6；CET-6 ≥ 550 才算达到毕业英语要求。
              英语能力可以超过 100，继续学没有坏处。
            </p>

            <div className="event-actions">
              <button
                type="button"
                className={`btn ${choice === 'skip' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setChoice('skip')}
              >
                不参加，继续
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!choice || (choice !== 'skip' && !canAfford)}
                onClick={confirm}
              >
                确认
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
