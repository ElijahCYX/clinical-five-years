import type { GameState, HealthTreatment } from '../types'
import { Pill } from '../ui'

interface HealthEventProps {
  state: GameState
  onTreat: (treatment: HealthTreatment) => void
}

export function HealthEventModal({ state, onTreat }: HealthEventProps) {
  const pending = state.pendingHealthEvent
  const condition = state.healthConditions.find(
    (item) => item.id === pending?.conditionId,
  )
  if (!condition) return null
  const options: Array<{
    treatment: HealthTreatment
    title: string
    text: string
    cost: string
  }> = [
    {
      treatment: 'none',
      title: '硬扛',
      text: '不做处理，继续按原计划行动，恢复会慢一些。',
      cost: '0 元 · 可能加重',
    },
    {
      treatment: 'medicine',
      title: '自行买药',
      text: '去药店买点对症的药，正常上课，恢复稍快。',
      cost: '生活费 -30',
    },
    {
      treatment: 'dorm',
      title: '宿舍休息',
      text: '把这一周的行动慢下来，在床上多躺一天。',
      cost: '压力 -5 · 恢复较快',
    },
    {
      treatment: 'clinic',
      title: '校医院就诊',
      text: '去校医院挂号、拿药，按医嘱休息。',
      cost: '生活费 -100 · 恢复最快',
    },
  ]
  return (
    <div className="random-event-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" />
      <section className="random-event-modal health-event-modal">
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <span className="research-notice-tag">HEALTH / 身体状况</span>
            <span className="random-event-hint">
              {condition.source}
            </span>
          </div>
          <h2 className="random-event-title">
            {condition.label}
          </h2>
        </header>
        <p className="random-event-text">
          身体先替你把话说完了。{condition.label}预计还需要
          <strong> {condition.daysLeft} 天</strong>恢复；这几天行动会更累，
          准备度收益也会下降。现在要处理一下吗？
        </p>
        <div className="health-treatment-list">
          {options.map((option) => (
            <button
              key={option.treatment}
              type="button"
              className="health-treatment-option"
              onClick={() => onTreat(option.treatment)}
            >
              <span>
                <strong>{option.title}</strong>
                <small>{option.text}</small>
              </span>
              <em>{option.cost}</em>
            </button>
          ))}
        </div>
        <footer className="random-event-footer">
          <p>无论怎么处理，身体都需要一点时间。</p>
          <Pill tone={condition.severity === 'severe' ? 'red' : 'gold'}>
            {condition.severity === 'severe'
              ? '重症'
              : condition.severity === 'moderate'
                ? '中症'
                : '轻症'}
          </Pill>
        </footer>
      </section>
    </div>
  )
}
