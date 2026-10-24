import { CET } from '../data'
import { cetHint } from '../game'
import type { GameState } from '../types'
import { Eyebrow, Pill, TopBar } from '../ui'

interface CetResultScreenProps {
  state: GameState
  nextLabel?: string
  onContinue: () => void
  onTitle?: () => void
}

export function CetResultScreen({ state, nextLabel = '下一学年', onContinue, onTitle }: CetResultScreenProps) {
  const cet4Taken = state.cet4Score !== null
  const cet6Taken = state.cet6Score !== null
  const cet4Passed = cet4Taken && state.cet4Score! >= CET.pass4
  const cet6Passed = cet6Taken && state.cet6Score! >= CET.pass6
  const cet6Qualified = cet6Taken && state.cet6Score! >= CET.graduate6

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
          <div className="paper-card event-card cet-result-card">
            <span className="tape" aria-hidden="true" />
            <Eyebrow>CET RESULT / AUTUMN SEMESTER</Eyebrow>
            <div className="event-title-row">
              <div>
                <h1 className="event-title">成绩公布</h1>
                <p className="event-sub">{nextLabel} · 学期初 · 英语四六级</p>
              </div>
              <Pill tone={cet6Qualified ? 'green' : 'gold'}>
                {cet6Qualified ? '毕业英语已合格' : '仍有提升空间'}
              </Pill>
            </div>

            <p className="event-lede">
              成绩单在开学前寄到。英语这件事，努力和记忆力都会算数。
              当前英语进度 {state.english}（{cetHint(state.cet4Score, state.cet6Score)}）。
            </p>

            <div className="cet-result-grid">
              <div className={`cet-result-block ${cet4Passed ? 'is-pass' : ''}`}>
                <span className="cet-code">CET-4</span>
                <div className="cet-score">{cet4Taken ? state.cet4Score : '—'}</div>
                <p>{cet4Taken ? (cet4Passed ? '通过' : '未通过') : '未参加'}</p>
                <small>通过线 {CET.pass4} / 总分 {CET.total}</small>
              </div>
              <div
                className={`cet-result-block ${cet6Qualified ? 'is-qualified' : cet6Passed ? 'is-pass' : ''}`}
              >
                <span className="cet-code">CET-6</span>
                <div className="cet-score">{cet6Taken ? state.cet6Score : '—'}</div>
                <p>
                  {cet6Taken
                    ? cet6Qualified
                      ? '通过 · 达到毕业要求'
                      : cet6Passed
                        ? '通过 · 未达毕业要求'
                        : '未通过'
                    : '未参加'}
                </p>
                <small>
                  通过线 {CET.pass6} / 毕业线 {CET.graduate6}
                </small>
              </div>
            </div>

            <div className="cet-result-note">
              {!cet4Taken && !cet6Taken && (
                <p>你没有参加这次四六级考试。之后仍可以在夏学期报名。</p>
              )}
              {cet4Taken && !cet4Passed && (
                <p>CET-4 没有通过。下一年夏天可以再次报名；英语进度越高，保底分越高。</p>
              )}
              {cet4Passed && !cet6Taken && (
                <p>CET-4 已通过。下一次夏学期可以报名 CET-6；毕业要求是 CET-6 ≥ 550。</p>
              )}
              {cet6Passed && !cet6Qualified && (
                <p>CET-6 已通过，但还没有达到毕业要求的 550。之后可以重考。</p>
              )}
              {cet6Qualified && <p>CET-6 已达到毕业要求。英语这一关，暂时可以放下了。</p>}
            </div>

            <div className="event-actions">
              <button type="button" className="btn btn-primary" onClick={onContinue}>
                继续学期计划
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
