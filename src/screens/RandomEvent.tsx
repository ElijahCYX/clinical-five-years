import type { GameState, PendingEvent } from '../types'
import { eventKindLabel } from '../events'
import { Eyebrow, Pill, TopBar } from '../ui'

interface RandomEventScreenProps {
  state: GameState
  event: PendingEvent
  onContinue: () => void
  onTitle: () => void
}

export function RandomEventScreen({
  event,
  onContinue,
  onTitle,
}: RandomEventScreenProps) {
  return (
    <div className="screen random-event-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />

        <header className="random-event-head">
          <Eyebrow>RANDOM EVENT / BEFORE WEEKLY ACTIONS</Eyebrow>
          <div className="random-event-kind-row">
            <Pill tone={event.kind === 'random' ? 'red' : event.kind === 'attribute' ? 'green' : 'gold'}>
              {eventKindLabel(event.kind)}
            </Pill>
            <span className="random-event-hint">本周行动前的小插曲</span>
          </div>
          <h1 className="page-title">{event.title}</h1>
        </header>

        <section className="paper-card random-event-card">
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

          <div className="random-event-footer">
            <p>收下这段经历后，本周行动才会开始。</p>
            <button className="btn btn-primary" type="button" onClick={onContinue}>
              继续本周
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
