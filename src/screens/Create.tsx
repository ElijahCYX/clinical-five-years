import { useMemo, useState } from 'react'
import { ATTRS, BACKGROUNDS, TALENTS } from '../data'
import { archetypeFor, evenAllocation, randomAllocation, totalPoints } from '../game'
import { randomCharacterName } from '../names'
import type {
  AttrKey,
  BackgroundId,
  Gender,
  Player,
  SexualOrientation,
  TalentId,
} from '../types'
import { Eyebrow, Footer, SectionLabel, Stamp, TopBar } from '../ui'

interface CreateScreenProps {
  initialPlayer?: Player
  onBack: () => void
  onConfirm: (player: Player) => void
}

export function CreateScreen({ initialPlayer, onBack, onConfirm }: CreateScreenProps) {
  const [talentId, setTalentId] = useState<TalentId>(initialPlayer?.talent ?? 'bright')
  const [attrs, setAttrs] = useState<Record<AttrKey, number>>(
    initialPlayer?.attrs ?? evenAllocation(initialPlayer?.talent ?? 'bright'),
  )
  const [name, setName] = useState(initialPlayer?.name ?? '')
  const [gender, setGender] = useState<Gender>(initialPlayer?.gender ?? '女')
  const [orientation, setOrientation] = useState<SexualOrientation>(
    initialPlayer?.orientation ?? 'heterosexual',
  )
  const [background, setBackground] = useState<BackgroundId>(
    initialPlayer?.background ?? 'ordinary',
  )

  const talent = TALENTS.find((item) => item.id === talentId) ?? TALENTS[1]
  const used = totalPoints(attrs)
  const remaining = talent.points - used
  const archetype = useMemo(() => archetypeFor(attrs), [attrs])

  const selectTalent = (id: TalentId) => {
    setTalentId(id)
    setAttrs(evenAllocation(id))
  }

  const changeAttr = (key: AttrKey, delta: number) => {
    setAttrs((current) => {
      const nextValue = current[key] + delta
      if (nextValue < 2 || nextValue > 10) return current
      if (delta > 0 && remaining <= 0) return current
      return { ...current, [key]: nextValue }
    })
  }

  const handleConfirm = () => {
    if (remaining !== 0) return
    onConfirm({
      name: name.trim() || '小林',
      gender,
      orientation,
      background,
      talent: talentId,
      attrs,
      archiveTitle: archetype,
    })
  }

  let lastGroup = ''

  return (
    <div className="screen create-screen">
      <div className="shell">
        <TopBar
          onTitle={onBack}
          right={
            <button className="text-btn" type="button" onClick={onBack}>
              ← 返回标题
            </button>
          }
        />

        <header className="create-head">
          <Eyebrow>ENROLLMENT RECORD / 001</Eyebrow>
          <h1 className="page-title">新生报到</h1>
          <p className="page-lede">
            在开始之前，请先决定你带着什么来到这里。
            天赋决定起点，不决定终点；这五年里，你会慢慢知道自己的长处与短板。
          </p>
        </header>

        <div className="create-grid">
          <main className="create-main">
            <section>
              <SectionLabel right="难度即天赋">01 / 天赋档位</SectionLabel>
              <div className="talent-grid">
                {TALENTS.map((item) => {
                  const selected = item.id === talentId
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`talent-card ${selected ? 'is-selected' : ''}`}
                      onClick={() => selectTalent(item.id)}
                    >
                      <span className="talent-spark">{item.label}</span>
                      <span className="talent-points">{item.points}</span>
                      <span className="talent-name">{item.name}</span>
                      <span className="talent-blurb">{item.blurb}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="attr-section">
              <SectionLabel
                right={
                  <span className={remaining === 0 ? 'points-done' : 'points-left'}>
                    剩余 {remaining} / {talent.points}
                  </span>
                }
              >
                02 / 属性分配
              </SectionLabel>

              <div className="attr-groups">
                {ATTRS.map((attr) => {
                  const showGroup = attr.group !== lastGroup
                  lastGroup = attr.group
                  const value = attrs[attr.key]
                  const canAdd = remaining > 0 && value < 10
                  const canSub = value > 2
                  return (
                    <div key={attr.key}>
                      {showGroup && <div className="attr-group-label">{attr.group}</div>}
                      <div className="attr-row">
                        <div className="attr-identity">
                          <span className="attr-name">{attr.name}</span>
                          <span className="attr-en">{attr.en}</span>
                          <span className="attr-blurb">{attr.blurb}</span>
                        </div>
                        <div className="segments" aria-hidden="true">
                          {Array.from({ length: 10 }, (_, index) => (
                            <span
                              key={index}
                              className={`segment ${index < value ? 'segment-on' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="attr-value">{value}</span>
                        <div className="stepper">
                          <button
                            type="button"
                            className="step-btn"
                            onClick={() => changeAttr(attr.key, -1)}
                            disabled={!canSub}
                            aria-label={`${attr.name} 减少`}
                          >
                            −
                          </button>
                          <button
                            type="button"
                            className="step-btn"
                            onClick={() => changeAttr(attr.key, 1)}
                            disabled={!canAdd}
                            aria-label={`${attr.name} 增加`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="attr-tools">
                <p>
                  每项 2–10 点，共 {talent.points} 点；必须全部分配完才能领取学生证。
                </p>
                <div>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setAttrs(randomAllocation(talentId))}
                  >
                    随机分配
                  </button>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setAttrs(evenAllocation(talentId))}
                  >
                    重置
                  </button>
                </div>
              </div>
            </section>
          </main>

          <aside className="create-aside">
            <div className="id-preview">
              <div className="id-preview-top">
                <span className="id-en">STUDENT IDENTIFICATION</span>
              </div>
              <div className="id-name">{name.trim() || '你的名字'}</div>
              <div className="id-sub">临床医学 · 五年制</div>
              <div className="id-divider" />
              <div className="id-meta-row">
                <span>天赋</span>
                <strong>{talent.name}</strong>
              </div>
              <div className="id-meta-row">
                <span>家庭背景</span>
                <strong>{BACKGROUNDS.find((item) => item.id === background)?.name}</strong>
              </div>
              <div className="id-meta-row">
                <span>入学档案称号</span>
                <strong className="id-archetype">{archetype}</strong>
              </div>
              <Stamp text="漸江大學醫學院" sub="新生档案" />
            </div>

            <section className="basic-info">
              <SectionLabel>03 / 基本信息</SectionLabel>
              <label className="field">
                <span>你的名字</span>
                <div className="name-input-row">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="留空也可以，故事会给你一个称呼"
                    maxLength={12}
                  />
                  <button
                    type="button"
                    className="name-random-btn"
                    onClick={() => {
                      setName(randomCharacterName())
                      setGender(Math.random() < 0.5 ? '女' : '男')
                      setOrientation(
                        (['heterosexual', 'homosexual', 'bisexual'] as SexualOrientation[])[
                          Math.floor(Math.random() * 3)
                        ],
                      )
                      setBackground(
                        BACKGROUNDS[
                          Math.floor(Math.random() * BACKGROUNDS.length)
                        ].id,
                      )
                    }}
                  >
                    随机生成
                  </button>
                </div>
              </label>

              <div className="field">
                <span>性别</span>
                <div className="segmented">
                  {(['女', '男'] as Gender[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={gender === item ? 'is-active' : ''}
                      onClick={() => setGender(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span>性取向</span>
                <div className="segmented">
                  {(
                    [
                      ['heterosexual', '异性恋'],
                      ['homosexual', '同性恋'],
                      ['bisexual', '双性恋'],
                    ] as Array<[SexualOrientation, string]>
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={orientation === key ? 'is-active' : ''}
                      onClick={() => setOrientation(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span>家庭背景</span>
                <div className="background-grid">
                  {BACKGROUNDS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`background-card ${background === item.id ? 'is-active' : ''}`}
                      onClick={() => setBackground(item.id)}
                    >
                      <strong>{item.name}</strong>
                      <small>每月 {item.money}</small>
                    </button>
                  ))}
                </div>
                <p className="field-note">
                  {BACKGROUNDS.find((item) => item.id === background)?.blurb}
                </p>
              </div>
            </section>

            <div className="confirm-box">
              <div className="confirm-status">
                <span>{remaining === 0 ? '属性分配完成' : `还有 ${remaining} 点未分配`}</span>
                <span className={remaining === 0 ? 'status-ok' : 'status-wait'}>
                  {used} / {talent.points}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-full"
                disabled={remaining !== 0}
                onClick={handleConfirm}
              >
                领取学生证，开始五年
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </aside>
        </div>

        <Footer />
      </div>
    </div>
  )
}
