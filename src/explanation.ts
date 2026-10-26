export type ExplanationCategory = 'page' | 'card' | 'rule' | 'value'

export interface ExplanationSettings {
  master: boolean
  page: boolean
  card: boolean
  rule: boolean
  value: boolean
}

const STORAGE_KEY = 'clinical-five-years-explanations-v1'

const DEFAULT_SETTINGS: ExplanationSettings = {
  master: true,
  page: true,
  card: true,
  rule: true,
  value: true,
}

function readSettings(): ExplanationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<ExplanationSettings>
    return {
      master: parsed.master !== false,
      page: parsed.page !== false,
      card: parsed.card !== false,
      rule: parsed.rule !== false,
      value: parsed.value !== false,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

let current = readSettings()
const listeners = new Set<() => void>()

export function getExplanationSettings(): ExplanationSettings {
  return current
}

export function subscribeExplanation(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function writeRootAttributes() {
  const root = document.documentElement
  root.dataset.explainMaster = current.master ? 'on' : 'off'
  root.dataset.explainPage = current.page ? 'on' : 'off'
  root.dataset.explainCard = current.card ? 'on' : 'off'
  root.dataset.explainRule = current.rule ? 'on' : 'off'
  root.dataset.explainValue = current.value ? 'on' : 'off'
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    // localStorage may be unavailable in private mode; the in-memory setting still works.
  }
}

export function setExplanationSettings(
  patch: Partial<ExplanationSettings>,
) {
  current = { ...current, ...patch }
  persist()
  writeRootAttributes()
  listeners.forEach((listener) => listener())
}

const SELECTORS: Record<ExplanationCategory, string[]> = {
  page: [
    '.page-lede',
    '.ending-lede',
    '.event-lede',
    '.title-copy',
    '.title-sub',
    '.focus-lede',
    '.skip-rules-lede',
    '.week-title-row p',
    '.vacation-banner p',
    '.dinner-head p',
  ],
  card: [
    '.action-flavor',
    '.plan-desc',
    '.plan-tagline',
    '.habit-desc',
    '.plan-course-note',
    '.event-sub',
    '.birthday-choice-desc',
    '.research-locked-card > p',
    '.research-panel-head > p',
    '.research-panel > p',
    '.club-panel-head p',
    '.club-panel > p',
    '.roommate-card p',
    '.whois-card p',
    '.scholarship-card p',
    '.bond-card p',
    '.prep-course-card p',
    '.cet-result-card p',
    '.exam-table-card p',
    '.club-picker-item p',
    '.slot-course-panel > p',
    '.review-card p',
  ],
  rule: [
    '.bond-non-lover-note',
    '.cet-note',
    '.cet-result-note',
    '.club-application-note',
    '.club-panel-note',
    '.condition-note',
    '.condition-notes',
    '.constitution-decay-note',
    '.elective-exclusion-note',
    '.elective-hint',
    '.ending-note',
    '.enroll-note',
    '.exam-note',
    '.field-note',
    '.focus-note',
    '.habit-decay-note',
    '.muted-note',
    '.pe-picker-note',
    '.placeholder-note',
    '.preview-note',
    '.random-event-hint',
    '.research-action-note',
    '.result-footnote',
    '.result-note',
    '.result-stress-copy',
    '.skip-choice-note',
    '.skip-reel-note',
    '.slot-auto-note',
    '.stat-hint',
    '.status-rail-note',
    '.stress-hearts-note',
    '.talent-plain-note',
    '.waiting-note',
    '.locked-panel > p',
    '.stat-sub',
    '.slot-free-note',
  ],
  value: [
    '.action-effect',
    '.plan-effects',
    '.habit-effect',
    '.review-effect',
    '.review-meta',
    '.prep-gain',
    '.random-event-effects',
    '.random-event-effect',
    '.travel-effect-list',
    '.delta-row',
    '.boost-deltas',
    '.memo-deltas',
    '.scholarship-reward',
    '.slot-course-actions .btn small',
    '.daily-action-btn small',
    '.action-repeat',
  ],
}

const CATEGORY_ORDER: ExplanationCategory[] = ['value', 'page', 'rule', 'card']

function isHidden(category: ExplanationCategory): boolean {
  return !current.master || !current[category]
}

function fontSizeOf(element: HTMLElement): number {
  return parseFloat(getComputedStyle(element).fontSize) || 0
}

const CARD_SELECTORS = [
  '.action-card',
  '.plan-card',
  '.habit-card',
  '.plan-course-card',
  '.course-card',
  '.club-panel',
  '.club-card',
  '.club-picker-item',
  '.locked-panel',
  '.review-card',
  '.daily-action-btn',
  '.research-panel',
  '.research-locked-card',
  '.result-stress-card',
  '.event-card',
  '.ending-card',
  '.focus-modal',
  '.random-event-modal',
  '.dinner-modal',
  '.bond-card',
  '.roommate-card',
  '.scholarship-card',
  '.exam-table-card',
  '.cet-result-card',
  '.memo-card',
  '.week-phase-card',
  '.prep-course-card',
  '.identity-card',
  '.status-card',
  '.paper-card',
  '.whois-card',
  '.boost-card',
  '.enroll-card',
]

function findCard(element: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = element.parentElement
  while (node && node !== document.body) {
    if (CARD_SELECTORS.some((selector) => node!.matches(selector))) return node
    node = node.parentElement
  }
  return null
}

function findCardTitle(card: HTMLElement): HTMLElement | null {
  const headings = Array.from(
    card.querySelectorAll<HTMLElement>('h1, h2, h3, h4'),
  ).filter((heading) => !heading.closest('.explain-i'))
  if (headings.length > 0) {
    return headings.reduce((best, item) =>
      fontSizeOf(item) > fontSizeOf(best) ? item : best,
    )
  }
  const named = Array.from(
    card.querySelectorAll<HTMLElement>('[class*="name"], [class*="title"], strong'),
  ).filter(
    (item) =>
      !item.closest('.explain-i') &&
      !item.closest('[data-explain-category]') &&
      (item.textContent ?? '').trim().length > 0,
  )
  if (named.length > 0) {
    return named.reduce((best, item) =>
      fontSizeOf(item) > fontSizeOf(best) ? item : best,
    )
  }
  return null
}

function findAnchorHeading(element: HTMLElement): HTMLElement | null {
  const card = findCard(element)
  if (card) {
    const title = findCardTitle(card)
    if (title) return title
  }

  let node: HTMLElement | null = element.parentElement
  while (node && node !== document.body) {
    const headings = Array.from(
      node.querySelectorAll<HTMLElement>('h1, h2, h3, h4'),
    ).filter(
      (heading) =>
        !element.contains(heading) &&
        !heading.closest('.explain-i') &&
        !heading.closest('.explain-cat'),
    )
    if (headings.length > 0) {
      const preceding = headings.filter(
        (heading) =>
          (heading.compareDocumentPosition(element) &
            Node.DOCUMENT_POSITION_FOLLOWING) !==
          0,
      )
      const pool = preceding.length > 0 ? preceding : headings
      return pool.reduce((best, item) =>
        fontSizeOf(item) > fontSizeOf(best) ? item : best,
      )
    }
    node = node.parentElement
  }
  const section = element.closest<HTMLElement>('.section-label')
  return section
}

function ensureTooltip(): HTMLDivElement {
  let tooltip = document.querySelector<HTMLDivElement>('.explain-tip')
  if (!tooltip) {
    tooltip = document.createElement('div')
    tooltip.className = 'explain-tip'
    tooltip.setAttribute('role', 'tooltip')
    document.body.appendChild(tooltip)
  }
  return tooltip
}

let hideTimer = 0
let activeButton: HTMLElement | null = null

function hideTooltip() {
  window.clearTimeout(hideTimer)
  hideTimer = 0
  activeButton = null
  const tooltip = document.querySelector<HTMLDivElement>('.explain-tip')
  if (tooltip) {
    tooltip.classList.remove('is-visible')
    tooltip.textContent = ''
  }
}

function showTooltip(button: HTMLElement) {
  const text = button.dataset.explainText?.trim()
  if (!text) return
  const tooltip = ensureTooltip()
  tooltip.textContent = text
  tooltip.classList.add('is-visible')
  activeButton = button

  const rect = button.getBoundingClientRect()
  const margin = 8
  const width = Math.min(360, window.innerWidth - margin * 2)
  tooltip.style.width = `${width}px`
  tooltip.style.maxHeight = `${Math.min(320, window.innerHeight * 0.55)}px`

  const measured = tooltip.getBoundingClientRect()
  let left = Math.min(
    Math.max(margin, rect.left),
    window.innerWidth - measured.width - margin,
  )
  let top = rect.bottom + 8
  if (top + measured.height > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - measured.height - 8)
  }
  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
}

