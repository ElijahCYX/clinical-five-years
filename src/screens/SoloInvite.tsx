import { useEffect, useRef, useState } from 'react'
import {
  SOLO_DECLINES,
  SOLO_EVENT_BY_ID,
  SOLO_PARTNER_REPLIES,
  SOLO_PARTNER_STATES,
  type SoloEventDef,
} from '../soloData'
import {
  SOLO_MAX_WEEKLY_SUCCESS,
  bondOf,
  createSoloInvite,
  drawSoloOptions,
  findSoloSlot,
  soloAcceptanceText,
  soloContactBlocked,
  soloContacts,
  soloEventTimeHint,
  soloSeasonKind,
  soloSlotLabel,
  soloSuccessChance,
  soloSuccessCount,
  soloWeekKey,
} from '../solo'
import type { GameState, Relationship, SoloChatLine, SoloChatRecord, SoloInvite } from '../types'

type ChatMessage = {
  id: number
  from: 'me' | 'them' | 'system'
  text: string
}

type SoloResult =
  | { kind: 'accepted'; event: SoloEventDef; slot: number }
  | { kind: 'declined' }
  | { kind: 'no-slot' }

interface SoloInviteProps {
  state: GameState
  onClose: () => void
  onAttempt: (record: SoloChatRecord, invite?: SoloInvite) => void
}

const BOND_LABEL = {
  lover: '恋人',
  brother: '兄弟',
  sister: '闺蜜',
} as const

