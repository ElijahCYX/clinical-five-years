import { useState } from 'react'
import type { BirthdayGiftResult, GameState, Relationship } from '../types'
import { pickBirthdayReaction } from '../birthdayReactions'
import {
  adjustIntimacyDelta,
  canConfess,
  canPat,
  confessionChance,
  currentWeekKey,
  gameDate,
  patLimit,
  orientationLabel,
  patRemainingThisWeek,
  relationshipKindLabel,
  unseenRelationCount,
} from '../social'
import { Bar, Eyebrow, InterfaceNav, Pill, SectionLabel, TopBar } from '../ui'
import { romanceRiskAfterWeek } from '../events'

interface WhoIsTAScreenProps {
  state: GameState
  onPat: (id: string) => string
  onAutoPat: () => string
  onConfess: (id: string) => string
  onViewRelation?: (id: string) => void
  onBirthdayGift?: (id: string) => BirthdayGiftResult
  onMain: () => void
  onWho: () => void
  onTitle?: () => void
}

interface StatChip {
  key: string
  label: string
  value: number
}

function statChips(relation: Relationship): StatChip[] {
  if (!relation.statsKnown || !relation.knownStats) {
    return [
      {
        key: 'appearance',
        label: '建模',
        value: relation.stats.attrs.appearance,
      },
      { key: 'social', label: '交际', value: relation.stats.attrs.social },
    ]
  }
  const attrs = relation.knownStats.attrs
  return [
    { key: 'memory', label: '记忆', value: attrs.memory },
    { key: 'comprehension', label: '悟性', value: attrs.comprehension },
    { key: 'dexterity', label: '操作', value: attrs.dexterity },
    { key: 'social', label: '交际', value: attrs.social },
    { key: 'appearance', label: '建模', value: attrs.appearance },
    { key: 'energy', label: '精力', value: attrs.energy },
    { key: 'constitution', label: '体质', value: attrs.constitution },
    { key: 'resilience', label: '抗压', value: attrs.resilience },
  ]
}

