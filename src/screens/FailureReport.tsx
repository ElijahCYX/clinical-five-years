import { createPortal } from 'react-dom'
import type { ExamResult, GameState } from '../types'

interface FailureReportProps {
  state: GameState
  results: ExamResult[]
  outstandingCredits: number
  willExpel: boolean
  onAcknowledge: () => void
}

const REPORT_LABELS: Array<[keyof NonNullable<GameState['semesterStats']>, string]> = [
  ['library', '泡图书馆'],
  ['attend', '去上课'],
  ['skip', '翘课'],
  ['sleepIn', '睡懒觉'],
  ['coffee', '喝咖啡'],
  ['selfCare', '高碳日'],
  ['exercise', '运动 / 校园跑'],
  ['social', '组局 / 社交'],
  ['partTime', '兼职'],
  ['research', '科研'],
]

export function FailureReport({
  state,
  results,
  outstandingCredits,
  willExpel,
  onAcknowledge,
}: FailureReportProps) {
  const failed = results.filter((result) => result.score < 60)
  const failedCredits = failed.reduce((sum, result) => sum + result.course.credits, 0)
  const stats = state.semesterStats
  const report: string[] = []

  if (stats.library === 0) {
    report.push('本学期，你一次图书馆都没去过。')
  } else {
    report.push(`本学期你去了 ${stats.library} 次图书馆。`)
  }
  if (stats.attend === 0) {
    report.push('课表上的课，你几乎没有真正坐下来听过。')
  } else if (stats.skip > stats.attend) {
    report.push(`你去上课 ${stats.attend} 次，翘课 ${stats.skip} 次——教室更像一个偶尔路过的地点。`)
  } else {
    report.push(`你去上课 ${stats.attend} 次，翘课 ${stats.skip} 次。`)
  }
  if (stats.sleepIn >= 3) {
    report.push(`你有 ${stats.sleepIn} 次把上午交给了睡懒觉。`)
  }
  if (stats.social + stats.partTime + stats.exercise === 0) {
    report.push('这一学期，你几乎没有把时间花在运动、社交或兼职上。')
  } else {
    report.push(`运动 ${stats.exercise} 次，社交 ${stats.social} 次，兼职 ${stats.partTime} 次。`)
  }
  if (stats.research > 0) {
    report.push(`科研投入 ${stats.research} 次。科研不是课程的替代品，课程才是。`)
  } else {
    report.push('科研投入 0 次。至少在现阶段，先把眼前的课程守住。')
  }
  report.push('大学不会因为你“只是有点累”就暂停考试。它只会把结果放在成绩单上。')

  const content = (
    <div className="failure-report-overlay" role="dialog" aria-modal="true" aria-label="挂科警告">
      <div className="failure-report-backdrop" />
      <section className={`failure-report-card ${willExpel ? 'is-expulsion' : ''}`}>
        <div className="failure-report-flag">!</div>
        <header className="failure-report-head">
          <span className="failure-report-kicker">
            {willExpel ? 'ACADEMIC DISMISSAL / 退学预警' : 'FAILED COURSES / 挂科警告'}
          </span>
          <h2>{willExpel ? '你的学业，已经走到悬崖边。' : '这次成绩单，不能再装作没看见。'}</h2>
          <p>
            {state.player?.name}，{willExpel
              ? '累计未通过学分已经达到退学线。这不是一次普通的补考，而是学校给出的最后处理结果。'
              : '本次成绩单出现了不及格课程。补考不是“重来一次”的按钮，它需要你重新把课程学一遍。'}
          </p>
        </header>

        <div className="failure-report-figures">
          <div>
            <span>本次挂科</span>
            <strong>{failed.length} 门 / {failedCredits} 学分</strong>
          </div>
          <div>
            <span>累计未通过</span>
            <strong>{outstandingCredits} / 20 学分</strong>
          </div>
          <div>
            <span>补考状态</span>
            <strong>{willExpel ? '已触发退学处理' : '进入下一学期补考'}</strong>
          </div>
        </div>

        <div className="failure-report-progress" aria-hidden="true">
          <i style={{ width: `${Math.min(100, (outstandingCredits / 20) * 100)}%` }} />
        </div>

        <div className="failure-report-body">
          <section>
            <h3>本次未通过课程</h3>
            <div className="failure-course-list">
              {failed.map((result) => (
                <div className="failure-course-row" key={result.course.id}>
                  <span>{result.course.name}</span>
                  <small>{result.course.credits} 学分</small>
                  <strong>{result.score} 分</strong>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>本学期行为报告</h3>
            <div className="failure-stat-grid">
              {REPORT_LABELS.map(([key, label]) => (
                <div key={key}>
                  <span>{label}</span>
                  <strong>{stats[key]}</strong>
                </div>
              ))}
            </div>
            <div className="failure-report-prose">
              {report.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>
        </div>

        <footer className="failure-report-footer">
          <p>
            {willExpel
              ? '退学处理不可撤销。你仍然可以回到标题页重新开始，但那会是另一个学生的五年。'
              : '现在还不算太晚。下学期的补考、课表和图书馆，至少还有一次机会被你认真对待。'}
          </p>
          <button
            type="button"
            className={`btn ${willExpel ? 'failure-expel-btn' : 'btn-primary'}`}
            onClick={onAcknowledge}
          >
            {willExpel ? '接受退学处理' : '我知道了，继续'}
            <span className="btn-arrow">→</span>
          </button>
        </footer>
      </section>
    </div>
  )

  return createPortal(content, document.body)
}
