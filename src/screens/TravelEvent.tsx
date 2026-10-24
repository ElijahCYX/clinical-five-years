import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { TravelEvent, TravelEventEffects, TravelEventOption } from '../travelEvents'

export interface TravelSequenceItem {
  event: TravelEvent
  companionId: string
  companionName: string
}

interface TravelPayload {
  items: TravelSequenceItem[]
  onResolve: (item: TravelSequenceItem, option: TravelEventOption) => void
}

interface TravelContextValue {
  showTravelEvents: (payload: TravelPayload) => void
}

const TravelContext = createContext<TravelContextValue>({
  showTravelEvents: () => undefined,
})

export function useTravelEvents(): TravelContextValue {
  return useContext(TravelContext)
}

function effectText(effects: TravelEventEffects, name: string): string[] {
  const lines: string[] = []
  if (effects.intimacy) {
    lines.push(`与${name}亲密度 ${effects.intimacy > 0 ? '+' : ''}${effects.intimacy}`)
  }
  if (effects.money) {
    lines.push(`生活费 ${effects.money > 0 ? '+' : ''}${effects.money}`)
  }
  if (effects.energy) {
    lines.push(`精力 ${effects.energy > 0 ? '+' : ''}${effects.energy}`)
  }
  if (effects.stress) {
    lines.push(`压力 ${effects.stress > 0 ? '+' : ''}${effects.stress}`)
  }
  return lines
}

function TravelEventModal({
  payload,
  index,
  onAdvance,
  onClose,
}: {
  payload: TravelPayload
  index: number
  onAdvance: () => void
  onClose: () => void
}) {
  const [chosen, setChosen] = useState<TravelEventOption | null>(null)
  const item = payload.items[index]
  const name = item.companionName

  useEffect(() => {
    document.body.classList.add('event-open')
    return () => document.body.classList.remove('event-open')
  }, [])

  useEffect(() => {
    setChosen(null)
  }, [index])

  if (!item) return null
  const replace = (text: string) => text.replaceAll('{name}', name)

  return (
    <div className="random-event-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" />
      <section className="random-event-modal travel-event-modal">
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <span className="research-notice-tag">TRAVEL STORY</span>
            <span className="random-event-hint">
              第 {index + 1} / {payload.items.length} 段
            </span>
          </div>
          <h2 className="random-event-title">{item.event.title}</h2>
        </header>

        <p className="random-event-text">{replace(item.event.intro)}</p>

        {chosen ? (
          <>
            <div className="encounter-result travel-result">
              <p>{replace(chosen.response)}</p>
              <div className="travel-effect-list">
                {effectText(chosen.effects, name).map((line) => (
                  <strong key={line}>{line}</strong>
                ))}
              </div>
            </div>
            <footer className="random-event-footer">
              <p>这次旅行里发生的事，已经写进回忆。</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (index + 1 >= payload.items.length) {
                    onClose()
                  } else {
                    onAdvance()
                  }
                }}
              >
                {index + 1 >= payload.items.length ? '结束旅行' : '继续旅行'}
                <span className="btn-arrow">→</span>
              </button>
            </footer>
          </>
        ) : (
          <div className="encounter-options">
            {item.event.options.map((option, optionIndex) => (
              <button
                key={option.text}
                type="button"
                onClick={() => {
                  setChosen(option)
                  payload.onResolve(item, option)
                }}
              >
                <span>{String.fromCharCode(65 + optionIndex)}</span>
                {replace(option.text)}
              </button>
            ))}
            <p className="encounter-warning">
              点击前不会显示收益与损失，选择后不可撤回。
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export function TravelEventProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<TravelPayload | null>(null)
  const [index, setIndex] = useState(0)
  return (
    <TravelContext.Provider
      value={{
        showTravelEvents: (next) => {
          setPayload(next)
          setIndex(0)
        },
      }}
    >
      {children}
      {payload && payload.items.length > 0 && (
        <TravelEventModal
          payload={payload}
          index={index}
          onAdvance={() => setIndex((current) => current + 1)}
          onClose={() => setPayload(null)}
        />
      )}
    </TravelContext.Provider>
  )
}
