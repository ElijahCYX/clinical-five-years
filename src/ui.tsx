import { useSyncExternalStore, type ReactNode } from 'react'
import { GAME_TITLE, SCHOOL_EN, SCHOOL_NAME } from './data'
import { getSaveHandler, requestSave, subscribeSave } from './saveBridge'

export function CrossMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="17.5" stroke="currentColor" strokeWidth="1" />
      <path d="M20 11.5V28.5M11.5 20H28.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="2.2" fill="currentColor" opacity=".8" />
    </svg>
  )
}

interface TopBarProps {
  right?: ReactNode
  minimal?: boolean
  onTitle?: () => void
}

function SaveTopbarButton() {
  const canSave = useSyncExternalStore(
    subscribeSave,
    () => Boolean(getSaveHandler()),
    () => false,
  )
  if (!canSave) return null
  return (
    <button
      className="save-chip"
      type="button"
      onClick={() => requestSave()}
      title="保存当前进度"
    >
      <span className="save-chip-dot" aria-hidden="true" />
      保存进度
    </button>
  )
}

export function TopBar({ right, minimal = false, onTitle }: TopBarProps) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onTitle} type="button" aria-label="返回标题">
        <CrossMark />
        <span className="brand-copy">
          <span className="brand-cn">{SCHOOL_NAME}</span>
          <span className="brand-en">{SCHOOL_EN} · 学生档案</span>
        </span>
      </button>
      {!minimal && (
        <div className="topbar-center">
          <div className="topbar-line">
            <span className="topbar-title">{GAME_TITLE}</span>
            <span className="topbar-dot">·</span>
            <span className="topbar-tag">五年，二十一季，慢慢成为医生</span>
          </div>
          <div className="topbar-authors">
            <p className="topbar-credits">
              <span>作者</span>
              <strong>Dingihyon</strong>
              <i>・</i>
              <strong>HuongGayu</strong>
            </p>
            <p className="topbar-thanks">
              感谢所有测试本游戏的朋友。无论你是否是医学生，感谢你愿意花时间了解医学生的生活。
            </p>
          </div>
        </div>
      )}
      <div className="topbar-right">
        <SaveTopbarButton />
        {right}
      </div>
    </header>
  )
}


export function InterfaceNav({
  active,
  onMain,
  onWho,
  onTA,
  badges = {},
}: {
  active: 'main' | 'who' | 'ta'
  onMain: () => void
  onWho: () => void
  onTA: () => void
  badges?: Partial<Record<'main' | 'who' | 'ta', string | number | boolean>>
}) {
  const renderBadge = (value: string | number | boolean | undefined) => {
    if (value === undefined || value === false || value === 0 || value === '') {
      return null
    }
    return (
      <span className="interface-badge" aria-label="有未完成操作">
        {typeof value === 'number'
          ? value
          : typeof value === 'string'
            ? value
            : ''}
      </span>
    )
  }

  const item = (
    key: 'main' | 'who' | 'ta',
    label: string,
    onClick: () => void,
  ) => {
    const badge = renderBadge(badges[key])
    return (
      <button
        type="button"
        className={`interface-btn ${active === key ? 'is-active' : ''} ${badge ? 'has-badge' : ''}`}
        onClick={onClick}
        aria-current={active === key ? 'page' : undefined}
      >
        {label}
        {badge}
      </button>
    )
  }

  return (
    <nav className="interface-nav" aria-label="界面切换">
      {item('main', '主界面', onMain)}
      {item('who', '我是谁', onWho)}
      {item('ta', 'TA 是谁', onTA)}
    </nav>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`eyebrow ${className}`}>{children}</div>
}

export function SectionLabel({
  children,
  right,
}: {
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="section-label">
      <span>{children}</span>
      <span className="section-rule" />
      {right && <span className="section-label-right">{right}</span>}
    </div>
  )
}

