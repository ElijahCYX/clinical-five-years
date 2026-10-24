import { useState } from 'react'
import { OPENING_TALENTS, TALENT_BY_ID } from '../data'
import type { GameState, OpeningTalentId } from '../types'
import { Eyebrow, Pill, SectionLabel, TopBar } from '../ui'

interface TalentSelectScreenProps {
  state: GameState
  onConfirm: (talent: OpeningTalentId | null) => void
  onBack?: () => void
}

const ACTIVE_TALENTS = OPENING_TALENTS.filter((talent) => talent.implemented)

function sampleThree(): OpeningTalentId[] {
  const pool = ACTIVE_TALENTS.map((talent) => talent.id)
  const picked: OpeningTalentId[] = []
  while (picked.length < 3 && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(index, 1)[0])
  }
  return picked
}

function refreshOne(current: OpeningTalentId[], index: number): OpeningTalentId[] {
  const used = new Set(current)
  const unused = ACTIVE_TALENTS.map((talent) => talent.id).filter(
    (id) => !used.has(id) || id === current[index],
  )
  const alternatives = unused.filter((id) => id !== current[index])
  if (alternatives.length === 0) return current
  const next = [...current]
  next[index] = alternatives[Math.floor(Math.random() * alternatives.length)]
  return next
}

export function TalentSelectScreen({
  state,
  onConfirm,
  onBack,
}: TalentSelectScreenProps) {
  const player = state.player
  const aptitude = player ? TALENT_BY_ID[player.talent] : null
  const isPlain = player?.talent === 'plain'
  const [slots, setSlots] = useState<OpeningTalentId[]>(() =>
    isPlain ? [] : sampleThree(),
  )
  const [refreshed, setRefreshed] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])
  const [selected, setSelected] = useState<OpeningTalentId | null>(null)

  if (!player) return null

  const refresh = (index: number) => {
    if (refreshed[index]) return
    const old = slots[index]
    const next = refreshOne(slots, index)
    setSlots(next)
    if (selected === old) setSelected(null)
    setRefreshed((current) => current.map((item, i) => (i === index ? true : item)) as [
      boolean,
      boolean,
      boolean,
    ])
  }

  return (
    <div className="screen talent-select-screen">
      <div className="shell">
        <TopBar
          onTitle={onBack}
          right={
            <button className="text-btn" type="button" onClick={onBack}>
              返回标题
            </button>
          }
        />

        <header className="talent-select-head">
          <Eyebrow>OPENING TALENT / BEFORE DAY ONE</Eyebrow>
          <h1 className="page-title">
            {isPlain ? '平庸者的开局' : '挑一个开局天赋'}
          </h1>
          <p className="page-lede">
            {isPlain
              ? '你以「平庸」的资质走进临江大学。学校把所有天赋摆在你面前，然后礼貌地告诉你：看看就好。'
              : `你的资质是「${aptitude?.name ?? '未知'}」。三个天赋任选其一，每个天赋下面各有一次刷新机会。选完，五年正式开始。`}
          </p>
        </header>

        {isPlain ? (
          <>
            <div className="talent-plain-note">
              因为你平庸的资质，你无法选择开局天赋。别灰心——平庸只是没有外挂，不是没有结局。
            </div>
            <section className="opening-talent-section">
              <SectionLabel right="全部 12 个">天赋图鉴 / 只可远观</SectionLabel>
              <div className="opening-talent-grid">
                {OPENING_TALENTS.map((talent) => (
                  <div
                    className={`opening-talent-card is-locked ${
                      talent.implemented ? '' : 'is-proposed'
                    }`}
                    key={talent.id}
                  >
                    <div className="opening-talent-top">
                      <span>{talent.en}</span>
                      {!talent.implemented && <Pill>候选 · 待确认</Pill>}
                    </div>
                    <h3>{talent.name}</h3>
                    <p>{talent.desc}</p>
                    <strong>{talent.effectText}</strong>
                    <span className="talent-locked-mark">不可选择</span>
                  </div>
                ))}
              </div>
            </section>
            <div className="talent-select-footer">
              <p>接受平庸，也是一种天赋。</p>
              <button type="button" className="btn btn-primary" onClick={() => onConfirm(null)}>
                接受平庸，开始五年
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="opening-talent-grid opening-talent-grid-three">
              {slots.map((id, index) => {
                const talent = OPENING_TALENTS.find((item) => item.id === id)
                return (
                  <div
                    className={`opening-talent-card ${selected === id ? 'is-selected' : ''}`}
                    key={`${id}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') setSelected(id)
                    }}
                  >
                    <div className="opening-talent-top">
                      <span>{talent?.en}</span>
                    </div>
                    <h3>{talent?.name}</h3>
                    <p>{talent?.desc}</p>
                    <strong>{talent?.effectText}</strong>
                    <span className="opening-talent-pick">
                      {selected === id ? '已选择' : '点选'}
                    </span>
                    <button
                      type="button"
                      className="talent-refresh-btn"
                      onClick={(event) => {
                        event.stopPropagation()
                        refresh(index)
                      }}
                      disabled={refreshed[index]}
                    >
                      {refreshed[index] ? '本卡已刷新' : '刷新这张'}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="talent-select-footer">
              <p>每个刷新按钮只有一次点击机会，选完不能反悔。</p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!selected}
                onClick={() => selected && onConfirm(selected)}
              >
                就它了，开始五年
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
