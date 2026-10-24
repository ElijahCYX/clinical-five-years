import { BACKGROUND_BY_ID, HABIT_BY_ID, PLAN_BY_ID, TALENT_BY_ID } from '../data'
import { cetHint, type WeekSimulation } from '../game'
import type { GameState } from '../types'
import { Dot, StatBar } from '../ui'
import {
  energyCostMultiplier,
  energyTone,
  stressTone,
} from '../game'

interface PlayerRailProps {
  state: GameState
  title: string
  titleRight: string
  preview?: WeekSimulation | null
  mode?: 'week' | 'exam'
  note?: string
}

/** 左侧固定栏：人物 / 周状态 / 计划。周循环和考试周共用，保证 UI 一致。 */
export function PlayerRail({
  state,
  title,
  titleRight,
  preview = null,
  mode = 'week',
  note,
}: PlayerRailProps) {
  const player = state.player
  if (!player) return null

  const talent = TALENT_BY_ID[player.talent]
  const background = BACKGROUND_BY_ID[player.background]
  const plan = state.plan ? PLAN_BY_ID[state.plan] : null
  const habits = (state.habits ?? [])
    .map((id) => HABIT_BY_ID[id])
    .filter(Boolean)
  const habitActive = habits.length > 0 && state.stress <= 60
  const remainingActions = Math.max(0, 2 - state.selected.length)
  const isExam = mode === 'exam'

  return (
    <aside className="game-left">
      <div className="student-id">
        <div className="student-id-top">
          <span>STUDENT IDENTIFICATION</span>
        </div>
        <div className="student-name">{player.name}</div>
        <div className="student-sub">临床医学 · 五年制</div>
        <div className="id-divider" />
        <div className="id-line">
          <span>天赋</span>
          <strong>{talent.name}</strong>
        </div>
        <div className="id-line">
          <span>背景</span>
          <strong>{background.name}</strong>
        </div>
        <div className="id-line">
          <span>性别</span>
          <strong>{player.gender}</strong>
        </div>
        <div className="id-line">
          <span>月度生活费</span>
          <strong>{background.money}</strong>
        </div>
        <span className="id-stamp" aria-hidden="true">
          <span>臨江大學</span>
          <span>醫學院</span>
        </span>
      </div>

      <div className="paper-card status-card">
        <div className="card-head">
          <span>{title}</span>
          <span>{titleRight}</span>
        </div>
        <StatBar
          label="精力"
          value={state.energy}
          tone={energyTone(state.energy)}
          previewValue={preview?.energy}
          sub={isExam ? '喝咖啡 / 刷夜会即时改变这里' : '自然恢复 +15 / 周 · 行动与计划消耗'}
        />
        <StatBar
          label="压力"
          value={state.stress}
          tone={stressTone(state.stress)}
          previewValue={preview?.stress}
          sub={habitActive ? '习惯生效中' : '压力过高，习惯已失效'}
        />
        {(state.highPressureDebuff || state.stress > 70 || energyCostMultiplier(state.energy) > 1) && (
          <div className="condition-notes">
            {state.highPressureDebuff && (
              <p className="condition-note is-danger">
                高压状态：考试准备度收益 -30%，压力回落到 60 以下后解除
              </p>
            )}
            {!state.highPressureDebuff && state.stress > 70 && (
              <p className="condition-note is-warn">压力偏高：考试准备度收益 -10%</p>
            )}
            {energyCostMultiplier(state.energy) > 1 && (
              <p className="condition-note is-warn">
                低精力：所有精力消耗 +{Math.round((energyCostMultiplier(state.energy) - 1) * 100)}%
              </p>
            )}
          </div>
        )}
        <div className="money-row">
          <div>
            <span>生活费</span>
            <strong>
              ¥ {state.money}
              {preview && preview.money !== state.money && (
                <span className="stat-preview-value">→ ¥{preview.money}</span>
              )}
            </strong>
          </div>
          <small>每周固定开销 250</small>
        </div>
        <div className="mini-stats">
          <div>
            <span>综合测评</span>
            <strong>
              {state.composite}
              {preview && preview.composite !== state.composite && (
                <span className="stat-preview-value">→ {preview.composite}</span>
              )}
            </strong>
          </div>
          <div>
            <span>英语进度</span>
            <strong>
              {state.english}
              {preview && preview.english !== state.english && (
                <span className="stat-preview-value">→ {preview.english}</span>
              )}
            </strong>
            <small className="stat-hint">
              {cetHint(state.cet4Score, state.cet6Score)}
            </small>
          </div>
          <div>
            <span>科研</span>
            <strong>
              {state.research}
              {preview && preview.research !== state.research && (
                <span className="stat-preview-value">→ {preview.research}</span>
              )}
            </strong>
          </div>
        </div>
        {preview && (
          <p className="preview-note">
            <span className="preview-swatch" aria-hidden="true" />
            浅色 / 斜线部分为本周结算后的预计变化
          </p>
        )}
        {!preview && note && <p className="status-rail-note">{note}</p>}
      </div>

      <div className="paper-card plan-card-mini">
        <div className="card-head">
          <span>SEMESTER PLAN</span>
          <span>{plan?.code}</span>
        </div>
        <div className="plan-mini-row">
          <span>学习计划</span>
          <strong>{plan ? plan.name : '未选择'}</strong>
        </div>
        <div className="plan-mini-row">
          <span>养成习惯</span>
          <strong>
            {habits.length > 0 ? habits.map((item) => item.name).join(' / ') : '未选择'}
            <Dot active={habitActive} />
          </strong>
        </div>
        <p>
          {habitActive
            ? '习惯正在生效。保持压力不超过 60。'
            : '压力超过 60，习惯本周失效。先照顾自己。'}
        </p>
      </div>

      <div className="left-progress">
        <div>
          <span>主线进度</span>
          <strong>{String(state.seasonIndex + 1).padStart(2, '0')} / 21 季</strong>
        </div>
        <div>
          <span>{isExam ? '当前阶段' : '本周行动'}</span>
          <strong>{isExam ? '考试周' : `${remainingActions} / 2 剩余`}</strong>
        </div>
        <div>
          <span>本周课程</span>
          <strong>{state.season.courses.length} 门</strong>
        </div>
      </div>
    </aside>
  )
}
