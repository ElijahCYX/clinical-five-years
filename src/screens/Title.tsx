import { useState } from 'react'
import { GAME_SUBTITLE, SCHOOL_NAME } from '../data'
import { Eyebrow, Footer, HeartLineArt, Stamp, TopBar } from '../ui'

interface SaveSlotSummary {
  id: string
  savedAt: number
  playerName: string
  seasonLabel: string
  screenLabel: string
}

interface TitleScreenProps {
  hasSave: boolean
  saveSlots?: SaveSlotSummary[]
  onStart: () => void
  onContinue: () => void
  onLoadSlot?: (id: string) => void
  onDeleteSlot?: (id: string) => void
  onTestClinical?: () => void
}

export function TitleScreen({ hasSave, saveSlots = [], onStart, onContinue, onLoadSlot, onDeleteSlot, onTestClinical }: TitleScreenProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const pendingDeleteSlot = saveSlots.find((slot) => slot.id === pendingDeleteId) ?? null
  return (
    <div className="screen title-screen">
      <div className="shell">
        <TopBar
          right={<span className="topbar-note">本科 · 临床医学</span>}
        />

        <main className="title-grid">
          <section className="title-hero">
            <Eyebrow>CLINICAL FIVE-YEAR · A STUDENT RECORD</Eyebrow>
            <h1 className="title-display">
              <span>临床</span>
              <em>五年</em>
            </h1>
            <p className="title-sub">{GAME_SUBTITLE}</p>
            <p className="title-copy">
              录取通知书上写着“临床医学”四个字。
              你当时并不知道它们的分量，只知道从九月起，
              你要开始学着把一个个具体的人，读成一页页需要被认真对待的病历。
            </p>

            <div className="title-meta">
              <span>21 季主线</span>
              <i />
              <span>8 维天赋</span>
              <i />
              <span>196 学分</span>
              <i />
              <span>多种人生去向</span>
            </div>

            <div className="title-actions">
              <button className="btn btn-primary btn-large" type="button" onClick={onStart}>
                领取学生证，开始五年
                <span className="btn-arrow">→</span>
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={onContinue}
                disabled={!hasSave}
              >
                {hasSave ? '继续上次档案' : '暂无存档'}
              </button>
              {onTestClinical && (
                <button
                  className="btn btn-ghost title-test-btn"
                  type="button"
                  onClick={onTestClinical}
                >
                  测试版：直接体验临床
                </button>
              )}
            </div>

            <div className="title-save-list">
              <div className="title-save-list-head">
                <span>本机存档</span>
                <small>{saveSlots.length > 0 ? `${saveSlots.length} 个` : '暂无'}</small>
              </div>
              {saveSlots.length === 0 ? (
                <p className="title-save-empty">开始五年后会自动出现在这里。</p>
              ) : (
                saveSlots.map((slot) => (
                  <div key={slot.id} className="title-save-row">
                    <button
                      type="button"
                      className="title-save-load"
                      onClick={() => onLoadSlot?.(slot.id)}
                    >
                      <strong>{slot.playerName}</strong>
                      <span>{slot.seasonLabel} · {slot.screenLabel}</span>
                      <small>{slot.savedAt ? new Date(slot.savedAt).toLocaleString('zh-CN', { hour12: false }) : ''}</small>
                    </button>
                    <button
                      type="button"
                      className="title-save-delete"
                      aria-label={`删除 ${slot.playerName} 的存档`}
                      onClick={() => setPendingDeleteId(slot.id)}
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>

            <blockquote className="title-quote">
              “先把今天过完。明天的事，明天再想。”
              <span>—— 一位不愿透露姓名的学长</span>
            </blockquote>
          </section>

          <aside className="enroll-wrap">
            <div className="paper-card enroll-card">
              <span className="tape" aria-hidden="true" />
              <Eyebrow>ENROLLMENT RECORD / 001</Eyebrow>
              <h2 className="enroll-title">新生报到</h2>
              <p className="enroll-school">{SCHOOL_NAME} · 临床医学（五年制）</p>

              <div className="enroll-fields">
                <div>
                  <span>姓名</span>
                  <strong>待填写</strong>
                </div>
                <div>
                  <span>天赋</span>
                  <strong>待分配</strong>
                </div>
                <div>
                  <span>家庭背景</span>
                  <strong>交由命运</strong>
                </div>
                <div>
                  <span>学制</span>
                  <strong>五年 · 二十一季</strong>
                </div>
              </div>

              <p className="enroll-note">
                这是一份虚构的入学档案。时间、金额与人物均为游戏单位。
                请先填写你的学生档案，再领取学生证。
              </p>

              <HeartLineArt />
              <Stamp />
            </div>

            <div className="enroll-caption">
              <span>LIFE IS MORE THAN A SCORE.</span>
              <span>01 / 001</span>
            </div>
          </aside>
        </main>
        {pendingDeleteSlot && (
          <div className="title-delete-backdrop">
            <div className="title-delete-modal">
              <span>删除存档</span>
              <h3>确定删除「{pendingDeleteSlot.playerName}」的存档吗？</h3>
              <p>{pendingDeleteSlot.seasonLabel} · {pendingDeleteSlot.screenLabel}<br />删除后无法恢复。</p>
              <div className="title-delete-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setPendingDeleteId(null)}>保留</button>
                <button type="button" className="btn btn-primary" onClick={() => {
                  if (pendingDeleteId) onDeleteSlot?.(pendingDeleteId)
                  setPendingDeleteId(null)
                }}>确认删除</button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}
