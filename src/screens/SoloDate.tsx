import { useEffect, useState } from 'react'
import { SOLO_PARTNER_STATES, SOLO_EVENT_BY_ID } from '../soloData'
import {
  SOLO_EFFECTS,
  bondOf,
  soloSlotLabel,
} from '../solo'
import type { GameState, SoloInvite } from '../types'
import { consumptionSoloDateCost } from '../consumption'

const BOND_LABEL = {
  lover: '恋人',
  brother: '兄弟',
  sister: '闺蜜',
} as const

interface SoloDateProps {
  state: GameState
  invite: SoloInvite
  suppressed?: boolean
  onFinish: () => void
}

export function SoloDateOverlay({
  state,
  invite,
  suppressed = false,
  onFinish,
}: SoloDateProps) {
  const [dateOpen, setDateOpen] = useState(false)
  const event = SOLO_EVENT_BY_ID[invite.eventId]
  const relation = state.relationships.find((item) => item.id === invite.relationshipId)
  const bond = relation ? bondOf(relation) : invite.bondType
  const partnerName = relation?.name ?? invite.partnerName
  const [partnerState, setPartnerState] = useState(() => {
    const pool = SOLO_PARTNER_STATES[bond]
    return pool[Math.floor(Math.random() * pool.length)]
  })

  useEffect(() => {
    setDateOpen(false)
    const pool = SOLO_PARTNER_STATES[bond]
    setPartnerState(pool[Math.floor(Math.random() * pool.length)])
  }, [invite.id, bond])

  if (suppressed) return null

  if (!event) return null

  return (
    <div className="solo-date-overlay" role="dialog" aria-modal="true" aria-label="单独邀约赴约">
      <div className="solo-date-backdrop" />
      {!dateOpen ? (
        <section className="solo-date-prompt">
          <span className="solo-date-kicker">SOLO DATE / 赴约时间到</span>
          <h2>该去赴约了</h2>
          <p>
            {partnerName} · {event.name}
          </p>
          <strong>{soloSlotLabel(invite.slot)}</strong>
          <button type="button" className="btn btn-primary" onClick={() => setDateOpen(true)}>
            去赴约
            <span className="btn-arrow">→</span>
          </button>
        </section>
      ) : (
        <section className="solo-date-modal">
          <header>
            <span className="solo-date-kicker">SOLO DATE / 约会记录</span>
            <h2>{event.name}</h2>
            <p>
              {BOND_LABEL[bond]} · {partnerName} · {soloSlotLabel(invite.slot)}
            </p>
          </header>
          <div className="solo-date-body">
            <p className="solo-date-copy">{event.description}</p>
            <blockquote>{partnerState}</blockquote>
            <div className="solo-date-effects">
              <span>亲密度 +{SOLO_EFFECTS.intimacy}</span>
              <span>精力 {SOLO_EFFECTS.energy}</span>
              <span>生活费 -{consumptionSoloDateCost(state, invite)}</span>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={onFinish}>
            结束这次约会
            <span className="btn-arrow">→</span>
          </button>
        </section>
      )}
    </div>
  )
}
