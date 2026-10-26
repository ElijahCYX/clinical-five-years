import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { GAME_TITLE, SCHOOL_EN, SCHOOL_NAME } from './data'
import { getSaveHandler, requestSave, subscribeSave } from './saveBridge'
import {
  getExplanationSettings,
  setExplanationSettings,
  subscribeExplanation,
  type ExplanationCategory,
} from './explanation'

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

const EXPLAIN_CATEGORIES: Array<{
  id: ExplanationCategory
  label: string
  detail: string
}> = [
  { id: 'page', label: '页面导语', detail: '页面标题下的介绍与开场说明' },
  { id: 'card', label: '卡片描述', detail: '行动、计划与习惯卡上的说明文案' },
  { id: 'rule', label: '规则提示', detail: '注意事项、提醒与规则说明' },
]

function ExplanationToggle() {
  const settings = useSyncExternalStore(
    subscribeExplanation,
    getExplanationSettings,
    getExplanationSettings,
  )
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const setCategory = (category: ExplanationCategory) => {
    setExplanationSettings({ [category]: !settings[category] })
  }

  return (
    <div className="explain-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`explain-toggle ${settings.master ? 'is-on' : ''}`}
        aria-pressed={settings.master}
        aria-label="显示或隐藏解释说明"
        title={settings.master ? '隐藏解释说明' : '显示解释说明'}
        onClick={() => {
          setExplanationSettings({ master: !settings.master })
          if (settings.master) setOpen(false)
        }}
      >
        <span className="explain-toggle-glyph" aria-hidden="true">i</span>
        <span className="explain-toggle-label">解释</span>
        <span className="explain-toggle-track" aria-hidden="true">
          <span />
        </span>
      </button>
      {settings.master && (
        <button
          type="button"
          className={`explain-caret ${open ? 'is-open' : ''}`}
          aria-label="解释说明分类"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          ⌄
        </button>
      )}
      {open && settings.master && (
        <div className="explain-menu" role="menu">
          <p>解释说明</p>
          {EXPLAIN_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="switch"
              aria-checked={settings[item.id]}
              className={`explain-menu-row ${settings[item.id] ? 'is-on' : ''}`}
              onClick={() => setCategory(item.id)}
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
              <i aria-hidden="true">
                <span />
              </i>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const CANVAS_RATIO_KEY = 'clinical-five-years-canvas-ratio'

type CanvasRatioId = 'auto' | '16:10' | '3:2' | '4:3'

const CANVAS_RATIOS: Array<{ id: CanvasRatioId; label: string; detail: string }> = [
  { id: 'auto', label: '自适应', detail: '跟随窗口' },
  { id: '16:10', label: '16:10', detail: '标准画布' },
  { id: '3:2', label: '3:2', detail: '略高一档' },
  { id: '4:3', label: '4:3', detail: '更接近方形' },
]

function canvasAspectFor(id: CanvasRatioId): number {
  if (id === '16:10') return 1.6
  if (id === '3:2') return 1.5
  if (id === '4:3') return 4 / 3
  const raw = (window.innerWidth - 24) / Math.max(1, window.innerHeight - 24)
  return Math.max(1.2, Math.min(2.2, raw))
}

function applyCanvasRatio(id: CanvasRatioId) {
  const aspect = canvasAspectFor(id)
  document.documentElement.style.setProperty('--canvas-aspect', aspect.toFixed(5))
  document.documentElement.dataset.canvasRatio = id
}

function readStoredCanvasRatio(): CanvasRatioId {
  const stored = localStorage.getItem(CANVAS_RATIO_KEY)
  return CANVAS_RATIOS.some((item) => item.id === stored)
    ? (stored as CanvasRatioId)
    : '16:10'
}

function CanvasRatioButton() {
  const [ratio, setRatio] = useState<CanvasRatioId>(readStoredCanvasRatio)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const apply = () => applyCanvasRatio(ratio)
    apply()
    localStorage.setItem(CANVAS_RATIO_KEY, ratio)
    if (ratio !== 'auto') return
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [ratio])

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const current = CANVAS_RATIOS.find((item) => item.id === ratio) ?? CANVAS_RATIOS[1]

  return (
    <div className="canvas-ratio-wrap" ref={wrapRef}>
      <button
        type="button"
        className="canvas-ratio-chip"
        aria-label="调整画布比例"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>画布 {current.label}</span>
        <i aria-hidden="true">⌄</i>
      </button>
      {open && (
        <div className="canvas-ratio-menu" role="menu">
          <p>画布比例</p>
          {CANVAS_RATIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitemradio"
              aria-checked={ratio === item.id}
              className={ratio === item.id ? 'is-active' : ''}
              onClick={() => {
                setRatio(item.id)
                setOpen(false)
              }}
            >
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
              {ratio === item.id && <em>当前</em>}
            </button>
          ))}
        </div>
      )}
    </div>
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
              <strong>
                Dingihyon<sup title="共同作者">#</sup>
              </strong>
              <i>・</i>
              <strong>
                HuongGayu<sup title="共同作者">#</sup>
              </strong>
              <i>・</i>
              <strong>林小菌</strong>
            </p>
            <p className="topbar-thanks">
              感谢所有测试本游戏的朋友。无论你是否是医学生，感谢你愿意花时间了解医学生的生活。
            </p>
          </div>
        </div>
      )}
      <div className="topbar-right">
        <ExplanationToggle />
        <CanvasRatioButton />
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
  variant = 'top',
}: {
  active: 'main' | 'who' | 'ta'
  onMain: () => void
  onWho: () => void
  onTA: () => void
  badges?: Partial<Record<'main' | 'who' | 'ta', string | number | boolean>>
  variant?: 'top' | 'bottom'
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
    <nav className={`interface-nav is-${variant}`} aria-label="界面切换">
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
