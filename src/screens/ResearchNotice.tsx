import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

export interface ResearchNotice {
  kind: 'lab' | 'published' | 'idea' | 'warning' | 'stress' | 'club' | 'pe' | 'sleep' | 'family' | 'mentor'
  title: string
  text: string
  journal?: string
  ruleText?: string
  ruleLabel?: string
  onAcknowledge?: () => void
  choices?: Array<{
    label: string
    primary?: boolean
    onClick: () => void
  }>
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
              {notice.kind === 'lab'
                ? 'RESEARCH LAB'
                : notice.kind === 'published'
                  ? 'PUBLICATION'
                  : notice.kind === 'idea'
                    ? 'NEW HYPOTHESIS'
                    : notice.kind === 'stress'
                      ? 'HEART WARNING'
                      : notice.kind === 'sleep'
                        ? 'SLEEP / 睡眠'
                      : notice.kind === 'family'
                        ? 'FAMILY / 家人'
                      : notice.kind === 'club'
                        ? 'CLUB NOTICE'
                        : notice.kind === 'pe'
                          ? 'PHYSICAL TEST'
                          : notice.kind === 'mentor'
                            ? 'RESEARCH MAIL / 导师邮件'
                            : 'LAB WARNING'}
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
        {notice.ruleText && (
          <div className="research-notice-rule">
            <span>{notice.ruleLabel ?? '高压规则'}</span>
            <p>{notice.ruleText}</p>
          </div>
        )}
        <footer className="random-event-footer">
          <p>
            {notice.kind === 'pe'
              ? '体测记录已归档。'
              : notice.kind === 'stress'
                ? '这是一次状态提醒，与科研进度无关。'
                : notice.kind === 'sleep'
                  ? '睡眠状态已记录。今晚别再靠咖啡硬撑。'
                  : notice.kind === 'family'
                    ? '家人的支持已记录。'
                : notice.kind === 'club'
                  ? '组织事务记录已归档。'
                  : notice.kind === 'mentor'
                    ? '导师联系与科研阶段已记录。'
                    : '这是科研系统的重要节点。'}
          </p>
          {notice.choices ? (
            <div className="research-notice-choices">
              {notice.choices.map((choice) => (
                <button
                  key={choice.label}
                  type="button"
                  className={choice.primary ? 'btn btn-primary' : 'btn btn-ghost'}
                  onClick={() => {
                    choice.onClick()
                    onClose()
                  }}
                >
                  {choice.label}
                  {choice.primary && <span className="btn-arrow">→</span>}
                </button>
              ))}
            </div>
          ) : (
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
          )}
        </footer>
      </section>
    </div>
  )
}

export function ResearchNoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<ResearchNotice | null>(null)
  const queueRef = useRef<ResearchNotice[]>([])
  const showResearchNotice = (next: ResearchNotice) => {
    setNotice((current) => {
      if (current) {
        queueRef.current.push(next)
        return current
      }
      return next
    })
  }
  const closeNotice = () => {
    const next = queueRef.current.shift() ?? null
    setNotice(next)
  }
  return (
    <ResearchNoticeContext.Provider value={{ showResearchNotice }}>
      {children}
      {notice && <ResearchNoticeModal notice={notice} onClose={closeNotice} />}
    </ResearchNoticeContext.Provider>
  )
}
