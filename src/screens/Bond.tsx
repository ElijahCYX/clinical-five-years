import { useState } from 'react'
import type { GameState, LoverContactResult, Relationship } from '../types'
import { currentWeekKey } from '../social'
import { Bar, Pill, SectionLabel } from '../ui'

interface BondScreenProps {
  state: GameState
  onContact: (relationshipId: string) => LoverContactResult
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

export function BondScreen({ state, onContact }: BondScreenProps) {
  const [contactResult, setContactResult] = useState<LoverContactResult | null>(
    null,
  )
  const partners = state.relationships.filter((relation) => relation.partner)

  return (
    <div className="tab-panel bond-panel">
      <SectionLabel right={`${partners.length} 段羁绊`}>羁绊</SectionLabel>

      {partners.length === 0 ? (
        <div className="bond-empty">
          <span className="bond-empty-mark">◇</span>
          <h3>还没有恋人羁绊</h3>
          <p>
            在「TA 是谁」里向足够熟悉的人表白。无论答案是什么，都会留在这段校园记忆里。
          </p>
        </div>
      ) : (
        <div className="bond-list">
          {partners.map((relation) => {
            const contactedThisWeek =
              relation.lastContactKey === currentWeekKey(state)
            return (
              <article className="bond-card" key={relation.id}>
                <div className="bond-card-head">
                  <div>
                    <span className="bond-kicker">LOVER / 恋人</span>
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
                  <Pill tone="gold">恋人</Pill>
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
                </div>

                <div className="bond-actions">
                  <p>
                    电话是否接听，取决于你们的亲密度、你的建模与交际。
                    每周可以联系一次。
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={contactedThisWeek}
                    onClick={() => setContactResult(onContact(relation.id))}
                  >
                    {contactedThisWeek ? '本周已联系' : '联系 TA'}
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </article>
            )
          })}
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
