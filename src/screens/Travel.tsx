import { useEffect, useMemo, useState } from 'react'
import type { Relationship } from '../types'
import {
  isDinnerFriend,
  randomRefusalReason,
  relationshipKindLabel,
  travelCost,
  travelJoinChance,
} from '../social'
import { Pill } from '../ui'

interface TravelModalProps {
  relationships: Relationship[]
  money: number
  onConfirm: (acceptedIds: string[], declinedIds: string[], cost: number) => void
  onCancel: () => void
}

interface TravelResult {
  id: string
  accepted: boolean
  reason?: string
}

export function TravelModal({
  relationships,
  money,
  onConfirm,
  onCancel,
}: TravelModalProps) {
  const friends = useMemo(
    () => relationships.filter(isDinnerFriend),
    [relationships],
  )
  const [selected, setSelected] = useState<string[]>([])
  const [results, setResults] = useState<TravelResult[] | null>(null)

  useEffect(() => {
    document.body.classList.add('dinner-open')
    return () => document.body.classList.remove('dinner-open')
  }, [])

  const accepted = results?.filter((item) => item.accepted) ?? []
  const declined = results?.filter((item) => !item.accepted) ?? []
  const cost = results ? travelCost(accepted.length) : 500
  const costLabel =
    accepted.length === 0
      ? '单人 ¥500'
      : accepted.length === 1
        ? '双人 ¥300'
        : `${accepted.length + 1} 人 ¥250`

  const toggle = (id: string) => {
    if (results) return
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const invite = () => {
    const next = selected.map((id) => {
      const relation = relationships.find((item) => item.id === id)
      if (!relation) return { id, accepted: false, reason: '你们好像不太熟。' }
      return {
        id,
        accepted: Math.random() < travelJoinChance(relation),
        reason: undefined,
      }
    }).map((item) =>
      item.accepted
        ? item
        : { ...item, reason: item.reason ?? randomRefusalReason() },
    )
    setResults(next)
  }

  return (
    <div className="dinner-overlay" role="dialog" aria-modal="true">
      <div className="dinner-backdrop" onClick={onCancel} />
      <section className="dinner-modal">
        <header className="dinner-head">
          <div>
            <span className="dinner-eyebrow">TRAVEL COMPANION / 假期旅行</span>
            <h2>这次旅行，和谁一起？</h2>
            <p>
              可以邀请一位或多位朋友。赴约概率由亲密度决定；
              单人 ¥500，双人 ¥300，三人及以上固定 ¥250。
            </p>
          </div>
          <Pill tone="gold">生活费 ¥{money}</Pill>
        </header>

        {friends.length === 0 ? (
          <p className="dinner-empty">
            还没有可以一起旅行的朋友。可以独自出发，也可以先去认识一些人。
          </p>
        ) : (
          <div className="dinner-list">
            {friends.map((relation) => {
              const checked = selected.includes(relation.id)
              const result = results?.find((item) => item.id === relation.id)
              return (
                <button
                  key={relation.id}
                  type="button"
                  className={`dinner-person ${checked ? 'is-selected' : ''} ${
                    result ? (result.accepted ? 'is-accepted' : 'is-declined') : ''
                  }`}
                  onClick={() => toggle(relation.id)}
                  disabled={Boolean(results) || Boolean(result)}
                >
                  <span className="dinner-person-name">
                    {relation.name}
                    <span
                      className={`inline-gender ${relation.gender === '男' ? 'is-male' : 'is-female'}`}
                      title={relation.gender === '男' ? '男性' : '女性'}
                      aria-label={relation.gender === '男' ? '男性' : '女性'}
                    >
                      {relation.gender === '男' ? '♂' : '♀'}
                    </span>
                    <small>
                      {relationshipKindLabel(relation.kind)} · 亲密度 {relation.intimacy}
                    </small>
                  </span>
                  <span className="dinner-person-status">
                    {result
                      ? result.accepted
                        ? '答应了'
                        : '婉拒了'
                      : checked
                        ? '已选'
                        : '邀请'}
                  </span>
                  {result && !result.accepted && (
                    <span className="dinner-reason">“{result.reason}”</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <footer className="dinner-footer">
          <div>
            <span>预计花费</span>
            <strong>{results ? `¥${travelCost(accepted.length)}` : '¥500 起'}</strong>
            <small>
              {results
                ? `${costLabel} · 实际同行 ${accepted.length + 1} 人`
                : '独自出发 -500；有人同行后按人数减少花费。'}
            </small>
          </div>
          {!results ? (
            <div className="dinner-actions">
              <button type="button" className="text-btn" onClick={onCancel}>
                取消
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={money < 500}
                onClick={() => onConfirm([], [], 500)}
              >
                独自出发
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={selected.length === 0}
                onClick={invite}
              >
                发出邀请
                <span className="btn-arrow">→</span>
              </button>
            </div>
          ) : (
            <div className="dinner-actions">
              <span className="dinner-summary">
                {accepted.length === 0
                  ? '没有人同行，你可以独自出发。'
                  : `${accepted.map((item) => relationships.find((r) => r.id === item.id)?.name).filter(Boolean).join('、')} 同行`}
              </span>
              <button
                type="button"
                className="btn btn-primary"
                disabled={cost > money}
                onClick={() =>
                  onConfirm(
                    accepted.map((item) => item.id),
                    declined.map((item) => item.id),
                    cost,
                  )
                }
              >
                {accepted.length === 0 ? '独自出发' : '确认同行'}
                <span className="btn-arrow">→</span>
              </button>
            </div>
          )}
        </footer>
      </section>
    </div>
  )
}
