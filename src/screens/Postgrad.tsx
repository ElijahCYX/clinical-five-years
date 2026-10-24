import {
  GRADUATION_CREDITS,
  KAOYAN_PASS,
  graduationReasons,
  postgradChanceFor,
} from '../game'
import type { ReactNode } from 'react'
import type { GameState, PostgradChoice } from '../types'
import { Eyebrow, Pill, Stamp, TopBar } from '../ui'

interface BaseEventProps {
  state: GameState
  onTitle?: () => void
}

function EventShell({
  state,
  eyebrow,
  title,
  sub,
  children,
  onTitle,
  tone = 'gold',
}: BaseEventProps & {
  eyebrow: string
  title: string
  sub: string
  children: ReactNode
  tone?: 'gold' | 'green' | 'red'
}) {
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
          <div className="paper-card event-card">
            <span className="tape" aria-hidden="true" />
            <Eyebrow>{eyebrow}</Eyebrow>
            <div className="event-title-row">
              <div>
                <h1 className="event-title">{title}</h1>
                <p className="event-sub">{sub}</p>
              </div>
              <Pill tone={tone}>{state.postgradChoice === 'employment' ? '就业线' : '毕业去向'}</Pill>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export function RouteScreen({
  state,
  onChoose,
  onTitle,
}: BaseEventProps & {
  onChoose: (choice: PostgradChoice) => void
}) {
  const chance = postgradChanceFor(state)
  const gpa =
    state.cumulativeCredits > 0 ? state.cumulativePoints / state.cumulativeCredits : 0

  return (
    <EventShell
      state={state}
      eyebrow="POSTGRADUATION / ROUTE CHOICE"
      title="毕业去向"
      sub="大四 · 春 · 推免概率评估"
      tone={chance >= 0.55 ? 'green' : 'gold'}
      onTitle={onTitle}
    >
      <p className="event-lede">
        辅导员把往年的推免数据摊在桌上。你的 GPA、英语、综测和科研，会决定接下来这一年把力气放在哪里。
        现在可以先看保研概率，再决定要不要同时给考研留一条后路。
      </p>

      <div className="event-info">
        <div>
          <span>当前 GPA</span>
          <strong>{gpa.toFixed(2)}</strong>
          <small>累计 {state.cumulativeCredits} 学分</small>
        </div>
        <div>
          <span>CET-6</span>
          <strong>{state.cet6Score ?? '—'}</strong>
          <small>{state.cet6Score && state.cet6Score >= 550 ? '已达到毕业线' : '毕业要求 550'}</small>
        </div>
        <div>
          <span>保研概率</span>
          <strong>{Math.round(chance * 100)}%</strong>
          <small>按当前材料估算</small>
        </div>
      </div>

      <div className="event-actions">
        <button type="button" className="btn btn-ghost" onClick={() => onChoose('employment')}>
          直接就业
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onChoose('baoyan')}>
          只冲保研
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onChoose('both')}>
          保研 + 考研双线
          <span className="btn-arrow">→</span>
        </button>
      </div>
      <p className="waiting-note">
        <span className="waiting-tag">等待开发</span>
        保研面试 / 夏令营 / 导师双选 / 科研论文模块
      </p>
    </EventShell>
  )
}

export function BaoyanResultScreen({
  state,
  onContinue,
  onKaoyan,
  onEmployment,
  onTitle,
}: BaseEventProps & {
  onContinue: () => void
  onKaoyan: () => void
  onEmployment: () => void
}) {
  const success = state.baoyanResult === 'success'
  return (
    <EventShell
      state={state}
      eyebrow="BAOYAN RESULT / AUTUMN"
      title={success ? '推免成功' : '推免未成功'}
      sub="大五 · 秋 · 推免结果"
      tone={success ? 'green' : 'red'}
      onTitle={onTitle}
    >
      <p className="event-lede">
        {success
          ? '名单公示了。你的名字在名单上。接下来只需要等复试和导师双选——那些模块还在开发中，但至少这一关已经过了。'
          : '名单上没有你的名字。保研不是唯一的路；如果还想去更高的地方，现在报名考研，大五冬还有一个冬学期可以准备。'}
      </p>

      <div className="event-info">
        <div>
          <span>保研概率</span>
          <strong>{Math.round((state.postgradChance ?? 0) * 100)}%</strong>
        </div>
        <div>
          <span>结果</span>
          <strong>{success ? '通过' : '未通过'}</strong>
        </div>
        <div>
          <span>下一步</span>
          <strong>{success ? '等待复试' : '考研 / 就业'}</strong>
        </div>
      </div>

      <p className="waiting-note">
        <span className="waiting-tag">等待开发</span>
        保研面试、复试、导师双选、录取通知详情
      </p>

      <div className="event-actions">
        {success ? (
          <button type="button" className="btn btn-primary" onClick={onContinue}>
            继续大五 · 冬
            <span className="btn-arrow">→</span>
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-ghost" onClick={onEmployment}>
              直接就业
            </button>
            <button type="button" className="btn btn-primary" onClick={onKaoyan}>
              报名考研，冬学期备考
              <span className="btn-arrow">→</span>
            </button>
          </>
        )}
      </div>
    </EventShell>
  )
}

