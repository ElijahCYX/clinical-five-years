import { cetHint } from '../game'
import type { GameState } from '../types'
import { Eyebrow, TopBar } from '../ui'

interface ResultScreenProps {
  state: GameState
  nextLabel: string
  onContinue: () => void
  onTitle?: () => void
}

export function ResultScreen({ state, nextLabel, onContinue, onTitle }: ResultScreenProps) {
  const player = state.player
  if (!player) return null

  const semesterCredits = state.results.reduce((sum, item) => sum + item.course.credits, 0)
  const semesterPoints = state.results.reduce(
    (sum, item) => sum + item.course.credits * item.gpa,
    0,
  )
  const semesterGpa = semesterCredits > 0 ? semesterPoints / semesterCredits : 0
  const cumulativeGpa =
    state.cumulativeCredits > 0 ? state.cumulativePoints / state.cumulativeCredits : 0
  const passed = state.results.every((item) => item.gpa > 0)

  return (
    <div className="screen result-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />

        <main className="result-wrap">
          <div className="paper-card result-sheet">
            <span className="tape" aria-hidden="true" />
            <header className="result-head">
              <div>
                <Eyebrow>SEMESTER REPORT / {state.season.chapterNo}</Eyebrow>
                <h1 className="page-title">学期结算</h1>
                <p className="result-sub">
                  {state.season.seasonLabel} · {state.season.chapterTitle}
                </p>
              </div>
              <div className="result-date">
                <span>归档日期</span>
                <strong>{state.season.seasonLabel}</strong>
              </div>
            </header>

            <div className="result-hero">
              <div>
                <span className="result-kicker">SEMESTER GPA</span>
                <strong className="result-gpa">{semesterGpa.toFixed(2)}</strong>
                <span className="result-gpa-sub">本学期平均绩点</span>
              </div>
              <div className="result-badge">
                <span>{state.results.length > 1 ? '卷面合计' : '卷面总分'}</span>
                <strong>{state.results.reduce((sum, item) => sum + item.score, 0)}</strong>
                <span>{passed ? '全部通过' : '有课程未通过'}</span>
              </div>
            </div>

            <table className="report-table">
              <thead>
                <tr>
                  <th>课程</th>
                  <th>类型</th>
                  <th>学分</th>
                  <th>卷面</th>
                  <th>绩点</th>
                </tr>
              </thead>
              <tbody>
                {state.results.map((result) => (
                  <tr key={result.course.id}>
                    <td>
                      <span className="course-name">
                        {result.course.name}
                        {result.course.makeup && <span className="makeup-tag">补考</span>}
                      </span>
                      <span className="course-sub">
                        记忆力 {result.course.memory} · 悟性 {result.course.comprehension}
                      </span>
                    </td>
                    <td>{result.course.examType}</td>
                    <td>{result.course.credits}</td>
                    <td className={result.score < 60 ? 'score-fail' : ''}>{result.score}</td>
                    <td className="gpa-cell">{result.gpa.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="result-stats">
              <div>
                <span>累计 GPA</span>
                <strong>{cumulativeGpa.toFixed(2)}</strong>
              </div>
              <div>
                <span>已修学分</span>
                <strong>{state.cumulativeCredits}</strong>
              </div>
              <div>
                <span>综合测评</span>
                <strong>{state.composite}</strong>
              </div>
              <div>
                <span>英语进度</span>
                <strong>{state.english}</strong>
                <small className="stat-hint">
                  {cetHint(state.cet4Score, state.cet6Score)}
                </small>
              </div>
            </div>

            <div className="result-footer">
              <div className="result-note">
                <span>导员评语</span>
                <p>
                  {passed
                    ? `${state.season.seasonLabel}顺利结束。别急着松口气，医学生的课表只会越来越满。`
                    : '这学期有课程没过。补考不是重来一遍考试，而是要把这门课重新学一遍。'}
                </p>
              </div>
              <div className="result-actions">
                <button type="button" className="btn btn-primary" onClick={onContinue}>
                  继续：{nextLabel}
                  <span className="btn-arrow">→</span>
                </button>
                <button type="button" className="btn btn-ghost" onClick={onTitle}>
                  回到标题
                </button>
              </div>
            </div>

            {state.examAllNighter && (
              <p className="result-extra">
                本次考试受刷夜影响，卷面分已下调 5%。下一次，早点睡。
              </p>
            )}
            <div className="result-quote">
              “成绩单只是一页纸。真正被记下来的，是你以后怎么对待每一个病人。”
            </div>
          </div>

          <p className="result-footnote">
            当前为可玩初稿：可完整走完大一至大五的「计划 → 周循环 → 考前复习 → 成绩单」流程。
            事件、人物、科研与完整毕业结局仍在后续开发中。
          </p>
        </main>
      </div>
    </div>
  )
}
