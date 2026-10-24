import { MENTOR_LIBRARY } from './mentors'
import type { Hypothesis } from './types'

const TEMPLATES: Array<(field: string) => string> = [
  (field) => `${field}中的“隐形开关”：一个被忽略的阴性结果`,
  (field) => `当${field}开始倒着生长：逆转时间轴的实验设计`,
  (field) => `把${field}放进离心机：分离出情绪的沉淀物`,
  (field) => `${field}的夜间模式：昼夜节律偷偷改写了什么`,
  (field) => `如果${field}也有社交距离：细胞之间的边界感`,
  (field) => `${field}与一杯咖啡：腺苷受体之外的意外线索`,
  (field) => `让${field}走一次迷宫：空间记忆里的错误地图`,
  (field) => `${field}的“假阳性”人生：一次误诊带来的新模型`,
  (field) => `在${field}里寻找噪音：被背景掩盖的真实信号`,
  (field) => `当${field}遇见人工智能：让模型先猜，再让实验反驳`,
]

export const HYPOTHESES_BY_MENTOR: Record<string, Hypothesis[]> =
  Object.fromEntries(
    MENTOR_LIBRARY.map((mentor) => [
      mentor.id,
      TEMPLATES.map((template, index) => ({
        id: `hyp-${mentor.id}-${String(index + 1).padStart(2, '0')}`,
        mentorId: mentor.id,
        title: template(mentor.field),
      })),
    ]),
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
