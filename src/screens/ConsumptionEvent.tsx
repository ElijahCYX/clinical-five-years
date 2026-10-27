import { useEffect } from 'react'
import type { ConsumptionEvent } from '../types'
import { Pill } from '../ui'

interface ConsumptionEventModalProps {
  event: ConsumptionEvent
  money: number
  onResolve: (accept: boolean, mode?: 'full' | 'installment') => void
}

export function ConsumptionEventModal({
  event,
  money,
  onResolve,
}: ConsumptionEventModalProps) {
  useEffect(() => {
    document.body.classList.add('event-open')
    return () => document.body.classList.remove('event-open')
  }, [])

  const affordable = money >= event.cost

  return (
    <div className="random-event-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" />
      <section className="random-event-modal consumption-event-modal">
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <Pill tone="gold">消费型事件</Pill>
            <span className="random-event-hint">本周行动前的可选消费</span>
          </div>
          <h2 className="random-event-title">{event.title}</h2>
        </header>

        <p className="random-event-text">{event.text}</p>

        <div className="random-event-effects">
          <span className="random-event-effects-label">本次消费</span>
          <div>
            <span className="random-event-effect">立即：生活费 -{event.cost}</span>
            {event.installment && (
              <span className="random-event-effect">
                分期：每周期生活费 -{event.installment.amount}（共 {event.installment.weeks} 期）
              </span>
            )}
            {event.benefitLines.map((line) => (
              <span className="random-event-effect" key={line}>
                {line}
              </span>
            ))}
          </div>
        </div>

        <footer className="random-event-footer">
          <p>
            当前生活费 ¥{money}
            {!affordable
              ? event.installment
                ? ' · 暂时买不起，可选择分期'
                : ' · 暂时买不起，下次再说吧'
              : ' · 收益在购买后生效'}
          </p>
          <div className="consumption-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onResolve(false)}
            >
              算了
            </button>
            {event.installment && (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={money < event.installment.amount}
                onClick={() => onResolve(true, 'installment')}
              >
                分 {event.installment.weeks} 期
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!affordable}
              onClick={() => onResolve(true, 'full')}
            >
              立即买下
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
