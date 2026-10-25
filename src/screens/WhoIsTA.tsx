import { useState } from 'react'
import type {
  AutoPatMode,
  BirthdayGiftResult,
  ConfessionResult,
  GameState,
  PatEvent,
  PatResult,
  Relationship,
} from '../types'
import { pickBirthdayReaction } from '../birthdayReactions'
import {
  adjustIntimacyDelta,
  canConfess,
  canPat,
  confessionChance,
  currentWeekKey,
  gameDate,
  isPatBlocked,
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
  onPat: (id: string) => PatResult
  onAutoPat: (mode: AutoPatMode) => PatResult
  onConfess: (id: string) => ConfessionResult
  onViewRelation?: (id: string) => void
  onMarkAllSeen?: () => void
  onBirthdayGift?: (id: string) => BirthdayGiftResult
  onBirthdayBlessing?: (id: string) => BirthdayGiftResult
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
  onMarkAllSeen,
  onBirthdayGift,
  onBirthdayBlessing,
  onMain,
  onWho,
  onTitle,
}: WhoIsTAScreenProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [relationFilter, setRelationFilter] = useState<'all' | 'elder' | 'peer'>('all')
  const [birthdayTarget, setBirthdayTarget] = useState<Relationship | null>(null)
  const [patEvents, setPatEvents] = useState<PatEvent[]>([])
  const [confessionResult, setConfessionResult] =
    useState<ConfessionResult | null>(null)
  const [autoPatOpen, setAutoPatOpen] = useState(false)
  const [birthdayResult, setBirthdayResult] = useState<
    (BirthdayGiftResult & { name: string; reaction: string }) | null
  >(null)
  const player = state.player
  if (!player) return null
  const handlePatResult = (result: PatResult) => {
    setMessage(result.message)
    if (result.events.length > 0) setPatEvents(result.events)
  }

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
              className="whois-read-all"
              disabled={unseenRelationCount(state) === 0}
              onClick={onMarkAllSeen}
            >
              {unseenRelationCount(state) > 0
                ? `全部标为已读 · ${unseenRelationCount(state)}`
                : '全部已读'}
            </button>
            <button
              type="button"
              className="whois-bulk-pat"
              disabled={patRemaining === 0 || !relations.some((r) => canPat(state, r))}
              onClick={() => setAutoPatOpen(true)}
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
                const birthdayContactedThisYear =
                  relation.birthdayGiftYear === currentDate.year
                const patBlocked = isPatBlocked(state, relation)
                const patAvailable = canPat(state, relation) && patRemaining > 0
                const confessAvailable =
                  !relation.confessRejected && canConfess(player, relation)
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
                                isBirthdayMonth && !birthdayContactedThisYear
                                  ? 'is-active'
                                  : ''
                              }`}
                              disabled={
                                !isBirthdayMonth || birthdayContactedThisYear
                              }
                              title={
                                birthdayContactedThisYear
                                  ? '今年生日已经联系过了'
                                  : isBirthdayMonth
                                    ? '可以送礼或送祝福'
                                    : '生日月份尚未到'
                              }
                              onClick={(event) => {
                                event.stopPropagation()
                                if (isBirthdayMonth && !birthdayContactedThisYear) {
                                  setBirthdayTarget(relation)
                                }
                              }}
                            >
                              生日 {relation.birthYear}.
                              {String(relation.birthdayMonth).padStart(2, '0')}
                              {birthdayContactedThisYear
                                ? relation.birthdayContactType === 'blessing'
                                  ? ' · 已祝福'
                                  : ' · 已送礼'
                                : isBirthdayMonth
                                  ? ' · 可互动'
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
                        onClick={() => handlePatResult(onPat(relation.id))}
                      >
                        {patBlocked
                          ? '心结未解'
                          : patAvailable
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
                          setConfessionResult(onConfess(relation.id))
                        }}
                      >
                        {relation.partner
                          ? '已经是恋人'
                          : relation.confessRejected
                            ? '已被拒绝'
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
                今天是 {birthdayTarget.name} 的生日
              </h2>
            </header>
            <p className="random-event-text">
              {birthdayTarget.name} 的生日是 {birthdayTarget.birthYear} 年{' '}
              {birthdayTarget.birthdayMonth} 月。你可以送一份礼物，也可以只送上一句祝福。
            </p>
            <div className="birthday-choice-list">
              <button
                type="button"
                className="birthday-choice"
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
                <span className="birthday-choice-title">送生日礼物</span>
                <span className="birthday-choice-desc">
                  生活费 -150 · 亲密度 +
                  {adjustIntimacyDelta(state, birthdayTarget, 15)}
                </span>
              </button>
              <button
                type="button"
                className="birthday-choice"
                onClick={() => {
                  const result = onBirthdayBlessing?.(birthdayTarget.id)
                  if (result) setMessage(result.message)
                  setBirthdayTarget(null)
                }}
              >
                <span className="birthday-choice-title">只送祝福</span>
                <span className="birthday-choice-desc">
                  不花生活费 · 亲密度 +
                  {adjustIntimacyDelta(state, birthdayTarget, 5)}
                </span>
              </button>
            </div>
            <footer className="random-event-footer">
              <p>当前生活费 ¥{state.money}</p>
              <button
                type="button"
                className="text-btn"
                onClick={() => setBirthdayTarget(null)}
              >
                先不打扰
              </button>
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
      {confessionResult && (
        <div className="confession-overlay" role="dialog" aria-modal="true">
          <div
            className="confession-backdrop"
            onClick={() => setConfessionResult(null)}
          />
          <section
            className={`confession-modal ${
              confessionResult.success ? 'is-success' : 'is-rejected'
            }`}
          >
            <span className="confession-kicker">
              {confessionResult.success ? 'CONFESSION / ACCEPTED' : 'CONFESSION / REJECTED'}
            </span>
            <h2>
              {confessionResult.success
                ? 'TA 答应了'
                : confessionResult.name
                  ? `TA 没有答应`
                  : '现在还不能表白'}
            </h2>
            <p>{confessionResult.text}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setConfessionResult(null)}
            >
              {confessionResult.success ? '收下这个答案' : '我明白了'}
              <span className="btn-arrow">→</span>
            </button>
          </section>
        </div>
      )}

      {autoPatOpen && (
        <div className="auto-pat-overlay" role="dialog" aria-modal="true">
          <div
            className="auto-pat-backdrop"
            onClick={() => setAutoPatOpen(false)}
          />
          <section className="auto-pat-modal">
            <header className="auto-pat-head">
              <span className="random-event-eyebrow">拍一拍 / AUTO PAT</span>
              <h2>这一周的三下，留给谁？</h2>
              <p>
                本周还剩 {patRemaining} 次拍一拍。你可以把这几下留给最熟悉的人，
                也可以去敲一敲那些很久没有出现在消息列表里的名字。
              </p>
            </header>
            <div className="auto-pat-options">
              <button
                type="button"
                className="auto-pat-option"
                onClick={() => {
                  setAutoPatOpen(false)
                  handlePatResult(onAutoPat('close'))
                }}
              >
                <span className="auto-pat-icon">◎</span>
                <strong>拍最亲密的人</strong>
                <small>
                  按亲密度从高到低，拍一拍身边最亲近的{' '}
                  {Math.min(patRemaining, relations.filter((r) => canPat(state, r)).length)} 位。
                </small>
              </button>
              <button
                type="button"
                className="auto-pat-option"
                onClick={() => {
                  setAutoPatOpen(false)
                  handlePatResult(onAutoPat('longtime'))
                }}
              >
                <span className="auto-pat-icon">↺</span>
                <strong>去问候许久未见的人</strong>
                <small>
                  按上次拍一拍的时间从久到近，拍一拍最久没有联系的{' '}
                  {Math.min(patRemaining, relations.filter((r) => canPat(state, r)).length)} 位朋友。
                </small>
              </button>
            </div>
            <footer className="auto-pat-footer">
              <button
                type="button"
                className="text-btn"
                onClick={() => setAutoPatOpen(false)}
              >
                先不拍
              </button>
            </footer>
          </section>
        </div>
      )}

      {patEvents.length > 0 && (
        <div className="random-event-overlay" role="dialog" aria-modal="true">
          <div className="random-event-backdrop" />
          <section className="random-event-modal pat-event-modal">
            <header className="random-event-head">
              <div className="random-event-kind-row">
                <Pill tone="gold">拍一拍</Pill>
                <span className="random-event-hint">
                  {patEvents.length > 1 ? '这次一拍，发生了好几件事' : '这次一拍，有回应'}
                </span>
              </div>
              <h2 className="random-event-title">
                {patEvents.length > 1 ? '不止一下' : '拍出了动静'}
              </h2>
            </header>
            <div className="pat-event-list">
              {patEvents.map((item) => (
                <article key={item.id} className="pat-event-item">
                  <div className="pat-event-top">
                    <span>{item.name}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <p>{item.text}</p>
                  <div className="pat-event-lines">
                    {item.lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <footer className="random-event-footer">
              <p>拍一拍不一定有大事，但这次确实有。</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPatEvents([])}
              >
                收下这些动静
                <span className="btn-arrow">→</span>
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
