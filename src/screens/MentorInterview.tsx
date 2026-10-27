import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MentorInterview } from '../types'

export interface MentorInterviewSceneData {
  interview: MentorInterview
  mentorName: string
  success: boolean
  chance: number
}

interface MentorInterviewSceneProps {
  data: MentorInterviewSceneData
  onConfirm: () => void
}

const SCENE_LINES = [
  '你敲了敲办公室的门。里面传来一声“进”。',
  '导师把电脑合上，示意你坐下。你发现自己不知道该把手放在哪里。',
  '你开始讲自己的课程、兴趣和做过的事。有一句话说到一半忘了，又硬着头皮接了下去。',
  '导师问了你几个问题。你听见自己的声音在办公室里显得格外清楚。',
  '最后，导师停下来看了你一会儿。你听见了自己的心跳。',
]

export function MentorInterviewScene({
  data,
  onConfirm,
}: MentorInterviewSceneProps) {
  const [phase, setPhase] = useState<'scene' | 'result'>('scene')
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    setPhase('scene')
    setLineIndex(0)
    const lineTimer = window.setInterval(() => {
      setLineIndex((index) => Math.min(SCENE_LINES.length - 1, index + 1))
    }, 920)
    const resultTimer = window.setTimeout(() => {
      setPhase('result')
      window.clearInterval(lineTimer)
    }, 5000)
    return () => {
      window.clearInterval(lineTimer)
      window.clearTimeout(resultTimer)
    }
  }, [data.interview.atAbs])

  return createPortal(
    <div className="interview-scene-overlay" role="dialog" aria-modal="true">
      <div className="interview-scene-backdrop" />
      <section className={`interview-scene-card ${phase === 'result' ? 'is-result' : ''}`}>
        {phase === 'scene' ? (
          <>
            <header className="interview-scene-head">
              <span>FACE TO FACE / 面谈</span>
              <small>导师办公室 · 门关着</small>
            </header>
            <div className="interview-scene-stage">
              <div className="interview-figure mentor-figure">
                <span className="interview-figure-head" />
                <span className="interview-figure-body" />
                <i>导师</i>
              </div>
              <div className="interview-desk">
                <span className="interview-desk-paper" />
                <span className="interview-desk-cup" />
              </div>
              <div className="interview-figure student-figure">
                <span className="interview-figure-head" />
                <span className="interview-figure-body" />
                <i>你</i>
              </div>
              <div className="interview-heartbeat" aria-hidden="true">
                <span />
              </div>
            </div>
            <div className="interview-scene-copy" key={lineIndex}>
              <span className="interview-line-index">
                {String(lineIndex + 1).padStart(2, '0')} / 05
              </span>
              <p>{SCENE_LINES[lineIndex]}</p>
            </div>
            <div className="interview-progress">
              <i />
            </div>
            <p className="interview-scene-hint">
              {data.mentorName}老师正在观察你。深呼吸，把话说完。
            </p>
          </>
        ) : (
          <div className="interview-result-view">
            <span className="interview-result-kicker">
              INTERVIEW RESULT / 面谈结果
            </span>
            <div className={`interview-result-seal ${data.success ? 'is-success' : 'is-failure'}`}>
              {data.success ? '通过' : '未通过'}
            </div>
            <h2>{data.success ? '导师点了点头。' : '导师沉默了一会儿。'}</h2>
            <p className="interview-result-text">
              {data.success
                ? `${data.mentorName}老师把你的名字写在了课题组名单上。\n\n“先来组会听听吧。”TA 说。你站起来时，发现自己的腿有点软，但还是认真地把椅子推回了原位。`
                : `${data.mentorName}老师委婉地告诉你，现在还不合适。\n\n你走出办公室，走廊里的灯很亮。你告诉自己，这不是世界末日，只是下一次要准备得更好。`}
            </p>
            <div className="interview-result-meta">
              <span>面谈成功率</span>
              <strong>{Math.round(data.chance * 100)}%</strong>
            </div>
            <button type="button" className="btn btn-primary" onClick={onConfirm}>
              确认结果
              <span className="btn-arrow">→</span>
            </button>
          </div>
        )}
      </section>
    </div>,
    document.body,
  )
}
