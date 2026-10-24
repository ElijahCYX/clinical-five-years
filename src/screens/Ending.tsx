import { BACKGROUND_BY_ID, TALENT_BY_ID } from '../data'
import type { GameState } from '../types'
import { Eyebrow, HeartLineArt, Stamp, TopBar } from '../ui'

interface EndingScreenProps {
  state: GameState
  onRestart: () => void
  onTitle: () => void
  onContinue?: () => void
  continueLabel?: string
  titleMain?: string
  titleAccent?: string
  eyebrow?: string
  description?: string
  note?: string
}

export function EndingScreen({
  state,
  onRestart,
  onTitle,
  onContinue,
  continueLabel,
  titleMain = '第一学期',
  titleAccent = '完',
  eyebrow = 'END OF YEAR ONE / PROTOTYPE 001',
  description,
  note,
}: EndingScreenProps) {
  const player = state.player
  if (!player) return null
  const talent = TALENT_BY_ID[player.talent]
  const background = BACKGROUND_BY_ID[player.background]
  const cumulativeGpa =
    state.cumulativeCredits > 0 ? state.cumulativePoints / state.cumulativeCredits : 0

  return (
    <div className="screen ending-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />

        <main className="ending-wrap">
          <div className="paper-card ending-card">
            <span className="tape" aria-hidden="true" />
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="ending-title">
              {titleMain}
              <em>{titleAccent}</em>
            </h1>
            <p className="ending-lede">
              {description ??
                state.finalNote ??
                '大一秋结束。你第一次知道，大学的“及格”不是终点，而是一张继续往前的车票。'}
            </p>

            <div className="ending-stats">
              <div>
                <span>姓名</span>
                <strong>{player.name}</strong>
              </div>
              <div>
                <span>天赋</span>
                <strong>
                  {talent.name} · {player.attrs.memory + player.attrs.comprehension} 学力
                </strong>
              </div>
              <div>
                <span>入学档案</span>
                <strong>{player.archiveTitle}</strong>
              </div>
              <div>
                <span>家庭背景</span>
                <strong>{background.name}</strong>
              </div>
              <div>
                <span>累计 GPA</span>
                <strong>{cumulativeGpa.toFixed(2)}</strong>
              </div>
              <div>
                <span>已修学分</span>
                <strong>{state.cumulativeCredits}</strong>
              </div>
              <div>
                <span>体育</span>
                <strong>
                  {state.peResults.length === 0
                    ? '—'
                    : `${state.peResults.filter((item) => item.passed).length} / ${state.peResults.length} 通过`}
                </strong>
              </div>
            </div>

            <div className="ending-illustration">
              <HeartLineArt />
            </div>

            <div className="ending-actions">
              {onContinue ? (
                <button type="button" className="btn btn-primary" onClick={onContinue}>
                  {continueLabel ?? '继续'}
                  <span className="btn-arrow">→</span>
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={onRestart}>
                  重新开始一局
                  <span className="btn-arrow">→</span>
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={onTitle}>
                回到标题
              </button>
            </div>

            <p className="ending-note">
              {note ??
                'UI 初稿到此。接下来会接入：事件卡、人物关系、科研、奖学金与临床年。'}
            </p>
            <Stamp text="漸江大學醫學院" sub="学生档案 · 待续" />
          </div>
        </main>
      </div>
    </div>
  )
}
