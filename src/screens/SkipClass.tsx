import { useEffect, useMemo, useState } from 'react'
import type { Course } from '../types'

type MethodKey = 'paper' | 'gps' | 'digital' | 'rollcall' | 'none'
type ReactionKey = 'friendSign' | 'fakeLocation' | 'intel' | 'friendAnswer'

export interface MethodInfo {
  key: MethodKey
  label: string
  hint: string
}

export interface ReactionInfo {
  key: ReactionKey
  label: string
  hint: string
  matches: MethodKey
}

export const METHODS: MethodInfo[] = [
  { key: 'paper', label: '纸质签到', hint: '一张纸，从第一排一路传到最后。' },
  { key: 'gps', label: 'GPS 签到', hint: '老师的屏幕上出现了一堆重叠的蓝点。' },
  { key: 'digital', label: '数字签到', hint: '群里弹出一个限时签到码，过期不候。' },
  { key: 'rollcall', label: '点名回答', hint: '老师抬起头，开始扫视教室。' },
  { key: 'none', label: '不签到', hint: '老师今天心情不错，或者也没备好课。' },
]

export const REACTIONS: ReactionInfo[] = [
  { key: 'friendSign', label: '朋友代签', hint: '让还在教室的朋友帮你签一个。', matches: 'paper' },
  { key: 'fakeLocation', label: '虚拟定位', hint: '打开那个“朋友推荐”的定位软件。', matches: 'gps' },
  { key: 'intel', label: '情报收集', hint: '问问教室里的朋友签到码是多少。', matches: 'digital' },
  { key: 'friendAnswer', label: '朋友代答', hint: '让朋友在老师点到你时替你答一声。', matches: 'rollcall' },
]

export type SkipCategory = 'professional' | 'water' | 'politics' | 'pe' | 'interest'

export const METHOD_PROBABILITIES: Record<SkipCategory, number[]> = {
  professional: [10, 10, 25, 15, 40],
  water: [10, 10, 10, 10, 60],
  politics: [10, 10, 25, 30, 25],
  pe: [0, 100, 0, 0, 0],
  interest: [0, 0, 0, 25, 75],
}

const SUCCESS_TEXTS: Record<ReactionKey | 'none', string[]> = {
  friendSign: [
    '朋友在纸上龙飞凤舞地写下了你的名字，还顺手给你画了一个笑脸。老师收走签到表时，连看都没看一眼。',
    '你收到一条消息：“签了，字可能有点不像你，但老师说你的字看起来一直很自由。”你决定把这笔人情记在账上。',
  ],
  fakeLocation: [
    '定位软件转了两圈，蓝点稳稳落在教学楼里。老师低头核对了一下，点了点头。你坐在宿舍床上，突然觉得科技改变生活。',
    '你把虚拟定位设到教室最后一排，还特意关掉了手机震动。老师没有发现，只有你的室友发现了你脸上的心虚。',
  ],
  intel: [
    '朋友把签到码发了过来，还附赠一句：“你欠我一杯奶茶。”你飞快输入，系统显示签到成功。老师甚至没抬头。',
    '你在群里问了一圈，终于有人发来正确的数字。签到页面显示绿色的“已完成”，你长出一口气，像刚完成一场小型抢救。',
  ],
  friendAnswer: [
    '老师念到你的名字时，朋友用极其自然的语气答了一声“到”。老师点点头，继续往下点名。朋友说，那一刻TA差点笑出声。',
    '朋友替你把那声“到”答得中气十足。下课后TA发来消息：“下次请我吃饭，我刚刚差点破音。”',
  ],
  none: [
    '老师今天只是来教室转了一圈，讲了十分钟就宣布下课。没有签到，没有点名，没有人记得你不在。你甚至有点失落。',
    '老师看了看空了一半的教室，叹了口气：“就这样吧，点到为止。”于是真的没有点。你成功翘课，还附赠了一点虚无感。',
  ],
}

const FAIL_TEXTS: Record<ReactionKey, string[]> = {
  friendSign: [
    '朋友在群里发来一句：“对不起，我也没去。”你盯着签到表上那个空着的位置，开始认真思考友情的定义。',
    '代签的朋友把“你”的名字写得像另一个人的签名。老师看了一眼，抬头问：“这位同学今天来了吗？”没人敢回答。',
  ],
  fakeLocation: [
    '定位软件在关键时刻弹出更新提示，蓝点一口气飘到了隔壁城市。老师在投影上放大教室地图，沉默了三秒。',
    '虚拟定位告诉你“已成功”，老师却刚好开始数人头。你手机上的蓝点和教室里的空座位，最终没能达成一致。',
  ],
  intel: [
    '你问了半天签到码，朋友回：“我们也在等人发。”五分钟后，签到窗口关闭，群里只剩一片“谁有码”的哀嚎。',
    '朋友忙着打游戏，忘了把签到码转发给你。你看到窗口从“剩余 08 秒”变成“已结束”，感觉平时分也一起过期了。',
  ],
  friendAnswer: [
    '老师念到你的名字时，朋友正在低头回消息。TA愣了一下，小声问旁边：“刚刚点的是谁？”老师顺着声音看了过来。',
    '朋友鼓起勇气替你答了一声“到”，但老师已经记住了你的脸不在。TA说：“我可能帮倒忙了。”你想，可能不是可能。',
  ],
}

