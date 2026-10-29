import type { ClubProjectDef, ClubProjectPhase } from '../clubProjects'
import { projectEffectLine } from '../clubProjects'
import type { ClubProjectState } from '../types'
import { Pill } from '../ui'
import { TIMETABLE_DAYS, TIMETABLE_SLOTS } from '../timetable'

interface ClubProjectModalProps {
  project: ClubProjectDef
  phase: ClubProjectPhase
  projectState: ClubProjectState
  phaseIndex: number
  week: number
  roleLabel?: string
  onChoose: (choiceId: string) => void
  onSkip: () => void
  onCancel: () => void
}

export function ClubProjectModal({
  project,
  phase,
  projectState,
  phaseIndex,
  week,
  roleLabel,
  onChoose,
  onSkip,
  onCancel,
}: ClubProjectModalProps) {
  return (
    <div className="dinner-overlay club-project-overlay" role="dialog" aria-modal="true">
      <div className="dinner-backdrop" onClick={onCancel} />
      <section className="dinner-modal club-project-modal">
        <header className="dinner-head">
          <div>
            <span className="dinner-eyebrow">WEEKLY MEETING / 第 {week} 周例会</span>
            <h2>{project.title}</h2>
            <p>{project.subtitle}</p>
          </div>
          <div className="club-project-stage-mark">
            <span>
              第 {phaseIndex + 1} / {project.stages.length} 阶段
            </span>
            <strong>{phase.title}</strong>
            {roleLabel && <Pill tone="green">{roleLabel}</Pill>}
          </div>
        </header>

        <p className="club-project-story">{phase.description}</p>

        <div className="club-project-meta">
          <div>
            <span>本次</span>
            <strong>参加第 {week} 周例会</strong>
            <small>精力 -5 · 不占用额外自由行动</small>
          </div>
          <div>
            <span>当前累计贡献</span>
            <strong>{projectState.contribution}</strong>
            <small>之前参与过 {projectState.phaseChoices.filter(Boolean).length} / {project.stages.length} 个阶段</small>
          </div>
        </div>

        <div className="club-project-schedule-note">
          <span>已锁定最终活动</span>
          <strong>
            第 {project.eventWeek} 周 ·{' '}
            {project.eventSlots
              .map(
                (slot) =>
                  `${TIMETABLE_DAYS[Math.floor(slot / 3)]}${TIMETABLE_SLOTS[slot % 3]}`,
              )
              .join(' / ')}
          </strong>
          <small>活动无论你参与与否都会如期举办。</small>
        </div>

        <div className="club-project-choices">
          {phase.choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              className="club-project-choice"
              onClick={() => onChoose(choice.id)}
            >
              <span className="club-project-choice-no">0{index + 1}</span>
              <span className="club-project-choice-main">
                <strong>{choice.label}</strong>
                <small>{choice.description}</small>
                <em>{projectEffectLine(choice.effects).join(' · ') || '无额外收益'}</em>
              </span>
              <span className="club-project-choice-contribution">
                贡献 +{choice.contribution}
              </span>
            </button>
          ))}
        </div>

        <footer className="dinner-footer club-project-footer">
          <div>
            <span>不参与本周任务</span>
            <strong>活动仍会继续推进</strong>
            <small>你可以只来听例会，或者直接不接本周任务。</small>
          </div>
          <div className="dinner-actions">
            <button type="button" className="text-btn" onClick={onCancel}>
              先不决定
            </button>
            <button type="button" className="btn btn-ghost" onClick={onSkip}>
              本周不参与
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
