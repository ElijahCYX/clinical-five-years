import { useEffect, useMemo, useRef, useState } from 'react'
import type { GameState, NpcRelation, Relationship } from '../types'
import { bondLabel } from '../bonds'
import { relationshipKindLabel } from '../social'
import {
  getNpcClueTarget,
  npcClueAttemptedThisWeek,
  npcGraphName,
  npcRelationLabel,
  type NpcClueTarget,
} from '../npcRelations'
import { SectionLabel } from '../ui'

interface RelationshipNetworkProps {
  state: GameState
  onInvestigateNpcClue?: (relationId: string) => {
    success: boolean
    chance: number
    message: string
    name?: string
    attemptedThisWeek: boolean
  } | null
}

interface ClueResultView {
  success: boolean
  message: string
  name?: string
  attemptedThisWeek: boolean
}

type NodeKind = 'player' | 'relationship' | 'unknown'

interface GraphNode {
  id: string
  name: string
  kind: NodeKind
  intimacy: number
  relationship?: Relationship
}

interface GraphEdge {
  id: string
  from: string
  to: string
  label: string
  kind: string
  intimacy: number
  isPlayerEdge: boolean
}

interface Point {
  x: number
  y: number
}

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

const PLAYER_NODE = '__player__'
const MIN_RADIUS = 78
const MAX_RADIUS = 258

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function radiusFor(intimacy: number): number {
  const normalized = Math.max(0, Math.min(100, intimacy)) / 100
  return MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * (1 - normalized)
}

function playerEdgeLabel(relation: Relationship): string {
  if (relation.partner || relation.bondType) return bondLabel(relation.bondType)
  return relationshipKindLabel(relation.kind)
}

function buildGraph(state: GameState): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    {
      id: PLAYER_NODE,
      name: state.player?.name ?? '我',
      kind: 'player',
      intimacy: 100,
    },
  ]
  const knownIds = new Set<string>()
  for (const relation of state.relationships) {
    knownIds.add(relation.id)
    nodes.push({
      id: relation.id,
      name: relation.name,
      kind: 'relationship',
      intimacy: relation.intimacy,
      relationship: relation,
    })
  }
  const edges: GraphEdge[] = state.relationships.map((relation) => ({
    id: `player-${relation.id}`,
    from: PLAYER_NODE,
    to: relation.id,
    label: playerEdgeLabel(relation),
    kind: relation.bondType ?? relation.kind,
    intimacy: relation.intimacy,
    isPlayerEdge: true,
  }))

  const knownNpcEdges = new Map<string, NpcRelation>()
  const priority: Record<string, number> = {
    lover: 6,
    brother: 5,
    sister: 5,
    crush: 4,
    ex: 3,
    conflict: 3,
    friend: 2,
    clubmate: 1,
    classmate: 1,
    roommate: 1,
  }
  for (const relation of state.npcRelations ?? []) {
    if (!relation.known) continue
    const key =
      relation.aId < relation.bId
        ? `${relation.aId}|${relation.bId}`
        : `${relation.bId}|${relation.aId}`
    const previous = knownNpcEdges.get(key)
    if (!previous || (priority[relation.kind] ?? 0) > (priority[previous.kind] ?? 0)) {
      knownNpcEdges.set(key, relation)
    }
  }
  for (const relation of knownNpcEdges.values()) {
    for (const endpoint of [relation.aId, relation.bId]) {
      if (endpoint === PLAYER_NODE || knownIds.has(endpoint)) continue
      knownIds.add(endpoint)
      nodes.push({
        id: endpoint,
        name: npcGraphName(state, endpoint),
        kind: 'unknown',
        intimacy: 28,
      })
    }
    edges.push({
      id: relation.id,
      from: relation.aId,
      to: relation.bId,
      label: npcRelationLabel(relation.kind),
      kind: relation.kind,
      intimacy: relation.intimacy,
      isPlayerEdge: false,
    })
  }
  return { nodes, edges }
}

/**
 * True when segment AB passes through rect. Endpoints inside count, and each
 * rectangle edge is tested against the segment.
 */
function lineIntersectsRect(
  a: Point,
  b: Point,
  rect: Rect,
): boolean {
  const inside = (point: Point) =>
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  if (inside(a) || inside(b)) return true

  const segmentIntersects = (
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point,
  ) => {
    const denominator =
      (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
    if (Math.abs(denominator) < 1e-6) return false
    const t =
      ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) /
      denominator
    const u =
      ((p1.x - p3.x) * (p1.y - p2.y) - (p1.y - p3.y) * (p1.x - p2.x)) /
      denominator
    return t >= 0 && t <= 1 && u >= 0 && u <= 1
  }

  const corners: Point[] = [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom },
  ]
  return corners.some((corner, index) =>
    segmentIntersects(a, b, corner, corners[(index + 1) % corners.length]),
  )
}

