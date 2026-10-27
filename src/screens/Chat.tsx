import { useEffect, useRef, useState } from 'react'
import type { BondType, GameState, GossipRecord, Relationship, SoloChatRecord } from '../types'
import { bondOf, soloContacts, soloSlotLabel } from '../solo'
import { SEASONS } from '../data'
import { currentWeekKey } from '../social'
import { SectionLabel } from '../ui'

export interface ChatLaunch {
  relationshipId: string
  token: number
  promptNickname: boolean
}

interface ChatScreenProps {
  state: GameState
  focus: ChatLaunch | null
  onFocusConsumed: () => void
  onOpenSoloInvite?: () => void
  onAskGossip: (relationshipId: string) => void
  onBondNicknameChange: (relationshipId: string, nickname: string) => void
  onBondNicknameDisplayChange: (relationshipId: string, enabled: boolean) => void
}

const BOND_LABEL: Record<BondType, string> = {
  lover: '恋人',
  brother: '兄弟',
  sister: '闺蜜',
}

const NICKNAME_OPTIONS: Record<BondType, [string, string, string]> = {
  lover: ['宝宝', '亲爱的', '乖乖'],
  brother: ['老铁', '哥哥', '憨憨'],
  sister: ['宝子', '姐妹', '老婆'],
}

type TimelineEntry =
  | {
      kind: 'solo'
      key: string
      order: number
      atMs: number
      timeLabel: string
      record: SoloChatRecord
    }
  | {
      kind: 'gossip'
      key: string
      order: number
      atMs: number
      timeLabel: string
      record: GossipRecord
    }
  | {
      kind: 'nickname'
      key: string
      order: number
      atMs: number
      timeLabel: string
      text: string
    }

function parseWeekKey(weekKey: string, state: GameState) {
  const match = weekKey.match(/^(.*)-w(\d+)$/)
  const seasonIndex = match
    ? SEASONS.findIndex((season) => season.id === match[1])
    : -1
  return {
    seasonIndex: seasonIndex >= 0 ? seasonIndex : state.seasonIndex,
    week: match ? Number(match[2]) : state.week,
  }
}

function slotOrder(seasonIndex: number, week: number, weekSlot: number): number {
  return seasonIndex * 84 + (week - 1) * 21 + weekSlot
}

function chatTimeLabel(week: number, weekSlot: number): string {
  return `第 ${week} 周 · ${soloSlotLabel(weekSlot)}`
}

