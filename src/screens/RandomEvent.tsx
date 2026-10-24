import { useEffect } from 'react'
import type { GameState, PendingEvent } from '../types'
import { eventKindLabel } from '../events'
import { Pill } from '../ui'

interface RandomEventModalProps {
  state: GameState
  event: PendingEvent
  onContinue: () => void
}

export function RandomEventModal({
  event,
  onContinue,
}: RandomEventModalProps) {
  useEffect(() => {
    document.body.classList.add('event-open')
    return () => document.body.classList.remove('event-open')
  }, [])

  return (
    <div className="random-event-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" />
      <section className="random-event-modal">
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <Pill
              tone={
                event.kind === 'random'
                  ? 'red'
                  : event.kind === 'attribute'
                    ? 'green'
                    : 'gold'
              }
            >
              {eventKindLabel(event.kind)}
            </Pill>
            <span className="random-event-hint">本周行动前的小插曲</span>
          </div>
          <h2 className="random-event-title">{event.title}</h2>
        </header>

        <p className="random-event-text">{event.text}</p>

        <div className="random-event-effects">
          <span className="random-event-effects-label">本次结算</span>
          <div>
            {event.effectLines.length > 0 ? (
              event.effectLines.map((line) => (
                <span className="random-event-effect" key={line}>
                  {line}
                </span>
              ))
            ) : (
              <span className="random-event-effect">这段经历本身，就是收获。</span>
            )}
          </div>
        </div>

        <footer className="random-event-footer">
          <p>收下这段经历后，本周行动才会开始。</p>
          <button className="btn btn-primary" type="button" onClick={onContinue}>
            继续本周
            <span className="btn-arrow">→</span>
          </button>
        </footer>
      </section>
    </div>
  )
}