export function skipCategoryFor(course: Course): SkipCategory {
  if (course.electiveType === 'pe') return 'pe'
  if (course.electiveType === 'politics') return 'politics'
  if (course.electiveType === 'interest') return 'interest'
  if (course.electiveType === 'water') return 'water'
  return 'professional'
}

function drawMethod(course: Course): MethodInfo {
  const weights = METHOD_PROBABILITIES[skipCategoryFor(course)]
  const total = weights.reduce((sum, value) => sum + value, 0)
  let roll = Math.random() * total
  for (let i = 0; i < METHODS.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return METHODS[i]
  }
  return METHODS[METHODS.length - 1]
}

function reactionRoll(reaction: ReactionKey): { success: boolean; text: string } {
  const r = Math.random()
  if (reaction === 'friendSign') {
    if (r < 0.8) {
      return { success: true, text: SUCCESS_TEXTS.friendSign[Math.floor(Math.random() * 2)] }
    }
    return { success: false, text: FAIL_TEXTS.friendSign[Math.floor(Math.random() * 2)] }
  }
  if (reaction === 'fakeLocation') {
    if (r < 0.9) {
      return { success: true, text: SUCCESS_TEXTS.fakeLocation[Math.floor(Math.random() * 2)] }
    }
    return { success: false, text: FAIL_TEXTS.fakeLocation[Math.floor(Math.random() * 2)] }
  }
  if (reaction === 'intel') {
    if (r < 0.8) {
      return { success: true, text: SUCCESS_TEXTS.intel[Math.floor(Math.random() * 2)] }
    }
    return { success: false, text: FAIL_TEXTS.intel[Math.floor(Math.random() * 2)] }
  }
  if (r < 0.5) {
    return { success: true, text: SUCCESS_TEXTS.friendAnswer[Math.floor(Math.random() * 2)] }
  }
  return { success: false, text: FAIL_TEXTS.friendAnswer[Math.floor(Math.random() * 2)] }
}

const SUSPENSE_LINES = [
  '老师清了清嗓子，教室里突然安静下来。',
  '前排有人悄悄把手机扣在桌上，假装自己很忙。',
  '你听见自己的心跳，比上课铃还响。',
  '老师的目光在名单上停了一下，又慢慢移开。',
  '你已经开始后悔刚才为什么没去教室。',
  '群里没人说话，只有一个人发了个“？”。',
  '你盯着屏幕，感觉这三秒比一整个早八还长。',
  '老师的笔尖在签到表上方悬着，像一把小小的刀。',
]

