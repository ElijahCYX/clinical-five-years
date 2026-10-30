import { BACKGROUND_BY_ID } from '../data'
import type { GameState, YearRecord } from '../types'
import { Eyebrow, Stamp, TopBar } from '../ui'
import { ORG_BY_ID } from '../organizations'

interface YearEndScreenProps {
  state: GameState
  year: number
  onContinue?: () => void
  onRestart: () => void
  onTitle: () => void
}

const YEAR_NAMES = ['大一', '大二', '大三', '大四', '大五']
const ATTR_LABELS: Array<[string, string]> = [
  ['memory', '记忆力'],
  ['comprehension', '悟性'],
  ['dexterity', '操作'],
  ['social', '人际'],
  ['appearance', '建模'],
  ['constitution', '体质'],
  ['resilience', '抗压'],
]

function roleLabel(role: string): string {
  return role === 'president' ? '负责人' : role === 'officer' ? '干事' : '成员'
}

function yearRecordFor(state: GameState, year: number): {
  record: YearRecord | null
  previous: YearRecord | null
} {
  const record = state.yearRecords.find((item) => item.year === year) ?? null
  const previous =
    state.yearRecords
      .filter((item) => item.year < year)
      .sort((a, b) => b.year - a.year)[0] ?? null
  return { record, previous }
}