interface LabelPlacement {
  id: string
  text: string
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
  fontSize: number
}

function buildLabels(
  nodes: GraphNode[],
  edges: GraphEdge[],
  positions: Record<string, Point>,
  width: number,
  height: number,
): LabelPlacement[] {
  const candidates = [
    { dx: 16, dy: 4, anchor: 'start' as const },
    { dx: -16, dy: 4, anchor: 'end' as const },
    { dx: 0, dy: 25, anchor: 'middle' as const },
    { dx: 0, dy: -15, anchor: 'middle' as const },
    { dx: 14, dy: 20, anchor: 'start' as const },
    { dx: -14, dy: 20, anchor: 'end' as const },
    { dx: 14, dy: -12, anchor: 'start' as const },
    { dx: -14, dy: -12, anchor: 'end' as const },
  ]

  return nodes.map((node) => {
    const point = positions[node.id]
    const fontSize = node.kind === 'player' ? 16 : node.kind === 'unknown' ? 13 : 12
    const estimatedWidth = Math.max(24, node.name.length * fontSize * 0.62 + 8)
    const estimatedHeight = fontSize + 6
    let best = { cost: Number.POSITIVE_INFINITY, x: 0, y: 0, anchor: 'middle' as LabelPlacement['anchor'] }
    for (const candidate of candidates) {
      const x = point.x + candidate.dx
      const y = point.y + candidate.dy
      const left = candidate.anchor === 'middle' ? x - estimatedWidth / 2 : candidate.anchor === 'end' ? x - estimatedWidth : x
      const top = y - estimatedHeight * 0.7
      const rect: Rect = {
        left: Math.max(2, left - 3),
        top: Math.max(2, top - 2),
        right: Math.min(width - 2, left + estimatedWidth + 3),
        bottom: Math.min(height - 2, y + estimatedHeight * 0.3 + 2),
      }
      let cost = 0
      for (const edge of edges) {
        const from = positions[edge.from]
        const to = positions[edge.to]
        if (!from || !to) continue
        if (lineIntersectsRect(from, to, rect)) {
          cost += edge.isPlayerEdge ? 4 : 1
        }
      }
      // Prefer a label that fits inside the canvas.
      if (rect.left <= 2 || rect.right >= width - 2 || rect.top <= 2 || rect.bottom >= height - 2) {
        cost += 8
      }
      if (cost < best.cost) best = { cost, x, y, anchor: candidate.anchor }
    }
    return {
      id: node.id,
      text: node.name,
      x: best.x,
      y: best.y,
      anchor: best.anchor,
      fontSize,
    }
  })
}

function buildLayout(
  nodes: GraphNode[],
  width: number,
  height: number,
): Record<string, Point> {
  const center = { x: width / 2, y: height / 2 }
  const nonPlayer = nodes.filter((node) => node.kind !== 'player')
  const positions: Record<string, Point> = { [PLAYER_NODE]: center }
  nonPlayer.forEach((node, index) => {
    const base = (index / Math.max(1, nonPlayer.length)) * Math.PI * 2
    const jitter = ((hashString(node.id) % 100) / 100 - 0.5) * 0.18
    const angle = base + jitter
    const radius =
      node.kind === 'unknown'
        ? Math.min(MAX_RADIUS, MIN_RADIUS + 112)
        : radiusFor(node.intimacy)
    positions[node.id] = {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    }
  })
  return positions
}

