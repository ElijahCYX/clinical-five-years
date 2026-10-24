import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { EncounterChat } from '../types'

export interface EncounterPayload {
  name: string
  identity: string
  chat: EncounterChat
  onResolve: (intimacy: number) => void
}

interface EncounterContextValue {
  showEncounter: (payload: EncounterPayload) => void
}

const EncounterContext = createContext<EncounterContextValue>({
  showEncounter: () => undefined,
})

export function useEncounter(): EncounterContextValue {
  return useContext(EncounterContext)
}

function EncounterModal({
  payload,
  onClose,
}: {
  payload: EncounterPayload
  onClose: () => void
}) {
  const [chosen, setChosen] = useState<number | null>(null)
  useEffect(() => {
    document.body.classList.add('event-open')
    return () => document.body.classList.remove('event-open')
  }, [])

  const option = chosen === null ? null : payload.chat.options[chosen]
  const replaceName = (text: string) =>
    text.replaceAll('{name}', payload.name)

  return (
    <div className="random-event-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" />
      <section className="random-event-modal encounter-modal">
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <span className="research-notice-tag">CAMPUS ENCOUNTER</span>
            <span className="random-event-hint">
              偶遇 · {payload.identity}
            </span>
          </div>
          <h2 className="random-event-title">在校园里遇见 {payload.name}</h2>
        </header>

        <p className="random-event-text">{replaceName(payload.chat.intro)}</p>

        {option ? (
          <>
            <div className="encounter-result">
              <p>{replaceName(option.response)}</p>
              <strong className={option.intimacy >= 0 ? 'is-positive' : 'is-negative'}>
                亲密度 {option.intimacy > 0 ? '+' : ''}
                {option.intimacy}
              </strong>
            </div>
            <footer className="random-event-footer">
              <p>这个选择已经发生，不能撤回。</p>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                继续
                <span className="btn-arrow">→</span>
              </button>
            </footer>
          </>
        ) : (
          <div className="encounter-options">
            {payload.chat.options.map((item, index) => (
              <button
                key={item.text}
                type="button"
                onClick={() => {
                  setChosen(index)
                  payload.onResolve(item.intimacy)
                }}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {item.text}
              </button>
            ))}
            <p className="encounter-warning">选定前不会显示后果。</p>
          </div>
        )}
      </section>
    </div>
  )
}

export function EncounterProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<EncounterPayload | null>(null)
  return (
    <EncounterContext.Provider value={{ showEncounter: setPayload }}>
      {children}
      {payload && (
        <EncounterModal payload={payload} onClose={() => setPayload(null)} />
      )}
    </EncounterContext.Provider>
  )
}
