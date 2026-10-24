import type { GameState } from '../types'
import { Eyebrow, Pill, TopBar } from '../ui'

interface OpeningTalentEventScreenProps {
  state: GameState
  onContinue: () => void
  onTitle?: () => void
}

export function OpeningTalentEventScreen({
  state,
  onContinue,
  onTitle,
}: OpeningTalentEventScreenProps) {
  const appearance = state.player?.attrs.appearance ?? 0

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
            <Eyebrow>OPENING TALENT / ROOMMATE ENCOUNTER</Eyebrow>
            <div className="event-title-row">
              <div>
                <h1 className="event-title">舍友关系 +1</h1>
                <p className="event-sub">建模面板 {appearance} · 概率事件已触发</p>
              </div>
              <Pill tone="green">建模怪</Pill>
            </div>
            <p className="event-lede">
              宿舍门刚推开，你的舍友正戴着耳机打游戏。他抬头看了你一眼，
              又看了一眼，突然把耳机摘下来：“等等，你是不是高中那个年级第一？”
            </p>
            <p className="event-lede">
              你还没来得及解释自己只是长得很会考试，他已经把椅子拉过来了：
              “以后打饭我帮你带，占座我帮你占。你别嫌弃我菜就行。”
              你的建模面板在你不知情的时候，完成了一次社交暴击。
            </p>
            <div className="crisis-debuff">
              <div>
                <span>获得</span>
                <strong>舍友关系加深 · 人际成长 +20</strong>
              </div>
              <p>后续人物关系系统会继续记录这段友谊；现在先记住，他打游戏真的很菜。</p>
            </div>
            <div className="event-actions">
              <button type="button" className="btn btn-primary" onClick={onContinue}>
                把行李放下，开始五年
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
