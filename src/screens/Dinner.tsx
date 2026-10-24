import { useEffect, useMemo, useState } from 'react'
import type { Relationship } from '../types'
import {
  dinnerAttendanceChance,
  dinnerCost,
  isDinnerFriend,
  randomRefusalReason,
  relationshipKindLabel,
} from '../social'
import { Pill } from '../ui'

interface DinnerModalProps {
  relationships: Relationship[]
  money: number
  onConfirm: (acceptedIds: string[], declinedIds: string[], cost: number) => void
  onCancel: () => void
}

interface DinnerResult {
  id: string
  accepted: boolean
  reason?: string
}

export function DinnerModal({
  relationships,
  money,
  onConfirm,
  onCancel,
}: DinnerModalProps) {
  const friends = useMemo(
    () => relationships.filter(isDinnerFriend),
    [relationships],
  )
  const [selected, setSelected] = useState<string[]>([])
  const [results, setResults] = useState<DinnerResult[] | null>(null)

  useEffect(() => {
    document.body.classList.add('dinner-open')
    return () => document.body.classList.remove('dinner-open')
  }, [])

  const accepted = results?.filter((item) => item.accepted) ?? []
  const declined = results?.filter((item) => !item.accepted) ?? []
  const cost = dinnerCost(accepted.length)

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
      const accepted = Math.random() < dinnerAttendanceChance(relation)
      return {
        id,
        accepted,
        reason: accepted ? undefined : randomRefusalReason(),
      }
    })
    setResults(next)
  }

  return (
    <div className="dinner-overlay" role="dialog" aria-modal="true">
      <div className="dinner-backdrop" onClick={onCancel} />
      <section className="dinner-modal">
        <header className="dinner-head">
          <div>
            <span className="dinner-eyebrow">DINNER INVITATION / 本周社交</span>
            <h2>今晚，和谁吃饭？</h2>
            <p>选一位或多位朋友。赴约概率由你们之间的亲密度决定。</p>
          </div>
          <Pill tone="gold">生活费 ¥{money}</Pill>
        </header>

        {friends.length === 0 ? (
          <p className="dinner-empty">
            还没有可以一起吃饭的朋友。去认识一些人，再回来约饭。
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
            <strong>{results ? `¥${cost}` : '¥50 起'}</strong>
            <small>每多一位朋友赴约，总费用减少 ¥5。</small>
          </div>
          {!results ? (
            <div className="dinner-actions">
              <button type="button" className="text-btn" onClick={onCancel}>
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={selected.length === 0 || money < 50}
                onClick={invite}
              >
                发出邀请
                <span className="btn-arrow">→</span>
              </button>
            </div>
          ) : accepted.length > 0 ? (
            <div className="dinner-actions">
              <span className="dinner-summary">
                {accepted.length} 人赴约 · 共 ¥{cost}
              </span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  onConfirm(
                    accepted.map((item) => item.id),
                    declined.map((item) => item.id),
                    cost,
                  )
                }
              >
                就这顿
                <span className="btn-arrow">→</span>
              </button>
            </div>
          ) : (
            <div className="dinner-actions">
              <span className="dinner-summary">今晚没人有空，你决定回宿舍吃泡面。</span>
              <button type="button" className="text-btn" onClick={onCancel}>
                关闭
              </button>
            </div>
          )}
        </footer>
      </section>
    </div>
  )
}
