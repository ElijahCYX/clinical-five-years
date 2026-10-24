import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface ResearchNotice {
  kind: 'lab' | 'published'
  title: string
  text: string
  journal?: string
  onAcknowledge?: () => void
}

interface ResearchNoticeContextValue {
  showResearchNotice: (notice: ResearchNotice) => void
}

const ResearchNoticeContext = createContext<ResearchNoticeContextValue>({
  showResearchNotice: () => undefined,
})

export function useResearchNotice(): ResearchNoticeContextValue {
  return useContext(ResearchNoticeContext)
}

function ResearchNoticeModal({
  notice,
  onClose,
}: {
  notice: ResearchNotice
  onClose: () => void
}) {
  useEffect(() => {
    document.body.classList.add('event-open')
    return () => document.body.classList.remove('event-open')
  }, [])

  return (
    <div className="random-event-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" />
      <section className="random-event-modal research-notice-modal">
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <span className="research-notice-tag">
              {notice.kind === 'lab' ? 'RESEARCH LAB' : 'PUBLICATION'}
            </span>
          </div>
          <h2 className="random-event-title">{notice.title}</h2>
        </header>
        <p className="random-event-text">{notice.text}</p>
        {notice.journal && (
          <div className="research-notice-journal">
            <span>刊登期刊</span>
            <strong>{notice.journal}</strong>
          </div>
        )}
        <footer className="random-event-footer">
          <p>这是科研系统的重要节点。</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              notice.onAcknowledge?.()
              onClose()
            }}
          >
            知道了
            <span className="btn-arrow">→</span>
          </button>
        </footer>
      </section>
    </div>
  )
}

export function ResearchNoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<ResearchNotice | null>(null)
  const showResearchNotice = (next: ResearchNotice) => setNotice(next)
  return (
    <ResearchNoticeContext.Provider value={{ showResearchNotice }}>
      {children}
      {notice && (
        <ResearchNoticeModal
          notice={notice}
          onClose={() => setNotice(null)}
        />
      )}
    </ResearchNoticeContext.Provider>
  )
}