export function YearEndScreen({
  state,
  year,
  onContinue,
  onRestart,
  onTitle,
}: YearEndScreenProps) {
  const player = state.player
  if (!player) return null
  const yearName = YEAR_NAMES[year - 1] ?? `第 ${year} 学年`
  const { record, previous } = yearRecordFor(state, year)
  const stats = record?.careerStats ?? state.careerStats
  const previousStats = previous?.careerStats
  const delta = (key: keyof typeof stats): number =>
    Math.max(0, (stats[key] ?? 0) - (previousStats?.[key] ?? 0))
  const credits = record
    ? record.cumulativeCredits - (previous?.cumulativeCredits ?? 0)
    : state.cumulativeCredits
  const cumulativeGpa =
    state.cumulativeCredits > 0
      ? state.cumulativePoints / state.cumulativeCredits
      : 0
  const gpa = record?.gpa ?? cumulativeGpa
  const bonds = state.relationships.filter(
    (relation) => relation.partner || relation.bondType,
  ).length
  const lovers = state.relationships.filter((relation) => relation.partner).length
  const closeFriends = state.relationships.filter(
    (relation) =>
      relation.kind !== 'mentor' &&
      relation.kind !== 'counselor' &&
      relation.intimacy >= 60,
  ).length
  const library = delta('library')
  const attend = delta('attend')
  const exercise = delta('exercise') + delta('campusRun')
  const clubActivities = delta('club')
  const social = delta('social') + delta('date') + delta('dinner')
  const research = delta('research')
  const partTime = delta('partTime')
  const coffee = delta('coffee')
  const selfCare = delta('selfCare')
  const clubText =
    state.clubMemberships.length > 0
      ? state.clubMemberships
          .map((membership) => {
            const org = ORG_BY_ID[membership.orgId]
            return `${org?.name ?? membership.orgId}（${roleLabel(membership.role)}）`
          })
          .join('、')
      : '没有加入组织'
  const growthEntries = ATTR_LABELS.map(([key, label]) => {
    const current = record?.attrs?.[key]
    const before = previous?.attrs?.[key]
    if (current === undefined) return null
    if (before === undefined) return { label, value: current, total: true }
    return { label, value: current - before, total: false }
  }).filter(Boolean) as Array<{ label: string; value: number; total: boolean }>
  const tags: string[] = []
  const tag = (value: number, label: string, threshold: number) => {
    if (value >= threshold) tags.push(label)
  }
  tag(library, '图书馆常客', 12)
  tag(attend, '早八幸存者', 20)
  tag(exercise, '运动起来', 12)
  tag(clubActivities, '组织活跃', 8)
  tag(social, '社交在场', 8)
  tag(research, '实验室里', 6)
  tag(partTime, '打工攒钱', 4)
  tag(coffee, '咖啡续命', 10)
  if (tags.length === 0) tags.push('按自己的节奏', '慢慢往前')
  if (state.everFailed) tags.push('有过一次补考')
  if (bonds > 0) tags.push('有人同行')
  const summary = [
    `${yearName}这一年，你去图书馆 ${library} 次`,
    `上了 ${attend} 次课`,
    exercise > 0 ? `运动 ${exercise} 次` : null,
    clubActivities > 0 ? `参加组织活动 ${clubActivities} 次` : null,
    social > 0 ? `和人见面 ${social} 次` : null,
    research > 0 ? `做科研 ${research} 次` : null,
  ]
    .filter(Boolean)
    .join('，')
  const note = state.everFailed
    ? '这一年有过一次没考好的课，但你还在往前。'
    : '没有谁规定大学要过得一样。你按自己的方式，把这一年过完了。'
  const background = player.background
    ? BACKGROUND_BY_ID[player.background]
    : null

  return (
    <div className="screen year-end-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />
        <main className="year-end-wrap">
          <article className="paper-card year-end-card">
            <span className="tape" aria-hidden="true" />
            <Eyebrow>{`END OF ${yearName.toUpperCase()} / YEAR IN REVIEW`}</Eyebrow>
            <h1 className="year-end-title">
              {yearName}
              <em>这一年</em>
            </h1>
            <p className="year-end-lede">{summary}。这不是成绩单，是你这一年真正做过的事。</p>

            <div className="year-end-hero-tags">
              {tags.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="year-end-grid">
              <section>
                <span>学业</span>
                <strong>{gpa.toFixed(2)} GPA</strong>
                <p>
                  这一年修完 {credits} 学分，累计 {state.cumulativeCredits} 学分。
                  {record?.failed ? '有一门课没通过。' : '所有课都通过了。'}
                </p>
                {state.cet4Score || state.cet6Score ? (
                  <small>
                    英语：CET-4 {state.cet4Score ?? '未考'} · CET-6{' '}
                    {state.cet6Score ?? '未考'}
                  </small>
                ) : null}
              </section>
              <section>
                <span>日常</span>
                <strong>{library + attend} 次学习</strong>
                <p>
                  图书馆 {library} 次 · 上课 {attend} 次 · 运动 {exercise} 次 ·
                  咖啡 {coffee} 杯 · 兼职 {partTime} 次。
                </p>
                <small>对自己好一点 {selfCare} 次。</small>
              </section>
              <section>
                <span>关系</span>
                <strong>{bonds > 0 ? `${bonds} 段羁绊` : '还在认识人'}</strong>
                <p>
                  恋人 {lovers} 位 · 交心朋友 {closeFriends} 位 ·
                  导师 {state.relationships.some((relation) => relation.kind === 'mentor') ? '已认识' : '尚未认识'}。
                </p>
                <small>
                  {social > 0 ? `这一年和人见面 ${social} 次。` : '有些关系是在沉默里慢慢长出来的。'}
                </small>
              </section>
              <section>
                <span>组织与科研</span>
                <strong>{clubActivities} 次组织活动</strong>
                <p>{clubText}</p>
                <small>
                  科研行动 {research} 次 · 论文 {record?.papers ?? 0} 篇 ·
                  科研进度 {state.researchProgress} / 100。
                </small>
              </section>
            </div>

            <section className="year-end-growth">
              <div>
                <span>这一年的成长</span>
                <small>属性变化 / 学年结束面板</small>
              </div>
              <div className="year-end-growth-list">
                {growthEntries.map((entry) => (
                  <div key={entry.label}>
                    <span>{entry.label}</span>
                    <strong>
                      {entry.total
                        ? `${entry.value}`
                        : `${entry.value >= 0 ? '+' : ''}${entry.value}`}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            <div className="year-end-footer">
              <p>{note}</p>
              <div className="year-end-actions">
                {onContinue ? (
                  <button type="button" className="btn btn-primary" onClick={onContinue}>
                    继续下一学年
                    <span className="btn-arrow">→</span>
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={onRestart}>
                    重新开始一局
                    <span className="btn-arrow">→</span>
                  </button>
                )}
                <button type="button" className="btn btn-ghost" onClick={onTitle}>
                  回到标题
                </button>
              </div>
            </div>

            <div className="year-end-footnote">
              <span>{player.name} · {background?.name ?? '学生档案'}</span>
              <Stamp text="漸江大學醫學院" sub="学生档案 · 学年小结" />
            </div>
          </article>
        </main>
      </div>
    </div>
  )
}