export function WhoIsTAScreen({
  state,
  onPat,
  onAutoPat,
  onConfess,
  onViewRelation,
  onBirthdayGift,
  onMain,
  onWho,
  onTitle,
}: WhoIsTAScreenProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [relationFilter, setRelationFilter] = useState<'all' | 'elder' | 'peer'>('all')
  const [birthdayTarget, setBirthdayTarget] = useState<Relationship | null>(null)
  const [birthdayResult, setBirthdayResult] = useState<
    (BirthdayGiftResult & { name: string; reaction: string }) | null
  >(null)
  const player = state.player
  if (!player) return null
  const weekKey = currentWeekKey(state)
  const relations = state.relationships
  const visibleRelations = relations.filter((relation) =>
    relationFilter === 'all'
      ? true
      : relationFilter === 'elder'
        ? relation.kind === 'mentor' || relation.kind === 'counselor'
        : relation.kind !== 'mentor' && relation.kind !== 'counselor',
  )
  const patRemaining = patRemainingThisWeek(state)
  const partnerCount = relations.filter((relation) => relation.partner).length
  const staffPartner = relations.some(
    (relation) =>
      relation.partner &&
      (relation.kind === 'mentor' || relation.kind === 'counselor'),
  )

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
          badges={{
            main: state.selected.length < 2 ? 2 - state.selected.length : undefined,
            ta:
              unseenRelationCount(state) > 0
                ? '新'
                : patRemaining || undefined,
          }}
        />

        <header className="whois-head">
          <div>
            <Eyebrow>WHO IS TA / RELATIONSHIP LEDGER</Eyebrow>
            <h1 className="page-title">TA 是谁</h1>
            <p className="page-lede">
              你认识的人都在这里。建模与交际永久可见；亲密度越高，越可能看到 TA 不愿示人的一面。
              双方交际之和 ≥16 时亲密度变化 +30%，≥13 时 +15%。
            </p>
          </div>
          <div className="whois-summary">
            <Pill tone="green">{relations.length} 段关系</Pill>
            <button
              type="button"
              className="whois-bulk-pat"
              disabled={patRemaining === 0 || !relations.some((r) => canPat(state, r))}
              onClick={() => setMessage(onAutoPat())}
            >
              <span>本周拍一拍剩余 {patRemaining} / {patLimit(state)} 次</span>
              <small>
                {patRemaining === 0
                  ? '本周次数已用完'
                  : '点击自动拍亲密度最高的前三位'}
              </small>
            </button>
            {state.romanceUnlocked && <Pill tone="gold">恋爱模块已解锁</Pill>}
            {partnerCount > 1 && (
              <Pill tone="red">
                多线恋爱 · 下周风险 {romanceRiskAfterWeek(state)}%
              </Pill>
            )}
            {staffPartner && (
              <Pill tone="red">师生关系风险 {state.teacherScandalRisk}%</Pill>
            )}
          </div>
        </header>

        <div className="whois-filter-row">
          <span>显示关系</span>
          <div className="whois-filter">
            {(
              [
                ['all', '全部'],
                ['elder', '长辈'],
                ['peer', '同辈'],
              ] as Array<['all' | 'elder' | 'peer', string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={relationFilter === key ? 'is-active' : ''}
                onClick={() => setRelationFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <small>
            {relationFilter === 'elder'
              ? '导师与辅导员'
              : relationFilter === 'peer'
                ? '舍友、朋友、同学与恋人'
                : '长辈与同辈'}
          </small>
        </div>

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
          {visibleRelations.length === 0 ? (
            <p className="placeholder-note">你还没有认识什么人。先去过一周。</p>
          ) : (
            <div className="whois-list">
              {visibleRelations.map((relation) => {
                const stats = statChips(relation)
                const currentDate = gameDate(state)
                const isBirthdayMonth =
                  relation.birthdayMonth === currentDate.month
                const birthdayGiftedThisYear =
                  relation.birthdayGiftYear === currentDate.year
                const patAvailable = canPat(state, relation) && patRemaining > 0
                const confessAvailable = canConfess(player, relation)
                const chance = Math.round(confessionChance(player, relation) * 100)
                return (
                  <article
                    className={`whois-row ${
                      !state.seenRelationIds.includes(relation.id)
                        ? 'is-new-relation'
                        : ''
                    }`}
                    key={relation.id}
                    onClick={() => onViewRelation?.(relation.id)}
                  >
                    {!state.seenRelationIds.includes(relation.id) && (
                      <span className="whois-new-pulse" aria-hidden="true">
                        NEW
                      </span>
                    )}
                    <div className="whois-avatar">
                      {relation.name.slice(0, 1)}
                    </div>
                    <div className="whois-main">
                      <div className="whois-name-row">
                        <span
                          className="whois-name-plate"
                          style={{
                            backgroundColor: `rgba(32, 59, 50, ${(
                              0.035 +
                              (relation.intimacy / 100) * 0.09
                            ).toFixed(3)})`,
                          }}
                        >
                          <h3>{relation.name}</h3>
                          <span
                            className={`whois-gender ${relation.gender === '男' ? 'is-male' : 'is-female'}`}
                            title={relation.gender === '男' ? '男性' : '女性'}
                            aria-label={relation.gender === '男' ? '男性' : '女性'}
                          >
                            {relation.gender === '男' ? '♂' : '♀'}
                          </span>
                          {relation.intimacy >= 80 && (
                            <span
                              className="whois-orientation"
                              title={`性取向：${orientationLabel(relation.orientation)}`}
                            >
                              {orientationLabel(relation.orientation)}
                            </span>
                          )}
                          {relation.intimacy >= 40 && (
                            <button
                              type="button"
                              className={`whois-birthday ${
                                isBirthdayMonth && !birthdayGiftedThisYear
                                  ? 'is-active'
                                  : ''
                              }`}
                              disabled={
                                !isBirthdayMonth || birthdayGiftedThisYear
                              }
                              title={
                                birthdayGiftedThisYear
                                  ? '本年生日礼物已送过'
                                  : isBirthdayMonth
                                    ? '可以赠送生日礼物'
                                    : '生日月份尚未到'
                              }
                              onClick={(event) => {
                                event.stopPropagation()
                                if (isBirthdayMonth && !birthdayGiftedThisYear) {
                                  setBirthdayTarget(relation)
                                }
                              }}
                            >
                              生日 {relation.birthYear}.
                              {String(relation.birthdayMonth).padStart(2, '0')}
                              {birthdayGiftedThisYear
                                ? ' · 已送'
                                : isBirthdayMonth
                                  ? ' · 可送礼'
                                  : ''}
                            </button>
                          )}
                        </span>
                        <span>{relation.identity}</span>
                        {relationshipKindLabel(relation.kind) !== relation.identity && (
                          <span className="whois-kind">
                            {relationshipKindLabel(relation.kind)}
                          </span>
                        )}
                        {relation.partner && <span className="whois-partner">恋人</span>}
                        {relation.ex && !relation.partner && (
                          <span className="whois-ex">前任</span>
                        )}
                      </div>
                      <div className="whois-intimacy">
                        <Bar value={relation.intimacy} thin />
                        <span>{relation.intimacy} / 100</span>
                      </div>
                      <div className="whois-stats">
                        {relation.statsKnown && relation.knownStats && (
                          <span className="whois-stat-extra">
                            GPA {relation.knownStats.gpa.toFixed(2)}
                          </span>
                        )}
                        {stats.map((stat) => (
                          <span
                            key={stat.key}
                            className={`whois-stat-chip ${
                              stat.value >= 9
                                ? 'is-critical'
                                : stat.value >= 7
                                  ? 'is-high'
                                  : ''
                            }`}
                          >
                            {stat.label} {stat.value}
                          </span>
                        ))}
                        {!relation.statsKnown && (
                          <span className="whois-hidden">
                            其余面板未解锁 · 亲密度 100 或随机事件后可见
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="whois-actions">
                      <button
                        type="button"
                        className="whois-action"
                        disabled={!patAvailable}
                        onClick={() => setMessage(onPat(relation.id))}
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
      {birthdayTarget && (
        <div className="random-event-overlay" role="dialog" aria-modal="true">
          <div className="random-event-backdrop" />
          <section className="random-event-modal birthday-gift-modal">
            <header className="random-event-head">
              <div className="random-event-kind-row">
                <Pill tone="gold">生日礼物</Pill>
              </div>
              <h2 className="random-event-title">
                要给 {birthdayTarget.name} 送生日礼物吗？
              </h2>
            </header>
            <p className="random-event-text">
              {birthdayTarget.name} 的生日是 {birthdayTarget.birthYear} 年{' '}
              {birthdayTarget.birthdayMonth} 月。一份不算便宜但用心的礼物，
              也许会让你们更靠近一点。
            </p>
            <div className="random-event-effects">
              <span className="random-event-effects-label">本次花费</span>
              <div>
                <span className="random-event-effect">生活费 -150</span>
                <span className="random-event-effect">
                  亲密度 +{adjustIntimacyDelta(state, birthdayTarget, 15)}
                </span>
              </div>
            </div>
            <footer className="random-event-footer">
              <p>当前生活费 ¥{state.money}</p>
              <div className="consumption-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setBirthdayTarget(null)}
                >
                  不送了
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={state.money < 150}
                  onClick={() => {
                    const result = onBirthdayGift?.(birthdayTarget.id)
                    if (result && result.gain > 0) {
                      setBirthdayResult({
                        ...result,
                        name: birthdayTarget.name,
                        reaction: pickBirthdayReaction(),
                      })
                    } else if (result) {
                      setMessage(result.message)
                    }
                    setBirthdayTarget(null)
                  }}
                >
                  送去祝福
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
      {birthdayResult && (
        <div className="random-event-overlay" role="dialog" aria-modal="true">
          <div className="random-event-backdrop" />
          <section className="random-event-modal birthday-response-modal">
            <header className="random-event-head">
              <div className="random-event-kind-row">
                <Pill tone="green">生日礼物</Pill>
                <span className="random-event-hint">TA 的回礼反应</span>
              </div>
              <h2 className="random-event-title">
                礼物送出了
              </h2>
            </header>
            <p className="random-event-text">
              {birthdayResult.reaction.replaceAll('{name}', birthdayResult.name)}
            </p>
            <div className="birthday-intimacy-animation">
              <span className="gift-heart" aria-hidden="true">♥</span>
              <div>
                <span>与{birthdayResult.name}的亲密度</span>
                <strong className="gift-intimacy-gain">
                  +{birthdayResult.gain}
                </strong>
                <small>
                  {birthdayResult.before} → {birthdayResult.after} / 100
                </small>
              </div>
            </div>
            <footer className="random-event-footer">
              <p>生日一年只有一次，但你们的关系又往前走了一点。</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setBirthdayResult(null)}
              >
                收下这份回忆
                <span className="btn-arrow">→</span>
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