export function RelationshipNetwork({
  state,
  onInvestigateNpcClue,
}: RelationshipNetworkProps) {
  const [clueTarget, setClueTarget] = useState<NpcClueTarget | null>(null)
  const [clueResult, setClueResult] = useState<ClueResultView | null>(null)
  const liveClueTarget = clueTarget
    ? getNpcClueTarget(state, clueTarget.relation.id)
    : null

  const openUnknownClue = (npcId: string) => {
    const relation = (state.npcRelations ?? []).find(
      (item) =>
        item.known &&
        (item.aId === npcId || item.bId === npcId) &&
        Boolean(state.relationships.some((known) => known.id === item.aId)) &&
        Boolean(state.relationships.some((known) => known.id === item.bId)),
    ) ?? (state.npcRelations ?? []).find(
      (item) =>
        item.known &&
        (item.aId === npcId || item.bId === npcId),
    )
    if (!relation) return
    const target = getNpcClueTarget(state, relation.id)
    if (!target) return
    setClueTarget(target)
    setClueResult(null)
  }

  const investigate = () => {
    if (!liveClueTarget || !onInvestigateNpcClue) return
    const result = onInvestigateNpcClue(liveClueTarget.relation.id)
    if (result) setClueResult(result)
  }

  const graph = useMemo(() => buildGraph(state), [state])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 900, height: 560 })
  const [hoverEdge, setHoverEdge] = useState<GraphEdge | null>(null)
  const [tooltip, setTooltip] = useState<Point>({ x: 0, y: 0 })

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const measure = () => {
      const rect = element.getBoundingClientRect()
      setSize({
        width: Math.max(480, rect.width),
        height: Math.max(360, rect.height),
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const positions = useMemo(
    () => buildLayout(graph.nodes, size.width, size.height),
    [graph.nodes, size.width, size.height],
  )
  const labels = useMemo(
    () => buildLabels(graph.nodes, graph.edges, positions, size.width, size.height),
    [graph.nodes, graph.edges, positions, size.width, size.height],
  )

  const edgeColor = (edge: GraphEdge) => {
    if (edge.isPlayerEdge) {
      return edge.kind === 'lover' || edge.kind === 'brother' || edge.kind === 'sister'
        ? '#a94d5d'
        : '#71847a'
    }
    if (edge.kind === 'lover') return '#b44d63'
    if (edge.kind === 'brother' || edge.kind === 'sister') return '#9b762f'
    if (edge.kind === 'crush') return '#c5864c'
    if (edge.kind === 'conflict' || edge.kind === 'ex') return '#a95743'
    return '#728a7d'
  }

  const pointFor = (id: string): Point =>
    positions[id] ?? { x: size.width / 2, y: size.height / 2 }

  const updateHover = (
    event: React.PointerEvent<SVGLineElement>,
    edge: GraphEdge,
  ) => {
    const rect = containerRef.current?.getBoundingClientRect()
    setTooltip({
      x: rect ? event.clientX - rect.left : event.clientX,
      y: rect ? event.clientY - rect.top : event.clientY,
    })
    setHoverEdge(edge)
  }

  return (
    <div className="tab-panel relationship-graph-panel">
      <div className="relationship-graph-head">
        <div>
          <SectionLabel right={`${graph.nodes.length - 1} 人 · ${graph.edges.length} 条关系`}>
            关系网
          </SectionLabel>
          <p>以你为中心，亲密度决定线的长度。布局固定，悬停连线查看关系。</p>
        </div>
        <span className="relationship-graph-legend">
          <i className="is-lover" /> 羁绊
          <i className="is-crush" /> 暗恋
          <i className="is-conflict" /> 矛盾
          <i className="is-normal" /> 普通关系
          <b>？？</b> 尚未认识
        </span>
      </div>
      <div className="relationship-graph-body" ref={containerRef}>
        <svg
          className="relationship-graph-svg"
          viewBox={`0 0 ${size.width} ${size.height}`}
          role="img"
          aria-label="玩家关系网"
        >
          <g>
            {graph.edges.map((edge) => {
              const from = pointFor(edge.from)
              const to = pointFor(edge.to)
              const isHovered = hoverEdge?.id === edge.id
              return (
                <g key={edge.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={edgeColor(edge)}
                    strokeWidth={isHovered ? 2.4 : edge.isPlayerEdge ? 1.15 : 1}
                    strokeDasharray={edge.isPlayerEdge ? undefined : '4 3'}
                    opacity={isHovered ? 1 : 0.62}
                    className="relationship-graph-edge"
                  />
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="transparent"
                    strokeWidth={14}
                    className="relationship-graph-edge-hit"
                    onPointerEnter={(event) => updateHover(event, edge)}
                    onPointerMove={(event) => updateHover(event, edge)}
                    onPointerLeave={() => setHoverEdge(null)}
                  />
                </g>
              )
            })}
            {graph.nodes.map((node) => {
              const point = pointFor(node.id)
              const isPlayer = node.kind === 'player'
              const isUnknown = node.kind === 'unknown'
              return (
                <g
                  key={node.id}
                  className={`relationship-graph-node ${isPlayer ? 'is-player' : ''} ${isUnknown ? 'is-unknown' : ''}`}
                  transform={`translate(${point.x} ${point.y})`}
                  role={isUnknown ? 'button' : undefined}
                  tabIndex={isUnknown ? 0 : undefined}
                  aria-label={isUnknown ? `调查 ${node.name} 的线索` : undefined}
                  onClick={isUnknown ? () => openUnknownClue(node.id) : undefined}
                  onKeyDown={
                    isUnknown
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            openUnknownClue(node.id)
                          }
                        }
                      : undefined
                  }
                >
                  <circle
                    r={isPlayer ? 15 : isUnknown ? 8 : 11}
                    fill={isPlayer ? 'var(--green)' : '#f7f1e4'}
                    stroke={isPlayer ? 'var(--gold)' : isUnknown ? '#a99e8b' : '#2f5b4c'}
                    strokeWidth={isPlayer ? 2 : 1}
                    strokeDasharray={isUnknown ? '3 2' : undefined}
                  />
                </g>
              )
            })}
            {labels.map((label) => {
              const node = graph.nodes.find((item) => item.id === label.id)
              const isPlayer = node?.kind === 'player'
              const isUnknown = node?.kind === 'unknown'
              return (
                <text
                  key={label.id}
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  className={`relationship-graph-label ${isPlayer ? 'is-player-label' : ''} ${isUnknown ? 'is-unknown-label' : ''}`}
                  style={{ fontSize: label.fontSize }}
                  paintOrder="stroke"
                  stroke="rgba(250, 246, 236, 0.94)"
                  strokeWidth="3"
                >
                  {label.text}
                </text>
              )
            })}
          </g>
        </svg>
        {hoverEdge && (
          <div
            className="relationship-graph-tooltip"
            style={{ left: tooltip.x + 14, top: tooltip.y - 12 }}
          >
            <strong>{hoverEdge.label}</strong>
            <span>
              {hoverEdge.from === PLAYER_NODE
                ? '你'
                : npcGraphName(state, hoverEdge.from)}{' '}
              ↔{' '}
              {hoverEdge.to === PLAYER_NODE
                ? '你'
                : npcGraphName(state, hoverEdge.to)}
            </span>
            <small>亲密度 {Math.round(hoverEdge.intimacy)}</small>
          </div>
        )}
      </div>

      {clueTarget && liveClueTarget && (
        <div
          className="npc-clue-backdrop"
          role="presentation"
          onClick={() => {
            setClueTarget(null)
            setClueResult(null)
          }}
        >
          <section
            className="paper-card npc-clue-card"
            role="dialog"
            aria-modal="true"
            aria-label="NPC 线索"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="npc-clue-kicker">RELATION CLUE / 线索</div>
            <h3>顺着这条关系，也许能知道「？？」是谁</h3>
            <dl className="npc-clue-facts">
              <div>
                <dt>已知当事人</dt>
                <dd>{liveClueTarget.knownPartyName ?? '你还不认识的人'}</dd>
              </div>
              <div>
                <dt>关系</dt>
                <dd>{liveClueTarget.relationLabel}</dd>
              </div>
              <div>
                <dt>未知一方</dt>
                <dd>{liveClueTarget.profile.revealed ? liveClueTarget.profile.name : '？？'}</dd>
              </div>
            </dl>
            {liveClueTarget.profile.revealed ? (
              <p className="npc-clue-copy">
                你已经知道 TA 叫 {liveClueTarget.profile.name}。等下一次校园偶遇，你们才能真正认识。
              </p>
            ) : npcClueAttemptedThisWeek(state, liveClueTarget.relation.id) ? (
              <p className="npc-clue-copy">这条线索本周已经查过，下周再继续吧。</p>
            ) : (
              <>
                <p className="npc-clue-copy">
                  顺着已知当事人的关系去打听，不消耗时间段。成功率取决于你的交际和与当事人的熟悉程度。
                </p>
                <button
                  type="button"
                  className="btn btn-primary npc-clue-action"
                  onClick={investigate}
                  disabled={!onInvestigateNpcClue}
                >
                  调查线索
                </button>
              </>
            )}
            {clueResult && (
              <div
                className={`npc-clue-result ${clueResult.success ? 'is-success' : 'is-failure'}`}
              >
                {clueResult.success && clueResult.name
                  ? `你打听到了名字：${clueResult.name}。`
                  : clueResult.message}
              </div>
            )}
            <button
              type="button"
              className="btn btn-ghost npc-clue-close"
              onClick={() => {
                setClueTarget(null)
                setClueResult(null)
              }}
            >
              收起
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
