import { useState } from 'react'
import type {
  AutoPatMode,
  BondType,
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
  CLOSE_FRIEND_LIMIT,
  closeFriendCount,
  closeFriendGrowthMultiplier,
  isCloseFriend,
  isPeerFriend,
  isSeniorRelation,
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
import { BOND_DEFS, bondTypeAvailable, hasAvailableBond } from '../bonds'

interface WhoIsTAScreenProps {
  state: GameState
  onPat: (id: string) => PatResult
  onAutoPat: (mode: AutoPatMode) => PatResult
  onConfess: (id: string) => ConfessionResult
  onEstablishBond: (id: string, type: 'brother' | 'sister') => ConfessionResult
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
  onEstablishBond,
  onViewRelation,
  onMarkAllSeen,
  onBirthdayGift,
  onBirthdayBlessing,
  onMain,
  onWho,
  onTitle,
}: WhoIsTAScreenProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [relationFilter, setRelationFilter] = useState<'all' | 'elder' | 'peer' | 'senior'>('all')
  const [birthdayTarget, setBirthdayTarget] = useState<Relationship | null>(null)
  const [patEvents, setPatEvents] = useState<PatEvent[]>([])
  const [confessionResult, setConfessionResult] =
    useState<ConfessionResult | null>(null)
  const [bondPickerTarget, setBondPickerTarget] =
    useState<typeof state.relationships[number] | null>(null)
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
  const closeCount = closeFriendCount(state)
  const closeGrowthPct = Math.round(closeFriendGrowthMultiplier(state) * 100)
  const closeCapReached = closeCount >= CLOSE_FRIEND_LIMIT
  const visibleRelations = relations.filter((relation) =>
    relationFilter === 'all'
      ? true
      : relationFilter === 'elder'
        ? relation.kind === 'mentor' || relation.kind === 'counselor'
        : relationFilter === 'senior'
          ? isSeniorRelation(relation)
          : !isSeniorRelation(relation) &&
            relation.kind !== 'mentor' &&
            relation.kind !== 'counselor',
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
                ['senior', '前辈'],
              ] as Array<['all' | 'elder' | 'peer' | 'senior', string]>
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
              : relationFilter === 'senior'
                ? '同门师兄师姐与社团/学生会/辩论队前辈'
                : relationFilter === 'peer'
                  ? '舍友、朋友、同学与恋人'
                  : '长辈、同辈与前辈'}
          </small>
        </div>

        <div className={`whois-close-rule ${closeCapReached ? 'is-full' : ''}`}>
          <div>
            <span>交心朋友</span>
            <strong>{closeCount} / {CLOSE_FRIEND_LIMIT}</strong>
          </div>
          <p>
            {closeCapReached
              ? '名额已满：未达 60 的同辈亲密度最多停在 59。'
              : '交心朋友越多，其他未达 60 的同辈亲密度增长越慢。'}
          </p>
          <b>{closeCapReached ? '封顶 59' : `成长 ×${closeGrowthPct}%`}</b>
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
            <p className="placeholder-note">
              {relationFilter === 'senior'
                ? '你还没有认识前辈。加入课题组或组织后，师兄师姐会出现在这里。'
                : '你还没有认识什么人。先去过一周。'}
            </p>
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
                const peer = isPeerFriend(relation)
                const close = isCloseFriend(relation)
                const cappedHere = peer && !close && closeCapReached
                const bondOptions = BOND_DEFS.filter((def) =>
                  bondTypeAvailable(player, relation, def.type),
                )
                const bondButtonLabel =
                  relation.partner || relation.bondType
                    ? '已建立羁绊'
                    : relation.intimacy < 60
                      ? '亲密度不足'
                      : bondOptions.length === 0
                        ? '暂无可建立羁绊'
                        : '建立羁绊'
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
                        {peer && !close && (
                          <span className="whois-growth-chip">
                            成长 ×{closeGrowthPct}%
                          </span>
                        )}
                        {cappedHere && (
                          <span className="whois-cap-chip">
                            {relation.intimacy >= 59
                              ? '交心名额已满 · 停在 59'
                              : '交心名额已满 · 最多 59'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="whois-actions">
                      <button
                        type="button"
                        className="whois-action"
                        disabled={!patAvailable}
                        onClick={(event) => {
                          // The row itself marks the relation as seen. Without
                          // stopping propagation, that row handler writes a
                          // pre-pat state snapshot back and can wipe the +prep
                          // (and even an earlier week) gained by this action.
                          event.stopPropagation()
                          const result = onPat(relation.id)
                          // Preserve the row's "new relation" behavior without
                          // letting the row click overwrite the pat result.
                          onViewRelation?.(relation.id)
                          handlePatResult(result)
                        }}
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
                        disabled={
                          Boolean(relation.partner || relation.bondType) ||
                          relation.intimacy < 60 ||
                          bondOptions.length === 0
                        }
                        onClick={(event) => {
                          // Same reason as the pat button: this is an action,
                          // not a request to mark the row as seen.
                          event.stopPropagation()
                          onViewRelation?.(relation.id)
                          setBondPickerTarget(relation)
                        }}
                      >
                        {bondButtonLabel}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
        <InterfaceNav
          active="ta"
          variant="bottom"
          bondAlert={hasAvailableBond(state)}
          onMain={onMain}
          onWho={onWho}
          onTA={() => undefined}
          badges={{
            ta:
              unseenRelationCount(state) > 0
                ? '新'
                : patRemaining || undefined,
          }}
        />

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
      {bondPickerTarget && (
        <div className="bond-picker-overlay" role="dialog" aria-modal="true">
          <div
            className="bond-picker-backdrop"
            onClick={() => setBondPickerTarget(null)}
          />
          <section className="bond-picker-modal">
            <header className="bond-picker-head">
              <span className="bond-picker-kicker">BOND / 建立羁绊</span>
              <h2>你和 {bondPickerTarget.name} 之间</h2>
              <p>
                亲密度 {bondPickerTarget.intimacy} / 100。选择一种你们愿意承认的关系。
                灰色选项代表当前条件不满足。
              </p>
            </header>
            <div className="bond-picker-list">
              {BOND_DEFS.map((def) => {
                const available = bondTypeAvailable(
                  player,
                  bondPickerTarget,
                  def.type,
                )
                const reason =
                  bondPickerTarget.partner || bondPickerTarget.bondType
                    ? '已经建立了羁绊'
                    : bondPickerTarget.intimacy < 60
                      ? '亲密度不足 60'
                      : def.type === 'lover' && bondPickerTarget.confessRejected
                        ? '已经被拒绝'
                        : !available
                          ? '条件不满足'
                          : ''
                return (
                  <button
                    key={def.type}
                    type="button"
                    className={`bond-picker-option ${
                      available ? '' : 'is-disabled'
                    }`}
                    disabled={!available}
                    onClick={() => {
                      const target = bondPickerTarget
                      setBondPickerTarget(null)
                      if (def.type === 'lover') {
                        setConfessionResult(onConfess(target.id))
                      } else {
                        setConfessionResult(
                          onEstablishBond(target.id, def.type),
                        )
                      }
                    }}
                  >
                    <span className="bond-picker-icon">
                      {def.type === 'lover' ? '♡' : def.type === 'brother' ? '兄' : '闺'}
                    </span>
                    <span>
                      <strong>{def.label}</strong>
                      <small>{def.description}</small>
                      {reason && <em>{reason}</em>}
                    </span>
                  </button>
                )
              })}
            </div>
            <footer className="bond-picker-footer">
              <button
                type="button"
                className="text-btn"
                onClick={() => setBondPickerTarget(null)}
              >
                先不建立
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
              {confessionResult.bondType === 'brother'
                ? 'BOND / BROTHER'
                : confessionResult.bondType === 'sister'
                  ? 'BOND / SISTER'
                  : confessionResult.success
                    ? 'CONFESSION / ACCEPTED'
                    : 'CONFESSION / REJECTED'}
            </span>
            <h2>
              {confessionResult.success && confessionResult.bondType === 'brother'
                ? '兄弟羁绊已建立'
                : confessionResult.success && confessionResult.bondType === 'sister'
                  ? '闺蜜羁绊已建立'
                  : confessionResult.success
                    ? 'TA 答应了'
                    : confessionResult.bondType === 'lover'
                      ? 'TA 没有答应'
                      : confessionResult.name
                        ? '未能建立羁绊'
                        : '现在还不能建立羁绊'}
            </h2>
            <p>{confessionResult.text}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setConfessionResult(null)}
            >
              {confessionResult.success ? '收下这段关系' : '我明白了'}
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
