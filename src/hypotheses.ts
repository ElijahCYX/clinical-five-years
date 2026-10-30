import type { MentorProfile } from './types'
import { MENTOR_LIBRARY } from './mentors'
import type { Hypothesis } from './types'
import { MENTOR_PAPERS } from './mentorPapers'

/** 把导师的「科室 · 方向1、方向2」拆成两个研究方向。 */
function directionsOf(field: string): [string, string] {
  const afterDot = field.includes(' · ') ? field.split(' · ').slice(1).join(' · ') : field
  const parts = afterDot
    .split('、')
    .map((item) => item.trim())
    .filter(Boolean)
  return [parts[0] ?? afterDot, parts[1] ?? parts[0] ?? afterDot]
}

const BASIC_TEMPLATES: Array<(primary: string, secondary: string) => string> = [
  (primary, secondary) => `${primary}与${secondary}的互作机制研究`,
  (primary, secondary) => `${primary}中${secondary}的调控作用研究`,
  (primary, secondary) => `基于${primary}的${secondary}干预策略研究`,
  (primary, secondary) => `${primary}相关${secondary}的分子机制`,
  (primary, secondary) => `${primary}与${secondary}的细胞模型研究`,
  (primary, secondary) => `${primary}代谢重编程与${secondary}研究`,
  (primary, secondary) => `${primary}与${secondary}的单细胞图谱研究`,
  (primary, secondary) => `靶向${primary}的${secondary}递送系统研究`,
  (primary, secondary) => `${primary}动物模型中的${secondary}作用研究`,
  (primary, secondary) => `${primary}与${secondary}的转化医学研究`,
]

const CLINICAL_TEMPLATES: Array<(primary: string, secondary: string) => string> = [
  (primary, secondary) => `${primary}的${secondary}临床研究`,
  (primary, secondary) => `${primary}的${secondary}治疗策略与预后分析`,
  (primary, secondary) => `${primary}相关${secondary}的队列研究`,
  (primary, secondary) => `${primary}的早期诊断与${secondary}干预研究`,
  (primary, secondary) => `基于${secondary}的${primary}治疗策略研究`,
  (primary, secondary) => `${primary}患者中${secondary}的疗效与安全性研究`,
  (primary, secondary) => `${primary}的${secondary}多中心研究`,
  (primary, secondary) => `${primary}围手术期${secondary}管理研究`,
  (primary, secondary) => `${primary}的${secondary}影像学评估`,
  (primary, secondary) => `${primary}的${secondary}长期随访研究`,
]

const PUBLIC_HEALTH_TEMPLATES: Array<(primary: string, secondary: string) => string> = [
  (primary, secondary) => `${primary}与${secondary}的队列研究`,
  (primary, secondary) => `${primary}相关${secondary}的流行病学研究`,
  (primary, secondary) => `${primary}的${secondary}风险因素分析`,
  (primary, secondary) => `${primary}与${secondary}的预测模型构建`,
  (primary, secondary) => `${primary}的${secondary}干预效果评价`,
  (primary, secondary) => `${primary}相关${secondary}的横断面研究`,
  (primary, secondary) => `${primary}与${secondary}的长期趋势分析`,
  (primary, secondary) => `${primary}的${secondary}生物标志物筛查`,
  (primary, secondary) => `${primary}与${secondary}的临床转化研究`,
  (primary, secondary) => `${primary}的${secondary}多中心研究`,
]

function templatesFor(mentor: MentorProfile): Array<(primary: string, secondary: string) => string> {
  if (/流行病|卫生统计|公共卫生|生物信息|人群|队列/.test(mentor.field)) {
    return PUBLIC_HEALTH_TEMPLATES
  }
  if (mentor.department === '医学院' && mentor.title === '主任医师') {
    return CLINICAL_TEMPLATES
  }
  return BASIC_TEMPLATES
}

export const HYPOTHESES_BY_MENTOR: Record<string, Hypothesis[]> =
  Object.fromEntries(
    MENTOR_LIBRARY.map((mentor) => {
      const realPapers = MENTOR_PAPERS[mentor.id]
      if (realPapers && realPapers.length > 0) {
        return [
          mentor.id,
          realPapers.slice(0, 10).map((paper, index) => ({
            id: `hyp-${mentor.id}-${String(index + 1).padStart(2, '0')}`,
            mentorId: mentor.id,
            title: paper.project,
          })),
        ]
      }
      const [primary, secondary] = directionsOf(mentor.field)
      return [
        mentor.id,
        templatesFor(mentor).map((template, index) => ({
          id: `hyp-${mentor.id}-${String(index + 1).padStart(2, '0')}`,
          mentorId: mentor.id,
          title: template(primary, secondary),
        })),
      ]
    }),
  )

export const HYPOTHESIS_BY_ID: Record<string, Hypothesis> = Object.fromEntries(
  Object.values(HYPOTHESES_BY_MENTOR)
    .flat()
    .map((hypothesis) => [hypothesis.id, hypothesis]),
)

export function pickHypothesis(mentorProfileId: string): Hypothesis | null {
  const pool = HYPOTHESES_BY_MENTOR[mentorProfileId] ?? []
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
