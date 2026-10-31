import { GAME_SUBTITLE, SCHOOL_NAME } from '../data'
import { Eyebrow, Footer, HeartLineArt, Stamp, TopBar } from '../ui'

interface TitleScreenProps {
  hasSave: boolean
  onStart: () => void
  onContinue: () => void
  onTestClinical?: () => void
}

export function TitleScreen({ hasSave, onStart, onContinue, onTestClinical }: TitleScreenProps) {
  return (
    <div className="screen title-screen">
      <div className="shell">
        <TopBar
          right={<span className="topbar-note">本科 · 临床医学</span>}
        />

        <main className="title-grid">
          <section className="title-hero">
            <Eyebrow>CLINICAL FIVE-YEAR · A STUDENT RECORD</Eyebrow>
            <h1 className="title-display">
              <span>临床</span>
              <em>五年</em>
            </h1>
            <p className="title-sub">{GAME_SUBTITLE}</p>
            <p className="title-copy">
              录取通知书上写着“临床医学”四个字。
              你当时并不知道它们的分量，只知道从九月起，
              你要开始学着把一个个具体的人，读成一页页需要被认真对待的病历。
            </p>

            <div className="title-meta">
              <span>21 季主线</span>
              <i />
              <span>8 维天赋</span>
              <i />
              <span>196 学分</span>
              <i />
              <span>多种人生去向</span>
            </div>

            <div className="title-actions">
              <button className="btn btn-primary btn-large" type="button" onClick={onStart}>
                领取学生证，开始五年
                <span className="btn-arrow">→</span>
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={onContinue}
                disabled={!hasSave}
              >
                {hasSave ? '继续上次档案' : '暂无存档'}
              </button>
              {import.meta.env.DEV && onTestClinical && (
                <button
                  className="btn btn-ghost title-test-btn"
                  type="button"
                  onClick={onTestClinical}
                >
                  测试：临床
                </button>
              )}
            </div>

            <blockquote className="title-quote">
              “先把今天过完。明天的事，明天再想。”
              <span>—— 一位不愿透露姓名的学长</span>
            </blockquote>
          </section>

          <aside className="enroll-wrap">
            <div className="paper-card enroll-card">
              <span className="tape" aria-hidden="true" />
              <Eyebrow>ENROLLMENT RECORD / 001</Eyebrow>
              <h2 className="enroll-title">新生报到</h2>
              <p className="enroll-school">{SCHOOL_NAME} · 临床医学（五年制）</p>

              <div className="enroll-fields">
                <div>
                  <span>姓名</span>
                  <strong>待填写</strong>
                </div>
                <div>
                  <span>天赋</span>
                  <strong>待分配</strong>
                </div>
                <div>
                  <span>家庭背景</span>
                  <strong>交由命运</strong>
                </div>
                <div>
                  <span>学制</span>
                  <strong>五年 · 二十一季</strong>
                </div>
              </div>

              <p className="enroll-note">
                这是一份虚构的入学档案。时间、金额与人物均为游戏单位。
                请先填写你的学生档案，再领取学生证。
              </p>

              <HeartLineArt />
              <Stamp />
            </div>

            <div className="enroll-caption">
              <span>LIFE IS MORE THAN A SCORE.</span>
              <span>01 / 001</span>
            </div>
          </aside>
        </main>

        <Footer />
      </div>
    </div>
  )
}
