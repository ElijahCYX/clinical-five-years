import { useEffect } from 'react'
import type { PendingConfession } from '../types'
import { Pill } from '../ui'

interface NpcConfessionModalProps {
  confession: PendingConfession
  onAccept: () => void
  onDecline: () => void
}

export function NpcConfessionModal({
  confession,
  onAccept,
  onDecline,
}: NpcConfessionModalProps) {
  useEffect(() => {
    document.body.classList.add('event-open')
    return () => document.body.classList.remove('event-open')
  }, [])

  return (
    <div className="random-event-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" />
      <section className="random-event-modal npc-confession-modal">
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <Pill tone="gold">TA 的表白</Pill>
            <span className="random-event-hint">本周行动前的小插曲</span>
          </div>
          <h2 className="random-event-title">
            {confession.name} 好像有话要说
          </h2>
        </header>

        <p className="random-event-text">{confession.text}</p>

        {confession.staff && (
          <div className="npc-confession-warning">
            对方是{confession.identity}。师生恋违背公序良俗，一旦被发现，
            这段关系会破裂，你的交际与名声也会受损。
          </div>
        )}

        <footer className="npc-confession-footer">
          <p>你不需要立刻回答，但 TA 正在等。</p>
          <div>
            <button type="button" className="text-btn" onClick={onDecline}>
              婉拒
            </button>
            <button type="button" className="btn btn-primary" onClick={onAccept}>
              接受
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
