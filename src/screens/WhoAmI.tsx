import {
  ATTRS,
  BACKGROUND_BY_ID,
  HABIT_BY_ID,
  OPENING_TALENT_BY_ID,
  PLAN_BY_ID,
  TALENT_BY_ID,
} from '../data'
import { AWARD_LABELS, bestAward } from '../game'
import type { GameState } from '../types'
import { Eyebrow, InterfaceNav, Pill, SectionLabel, TopBar } from '../ui'
import { patRemainingThisWeek, unseenRelationCount } from '../social'

interface WhoAmIScreenProps {
  state: GameState
  onMain: () => void
  onTA?: () => void
  onTitle?: () => void
}

const YEAR_NAMES = ['大一', '大二', '大三', '大四', '大五']

export function WhoAmIScreen({ state, onMain, onTA, onTitle }: WhoAmIScreenProps) {
  const player = state.player
  if (!player) return null

  const talent = TALENT_BY_ID[player.talent]
  const background = BACKGROUND_BY_ID[player.background]
  const plan = state.plan ? PLAN_BY_ID[state.plan] : null
  const habits = (state.habits ?? [])
    .map((id) => HABIT_BY_ID[id])
    .filter(Boolean)
  const cumulativeGpa =
    state.cumulativeCredits > 0
      ? state.cumulativePoints / state.cumulativeCredits
      : null
  const awards = state.yearRecords.filter(
    (record) => record.evaluated && (record.awards?.length ?? 0) + (record.award ? 1 : 0) > 0,
  )
  const previousAward = bestAward(state.yearRecords)
  const paperCount = Math.floor(state.research / 100)
  const openingTalents = state.openingTalents
    .map((id) => OPENING_TALENT_BY_ID[id])
    .filter(Boolean)
  const postgradLabel =
    state.postgradChoice === 'baoyan'
      ? '保研'
      : state.postgradChoice === 'both'
        ? '保研 + 考研双线'
        : state.postgradChoice === 'employment'
          ? '直接就业'
          : '尚未决定'
  const postgradStatus =
    state.baoyanResult === 'success'
      ? '推免成功'
      : state.kaoyanResult === 'success'
        ? '考研上岸'
        : state.kaoyanResult === 'fail'
          ? '考研未上岸'
          : state.baoyanResult === 'fail'
            ? '推免未成功'
            : ''

  return (
    <div className="screen whoami-screen">
      <div className="shell">
        <TopBar
          onTitle={onTitle}
          right={
            <button className="text-btn" type="button" onClick={onTitle}>
              返回标题
            </button>
          }
        />

        <InterfaceNav
          active="who"
          onMain={onMain}
          onWho={() => undefined}
          onTA={onTA ?? (() => undefined)}
          badges={{
            main: state.selected.length < 2 ? 2 - state.selected.length : undefined,
            ta:
              unseenRelationCount(state) > 0
                ? '新'
                : patRemainingThisWeek(state) || undefined,
          }}
        />

        <header className="whoami-head">
          <div>
            <Eyebrow>WHO AM I / PLAYER DOSSIER</Eyebrow>
            <h1 className="page-title">我是谁</h1>
            <p className="page-lede">
              一份写给自己的简历。所有面板、成绩、荣誉和未完成的事，都在这里。
            </p>
          </div>
          <div className="whoami-mark">
            <span>渐江大学医学院</span>
            <strong>PLAYER / 001</strong>
          </div>
        </header>

        <main className="whoami-wrap">
          <section className="paper-card dossier-cover">
            <span className="tape" aria-hidden="true" />
            <div className="dossier-cover-main">
              <div className="dossier-avatar" aria-hidden="true">
                <span>{player.name.slice(0, 1)}</span>
              </div>
              <div>
                <span className="result-kicker">CLINICAL MEDICINE / FIVE-YEAR PROGRAM</span>
                <h2>{player.name}</h2>
                <p>
                  {background.name} · {talent.name} · {player.archiveTitle}
                </p>
                <div className="dossier-tags">
                  <Pill tone="green">{player.gender}</Pill>
                  <Pill>
                    {player.orientation === 'heterosexual'
                      ? '异性恋'
                      : player.orientation === 'homosexual'
                        ? '同性恋'
                        : '双性恋'}
                  </Pill>
                  <Pill>临床医学 · 五年制</Pill>
                  <Pill tone={state.everFailed ? 'red' : 'plain'}>
                    {state.everFailed ? '有挂科记录' : '无挂科记录'}
                  </Pill>
                </div>
              </div>
            </div>
            <div className="dossier-cover-side">
              <div>
                <span>当前学期</span>
                <strong>{state.season.seasonLabel}</strong>
              </div>
              <div>
                <span>累计 GPA</span>
                <strong>{cumulativeGpa === null ? '—' : cumulativeGpa.toFixed(2)}</strong>
              </div>
              <div>
                <span>已修学分</span>
                <strong>{state.cumulativeCredits}</strong>
              </div>
              <div>
                <span>最高荣誉</span>
                <strong>{previousAward ? AWARD_LABELS[previousAward] : '暂无'}</strong>
              </div>
            </div>
          </section>

          <div className="dossier-grid">
            <section className="paper-card dossier-block">
              <SectionLabel right="2–10">01 / 面板属性</SectionLabel>
              <div className="dossier-attrs">
                {ATTRS.map((attr) => (
                  <div className="dossier-attr" key={attr.key}>
                    <div>
                      <span>{attr.name}</span>
                      <strong>{player.attrs[attr.key]}</strong>
                    </div>
                    <div className="dossier-attr-bar">
                      <i style={{ width: `${player.attrs[attr.key] * 10}%` }} />
                    </div>
                    <small>{attr.blurb}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="paper-card dossier-block">
              <SectionLabel right="本周状态">02 / 现状</SectionLabel>
              <div className="dossier-stats">
                <div>
                  <span>精力</span>
                  <strong>{state.energy}</strong>
                </div>
                <div>
                  <span>压力</span>
                  <strong>{state.stress}</strong>
                </div>
                <div>
                  <span>生活费</span>
                  <strong>¥ {state.money}</strong>
                </div>
                <div>
                  <span>综合测评</span>
                  <strong>{state.composite}</strong>
                </div>
                <div>
                  <span>英语进度</span>
                  <strong>{state.english}</strong>
                </div>
                <div>
                  <span>科研进度</span>
                  <strong>{state.research}</strong>
                </div>
              </div>
              <div className="dossier-growth">
                <div>
                  <span>体质成长</span>
                  <strong>{Math.round(state.constitutionGrowth)}%</strong>
                </div>
                <div>
                  <span>外形成长</span>
                  <strong>{Math.round(state.appearanceGrowth)}%</strong>
                </div>
                <div>
                  <span>人际成长</span>
                  <strong>{Math.round(state.socialGrowth)}%</strong>
                </div>
              </div>
            </section>
          </div>

          <div className="dossier-grid">
            <section className="paper-card dossier-block">
              <SectionLabel right="上一学年">03 / 学业与英语</SectionLabel>
              <div className="dossier-list">
                <div>
                  <span>本学期课程</span>
                  <strong>{state.season.courses.map((course) => course.name).join(' / ')}</strong>
                </div>
                <div>
                  <span>本周主攻</span>
                  <strong>
                    {state.weekFocus === 'balanced'
                      ? '全部课程均衡'
                      : state.season.courses.find((course) => course.id === state.weekFocus)?.name ??
                        '尚未选择'}
                  </strong>
                </div>
                <div>
                  <span>学期计划</span>
                  <strong>{plan ? plan.name : '未选择'}</strong>
                </div>
                <div>
                  <span>养成习惯</span>
                  <strong>
                    {habits.length > 0 ? habits.map((habit) => habit.name).join(' / ') : '未选择'}
                  </strong>
                </div>
                <div>
                  <span>CET-4</span>
                  <strong>{state.cet4Score ?? '未考'}</strong>
                </div>
                <div>
                  <span>CET-6</span>
                  <strong>{state.cet6Score ?? '未考'}</strong>
                </div>
                <div>
                  <span>论文产出</span>
                  <strong>{paperCount} 篇</strong>
                </div>
                <div>
                  <span>选修学分</span>
                  <strong>
                    {state.electiveCredits} / 10（已选 {state.electiveHistory.length} 门）
                  </strong>
                </div>
                <div>
                  <span>思政进度</span>
                  <strong>
                    {state.politicsCompleted.length} / 5 · {state.politicsCredits} / 11 学分
                  </strong>
                </div>
                <div>
                  <span>家人好感</span>
                  <strong>{state.familyAffection} / 100</strong>
                </div>
                <div>
                  <span>导师联系</span>
                  <strong>{state.mentorContactUnlocked ? '已解锁（待开发）' : '未解锁'}</strong>
                </div>
                <div>
                  <span>舍友关系</span>
                  <strong>{state.roommateBond ? '已加深' : '普通'}</strong>
                </div>
                <div>
                  <span>体育成绩</span>
                  <strong>
                    {state.peResults.length > 0
                      ? state.peResults
                          .map((pe) => `${pe.score}${pe.passed ? '' : '（挂）'}`)
                          .join(' / ')
                      : '暂无'}
                  </strong>
                </div>
              </div>
            </section>

            <section className="paper-card dossier-block">
              <SectionLabel right="履历">04 / 荣誉与去向</SectionLabel>
              <div className="dossier-list">
                <div>
                  <span>毕业去向</span>
                  <strong>{postgradLabel}</strong>
                </div>
                <div>
                  <span>保研概率</span>
                  <strong>
                    {state.postgradChance === null
                      ? '尚未评估'
                      : `${Math.round(state.postgradChance * 100)}%`}
                  </strong>
                </div>
                <div>
                  <span>考研分数</span>
                  <strong>{state.kaoyanScore ?? '—'}</strong>
                </div>
                <div>
                  <span>当前状态</span>
                  <strong>{postgradStatus || '进行中'}</strong>
                </div>
                <div>
                  <span>奖学金</span>
                  <strong>
                    {awards.length > 0
                      ? awards
                          .map(
                            (record) =>
                              `${YEAR_NAMES[record.year - 1] ?? `${record.year} 学年`} ${
                                (record.awards?.length
                                  ? record.awards
                                  : record.award
                                    ? [record.award]
                                    : []
                                )
                                  .map((award) => AWARD_LABELS[award])
                                  .join('+')
                              }`,
                          )
                          .join(' / ')
                      : '暂无'}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <section className="paper-card dossier-block dossier-wide">
            <SectionLabel right="按学年归档">05 / 学年记录</SectionLabel>
            {state.yearRecords.length === 0 ? (
              <p className="dossier-empty">还没有完成一个学年，第一份学年记录会在学年结算后出现。</p>
            ) : (
              <div className="dossier-year-table">
                <div className="dossier-year-row dossier-year-head">
                  <span>学年</span>
                  <span>学年 GPA</span>
                  <span>综测</span>
                  <span>论文</span>
                  <span>奖学金</span>
                </div>
                {state.yearRecords.map((record) => (
                  <div className="dossier-year-row" key={record.year}>
                    <span>{YEAR_NAMES[record.year - 1] ?? `${record.year} 学年`}</span>
                    <span>{record.gpa.toFixed(2)}</span>
                    <span>{record.compositeGain}</span>
                    <span>{record.papers}</span>
                    <span>
                      {(record.awards?.length ? record.awards : record.award ? [record.award] : [])
                        .map((award) => AWARD_LABELS[award])
                        .join(' + ') || '未获奖'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {state.pendingMakeups.length > 0 && (
              <p className="dossier-warning">
                待补考：{state.pendingMakeups.map((course) => course.name).join(' / ')}
              </p>
            )}
            {state.mentorSelected || state.labEntered ? (
              <p className="dossier-muted">
                导师：{state.mentorSelected ? '已选' : '未选'} · 实验室：
                {state.labEntered ? '已进入' : '未进入'}
              </p>
            ) : (
              <p className="dossier-muted">科研导师与实验室：等待开发。</p>
            )}
          </section>
        </main>
      </div>

    </div>
  )
}
