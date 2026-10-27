import { useState } from 'react'
import { MENTOR_LIBRARY, mentorGender, researchStage as researchPhase } from '../mentors'
import { currentWeekKey, stageLabel } from '../mentorMail'
import type { GameEmail, GameState, MentorProfile } from '../types'
import { Bar, Pill, SectionLabel } from '../ui'

interface ResearchHubProps {
  state: GameState
  onComposeMentor: (mentorId: string) => { draft: GameEmail | null; error: string | null }
}

export function ResearchHub({ state, onComposeMentor }: ResearchHubProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    state.mentorProfileId ?? MENTOR_LIBRARY[0]?.id ?? null,
  )
  const [error, setError] = useState<string | null>(null)
  const activeProfile = state.mentorProfileId
    ? MENTOR_LIBRARY.find((mentor) => mentor.id === state.mentorProfileId) ?? null
    : null
  const activeRelation = state.relationships.find((relation) => relation.kind === 'mentor') ?? null
  const selected =
    MENTOR_LIBRARY.find((mentor) => mentor.id === selectedId) ??
    activeProfile ??
    MENTOR_LIBRARY[0]
  const stage = state.researchStage
  const mailUsedThisWeek = state.mailSentWeekKey === currentWeekKey(state)
  const hasActiveApplication = Boolean(state.mentorApplication)
  const canMail = (mentorId: string) =>
    stage === 1 &&
    !state.medicalFamilyMentorId &&
    !hasActiveApplication &&
    !mailUsedThisWeek &&
    !state.failedMentorIds.includes(mentorId)

  const clickMail = (mentor: MentorProfile) => {
    const result = onComposeMentor(mentor.id)
    if (result.error) {
      setError(result.error)
      return
    }
    setError(null)
  }

  return (
    <div className="tab-panel research-hub">
      <div className="research-title-row">
        <div>
          <h2>科研 · 导师名录</h2>
          <p>
            所有导师的教师主页都在这里。先找到你真正想跟随的方向，再决定把第一封自荐信写给谁。
          </p>
        </div>
        <Pill tone={stage >= 4 ? 'green' : stage >= 2 ? 'gold' : 'plain'}>
          阶段 {stage} · {stageLabel(stage)}
        </Pill>
      </div>

      {stage > 1 && activeProfile && (
        <section className="research-active-card">
          <div className="research-active-head">
            <div>
              <span>当前导师</span>
              <h3>
                {activeProfile.alias} <small>{mentorGender(activeProfile)}</small>
              </h3>
              <p>
                {activeProfile.department} · {activeProfile.title} · {activeProfile.field}
              </p>
            </div>
            {activeRelation && (
              <div className="research-active-intimacy">
                <span>导师亲密度</span>
                <strong>{activeRelation.intimacy} / 100</strong>
                <Bar value={activeRelation.intimacy} max={100} thin />
              </div>
            )}
          </div>
          <div className="research-stage-row">
            <span>{stageLabel(stage)}</span>
            {stage === 2 && state.mentorInterview && (
              <strong>面谈：{state.mentorInterview.label}</strong>
            )}
            {stage === 3 && <strong>正在赴约 / 面谈中</strong>}
            {stage === 4 && state.welcomeMailSent && (
              <strong>
                {state.seniorsGenerated ? '课题组已加入 · 前辈已认识' : '等待你阅读欢迎邮件'}
              </strong>
            )}
            {stage === 4 && activeRelation && activeRelation.intimacy < 40 && (
              <small>与导师亲密度达到 40 后，会收到进入实验室的邮件。</small>
            )}
            {stage === 5 && <strong>实验室学习中 · 科研进度尚未开始</strong>}
            {stage === 6 && <strong>科研进度 {state.researchProgress} / 100</strong>}
          </div>
          {stage === 6 && (
            <div className="research-progress-wrap">
              <Bar value={state.researchProgress} max={100} />
              <p>{researchPhase(state.researchProgress).description}</p>
            </div>
          )}
        </section>
      )}

      {error && (
        <div className="research-mail-error">
          {error}
          <button type="button" className="text-btn" onClick={() => setError(null)}>
            知道了
          </button>
        </div>
      )}

      <SectionLabel right={`${MENTOR_LIBRARY.length} 位导师`}>教师个人主页</SectionLabel>
      <div className="mentor-directory-layout">
        <div className="mentor-grid">
          {MENTOR_LIBRARY.map((mentor) => (
            <button
              type="button"
              key={mentor.id}
              className={`mentor-card ${selected?.id === mentor.id ? 'is-selected' : ''} ${
                mentor.id === state.mentorProfileId ? 'is-active-mentor' : ''
              }`}
              onClick={() => {
                setSelectedId(mentor.id)
                setError(null)
              }}
            >
              <MentorPortrait small />
              <span className="mentor-card-main">
                <strong>
                  {mentor.alias}
                  <small>{mentorGender(mentor)}</small>
                </strong>
                <em>{mentor.title}</em>
                <span>{mentor.field}</span>
              </span>
            </button>
          ))}
        </div>

        {selected && (
          <article className="mentor-profile">
            <div className="mentor-profile-top">
              <MentorPortrait />
              <div>
                <span className="mentor-profile-kicker">FACULTY PROFILE</span>
                <h3>
                  {selected.alias}
                  <small>{mentorGender(selected)}</small>
                </h3>
                <p>{selected.department} · {selected.title}</p>
                <p className="mentor-profile-field">{selected.field}</p>
              </div>
            </div>
            <div className="mentor-profile-section">
              <span>研究方向</span>
              <strong>{selected.field}</strong>
            </div>
            <div className="mentor-profile-section">
              <span>代表期刊</span>
              <p>{selected.journals.slice(0, 4).join(' · ')}</p>
            </div>
            <div className="mentor-profile-section">
              <span>当前状态</span>
              {stage === 1 ? (
                <p>
                  {state.medicalFamilyMentorId
                    ? '医学世家已经替你联系了导师，等待导师的邮件。'
                    : selected.id === state.mentorApplication?.mentorId
                      ? '自荐信已发送，等待导师回复。'
                      : state.failedMentorIds.includes(selected.id)
                        ? '这位导师已经婉拒过你的申请。'
                        : mailUsedThisWeek
                          ? '本周已经发过一封导师邮件，下周再试。'
                          : '可以发送自荐邮件。'}
                </p>
              ) : selected.id === state.mentorProfileId ? (
                <p>这是你当前的导师。</p>
              ) : (
                <p>你已经在联系其他导师，暂时不能发送新的自荐信。</p>
              )}
            </div>
            {stage === 1 && (
              <button
                type="button"
                className="btn btn-primary mentor-mail-btn"
                disabled={!canMail(selected.id)}
                onClick={() => clickMail(selected)}
              >
                邮件联系
                <span className="btn-arrow">→</span>
              </button>
            )}
          </article>
        )}
      </div>
    </div>
  )
}

function MentorPortrait({ small = false }: { small?: boolean }) {
  return (
    <div className={`mentor-portrait ${small ? 'is-small' : ''}`} aria-hidden="true">
      <span className="mentor-portrait-head" />
      <span className="mentor-portrait-body" />
    </div>
  )
}
