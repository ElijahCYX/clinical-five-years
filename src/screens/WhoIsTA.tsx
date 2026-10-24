import { useState } from 'react'
import type { GameState, Relationship } from '../types'
import {
  canConfess,
  canPat,
  confessionChance,
  currentWeekKey,
  patRemainingThisWeek,
  relationshipKindLabel,
} from '../social'
import { Bar, Eyebrow, InterfaceNav, Pill, SectionLabel, TopBar } from '../ui'

interface WhoIsTAScreenProps {
  state: GameState
  onPat: (id: string) => void
  onConfess: (id: string) => string
  onMain: () => void
  onWho: () => void
  onTitle?: () => void
}

function statsText(relation: Relationship): string[] {
  if (!relation.statsKnown || !relation.knownStats) return []
  const stats = relation.knownStats
  return [
    `GPA ${stats.gpa.toFixed(2)}`,
    `记忆 ${stats.attrs.memory}`,
    `悟性 ${stats.attrs.comprehension}`,
    `操作 ${stats.attrs.dexterity}`,
    `交际 ${stats.attrs.social}`,
    `建模 ${stats.attrs.appearance}`,
    `精力 ${stats.attrs.energy}`,
    `体质 ${stats.attrs.constitution}`,
    `抗压 ${stats.attrs.resilience}`,
  ]
}

export function WhoIsTAScreen({
  state,
  onPat,
  onConfess,
  onMain,
  onWho,
  onTitle,
}: WhoIsTAScreenProps) {
  const [message, setMessage] = useState<string | null>(null)
  const player = state.player
  if (!player) return null
  const weekKey = currentWeekKey(state)
  const relations = state.relationships
  const patRemaining = patRemainingThisWeek(state)
  const partnerCount = relations.filter((relation) => relation.partner).length

  return (
    <div className="screen whois-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />
        <InterfaceNav
          active="ta"
          onMain={onMain}
          onWho={onWho}
          onTA={() => undefined}
        />

        <header className="whois-head">
          <div>
            <Eyebrow>WHO IS TA / RELATIONSHIP LEDGER</Eyebrow>
            <h1 className="page-title">TA 是谁</h1>
            <p className="page-lede">
              你认识的人都在这里。亲密度越高，越可能看到 TA 不愿示人的一面；
              到 100 时，所有面板都会完全解锁。
            </p>
          </div>
          <div className="whois-summary">
            <Pill tone="green">{relations.length} 段关系</Pill>
            <Pill>本周拍一拍剩余 {patRemaining} / 3 次</Pill>
            {state.romanceUnlocked && <Pill tone="gold">恋爱模块已解锁</Pill>}
            {partnerCount > 1 && (
              <Pill tone="red">多线恋爱 · 下周风险 {state.romanceRisk}%</Pill>
            )}
          </div>
        </header>

        {message && (
          <div className="whois-message" role="status">
            {message}
            <button className="text-btn" type="button" onClick={() => setMessage(null)}>
              知道了
            </button>
          </div>
        )}

        <section className="paper-card whois-card">
          <SectionLabel right={`本周 ${weekKey}`}>关系列表</SectionLabel>
          {relations.length === 0 ? (
            <p className="placeholder-note">你还没有认识什么人。先去过一周。</p>
          ) : (
            <div className="whois-list">
              {relations.map((relation) => {
                const stats = statsText(relation)
                const patAvailable = canPat(state, relation) && patRemaining > 0
                const confessAvailable = canConfess(player, relation)
                const chance = Math.round(confessionChance(player, relation) * 100)
                return (
                  <article className="whois-row" key={relation.id}>
                    <div className="whois-avatar">
                      {relation.name.slice(0, 1)}
                    </div>
                    <div className="whois-main">
                      <div className="whois-name-row">
                        <h3>{relation.name}</h3>
                        <span>{relation.identity}</span>
                        {relationshipKindLabel(relation.kind) !== relation.identity && (
                          <span className="whois-kind">
                            {relationshipKindLabel(relation.kind)}
                          </span>
                        )}
                        {relation.partner && <span className="whois-partner">恋人</span>}
                      </div>
                      <div className="whois-intimacy">
                        <Bar value={relation.intimacy} thin />
                        <span>{relation.intimacy} / 100</span>
                      </div>
                      <div className="whois-stats">
                        {stats.length > 0 ? (
                          stats.map((line) => <span key={line}>{line}</span>)
                        ) : (
                          <span className="whois-hidden">
                            面板未解锁 · 亲密度 100 或随机事件后可见
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="whois-actions">
                      <button
                        type="button"
                        className="whois-action"
                        disabled={!patAvailable}
                        onClick={() => onPat(relation.id)}
                      >
                        {patAvailable
                        ? '拍一拍'
                        : relation.lastPatKey === weekKey
                          ? '本周已拍'
                          : '本周已拍满'}
                      </button>
                      <button
                        type="button"
                        className="whois-action whois-confess"
                        disabled={!confessAvailable}
                        onClick={() => {
                          const result = onConfess(relation.id)
                          setMessage(result)
                        }}
                      >
                        {relation.partner
                          ? '已经是恋人'
                          : confessAvailable
                            ? `表白 · ${chance}%`
                            : '还不能表白'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
