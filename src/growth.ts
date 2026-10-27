import type { AttrKey } from './types'

export interface GrowthFields {
  constitutionGrowth: number
  appearanceGrowth: number
  socialGrowth: number
  englishGrowth: number
}

export interface GrowthCarryInput extends GrowthFields {
  attrs: Record<AttrKey, number>
  english: number
}

export interface GrowthCarryResult extends GrowthFields {
  attrs: Record<AttrKey, number>
  english: number
}

const ATTR_MIN = 1
const ATTR_MAX = 15

/**
 * Growth values are percentages: 100% converts into one panel point.
 * Values can also be negative; a negative full 100% subtracts a panel point.
 */
export function applyGrowthCarry(input: GrowthCarryInput): GrowthCarryResult {
  const attrs = { ...input.attrs }
  let english = input.english
  let constitutionGrowth = input.constitutionGrowth
  let appearanceGrowth = input.appearanceGrowth
  let socialGrowth = input.socialGrowth
  let englishGrowth = input.englishGrowth

  const carryAttr = (key: AttrKey, rawValue: number): number => {
    // At the absolute panel cap, the corresponding growth is spent out:
    // it displays 0% and cannot accumulate again.
    if (attrs[key] >= ATTR_MAX) return 0
    let value = rawValue
    let guard = 0
    while (value >= 100 && attrs[key] < ATTR_MAX && guard < 100) {
      attrs[key] += 1
      value -= 100
      guard += 1
    }
    while (value < 0 && attrs[key] > ATTR_MIN && guard < 200) {
      attrs[key] -= 1
      value += 100
      guard += 1
    }
    if (attrs[key] >= ATTR_MAX) value = 0
    if (value < 0) value = 0
    return value
  }

  constitutionGrowth = carryAttr('constitution', constitutionGrowth)
  appearanceGrowth = carryAttr('appearance', appearanceGrowth)
  socialGrowth = carryAttr('social', socialGrowth)

  let guard = 0
  while (englishGrowth >= 100 && guard < 100) {
    english += 1
    englishGrowth -= 100
    guard += 1
  }
  while (englishGrowth < 0 && english > 0 && guard < 200) {
    english -= 1
    englishGrowth += 100
    guard += 1
  }
  if (englishGrowth < 0) englishGrowth = 0

  return {
    attrs,
    english,
    constitutionGrowth,
    appearanceGrowth,
    socialGrowth,
    englishGrowth,
  }
}
