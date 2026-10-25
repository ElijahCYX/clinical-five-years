import type { GameState } from '../types'
import { getCampusBroadcast } from '../campusBroadcast'

interface CampusNoticeBoardProps {
  state: GameState
}

export function CampusNoticeBoard({ state }: CampusNoticeBoardProps) {
  const broadcast = getCampusBroadcast(state)
  const notices = state.noticeFeed ?? []

  return (
    <section className="campus-notice-board">
      <div className="campus-notice-head">
        <span>CAMPUS NOTICE</span>
        <span>校园通知</span>
      </div>

      <div className="campus-broadcast">
        <div className="campus-subhead">
          <span>校园广播</span>
          <small>今日播报</small>
        </div>
        <div className="campus-broadcast-copy">
          <p className="broadcast-weather">{broadcast.weather}</p>
          <p>{broadcast.campus}</p>
          <p>{broadcast.holiday}</p>
        </div>
      </div>

      <div className="campus-player-notices">
        <div className="campus-subhead">
          <span>给你的通知</span>
          <small>{notices.length} 条</small>
        </div>
        <div className="campus-notice-scroll">
          {notices.length === 0 ? (
            <p className="campus-notice-empty">
              还没有单独通知你的事。等校园里发生点什么，这里会记下来。
            </p>
          ) : (
            notices.map((notice) => (
              <article className="campus-notice-item" key={notice.id}>
                <time>{notice.time}</time>
                <strong>{notice.title}</strong>
                <p>{notice.text}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
