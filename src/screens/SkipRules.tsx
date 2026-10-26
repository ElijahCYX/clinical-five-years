import type { Course } from '../types'
import {
  METHODS,
  METHOD_PROBABILITIES,
  skipCategoryFor,
  type SkipCategory,
} from './SkipClass'

const CATEGORY_LABELS: Record<SkipCategory, string> = {
  professional: '专业课',
  water: '水课',
  politics: '思政课',
  pe: '体育课',
  interest: '兴趣课',
}

const REACTION_RULES = [
  {
    name: '朋友代签',
    match: '纸质签到',
    success: '80%',
    fail: '20% · 朋友也翘课了',
  },
  {
    name: '虚拟定位',
    match: 'GPS 签到',
    success: '90%',
    fail: '10% · 定位软件故障',
  },
  {
    name: '情报收集',
    match: '数字签到',
    success: '80%',
    fail: '15% 朋友没去 · 5% 错过签到时间',
  },
  {
    name: '朋友代答',
    match: '点名回答',
    success: '50%',
    fail: '25% 朋友社恐 · 25% 被老师发现',
  },
]

export function SkipRulesModal({
  course,
  onClose,
}: {
  course: Course
  onClose: () => void
}) {
  const category = skipCategoryFor(course)
  return (
    <div className="random-event-overlay skip-rules-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" onClick={onClose} />
      <section className="random-event-modal skip-rules-modal">
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <span className="research-notice-tag">SKIP INFO / 翘课规则</span>
            <span className="random-event-hint">授课老师抽什么，你都得接住</span>
          </div>
          <h2 className="random-event-title">翘课判定规则</h2>
        </header>

        <p className="skip-rules-lede">
          翘课不消耗精力，也不增加课程准备度。老师会随机选择一种抽查方式，
          你只能使用对应的应对方式；不签到则自动安全。
        </p>

        <section className="skip-rules-section">
          <h3>① 老师怎么抽</h3>
          <div className="skip-rules-table-wrap">
            <table className="skip-rules-table">
              <thead>
                <tr>
                  <th>课程类型</th>
                  {METHODS.map((method) => (
                    <th key={method.key}>{method.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(CATEGORY_LABELS) as SkipCategory[]).map((key) => (
                  <tr key={key} className={key === category ? 'is-current' : ''}>
                    <td>
                      {CATEGORY_LABELS[key]}
                      {key === category && <em>当前课程</em>}
                    </td>
                    {METHOD_PROBABILITIES[key].map((value, index) => (
                      <td key={METHODS[index].key}>{value}%</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="skip-rules-section">
          <h3>② 你该怎么接</h3>
          <div className="skip-rules-reactions">
            {REACTION_RULES.map((rule) => (
              <article key={rule.name} className="skip-rules-reaction">
                <div>
                  <strong>{rule.name}</strong>
                  <span>只能应对：{rule.match}</span>
                </div>
                <p>
                  <b>成功 {rule.success}</b>
                  <span>失败 {rule.fail}</span>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="skip-rules-section">
          <h3>③ 失败代价</h3>
          <div className="skip-rules-penalty">
            <span>被老师发现</span>
            <strong>该课程平时分 -20%</strong>
            <strong>压力 +5</strong>
            <p>成功则没有精力、准备度或平时分收益，只把这一格变回自由时间。</p>
          </div>
        </section>

        <footer className="random-event-footer">
          <p>翘课有风险，抽查靠运气，朋友靠不住。</p>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            我记住了
            <span className="btn-arrow">→</span>
          </button>
        </footer>
      </section>
    </div>
  )
}