export function KaoyanExamScreen({
  state,
  onContinue,
  onTitle,
}: BaseEventProps & { onContinue: () => void }) {
  return (
    <EventShell
      state={state}
      eyebrow="POSTGRAD EXAM / WINTER"
      title="考研初试"
      sub="大五 · 冬 · 初试结束"
      tone="gold"
      onTitle={onTitle}
    >
      <p className="event-lede">
        两天的考试结束了。冬天很冷，考场外的树光秃秃的。成绩会在春天公布，现在能做的只有等。
      </p>
      <div className="event-info">
        <div>
          <span>初试估分</span>
          <strong>{state.kaoyanScore ?? '—'}</strong>
          <small>满分 500</small>
        </div>
        <div>
          <span>备考加成</span>
          <strong>+{state.kaoyanPrep}</strong>
          <small>冬学期复习进度</small>
        </div>
        <div>
          <span>结果公布</span>
          <strong>大五 · 春</strong>
        </div>
      </div>
      <div className="event-actions">
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          等待春季成绩
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </EventShell>
  )
}

export function KaoyanResultScreen({
  state,
  onContinue,
  onTitle,
}: BaseEventProps & { onContinue: () => void }) {
  const success = state.kaoyanResult === 'success'
  return (
    <EventShell
      state={state}
      eyebrow="POSTGRAD RESULT / SPRING"
      title={success ? '考研上岸' : '考研未上岸'}
      sub="大五 · 春 · 复试结果"
      tone={success ? 'green' : 'red'}
      onTitle={onTitle}
    >
      <p className="event-lede">
        {success
          ? '复试名单出来了。你被录取了。五年里那些看起来没有尽头的考试，终于有一场把你送到了想去的地方。'
          : '分数线差了一点。不是所有努力都会立刻有结果；先把大五夏的实习走完，毕业之后还有别的路。'}
      </p>
      <div className="event-info">
        <div>
          <span>初试成绩</span>
          <strong>{state.kaoyanScore ?? '—'}</strong>
        </div>
        <div>
          <span>复试线</span>
          <strong>{KAOYAN_PASS}</strong>
        </div>
        <div>
          <span>结果</span>
          <strong>{success ? '拟录取' : '未录取'}</strong>
        </div>
      </div>
      <p className="waiting-note">
        <span className="waiting-tag">等待开发</span>
        复试面试、导师联系、调剂与录取通知详情
      </p>
      <div className="event-actions">
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          继续大五 · 夏
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </EventShell>
  )
}

export function GraduationScreen({
  state,
  onRestart,
  onTitle,
}: BaseEventProps & {
  onRestart: () => void
}) {
  const reasons = graduationReasons(state)
  const graduated = reasons.length === 0
  const gpa =
    state.cumulativeCredits > 0 ? state.cumulativePoints / state.cumulativeCredits : 0

  return (
    <div className="screen ending-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />
        <main className="ending-wrap">
          <div className="paper-card ending-card">
            <span className="tape" aria-hidden="true" />
            <Eyebrow>GRADUATION / FIVE YEARS LATER</Eyebrow>
            <h1 className="ending-title">
              {graduated ? '毕业' : '延毕'}
              <em>{graduated ? '快乐' : '一年'}</em>
            </h1>
            <p className="ending-lede">
              {graduated
                ? '五年，二十季，从解剖楼到病房。你终于把学生证换成了毕业证。'
                : '还有几项没有完成。医学这条路不差这一年，先把该补的补上。'}
            </p>

            <div className="ending-stats">
              <div>
                <span>学分</span>
                <strong>
                  {state.cumulativeCredits} / {GRADUATION_CREDITS}
                </strong>
              </div>
              <div>
                <span>累计 GPA</span>
                <strong>{gpa.toFixed(2)}</strong>
              </div>
              <div>
                <span>CET-6</span>
                <strong>{state.cet6Score ?? '未参加'}</strong>
              </div>
              <div>
                <span>体育</span>
                <strong>
                  {state.peMakeupPassed === false
                    ? '毕业补考未通过'
                    : state.peMakeupPassed
                      ? '补考通过'
                      : '全部通过'}
                </strong>
              </div>
              <div>
                <span>去向</span>
                <strong>
                  {state.baoyanResult === 'success'
                    ? '保研'
                    : state.kaoyanResult === 'success'
                      ? '考研上岸'
                      : '就业'}
                </strong>
              </div>
              <div>
                <span>补考</span>
                <strong>{state.pendingMakeups.length === 0 ? '无' : `${state.pendingMakeups.length} 门未过`}</strong>
              </div>
            </div>

            {!graduated && (
              <div className="graduation-reasons">
                {reasons.map((reason) => (
                  <p key={reason}>{reason}</p>
                ))}
              </div>
            )}

            <p className="waiting-note">
              <span className="waiting-tag">等待开发</span>
              完整毕业结局：保研学校 / 考研院校 / 工作城市 / 学位授予与毕业照
            </p>

            <div className="ending-actions">
              <button type="button" className="btn btn-primary" onClick={onRestart}>
                重新开始一局
                <span className="btn-arrow">→</span>
              </button>
              <button type="button" className="btn btn-ghost" onClick={onTitle}>
                回到标题
              </button>
            </div>
            <Stamp text="臨江大學醫學院" sub="教務處 · 畢業" />
          </div>
        </main>
      </div>
    </div>
  )
}
