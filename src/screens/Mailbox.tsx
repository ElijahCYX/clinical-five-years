import { useEffect, useMemo, useState } from 'react'
import type { GameEmail, GameState } from '../types'
import { Pill, SectionLabel } from '../ui'

interface MailboxProps {
  state: GameState
  draft: GameEmail | null
  onSendDraft: (draft: GameEmail) => { ok: boolean; error?: string }
  onReadEmail: (emailId: string) => void
  onAcceptProject: (emailId: string) => void
  onDeclineProject: (emailId: string) => void
  onDraftDone: () => void
  onCancelDraft: () => void
}

type MailFolder = 'inbox' | 'sent'
type ComposePhase = 'typing' | 'ready' | 'sending' | 'sent' | 'error'

export function Mailbox({
  state,
  draft,
  onSendDraft,
  onReadEmail,
  onAcceptProject,
  onDeclineProject,
  onDraftDone,
  onCancelDraft,
}: MailboxProps) {
  const [folder, setFolder] = useState<MailFolder>('inbox')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [typedCount, setTypedCount] = useState(0)
  const [phase, setPhase] = useState<ComposePhase>('typing')
  const [sendError, setSendError] = useState<string | null>(null)

  const inbox = useMemo(
    () =>
      state.emails
        .filter((email) => email.direction === 'inbox')
        .sort((a, b) => b.sentAtAbs - a.sentAtAbs),
    [state.emails],
  )
  const sent = useMemo(
    () =>
      state.emails
        .filter((email) => email.direction === 'sent')
        .sort((a, b) => b.sentAtAbs - a.sentAtAbs),
    [state.emails],
  )
  const list = folder === 'inbox' ? inbox : sent
  const unread = inbox.filter((email) => !email.read).length
  const selected = selectedId
    ? state.emails.find((email) => email.id === selectedId) ?? null
    : null

  useEffect(() => {
    if (!draft) return
    setPhase('typing')
    setTypedCount(0)
    setSendError(null)
    setSelectedId(null)
    const step = Math.max(2, Math.ceil(draft.body.length / 150))
    const timer = window.setInterval(() => {
      setTypedCount((count) => {
        const next = Math.min(draft.body.length, count + step)
        if (next >= draft.body.length) {
          window.clearInterval(timer)
          setPhase('ready')
        }
        return next
      })
    }, 20)
    return () => window.clearInterval(timer)
  }, [draft])

  useEffect(() => {
    if (phase !== 'sent') return
    const timer = window.setTimeout(() => {
      onDraftDone()
      setFolder('sent')
      setSelectedId(draft?.id ?? null)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [phase, draft, onDraftDone])

  const selectMail = (email: GameEmail) => {
    setSelectedId(email.id)
    if (email.direction === 'inbox' && !email.read) onReadEmail(email.id)
  }

  const sendDraft = () => {
    if (!draft || phase === 'sending' || phase === 'sent') return
    const result = onSendDraft(draft)
    if (!result.ok) {
      setSendError(result.error ?? '邮件发送失败。')
      setPhase('error')
      return
    }
    setSendError(null)
    setPhase('sending')
    window.setTimeout(() => setPhase('sent'), 900)
  }

  const showCompose = Boolean(draft)

  return (
    <div className="tab-panel mailbox-panel">
      <div className="mailbox-title-row">
        <div>
          <h2>邮箱</h2>
          <p>导师、课题组和学院的通知都会落在这里。未读邮件会在页签上亮起提醒。</p>
        </div>
        <Pill tone={unread > 0 ? 'red' : 'plain'}>
          {unread > 0 ? `未读 ${unread}` : '没有未读邮件'}
        </Pill>
      </div>

      <div className="mailbox-layout">
        <aside className="mailbox-sidebar">
          <div className="mailbox-folders">
            <button
              type="button"
              className={folder === 'inbox' ? 'is-active' : ''}
              onClick={() => setFolder('inbox')}
            >
              收件箱
              {unread > 0 && <span className="mailbox-folder-count">{unread}</span>}
            </button>
            <button
              type="button"
              className={folder === 'sent' ? 'is-active' : ''}
              onClick={() => setFolder('sent')}
            >
              已发送
            </button>
          </div>
          <div className="mailbox-list">
            {list.length === 0 ? (
              <p className="mailbox-empty">
                {folder === 'inbox' ? '收件箱还是空的。' : '还没有发过邮件。'}
              </p>
            ) : (
              list.map((email) => (
                <button
                  type="button"
                  key={email.id}
                  className={`mail-card ${selectedId === email.id ? 'is-selected' : ''} ${
                    email.direction === 'inbox' && !email.read ? 'is-unread' : ''
                  }`}
                  onClick={() => selectMail(email)}
                >
                  <span className="mail-card-source">
                    {email.direction === 'inbox' ? email.senderName : `致 ${email.recipientName}`}
                    {email.direction === 'inbox' && !email.read && (
                      <i className="mail-unread-dot" />
                    )}
                  </span>
                  <strong>{email.subject}</strong>
                  <time>{email.timeLabel}</time>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="mailbox-reader">
          {showCompose && draft ? (
            <div className="mail-compose">
              <div className="mail-compose-head">
                <span>新邮件</span>
                <Pill tone="gold">自动生成 · 可发送</Pill>
              </div>
              <div className="mail-compose-fields">
                <div>
                  <span>收件人</span>
                  <strong>{draft.recipientName}</strong>
                </div>
                <div>
                  <span>主题</span>
                  <strong>{draft.subject}</strong>
                </div>
              </div>
              <pre className="mail-compose-body">
                {draft.body.slice(0, typedCount)}
                {typewriterCursor(phase)}
              </pre>
              {phase === 'typing' && (
                <p className="mail-compose-status">正在把想说的话写成邮件……</p>
              )}
              {phase === 'ready' && (
                <div className="mail-compose-actions">
                  <button type="button" className="btn btn-ghost" onClick={onCancelDraft}>
                    取消
                  </button>
                  <button type="button" className="btn btn-primary" onClick={sendDraft}>
                    发送邮件
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              )}
              {phase === 'sending' && (
                <div className="mail-sending">
                  <span className="mail-send-plane">✈</span>
                  <p>正在发送给 {draft.recipientName}……</p>
                </div>
              )}
              {phase === 'sent' && (
                <div className="mail-sent-notice">
                  <strong>邮件已发送。</strong>
                  <span>接下来，等待导师的回复。</span>
                </div>
              )}
              {phase === 'error' && (
                <div className="mail-send-error">
                  <p>{sendError}</p>
                  <button type="button" className="btn btn-ghost" onClick={onCancelDraft}>
                    返回邮箱
                  </button>
                </div>
              )}
            </div>
          ) : selected ? (
            <article className="mail-reader">
              <header>
                <span className="mail-reader-source">
                  {selected.direction === 'inbox'
                    ? selected.senderName
                    : `发件人：${selected.senderName}`}
                </span>
                <h2>{selected.subject}</h2>
                <p>
                  收件人：{selected.recipientName} · {selected.timeLabel}
                </p>
              </header>
              <pre className="mail-reader-body">{selected.body}</pre>
              {selected.kind === 'projectOffer' &&
                selected.project &&
                state.researchStage >= 5 && (
                  <div className="mail-project-action">
                    {selected.projectDecision ? (
                      <p>
                        {selected.projectDecision === 'accepted'
                          ? '你已经接受了这个课题。'
                          : '你已经拒绝了这个课题，导师会在之后重新考虑新的题目。'}
                      </p>
                    ) : (
                      <>
                        <p>导师在等你的答复。</p>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => onAcceptProject(selected.id)}
                        >
                          接受课题，开始科研
                          <span className="btn-arrow">→</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => onDeclineProject(selected.id)}
                        >
                          暂不接受
                        </button>
                      </>
                    )}
                  </div>
                )}
              <footer>
                <span>— {selected.senderName}</span>
              </footer>
            </article>
          ) : (
            <div className="mailbox-reader-empty">
              <span>✉</span>
              <h3>选择一封邮件</h3>
              <p>左侧是收件箱和已发送列表，点开邮件查看正文。</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function typewriterCursor(phase: ComposePhase): string {
  return phase === 'typing' ? '▍' : ''
}