export function SkipClassModal({
  course,
  onResolved,
}: {
  course: Course
  onResolved: (success: boolean) => void
}) {
  const method = useMemo(() => drawMethod(course), [course])
  const [rolling, setRolling] = useState(true)
  const [reelIndex, setReelIndex] = useState(0)
  const [reelInterval, setReelInterval] = useState(55)
  const [suspenseIndex, setSuspenseIndex] = useState(0)
  const [stage, setStage] = useState<'roll' | 'choose' | 'result'>('roll')
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null)
  const correctReaction = REACTIONS.find((item) => item.matches === method.key) ?? null

  useEffect(() => {
    const startedAt = performance.now()
    let cancelled = false
    let tickTimer: number | null = null
    let revealTimer: number | null = null
    let suspenseTimer: number | null = null

    const finish = () => {
      if (cancelled) return
      if (tickTimer !== null) window.clearTimeout(tickTimer)
      if (suspenseTimer !== null) window.clearInterval(suspenseTimer)
      // 最后停在授课老师真正抽中的方式上。
      setReelIndex(METHODS.findIndex((item) => item.key === method.key))
      setRolling(false)
      revealTimer = window.setTimeout(() => {
        if (cancelled) return
        setStage(method.key === 'none' ? 'result' : 'choose')
        if (method.key === 'none') {
          setResult({
            success: true,
            text: SUCCESS_TEXTS.none[
              Math.floor(Math.random() * SUCCESS_TEXTS.none.length)
            ],
          })
        }
      }, 2000)
    }

    // 转速从快到慢：每一次切换的间隔逐渐拉长，最后停在结果上。
    const tick = () => {
      if (cancelled) return
      const elapsed = performance.now() - startedAt
      if (elapsed >= 4000) {
        finish()
        return
      }
      setReelIndex((current) => (current + 1) % METHODS.length)
      const interval =
        elapsed < 800
          ? 55
          : elapsed < 1600
            ? 75
            : elapsed < 2400
              ? 105
              : elapsed < 3000
                ? 160
                : elapsed < 3500
                  ? 240
                  : elapsed < 3800
                    ? 340
                    : 420
      setReelInterval(interval)
      tickTimer = window.setTimeout(tick, interval)
    }

    suspenseTimer = window.setInterval(() => {
      setSuspenseIndex((current) => (current + 1) % SUSPENSE_LINES.length)
    }, 520)
    tickTimer = window.setTimeout(tick, 60)

    return () => {
      cancelled = true
      if (tickTimer !== null) window.clearTimeout(tickTimer)
      if (revealTimer !== null) window.clearTimeout(revealTimer)
      if (suspenseTimer !== null) window.clearInterval(suspenseTimer)
    }
  }, [method])

  const isSettled = !rolling && stage === 'roll'

  const chooseReaction = (reaction: ReactionInfo) => {
    if (reaction.key !== correctReaction?.key) return
    const outcome = reactionRoll(reaction.key)
    setResult(outcome)
    setStage('result')
  }

  return (
    <div className="random-event-overlay skip-class-overlay" role="dialog" aria-modal="true">
      <div className="random-event-backdrop" />
      <section
        className={`random-event-modal skip-class-modal ${
          stage === 'roll' && rolling
            ? 'is-rolling'
            : stage === 'roll' && isSettled
              ? 'is-settled'
              : ''
        }`}
      >
        {stage === 'roll' && rolling && (
          <div className="skip-adrenaline-flash" aria-hidden="true" />
        )}
        <header className="random-event-head">
          <div className="random-event-kind-row">
            <span className="research-notice-tag">SKIP CLASS / 翘课判定</span>
            <span className="random-event-hint">{course.name} · 抽查现场</span>
          </div>
          <h2 className="random-event-title">
            {stage === 'result'
              ? result?.success
                ? '翘课成功'
                : '被抓个正着'
              : '老师开始抽查了'}
          </h2>
        </header>

        {stage === 'roll' && (
          <div className="skip-reel-zone">
            <div className="skip-tension-head">
              <span className="skip-heart">♥</span>
              <span>命运抽查中</span>
              <em>HOLD YOUR BREATH</em>
            </div>
            <p className="random-event-text">
              你刚在宿舍坐下，教室里突然安静下来。你盯着手机，等待命运给出今天的抽查方式。
            </p>
            <div
              className={`skip-reel ${rolling ? 'is-rolling' : ''} ${isSettled ? 'is-settled' : ''}`}
            >
              <span className="skip-reel-scan" aria-hidden="true" />
              <span className="skip-reel-label">本次抽查方式</span>
              <div className="skip-reel-window">
                {METHODS.map((item, index) => {
                  const offset =
                    (index - reelIndex + METHODS.length) % METHODS.length
                  const position =
                    offset === 0
                      ? 'is-current'
                      : offset === 1
                        ? 'is-next'
                        : offset === METHODS.length - 1
                          ? 'is-prev'
                          : 'is-hidden'
                  return (
                    <div
                      key={item.key}
                      className={`skip-reel-item ${position}`}
                      style={{ transitionDuration: `${reelInterval}ms` }}
                    >
                      <strong>{item.label}</strong>
                      {offset === 0 && <small>{item.hint}</small>}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="skip-progress">
              <i />
            </div>
            <p className="skip-suspense-line" key={suspenseIndex}>
              {SUSPENSE_LINES[suspenseIndex]}
            </p>
            <p className="skip-reel-note">
              {isSettled ? '结果锁定……老师正在看你。' : '转盘正在减速……四秒后揭晓'}
            </p>
          </div>
        )}

        {stage === 'choose' && (
          <div className="skip-choice-zone">
            <div className="skip-method-banner">
              <span>老师选择了</span>
              <strong>{method.label}</strong>
              <p>{method.hint}</p>
            </div>
            <p className="skip-choice-note">只有能应对这次抽查的方法才亮着。</p>
            <div className="skip-reaction-grid">
              {REACTIONS.map((reaction) => {
                const enabled = reaction.key === correctReaction?.key
                return (
                  <button
                    key={reaction.key}
                    type="button"
                    className={`skip-reaction-card ${enabled ? 'is-enabled' : 'is-disabled'}`}
                    disabled={!enabled}
                    onClick={() => chooseReaction(reaction)}
                  >
                    <strong>{reaction.label}</strong>
                    <span>{reaction.hint}</span>
                    {!enabled && <em>对不上这次抽查</em>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {stage === 'result' && result && (
          <div className={`skip-result-zone ${result.success ? 'is-success' : 'is-fail'}`}>
            <p className="random-event-text">{result.text}</p>
            <div className="skip-result-stamp">
              {result.success ? '本次翘课未被发现' : '翘课失败 · 平时分 -20% · 压力 +5'}
            </div>
            <footer className="random-event-footer">
              <p>
                {result.success
                  ? '你成功把这一格时间变成了自由时间。'
                  : '老师在你的名字旁边做了一个记号。'}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onResolved(result.success)}
              >
                回到自由时间
                <span className="btn-arrow">→</span>
              </button>
            </footer>
          </div>
        )}
      </section>
    </div>
  )
}
