import { useState } from 'react'
import type {
  BondActionResult,
  BondType,
  GameState,
  LoverContactResult,
  Relationship,
} from '../types'
import { currentWeekKey, progressWeek } from '../social'
import { bondLabel } from '../bonds'
import { BOND_BREAK_CONFIRM } from '../bondTexts'
import { Bar, Pill, SectionLabel } from '../ui'

interface BondScreenProps {
  state: GameState
  onContact: (relationshipId: string) => LoverContactResult
  onBreakBond: (relationshipId: string) => BondActionResult
  onReconcileBond: (relationshipId: string) => BondActionResult
}

interface BreakTarget {
  relation: Relationship
  type: BondType
}

function anniversaryLabel(relation: Relationship): string {
  if (relation.partnerSinceLabel) {
    return `${relation.partnerSinceLabel} · 第 ${relation.partnerSinceWeek ?? 1} 周`
  }
  return '纪念日还没有记录'
}

function durationLabel(state: GameState, relation: Relationship): string {
  if (
    typeof relation.partnerSinceSeasonIndex !== 'number' ||
    typeof relation.partnerSinceWeek !== 'number'
  ) {
    return '刚开始'
  }
  const since = relation.partnerSinceSeasonIndex * 4 + relation.partnerSinceWeek
  const now = state.seasonIndex * 4 + state.week
  const weeks = Math.max(1, now - since + 1)
  if (weeks < 5) return `${weeks} 周`
  const months = Math.floor(weeks / 4)
  return `${months} 个月左右`
}

function knownDurationLabel(
  state: GameState,
  relation: Relationship,
): string {
  const now = progressWeek(state)
  const since = relation.metAbsWeek ?? 1
  const weeks = Math.max(1, now - since + 1)
  if (weeks < 5) return `${weeks} 周`
  const months = Math.floor(weeks / 4)
  return `${months} 个月左右`
}

function activeBondType(relation: Relationship): BondType | undefined {
  return relation.bondType ?? (relation.partner ? 'lover' : undefined)
}

function breakButtonLabel(type: BondType): string {
  if (type === 'brother') return '阋墙'
  if (type === 'sister') return '反目'
  return '缘尽'
}

function reconcileChance(
  state: GameState,
  relation: Relationship,
): { chance: number; calmWeek: number } {
  const now = progressWeek(state)
  const calmWeek = Math.max(
    1,
    Math.min(3, now - (relation.bondBreakWeek ?? now) + 1),
  )
  const penalty = [20, 40, 60][calmWeek - 1] ?? 60
  const attrs = state.player ? Object.values(state.player.attrs) : []
  const average =
    attrs.length > 0
      ? attrs.reduce((sum, value) => sum + value, 0) / attrs.length
      : 0
  const chance = Math.max(
    0,
    Math.min(100, Math.round(relation.intimacy * 0.7 + average * 4 - penalty)),
  )
  return { chance, calmWeek }
}

