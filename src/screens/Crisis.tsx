import type { GameState } from '../types'
import { Eyebrow, Pill, TopBar } from '../ui'

export type CrisisKind = 'stress' | 'energy'

interface CrisisScreenProps {
  state: GameState
  kind: CrisisKind
  onDismiss: () => void
  onTitle?: () => void
}

export function CrisisScreen({
  state,
  kind,
  onDismiss,
  onTitle,
}: CrisisScreenProps) {
  const isStress = kind === 'stress'

  return (
    <div className="screen event-screen crisis-screen">
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
          <div className={`paper-card event-card crisis-card ${isStress ? 'is-stress' : 'is-energy'}`}>
            <span className="tape" aria-hidden="true" />
            <Eyebrow>
              {isStress ? 'INCIDENT / PRESSURE OVERLOAD' : 'INCIDENT / BATTERY CRITICAL'}
            </Eyebrow>
            <div className="event-title-row">
              <div>
                <h1 className="event-title">
                  {isStress ? '高压警报' : '电量告急'}
                </h1>
                <p className="event-sub">
                  {isStress
                    ? `当前压力 ${Math.round(state.stress)} / 100`
                    : `当前精力 ${Math.round(state.energy)} / 100`}
                </p>
              </div>
              <Pill tone={isStress ? 'red' : 'gold'}>
                {isStress ? '压力 > 80' : '精力 < 20'}
              </Pill>
            </div>

            {isStress ? (
              <>
                <p className="event-lede">
                  你的压力冲破了 80。现在的大脑像一台同时开了三十七个网页的旧电脑：
                  风扇在响，进度条不动，连“我没事”三个字都要转半天。
                  学院于是给你挂上了一个持续生效的「高压状态」。
                </p>
                <div className="crisis-debuff">
                  <div>
                    <span>当前 debuff</span>
                    <strong>考试准备度收益 -30%</strong>
                  </div>
                  <p>压力回落到 60 以下后自动解除。注意：不是“睡一觉就没事”，是真的要松下来。</p>
                </div>
                <p className="event-lede">
                  建议：把书合上，去操场走两圈，回家吃顿热饭，或者给很久没联系的人打个电话。
                  医生要先学会给自己开休息处方。你倒下了，值班表不会替你难过。
                </p>
              </>
            ) : (
              <>
                <p className="event-lede">
                  你的精力跌破 20，身体已经切到超级省电模式：看一行书要缓冲，
                  走到食堂像一次长途转运，连点开这个弹窗都算剧烈运动。
                  低精力不会额外增加你的精力消耗，但身体确实需要一次真正的休息。
                </p>
                <div className="crisis-debuff">
                  <div>
                    <span>当前状态</span>
                    <strong>精力低于 20% · 需要休息</strong>
                  </div>
                  <p>这不是额外的惩罚，只是一次状态提醒。先休息，等精力回到 20 以上。</p>
                </div>
                <p className="event-lede">
                  建议：现在就去睡。床不是逃避，是充电桩；食堂不是浪费时间，是给下一台手术储备体力。
                  等你醒来，世界不会变得更简单，但你会更有力气面对它。
                </p>
              </>
            )}

            <div className="event-actions">
              <button type="button" className="btn btn-primary" onClick={onDismiss}>
                {isStress ? '先把呼吸调匀' : '去充电'}
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
