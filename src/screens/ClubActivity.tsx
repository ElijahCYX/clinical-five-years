import { useEffect, useMemo, useState } from 'react'
import type { DinnerInviteResult, Relationship } from '../types'
import {
  dinnerAttendanceChance,
  randomRefusalReason,
  relationshipKindLabel,
} from '../social'
import { Pill } from '../ui'

interface ClubActivityModalProps {
  organizationName: string
  members: Relationship[]
  initialResults?: DinnerInviteResult[] | null
  onSaveResults?: (results: DinnerInviteResult[]) => void
  onConfirm: (acceptedIds: string[], declinedIds: string[]) => void
  onCancel: () => void
}

export function ClubActivityModal({
  organizationName,
  members,
  initialResults = null,
  onSaveResults,
  onConfirm,
  onCancel,
}: ClubActivityModalProps) {
  const [selected, setSelected] = useState<string[]>(
    initialResults?.map((item) => item.id) ?? [],
  )
  const [results, setResults] = useState<DinnerInviteResult[] | null>(
    initialResults ?? null,
  )

  useEffect(() => {
    document.body.classList.add('dinner-open')
    return () => document.body.classList.remove('dinner-open')
  }, [])

  const accepted = results?.filter((item) => item.accepted) ?? []
  const declined = results?.filter((item) => !item.accepted) ?? []
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
      const relation = members.find((item) => item.id === id)
      if (!relation) return { id, accepted: false, reason: '你不太确定 TA 是谁。' }
      const accepted = Math.random() < dinnerAttendanceChance(relation)
      return {
        id,
        accepted,
        reason: accepted ? undefined : randomRefusalReason(),
      }
    })
    setResults(next)
    onSaveResults?.(next)
  }

  return (
    <div className="dinner-overlay" role="dialog" aria-modal="true">
      <div className="dinner-backdrop" onClick={onCancel} />
      <section className="dinner-modal club-activity-modal">
        <header className="dinner-head">
          <div>
            <span className="dinner-eyebrow">CLUB CO-WORK / 组织活动</span>
            <h2>这次和谁一起做事？</h2>
            <p>
              {organizationName}里你认识的人。邀请他们一起，成功率由亲密度决定。
              被拒绝的人当周不会改变结果。
            </p>
          </div>
          <Pill tone="gold">人际成长 +5</Pill>
        </header>

        {members.length === 0 ? (
          <p className="dinner-empty">
            你在组织里还没有认识的人。可以独自开工，或等下次活动认识新朋友。
          </p>
        ) : (
          <div className="dinner-list">
            {members.map((relation) => {
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
                  disabled={Boolean(results)}
                >
                  <span className="dinner-person-name">
                    {relation.name}
                    <span
                      className={`inline-gender ${relation.gender === '男' ? 'is-male' : 'is-female'}`}
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
            <span>合作之后</span>
            <strong>精力 -12 · 压力 +5 · 生活费 -20</strong>
            <small>无论几个人应约，行动都会照常消耗；应约者会获得额外亲密度。</small>
          </div>
          {!results ? (
            <div className="dinner-actions">
              <button type="button" className="text-btn" onClick={onCancel}>
                取消
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onConfirm([], [])}
              >
                独自开工
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
                {accepted.length > 0
                  ? `${accepted.length} 人应约`
                  : '这次没人有空，但你可以独自开工。'}
              </span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  onConfirm(
                    accepted.map((item) => item.id),
                    declined.map((item) => item.id),
                  )
                }
              >
                开始合作
                <span className="btn-arrow">→</span>
              </button>
            </div>
          )}
        </footer>
      </section>
    </div>
  )
}