export function Bar({
  value,
  max = 100,
  tone = 'green',
  thin = false,
  previewValue,
}: {
  value: number
  max?: number
  tone?: 'green' | 'red' | 'gold' | 'orange' | 'black'
  thin?: boolean
  previewValue?: number
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  const previewPercent =
    previewValue === undefined
      ? percent
      : Math.max(0, Math.min(100, (previewValue / max) * 100))
  const hasPreview = previewValue !== undefined && Math.abs(previewPercent - percent) > 0.01
  const isIncrease = previewPercent > percent
  return (
    <div className={`bar ${thin ? 'bar-thin' : ''}`}>
      <div className={`bar-fill bar-${tone}`} style={{ width: `${percent}%` }} />
      {hasPreview && isIncrease && (
        <div
          className={`bar-future bar-${tone}`}
          style={{ left: `${percent}%`, width: `${previewPercent - percent}%` }}
        />
      )}
      {hasPreview && !isIncrease && (
        <div
          className={`bar-loss bar-${tone}`}
          style={{ left: `${previewPercent}%`, width: `${percent - previewPercent}%` }}
        />
      )}
    </div>
  )
}

export function StatBar({
  label,
  value,
  max = 100,
  tone = 'green',
  valueLabel,
  sub,
  previewValue,
}: {
  label: string
  value: number
  max?: number
  tone?: 'green' | 'red' | 'gold' | 'orange' | 'black'
  valueLabel?: string
  sub?: string
  previewValue?: number
}) {
  const hasPreview = previewValue !== undefined && previewValue !== value
  return (
    <div className="stat-row">
      <div className="stat-line">
        <span className="stat-label">{label}</span>
        <span className="stat-bar-track">
          <Bar value={value} max={max} tone={tone} previewValue={previewValue} />
        </span>
        <span className="stat-value">
          {valueLabel ?? value}
          <span className="stat-max">/{max}</span>
          {hasPreview && (
            <span className="stat-preview-value">→ {previewValue}</span>
          )}
        </span>
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export function Stamp({ text = '漸江大學醫學院', sub = '教務處' }: { text?: string; sub?: string }) {
  const college = text.endsWith('醫學院')
    ? '醫學院'
    : text.endsWith('医学院')
      ? '医学院'
      : ''
  const university = college ? text.slice(0, -college.length) : text
  return (
    <div className="stamp" aria-hidden="true">
      <span className="stamp-inner">
        <span className="stamp-top">★</span>
        <span className="stamp-text">
          <span>{university}</span>
          {college && <span>{college}</span>}
        </span>
        <span className="stamp-sub">{sub}</span>
      </span>
    </div>
  )
}

export function StressHearts({ value }: { value: number }) {
  const hearts = Math.max(0, Math.min(3, value))
  return (
    <div className="stress-hearts" aria-label={`剩余心力 ${hearts} / 3`}>
      <span className="stress-hearts-label">心力</span>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`stress-heart ${index >= hearts ? 'is-broken' : ''}`}
          aria-hidden="true"
        >
          {index >= hearts ? '♡' : '♥'}
        </span>
      ))}
      <span className="stress-hearts-note">{hearts === 0 ? '已经碎完了' : `${hearts} / 3`}</span>
    </div>
  )
}

export function Pill({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'green' | 'red' | 'gold' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

export function Dot({ active = true }: { active?: boolean }) {
  return <span className={`dot ${active ? 'dot-on' : 'dot-off'}`} />
}

export function HeartLineArt({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`heart-art ${className}`}
      viewBox="0 0 360 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M180 168C140 140 96 112 96 80C96 57 113 41 135 41C151 41 168 50 180 65C192 50 209 41 225 41C247 41 264 57 264 80C264 112 220 140 180 168Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path
        d="M18 109H77L89 90L103 129L124 60L143 109H173L184 94L198 109H340"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="180" cy="92" r="50" stroke="currentColor" strokeWidth=".6" strokeDasharray="2 6" opacity=".65" />
      <path d="M294 49V67M285 58H303" stroke="currentColor" strokeWidth=".8" opacity=".7" />
      <path d="M56 46V59M49.5 52.5H62.5" stroke="currentColor" strokeWidth=".7" opacity=".55" />
      <circle cx="315" cy="132" r="1.7" fill="currentColor" opacity=".55" />
      <circle cx="43" cy="146" r="1.3" fill="currentColor" opacity=".45" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <span>虚构作品 · 非医学建议</span>
      <span>进度仅保存在当前浏览器</span>
    </footer>
  )
}