function attachButtonEvents(button: HTMLElement) {
  const hoverCapable = window.matchMedia('(hover: hover)').matches
  button.addEventListener('pointerenter', () => {
    if (!hoverCapable) return
    window.clearTimeout(hideTimer)
    showTooltip(button)
  })
  button.addEventListener('pointerleave', () => {
    if (!hoverCapable) return
    hideTooltip()
  })
  button.addEventListener('click', (event) => {
    event.stopPropagation()
    if (activeButton === button) {
      hideTooltip()
      return
    }
    showTooltip(button)
    window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(hideTooltip, 5000)
  })
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    showTooltip(button)
    window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(hideTooltip, 5000)
  })
}

function removeInfoButtons() {
  document.querySelectorAll('.explain-i').forEach((button) => button.remove())
  hideTooltip()
}

let smallTextOriginal = new WeakMap<
  HTMLElement,
  { value: string; priority: string }
>()

function clearSmallTextScale() {
  document
    .querySelectorAll<HTMLElement>('[data-explain-small="on"]')
    .forEach((element) => {
      const original = smallTextOriginal.get(element)
      if (original) {
        if (original.value) {
          element.style.setProperty(
            'font-size',
            original.value,
            original.priority,
          )
        } else {
          element.style.removeProperty('font-size')
        }
      } else {
        element.style.removeProperty('font-size')
      }
      element.removeAttribute('data-explain-small')
    })
  smallTextOriginal = new WeakMap()
}