function randomOf<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function SoloInviteModal({
  state,
  onClose,
  onAttempt,
}: SoloInviteProps) {
  const contacts = soloContacts(state)
  const [selected, setSelected] = useState<Relationship | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState(false)
  const [options, setOptions] = useState<SoloEventDef[]>([])
  const [refreshed, setRefreshed] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'hello' | 'options' | 'inviting' | 'result'>('idle')
  const [result, setResult] = useState<SoloResult | null>(null)
  const [frozenChat, setFrozenChat] = useState(false)
  const [historyDivider, setHistoryDivider] = useState(false)
  const [historyLeaving, setHistoryLeaving] = useState(false)
  const messageId = useRef(0)
  const timers = useRef<number[]>([])
  const chatRef = useRef<HTMLDivElement | null>(null)

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  const push = (from: ChatMessage['from'], text: string) => {
    messageId.current += 1
    setMessages((previous) => [
      ...previous,
      { id: messageId.current, from, text },
    ])
  }

  useEffect(() => {
    clearTimers()
    return clearTimers
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, typing, options, result])

  const startHelloFlow = (relation: Relationship, withDivider: boolean) => {
    setHistoryDivider(withDivider)
    setHistoryLeaving(false)
    setFrozenChat(false)
    setMessages([])
    setOptions([])
    setRefreshed(false)
    setResult(null)
    setTyping(false)
    setPhase('hello')
    const bond = bondOf(relation)
    const reply = randomOf(SOLO_PARTNER_REPLIES[bond])

    timers.current.push(
      window.setTimeout(() => push('me', '在吗？'), 250),
      window.setTimeout(() => {
        setTyping(true)
      }, 950),
      window.setTimeout(() => {
        setTyping(false)
        push('them', reply)
      }, 2250),
      window.setTimeout(() => {
        setOptions(drawSoloOptions(bond, soloSeasonKind(state)))
        setPhase('options')
      }, 3250),
    )
  }

  const selectContact = (relation: Relationship) => {
    if (soloContactBlocked(state, relation)) return
    clearTimers()
    setSelected(relation)
    setMessages([])
    setOptions([])
    setRefreshed(false)
    setResult(null)
    setTyping(false)
    setFrozenChat(false)
    setHistoryDivider(false)
    setHistoryLeaving(false)

    const frozenRecord = (state.soloChatRecords ?? []).find(
      (record) =>
        record.weekKey === soloWeekKey(state) &&
        record.attemptSlot === state.weekSlot &&
        record.relationshipId === relation.id,
    )
    const frozenInvite = (state.soloInvites ?? []).find(
      (invite) =>
        invite.weekKey === soloWeekKey(state) &&
        invite.attemptSlot === state.weekSlot &&
        invite.relationshipId === relation.id &&
        (invite.chat?.length ?? 0) > 0,
    )
    const frozenChatLines = frozenRecord?.chat ?? frozenInvite?.chat
    if (frozenChatLines) {
      const frozenEventId = frozenRecord?.eventId ?? frozenInvite?.eventId
      const frozenEvent = frozenEventId ? SOLO_EVENT_BY_ID[frozenEventId] : null
      setFrozenChat(true)
      setMessages(
        frozenChatLines.map((line, index) => ({
          id: index + 1,
          from: line.from,
          text: line.text,
        })),
      )
      if (frozenRecord?.outcome === 'declined') {
        setResult({ kind: 'declined' })
      } else if (frozenRecord?.outcome === 'no-slot') {
        setResult({ kind: 'no-slot' })
      } else if (frozenEvent) {
        setResult({
          kind: 'accepted',
          event: frozenEvent,
          slot: frozenRecord?.inviteSlot ?? frozenInvite?.slot ?? state.weekSlot,
        })
      }
      setPhase('result')
      return
    }

    const previousRecord = (state.soloChatRecords ?? [])
      .filter(
        (record) =>
          record.weekKey === soloWeekKey(state) &&
          record.relationshipId === relation.id &&
          record.attemptSlot !== state.weekSlot,
      )
      .sort((a, b) => b.attemptSlot - a.attemptSlot)[0]

    if (previousRecord) {
      setFrozenChat(true)
      setHistoryDivider(false)
      setMessages(
        previousRecord.chat.map((line, index) => ({
          id: index + 1,
          from: line.from,
          text: line.text,
        })),
      )
      setPhase('idle')
      timers.current.push(
        window.setTimeout(() => setHistoryLeaving(true), 300),
        window.setTimeout(() => {
          startHelloFlow(relation, true)
        }, 800),
      )
      return
    }

    startHelloFlow(relation, false)
  }

  const refreshOptions = () => {
    if (!selected || refreshed || phase !== 'options') return
    setOptions(drawSoloOptions(bondOf(selected), soloSeasonKind(state)))
    setRefreshed(true)
  }

  const chooseEvent = (event: SoloEventDef) => {
    if (!selected || phase !== 'options') return
    setOptions([])
    setPhase('inviting')
    setResult(null)
    push('me', event.invite)

    const bond = bondOf(selected)
    const accepted = Math.random() * 100 < soloSuccessChance(selected.intimacy)
    const slot = accepted ? findSoloSlot(state, event) : null

    if (!accepted) {
      const decline = randomOf(SOLO_DECLINES[bond])
      timers.current.push(
        window.setTimeout(() => {
          push('them', decline)
          const declineChat: SoloChatLine[] = [
            ...messages.map((message) => ({
              from: message.from,
              text: message.text,
            })),
            { from: 'me', text: event.invite },
            { from: 'them', text: decline },
          ]
          onAttempt({
            id: `solo-chat-${soloWeekKey(state)}-${selected.id}-${state.weekSlot}`,
            relationshipId: selected.id,
            partnerName: selected.name,
            bondType: bond,
            eventId: event.id,
            eventName: event.name,
            weekKey: soloWeekKey(state),
            attemptSlot: state.weekSlot,
            outcome: 'declined',
            chat: declineChat,
          })
          setResult({ kind: 'declined' })
          setPhase('result')
        }, 900),
      )
      return
    }

    if (slot === null) {
      timers.current.push(
        window.setTimeout(() => {
          push('them', '这周时间好像对不上，我们下周再约吧。')
          const noSlotChat: SoloChatLine[] = [
            ...messages.map((message) => ({
              from: message.from,
              text: message.text,
            })),
            { from: 'me', text: event.invite },
            { from: 'them', text: '这周时间好像对不上，我们下周再约吧。' },
          ]
          onAttempt({
            id: `solo-chat-${soloWeekKey(state)}-${selected.id}-${state.weekSlot}`,
            relationshipId: selected.id,
            partnerName: selected.name,
            bondType: bond,
            eventId: event.id,
            eventName: event.name,
            weekKey: soloWeekKey(state),
            attemptSlot: state.weekSlot,
            outcome: 'no-slot',
            chat: noSlotChat,
          })
          setResult({ kind: 'no-slot' })
          setPhase('result')
        }, 900),
      )
      return
    }

    const acceptedText = soloAcceptanceText(slot)
    const systemText = `已约定：${soloSlotLabel(slot)} · ${event.name}`
    const chatSnapshot: SoloChatLine[] = [
      ...messages.map((message) => ({
        from: message.from,
        text: message.text,
      })),
      { from: 'me', text: event.invite },
      { from: 'them', text: acceptedText },
      { from: 'system', text: systemText },
    ]
    const invite = createSoloInvite(state, selected, event, slot, chatSnapshot)
    timers.current.push(
      window.setTimeout(() => {
        push('them', acceptedText)
        push('system', systemText)
        onAttempt(
          {
            id: `solo-chat-${soloWeekKey(state)}-${selected.id}-${state.weekSlot}`,
            relationshipId: selected.id,
            partnerName: selected.name,
            bondType: bond,
            eventId: event.id,
            eventName: event.name,
            weekKey: soloWeekKey(state),
            attemptSlot: state.weekSlot,
            outcome: 'accepted',
            inviteSlot: slot,
            chat: chatSnapshot,
          },
          invite,
        )
        setResult({ kind: 'accepted', event, slot })
        setPhase('result')
      }, 900),
    )
  }

  const selectedBond = selected ? bondOf(selected) : null
  const selectedBlocked =
    selected !== null && soloContactBlocked(state, selected)

  return (
    <div className="solo-overlay" role="dialog" aria-modal="true">
      <div className="solo-backdrop" onClick={onClose} />
      <section className="solo-window">
        <header className="solo-window-head">
          <div>
            <span>SOLO INVITATION / 单独邀约</span>
            <h2>单独邀约</h2>
          </div>
          <button type="button" className="solo-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <div className="solo-window-body">
          <aside className="solo-contacts">
            <div className="solo-contacts-head">
              <span>羁绊</span>
              <small>{contacts.length} 位</small>
            </div>
            <div className="solo-contact-list">
              {contacts.length === 0 && (
                <p className="solo-empty">还没有恋人、兄弟或闺蜜羁绊。</p>
              )}
              {contacts.map((relation) => {
                const blocked = soloContactBlocked(state, relation)
                const count = soloSuccessCount(state, relation.id)
                const frozenRecord = (state.soloChatRecords ?? []).find(
                  (record) =>
                    record.weekKey === soloWeekKey(state) &&
                    record.attemptSlot === state.weekSlot &&
                    record.relationshipId === relation.id,
                )
                return (
                  <button
                    key={relation.id}
                    type="button"
                    className={`solo-contact ${selected?.id === relation.id ? 'is-active' : ''} ${
                      blocked ? 'is-blocked' : ''
                    }`}
                    disabled={blocked}
                    onClick={() => selectContact(relation)}
                  >
                    <span className="solo-avatar">{relation.name.slice(0, 1)}</span>
                    <span className="solo-contact-copy">
                      <strong>{relation.name}</strong>
                      <small>
                        {BOND_LABEL[bondOf(relation)]} · 亲密度 {relation.intimacy}
                      </small>
                      <em>
                        {blocked
                          ? '本周已约满'
                          : frozenRecord
                            ? frozenRecord.outcome === 'accepted'
                              ? '本时段已邀约'
                              : '本时段已婉拒'
                            : count > 0
                              ? `本周已约 ${count} / ${SOLO_MAX_WEEKLY_SUCCESS}`
                              : '可邀约'}
                      </em>
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <main className="solo-chat" ref={chatRef}>
            {!selected ? (
              <div className="solo-chat-empty">
                <span>SOLO DATE</span>
                <h3>选一位羁绊，约 TA 出去走走。</h3>
                <p>每位羁绊每周最多成功应邀两次。被婉拒后，当天不能再邀请同一个人。</p>
              </div>
            ) : (
              <>
                <header className="solo-chat-head">
                  <div>
                    <strong>{selected.name}</strong>
                    <small>
                      {BOND_LABEL[selectedBond!]} · 亲密度 {selected.intimacy}
                    </small>
                  </div>
                  <span className="solo-chat-status">
                    {selectedBlocked ? '暂不可邀请' : '在线'}
                  </span>
                </header>

                <div
                  className={`solo-messages ${frozenChat ? 'is-frozen' : ''} ${
                    historyLeaving ? 'is-leaving' : ''
                  }`}
                >
                  {historyDivider && (
                    <div className="solo-history-divider">
                      <span />
                      <em>以下为新消息</em>
                      <span />
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`solo-message is-${message.from}`}
                    >
                      {message.from !== 'system' && (
                        <span className="solo-message-avatar">
                          {message.from === 'me' ? '我' : selected.name.slice(0, 1)}
                        </span>
                      )}
                      <p>{message.text}</p>
                    </div>
                  ))}
                  {typing && (
                    <div className="solo-message is-them">
                      <span className="solo-message-avatar">{selected.name.slice(0, 1)}</span>
                      <p className="solo-typing"><i /><i /><i /></p>
                    </div>
                  )}
                </div>

                {phase === 'options' && options.length > 0 && (
                  <div className="solo-options">
                    <div className="solo-options-head">
                      <span>这周想做点什么？</span>
                      <button
                        type="button"
                        className="solo-refresh"
                        onClick={refreshOptions}
                        disabled={refreshed}
                      >
                        {refreshed ? '已刷新' : '换一批'}
                      </button>
                    </div>
                    <div className="solo-option-grid">
                      {options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="solo-option"
                          onClick={() => chooseEvent(option)}
                        >
                          <strong>{option.name}</strong>
                          <small>{soloEventTimeHint(option)}</small>
                          <em>{option.invite}</em>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {phase === 'result' && result && (
                  <footer className="solo-result">
                    {result.kind === 'accepted' ? (
                      <>
                        <span>已排进课表</span>
                        <strong>
                          {soloSlotLabel(result.slot)} · {result.event.name}
                        </strong>
                        <button type="button" className="btn btn-primary" onClick={onClose}>
                          完成
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{result.kind === 'no-slot' ? '时间对不上' : '这次没有约成'}</span>
                        <strong>
                          {result.kind === 'no-slot'
                            ? 'TA 说下周再约，今天先不打扰 TA 了。'
                            : 'TA 今天可能没有空，改天再试试。'}
                        </strong>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                          关闭
                        </button>
                      </>
                    )}
                  </footer>
                )}
              </>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}
