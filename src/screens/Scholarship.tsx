import {
  AWARD_LABELS,
  SCHOLARSHIP_COMPOSITE_BENCHMARK,
  bestAward,
} from '../game'
import type { GameState, YearRecord } from '../types'
import { Eyebrow, Pill, TopBar } from '../ui'

interface ScholarshipScreenProps {
  state: GameState
  record: YearRecord | undefined
  onContinue: () => void
  onTitle?: () => void
}

const YEAR_NAMES = ['大一', '大二', '大三', '大四', '大五']

export function ScholarshipScreen({
  state,
  record,
  onContinue,
  onTitle,
}: ScholarshipScreenProps) {
  const player = state.player
  if (!player || !record || !record.score) return null

  const score = record.score
  const prior = state.yearRecords.filter((item) => item.year < record.year)
  const previousAward = bestAward(prior)
  const yearName = YEAR_NAMES[record.year - 1] ?? `第 ${record.year} 学年`
  const awards = record.awards?.length
    ? record.awards
    : record.award
      ? [record.award]
      : []
  const award = awards.includes('national')
    ? 'national'
    : awards.includes('provincial')
      ? 'provincial'
      : awards.includes('school')
        ? 'school'
        : null
  const awardLabel = awards.length > 0
    ? awards.map((item) => AWARD_LABELS[item]).join(' + ')
    : '未获奖'

  return (
    <div className="screen event-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />
        <main className="event-wrap">
          <div className="paper-card event-card scholarship-card">
            <span className="tape" aria-hidden="true" />
            <Eyebrow>SCHOLARSHIP REVIEW / AUTUMN</Eyebrow>
            <div className="event-title-row">
              <div>
                <h1 className="event-title">奖学金评选</h1>
                <p className="event-sub">
                  {yearName}学年 · 秋季评审 · 100 分制
                </p>
              </div>
              <Pill
                tone={
                  award === 'national'
                    ? 'gold'
                    : award === 'provincial'
                      ? 'green'
                      : 'plain'
                }
              >
                {awardLabel}
              </Pill>
            </div>

            <p className="event-lede">
              学院把上一学年的成绩、综测、科研、面试和履历折算成一张百分制表。
              达到分数线只是获得候选资格，最终名额与答辩仍以学院评审为准。
            </p>

            <div className="scholarship-total">
              <div>
                <span>综合得分</span>
                <strong>{score.total.toFixed(1)}</strong>
                <small>/ 100</small>
              </div>
              <div className="scholarship-cutoffs">
                <span>国奖线 80</span>
                <span>省奖线 70</span>
                <span>校奖线 50</span>
              </div>
            </div>

            <div className="scholarship-grid">
              <div>
                <span>成绩 · 40</span>
                <strong>{score.grade.toFixed(1)}</strong>
                <small>学年 GPA {record.gpa.toFixed(2)}</small>
              </div>
              <div>
                <span>综测 · 20</span>
                <strong>{score.composite.toFixed(1)}</strong>
                <small>
                  本年 {record.compositeGain} / 标杆 {SCHOLARSHIP_COMPOSITE_BENCHMARK}（归一 1.0）
                </small>
              </div>
              <div>
                <span>科研 · 10</span>
                <strong>{score.research.toFixed(1)}</strong>
                <small>{record.papers > 0 ? `${record.papers} 篇论文` : '暂无论文产出'}</small>
              </div>
              <div>
                <span>面试 · 20</span>
                <strong>{score.interview.toFixed(1)}</strong>
                <small>
                  建模 {player.attrs.appearance} · 人际 {player.attrs.social}
                </small>
              </div>
              <div>
                <span>履历 · 10</span>
                <strong>{score.legacy.toFixed(1)}</strong>
                <small>
                  {previousAward
                    ? `上一项最高：${AWARD_LABELS[previousAward]}`
                    : '此前无奖学金'}
                </small>
              </div>
            </div>

            <div className={`scholarship-award ${award ? `is-${award}` : ''}`}>
              <div>
                <span>评审结果</span>
                <strong>{awardLabel}</strong>
              </div>
              <p>
                {awards.includes('national') &&
                  '总分达到国奖线，且没有挂科记录。校奖与国奖可以同时获得，奖金会一起到账。'}
                {!awards.includes('national') && awards.includes('provincial') &&
                  '总分达到省奖线，且本学年没有挂科。校奖与省奖可以同时获得，省奖与国奖只能取其一。'}
                {!awards.includes('national') && !awards.includes('provincial') && awards.includes('school') &&
                  '总分超过 50 分校奖线。校级奖学金不影响后续国奖/省奖的履历效应。'}
                {awards.length === 0 &&
                  '本次未超过 50 分校奖线。先把成绩和综测补起来，明年还有机会。'}
                {record.score.reward > 0 && (
                  <em className="scholarship-reward">
                    奖金 ¥{record.score.reward.toLocaleString()} 已计入生活费
                  </em>
                )}
              </p>
              {(state.everFailed || record.failed) && (
                <p className="scholarship-warning">
                  {state.everFailed && '存在挂科记录，国奖资格已被永久锁定。'}
                  {record.failed && '本学年有挂科，省奖资格本年取消；校奖不受影响。'}
                </p>
              )}
            </div>

            <p className="waiting-note">
              <span className="waiting-tag">等待开发</span>
              名额分配、学院答辩、材料审核、科研论文认定、学生任职与社团职务
            </p>

            <div className="event-actions">
              <button type="button" className="btn btn-primary" onClick={onContinue}>
                继续学期计划
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