function hasDirectText(element: HTMLElement): boolean {
  return Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim(),
  )
}

function applySmallTextScale() {
  clearSmallTextScale()
  if (current.master) return

  const candidates: Array<{ element: HTMLElement; size: number }> = []
  const chromeSelector =
    '.topbar, .interface-nav, .game-footer, .explain-tip, .explain-i, #app-version'

  document.querySelectorAll<HTMLElement>('body *').forEach((element) => {
    if (element.closest(chromeSelector)) return
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH'].includes(element.tagName)) {
      return
    }
    if (!hasDirectText(element)) return
    if (element.getClientRects().length === 0) return
    const size = parseFloat(getComputedStyle(element).fontSize)
    if (!Number.isFinite(size) || size <= 0) return
    candidates.push({ element, size: Math.round(size * 10) / 10 })
  })

  if (candidates.length === 0) return
  const tiers = Array.from(
    new Set(candidates.map((candidate) => candidate.size)),
  ).sort((a, b) => b - a)
  if (tiers.length < 4) return
  const third = tiers[2]

  candidates.forEach(({ element, size }) => {
    if (size >= third - 0.05) return
    const delta = third - size >= 3 ? 2 : 1
    const target = Math.min(third, Math.round((size + delta) * 10) / 10)
    if (target <= size + 0.05) return
    smallTextOriginal.set(element, {
      value: element.style.getPropertyValue('font-size'),
      priority: element.style.getPropertyPriority('font-size'),
    })
    element.dataset.explainSmall = 'on'
    element.style.setProperty('font-size', `${target}px`, 'important')
  })
}

function scan() {
  if (!document.body) return

  // Tag the explanatory elements once. Explicit card/page selectors win over
  // generic note selectors so an element never belongs to two categories.
  const assigned = new Map<HTMLElement, ExplanationCategory>()
  for (const category of CATEGORY_ORDER) {
    for (const selector of SELECTORS[category]) {
      document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (!assigned.has(element)) assigned.set(element, category)
      })
    }
  }
  for (const [element, category] of assigned) {
    if (element.dataset.explainCategory !== category) {
      element.dataset.explainCategory = category
    }
  }

  const groups = new Map<HTMLElement, string[]>()
  for (const category of CATEGORY_ORDER) {
    if (!isHidden(category)) continue
    for (const selector of SELECTORS[category]) {
      document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (element.closest('.explain-i')) return
        const heading = findAnchorHeading(element)
        if (!heading) return
        const text = (element.textContent ?? '').trim()
        if (!text) return
        const list = groups.get(heading) ?? []
        if (!list.includes(text)) list.push(text)
        groups.set(heading, list)
      })
    }
  }

  // Remove icons whose content is no longer hidden.
  document.querySelectorAll<HTMLElement>('.explain-i').forEach((button) => {
    const heading = button.parentElement
    if (!heading || !groups.has(heading)) button.remove()
  })

  for (const [heading, texts] of groups) {
    const text = texts.join('\n\n')
    let button = heading.querySelector<HTMLElement>(':scope > .explain-i')
    if (!button) {
      button = document.createElement('span')
      button.className = 'explain-i'
      button.setAttribute('role', 'button')
      button.tabIndex = 0
      button.setAttribute('aria-label', '查看说明')
      button.textContent = 'i'
      heading.appendChild(button)
      attachButtonEvents(button)
    }
    button.textContent = 'i'
    button.dataset.explainText = text
    button.title = '查看说明'
  }

  if (groups.size === 0) hideTooltip()
  applySmallTextScale()
}

let initialized = false

export function initExplanationDecorator() {
  if (initialized || typeof document === 'undefined') return
  initialized = true
  writeRootAttributes()
  ensureTooltip()

  let scheduled = false
  const scheduleScan = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      scan()
    })
  }

  subscribeExplanation(() => {
    removeInfoButtons()
    scheduleScan()
  })

  document.addEventListener('mousedown', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.explain-i') && !target.closest('.explain-tip')) {
      hideTooltip()
    }
  })
  window.addEventListener('scroll', hideTooltip, true)
  window.addEventListener('resize', hideTooltip)
  window.addEventListener('resize', scheduleScan)

  const observer = new MutationObserver(scheduleScan)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  })
  scheduleScan()
}

export function toggleExplanationMaster() {
  setExplanationSettings({ master: !current.master })
}

export function toggleExplanationCategory(category: ExplanationCategory) {
  setExplanationSettings({ [category]: !current[category] })
}