export function ChatScreen({
  state,
  focus,
  onFocusConsumed,
  onOpenSoloInvite,
  onAskGossip,
  onBondNicknameChange,
  onBondNicknameDisplayChange,
}: ChatScreenProps) {
  const bonds = soloContacts(state)
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return focus?.relationshipId ?? bonds[0]?.id ?? null
  })
  const [promptOpen, setPromptOpen] = useState(false)
  const [promptTyping, setPromptTyping] = useState(false)
  const [promptReady, setPromptReady] = useState(false)
  const [promptRelationshipId, setPromptRelationshipId] = useState<string | null>(null)
  const [customNickname, setCustomNickname] = useState('')
  const [nicknameError, setNicknameError] = useState<string | null>(null)
  const [nicknamePanelOpen, setNicknamePanelOpen] = useState(false)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  const selected = bonds.find((relation) => relation.id === selectedId) ?? null
  const selectedBond = selected ? bondOf(selected) : ('lover' as BondType)
  const selectedRecords = state.soloChatRecords.filter(
    (record) => record.relationshipId === selected?.id,
  )
  const gossipRecords = (state.gossipRecords ?? []).filter(
    (record) => record.partnerId === selected?.id,
  )
  const gossipAsked = Boolean(
    selected && state.gossipAsked?.[selected.id] === currentWeekKey(state),
  )

  const timeline: TimelineEntry[] = []
  for (const record of selectedRecords) {
    const parsed = parseWeekKey(record.weekKey, state)
    const seasonIndex = record.seasonIndex ?? parsed.seasonIndex
    const week = record.week ?? parsed.week
    const weekSlot = record.attemptSlot
    timeline.push({
      kind: 'solo',
      key: `solo-${record.id}`,
      order: slotOrder(seasonIndex, week, weekSlot),
      atMs: record.atMs ?? 0,
      timeLabel: chatTimeLabel(week, weekSlot),
      record,
    })
  }
  for (const record of gossipRecords) {
    const parsed = parseWeekKey(record.weekKey, state)
    const seasonIndex = record.seasonIndex ?? parsed.seasonIndex
    const week = record.week ?? parsed.week
    const hasExactTime = typeof record.weekSlot === 'number'
    const weekSlot = record.weekSlot ?? 0
    timeline.push({
      kind: 'gossip',
      key: `gossip-${record.id}`,
      // Old records without a stored slot are placed at the start of their
      // recorded week and clearly labelled; never pretend they happened now.
      order: slotOrder(seasonIndex, week, weekSlot),
      atMs: record.atMs ?? 0,
      timeLabel: record.timeLabel ?? (hasExactTime
        ? chatTimeLabel(week, weekSlot)
        : `第 ${week} 周 · 时间未记录`),
      record,
    })
  }
  if (selected?.bondNicknameAnnouncement) {
    const at = selected.bondNicknameAnnouncementAt
    const seasonIndex = at?.seasonIndex ?? state.seasonIndex
    const week = at?.week ?? state.week
    const weekSlot = at?.weekSlot ?? state.weekSlot
    timeline.push({
      kind: 'nickname',
      key: `nickname-${selected.id}-${selected.bondNickname}`,
      order: slotOrder(seasonIndex, week, weekSlot),
      atMs: at?.atMs ?? 0,
      timeLabel: chatTimeLabel(week, weekSlot),
      text: selected.bondNicknameAnnouncement,
    })
  }
  timeline.sort((a, b) => a.order - b.order || a.atMs - b.atMs)

  useEffect(() => {
    const element = messagesRef.current
    if (!element) return
    element.scrollTop = element.scrollHeight
  }, [selected?.id, timeline.length])

  const startNicknamePrompt = (relationshipId: string) => {
    clearTimers()
    setPromptRelationshipId(relationshipId)
    setPromptOpen(true)
    setPromptTyping(true)
    setPromptReady(false)
    setCustomNickname('')
    setNicknameError(null)
    timers.current.push(
      window.setTimeout(() => setPromptTyping(false), 760),
      window.setTimeout(() => setPromptReady(true), 1450),
    )
  }

  useEffect(() => {
    if (!focus) return
    const relation = state.relationships.find((item) => item.id === focus.relationshipId)
    if (relation) {
      setSelectedId(focus.relationshipId)
      if (focus.promptNickname && !relation.bondNickname) {
        startNicknamePrompt(focus.relationshipId)
      }
    }
    onFocusConsumed()
    // The parent clears the launch after the chat screen has consumed it, so
    // this effect is keyed by the token rather than by the focus object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.token])

  useEffect(() => {
    if (selectedId && bonds.some((relation) => relation.id === selectedId)) return
    setSelectedId(bonds[0]?.id ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bonds.map((relation) => relation.id).join('|')])

  const openNicknamePrompt = () => {
    if (!selected) return
    setNicknamePanelOpen(false)
    startNicknamePrompt(selected.id)
  }

  const confirmNickname = (nickname: string) => {
    if (!selected) return
    const clean = nickname.trim().slice(0, 12)
    if (!clean) {
      setNicknameError('先写下一个称呼吧。')
      return
    }
    onBondNicknameChange(selected.id, clean)
    setPromptOpen(false)
    setPromptRelationshipId(null)
    setNicknamePanelOpen(false)
    setNicknameError(null)
  }

  const toggleNickname = () => {
    if (!selected?.bondNickname) return
    onBondNicknameDisplayChange(
      selected.id,
      selected.bondNicknameEnabled === false,
    )
  }

  const showPrompt = Boolean(selected && promptOpen && promptRelationshipId === selected.id)
  const nicknameEnabled = selected?.bondNicknameEnabled !== false
  const displayName = selected?.name ?? ''

  return (
    <div className="tab-panel chat-panel">
      <SectionLabel right={`${bonds.length} 段羁绊`}>聊天</SectionLabel>
      <div className="chat-shell">
        <aside className="solo-contacts chat-contacts">
          <div className="solo-contacts-head">
            <span>羁绊聊天</span>
            <small>{bonds.length} 位</small>
          </div>
          <div className="solo-contact-list">
            {bonds.length === 0 && (
              <p className="solo-empty">还没有恋人、兄弟或闺蜜羁绊。</p>
            )}
            {bonds.map((relation) => {
              const latest = state.soloChatRecords
                .filter((record) => record.relationshipId === relation.id)
                .sort((a, b) => b.weekKey.localeCompare(a.weekKey) || b.attemptSlot - a.attemptSlot)[0]
              return (
                <button
                  key={relation.id}
                  type="button"
                  className={`solo-contact ${selectedId === relation.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedId(relation.id)
                    setNicknamePanelOpen(false)
                    setPromptOpen(false)
                  }}
                >
                  <span className="solo-avatar">{relation.name.slice(0, 1)}</span>
                  <span className="solo-contact-copy">
                    <strong>{relation.name}</strong>
                    <small>
                      {BOND_LABEL[bondOf(relation)]} · 亲密度 {relation.intimacy}
                      {relation.bondNickname && relation.bondNicknameEnabled === false
                        ? ' · 本名显示'
                        : ''}
                    </small>
                    <em>
                      {latest
                        ? latest.chat[latest.chat.length - 1]?.text ?? '开始聊天'
                        : '还没有聊过天'}
                    </em>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <main className="solo-chat chat-main">
          {!selected ? (
            <div className="solo-chat-empty">
              <span>CHAT / 聊天</span>
              <h3>先建立一段羁绊吧。</h3>
              <p>在「TA 是谁」里和亲密度足够的人建立恋人、兄弟或闺蜜关系，聊天会常驻在这里。</p>
            </div>
          ) : (
            <>
              <header className="solo-chat-head chat-head">
                <div>
                  <strong>{displayName}</strong>
                  <small>
                    {BOND_LABEL[selectedBond]} · 亲密度 {selected.intimacy}
                  </small>
                </div>
                <div className="chat-head-actions">
                  {onOpenSoloInvite && (
                    <button
                      type="button"
                      className="chat-solo-invite-btn"
                      onClick={onOpenSoloInvite}
                    >
                      单独邀约
                    </button>
                  )}
                  <button
                    type="button"
                    className="chat-gossip-btn"
                    disabled={gossipAsked}
                    onClick={() => onAskGossip(selected.id)}
                  >
                    {gossipAsked ? '本周已问' : '问八卦'}
                  </button>
                  <button
                    type="button"
                    className="chat-nickname-trigger"
                    onClick={() => {
                      if (selected.bondNickname) {
                        setNicknamePanelOpen((open) => !open)
                      } else {
                        openNicknamePrompt()
                      }
                    }}
                  >
                    {selected.bondNickname
                      ? nicknameEnabled
                        ? `代称 · ${selected.bondNickname}`
                        : `代称 · ${selected.bondNickname}（已关闭）`
                      : '设置代称'}
                  </button>
                </div>
              </header>

              {nicknamePanelOpen && (
                <div className="chat-nickname-panel">
                  <div>
                    <span>在聊天和关系页中显示</span>
                    <strong>
                      {selected.bondNickname
                        ? nicknameEnabled
                          ? selected.bondNickname
                          : `${selected.bondOriginalName ?? selected.name}（本名）`
                        : '尚未设置代称'}
                    </strong>
                  </div>
                  <div className="chat-nickname-panel-actions">
                    {selected.bondNickname && (
                      <button type="button" className="text-btn" onClick={toggleNickname}>
                        {nicknameEnabled ? '改用本名' : '使用代称'}
                      </button>
                    )}
                    <button type="button" className="text-btn" onClick={openNicknamePrompt}>
                      {selected.bondNickname ? '修改代称' : '设置代称'}
                    </button>
                  </div>
                </div>
              )}

              <div className="solo-messages chat-messages" ref={messagesRef}>
                {timeline.length === 0 && !showPrompt && (
                  <div className="chat-empty-note">
                    <span>还没有聊天记录</span>
                    <p>去本周安排里发起一次单独邀约，之后这里会留下你们的聊天。</p>
                  </div>
                )}

                {timeline.map((entry) => (
                  <div className="chat-record chat-timeline-entry" key={entry.key}>
                    <div className="solo-history-time">{entry.timeLabel}</div>
                    {entry.kind === 'solo' &&
                      entry.record.chat.map((line, index) => (
                        <div
                          className={`solo-message is-${line.from}`}
                          key={`${entry.record.id}-${index}`}
                        >
                          {line.from !== 'system' && (
                            <span className="solo-message-avatar">
                              {line.from === 'me' ? '我' : displayName.slice(0, 1)}
                            </span>
                          )}
                          <p>{line.text}</p>
                        </div>
                      ))}
                    {entry.kind === 'gossip' && (
                      <>
                        <div className="solo-message is-them chat-gossip-message">
                          <span className="solo-message-avatar">{displayName.slice(0, 1)}</span>
                          <p>{entry.record.text}</p>
                        </div>
                        {entry.record.reply && (
                          <div className="solo-message is-me chat-gossip-reply">
                            <span className="solo-message-avatar">我</span>
                            <p>{entry.record.reply}</p>
                          </div>
                        )}
                      </>
                    )}
                    {entry.kind === 'nickname' && (
                      <div className="solo-message is-me chat-player-announcement">
                        <span className="solo-message-avatar">我</span>
                        <p>{entry.text}</p>
                      </div>
                    )}
                  </div>
                ))}

                {showPrompt && (
                  <>
                    {promptTyping ? (
                      <div className="solo-message is-them">
                        <span className="solo-message-avatar">{displayName.slice(0, 1)}</span>
                        <p className="solo-typing"><i /><i /><i /></p>
                      </div>
                    ) : (
                      <div className="solo-message is-them chat-nickname-message">
                        <span className="solo-message-avatar">{displayName.slice(0, 1)}</span>
                        <p>你……想怎么称呼我呢？</p>
                      </div>
                    )}
                    {promptReady && (
                      <div className="chat-nickname-picker">
                        <span className="chat-nickname-kicker">TA 在等你的回答</span>
                        <div className="chat-nickname-grid">
                          {NICKNAME_OPTIONS[selectedBond].map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="solo-option chat-nickname-option"
                              onClick={() => confirmNickname(option)}
                            >
                              <strong>{option}</strong>
                              <small>用这个称呼</small>
                            </button>
                          ))}
                          <div className="solo-option chat-nickname-custom">
                            <span>自定义</span>
                            <input
                              value={customNickname}
                              maxLength={12}
                              placeholder="写一个称呼"
                              onChange={(event) => {
                                setCustomNickname(event.target.value)
                                setNicknameError(null)
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') confirmNickname(customNickname)
                              }}
                            />
                            <button
                              type="button"
                              disabled={!customNickname.trim()}
                              onClick={() => confirmNickname(customNickname)}
                            >
                              确认
                            </button>
                          </div>
                        </div>
                        {nicknameError && <p className="chat-nickname-error">{nicknameError}</p>}
                        <button
                          type="button"
                          className="chat-nickname-skip"
                          onClick={() => {
                            setPromptOpen(false)
                            setPromptRelationshipId(null)
                            setNicknameError(null)
                          }}
                        >
                          先不设置，以后再说
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