export function BondScreen({
  state,
  onContact,
  onBreakBond,
  onReconcileBond,
}: BondScreenProps) {
  const [contactResult, setContactResult] = useState<LoverContactResult | null>(
    null,
  )
  const [breakTarget, setBreakTarget] = useState<BreakTarget | null>(null)
  const [bondResult, setBondResult] = useState<BondActionResult | null>(null)
  const [bondResultKind, setBondResultKind] = useState<
    'break' | 'success' | 'fail'
  >('break')
  const now = progressWeek(state)

  const allBonds = state.relationships.filter(
    (relation) => relation.partner || relation.bondType || relation.brokenBondType,
  )
  const activeBonds = allBonds
    .filter((relation) => activeBondType(relation))
    .sort((a, b) => {
      const typeA = activeBondType(a) ?? 'sister'
      const typeB = activeBondType(b) ?? 'sister'
      const order: Record<BondType, number> = {
        lover: 0,
        brother: 1,
        sister: 2,
      }
      return order[typeA] - order[typeB] || a.name.localeCompare(b.name)
    })
  const brokenBonds = allBonds
    .filter(
      (relation) =>
        relation.brokenBondType &&
        typeof relation.bondCalmUntilWeek === 'number' &&
        now <= relation.bondCalmUntilWeek,
    )
    .sort((a, b) => a.name.localeCompare(b.name))
  const allCount = activeBonds.length + brokenBonds.length

  const finishBreak = () => {
    if (!breakTarget) return
    const result = onBreakBond(breakTarget.relation.id)
    setBondResultKind('break')
    setBondResult(result)
    setBreakTarget(null)
  }

  const tryReconcile = (relation: Relationship) => {
    const result = onReconcileBond(relation.id)
    setBondResultKind(result.success ? 'success' : 'fail')
    setBondResult(result)
  }

  return (
    <div className="tab-panel bond-panel">
      <SectionLabel right={`${allCount} 段羁绊`}>羁绊</SectionLabel>

      {allCount === 0 ? (
        <div className="bond-empty">
          <span className="bond-empty-mark">◇</span>
          <h3>还没有恋人羁绊</h3>
          <p>
            在「TA 是谁」里与足够熟悉的人建立羁绊。恋人、兄弟或闺蜜，都会留在这段校园记忆里。
          </p>
        </div>
      ) : (
        <div className="bond-list">
          {activeBonds.map((relation) => {
            const type = activeBondType(relation)
            if (!type) return null
            const isLover = type === 'lover'
            const contactedThisWeek =
              relation.lastContactKey === currentWeekKey(state)
            return (
              <article className="bond-card" key={relation.id}>
                <div className="bond-card-head">
                  <div>
                    <span className="bond-kicker">
                      {bondLabel(type)} / BOND
                    </span>
                    <h3>
                      {relation.name}
                      <span
                        className={`inline-gender ${relation.gender === '男' ? 'is-male' : 'is-female'}`}
                      >
                        {relation.gender === '男' ? '♂' : '♀'}
                      </span>
                    </h3>
                    <p>{relation.identity}</p>
                  </div>
                  <Pill tone="gold">{bondLabel(type)}</Pill>
                </div>

                <div className="bond-intimacy">
                  <div className="bond-intimacy-line">
                    <span>亲密度</span>
                    <strong>{relation.intimacy} / 100</strong>
                  </div>
                  <Bar value={relation.intimacy} />
                </div>

                <div className="bond-meta">
                  <div>
                    <span>纪念日</span>
                    <strong>{anniversaryLabel(relation)}</strong>
                  </div>
                  <div>
                    <span>在一起</span>
                    <strong>{durationLabel(state, relation)}</strong>
                  </div>
                  <div>
                    <span>相识</span>
                    <strong>{knownDurationLabel(state, relation)}</strong>
                  </div>
                </div>

                <div className="bond-actions">
                  {isLover ? (
                    <p>
                      电话是否接听，取决于你们的亲密度、你的建模与交际。
                      每周可以联系一次。
                    </p>
                  ) : (
                    <p className="bond-non-lover-note">
                      你们已经建立了{bondLabel(type)}羁绊。这份关系不需要每周联系来证明。
                    </p>
                  )}
                  <div className="bond-action-buttons">
                    {isLover && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={contactedThisWeek}
                        onClick={() => setContactResult(onContact(relation.id))}
                      >
                        {contactedThisWeek ? '本周已联系' : '联系 TA'}
                        <span className="btn-arrow">→</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="bond-break-btn"
                      onClick={() => setBreakTarget({ relation, type })}
                    >
                      {breakButtonLabel(type)}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}

          {brokenBonds.map((relation) => {
            const type = relation.brokenBondType as BondType
            const { chance, calmWeek } = reconcileChance(state, relation)
            const attemptsLeft = !relation.bondReconcileAttempted
            const remaining =
              typeof relation.bondCalmUntilWeek === 'number'
                ? Math.max(1, relation.bondCalmUntilWeek - now + 1)
                : 0
            return (
              <article
                className="bond-card bond-card-broken"
                key={`broken-${relation.id}`}
              >
                <div className="bond-card-head">
                  <div>
                    <span className="bond-kicker">
                      FORMER {bondLabel(type).toUpperCase()} / 冷静期
                    </span>
                    <h3>
                      {relation.name}
                      <span
                        className={`inline-gender ${relation.gender === '男' ? 'is-male' : 'is-female'}`}
                      >
                        {relation.gender === '男' ? '♂' : '♀'}
                      </span>
                    </h3>
                    <p>前{bondLabel(type)} · 冷静期第 {calmWeek} 周</p>
                  </div>
                  <Pill tone="red">冷静期</Pill>
                </div>
                <div className="bond-intimacy">
                  <div className="bond-intimacy-line">
                    <span>亲密度（冻结）</span>
                    <strong>{relation.intimacy} / 100</strong>
                  </div>
                  <Bar value={relation.intimacy} />
                </div>
                <div className="bond-meta">
                  <div>
                    <span>冷静期</span>
                    <strong>还剩 {remaining} 周</strong>
                  </div>
                  <div>
                    <span>复合概率</span>
                    <strong>{chance}%</strong>
                  </div>
                </div>
                <div className="bond-actions">
                  <p className="bond-non-lover-note">
                    冷静期内亲密度冻结。冷静期结束仍未复合，这段羁绊会正式结束。
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!attemptsLeft}
                    onClick={() => tryReconcile(relation)}
                  >
                    {attemptsLeft ? `复合 · ${chance}%` : '复合失败'}
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {breakTarget && (
        <div className="bond-break-confirm-overlay" role="dialog" aria-modal="true">
          <div
            className="bond-break-confirm-backdrop"
            onClick={() => setBreakTarget(null)}
          />
          <section className="bond-break-confirm-modal">
            <span className="bond-kicker">
              {breakButtonLabel(breakTarget.type)} / 提出解除
            </span>
            <h2>要和 {breakTarget.relation.name} 解除羁绊吗？</h2>
            <p>{BOND_BREAK_CONFIRM[breakTarget.type]}</p>
            <div className="bond-break-confirm-actions">
              <button
                type="button"
                className="text-btn"
                onClick={() => setBreakTarget(null)}
              >
                再想想
              </button>
              <button
                type="button"
                className="bond-break-confirm-btn"
                onClick={finishBreak}
              >
                确认解除
              </button>
            </div>
          </section>
        </div>
      )}

      {bondResult && (
        <div className="bond-result-overlay" role="dialog" aria-modal="true">
          <div
            className="bond-result-backdrop"
            onClick={() => setBondResult(null)}
          />
          <section
            className={`bond-result-modal ${
              bondResultKind === 'success'
                ? 'is-success'
                : bondResultKind === 'fail'
                  ? 'is-fail'
                  : 'is-break'
            }`}
          >
            <span className="bond-kicker">
              {bondResultKind === 'break'
                ? 'BOND ENDED / 已解除'
                : bondResultKind === 'success'
                  ? 'BOND RESTORED / 复合成功'
                  : 'BOND FAILED / 复合失败'}
            </span>
            <h2>
              {bondResultKind === 'break'
                ? '羁绊已解除'
                : bondResultKind === 'success'
                  ? `你和${bondResult.name}复合了`
                  : '这次没能复合'}
            </h2>
            {bondResultKind !== 'break' && typeof bondResult.chance === 'number' && (
              <p className="bond-result-chance">
                本次复合概率：{bondResult.chance}%
              </p>
            )}
            <p className="bond-result-text">{bondResult.text}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setBondResult(null)}
            >
              我知道了
              <span className="btn-arrow">→</span>
            </button>
          </section>
        </div>
      )}

      {contactResult && (
        <div className="lover-contact-overlay" role="dialog" aria-modal="true">
          <div
            className="lover-contact-backdrop"
            onClick={() => setContactResult(null)}
          />
          <section
            className={`lover-contact-modal ${
              contactResult.answered ? 'is-answered' : 'is-missed'
            }`}
          >
            <span className="bond-kicker">
              {contactResult.answered ? 'CALL CONNECTED / 已接通' : 'CALL MISSED / 未接听'}
            </span>
            <h2>{contactResult.title}</h2>
            <p className="lover-contact-text">{contactResult.text}</p>
            {contactResult.lines.length > 0 && (
              <div className="lover-contact-lines">
                {contactResult.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setContactResult(null)}
            >
              挂断电话
              <span className="btn-arrow">→</span>
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
