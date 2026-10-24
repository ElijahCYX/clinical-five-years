import { FIRST_SEASON } from './data'
import { newGameState } from './game'
import type { AttrKey, DemoName, GameState, Player } from './types'

const demoAttrs: Record<AttrKey, number> = {
  memory: 7,
  comprehension: 8,
  dexterity: 5,
  social: 4,
  appearance: 5,
  energy: 5,
  constitution: 6,
  resilience: 5,
}

export const demoPlayer: Player = {
  name: '林知夏',
  gender: '女',
  background: 'ordinary',
  talent: 'bright',
  attrs: demoAttrs,
}

export const demoWeekLog = {
  week: 1,
  title: '第一周 · 把人塞回教室',
  text: '九月的风把银杏叶吹进阶梯教室。大学数学第一节课，老师用十分钟讲完了你高中三年的极限。你坐在最后一排，把 ε 抄成了 E，又悄悄涂掉。',
  deltas: ['精力 -7', '压力 +2', '准备度 +12'],
}

export function buildDemoState(screen: DemoName): GameState {
  const base = newGameState(demoPlayer)

  const state: GameState = {
    ...base,
    screen: screen === 'title' ? 'title' : screen,
    plan: 'B',
    habit: 'timeManagement',
    week: 2,
    energy: 72,
    stress: 34,
    money: 1180,
    english: 8,
    composite: 12,
    research: 0,
    prep: { ...base.prep, math: 46 },
    constitutionGrowth: 20,
    appearanceGrowth: 0,
    logs: [demoWeekLog],
  }

  if (screen === 'plan') {
    return state
  }

  if (screen === 'prep') {
    return {
      ...state,
      screen: 'prep',
      prep: { math: 58 },
      energy: 64,
      stress: 38,
    }
  }

  if (screen === 'cetEvent') {
    return {
      ...state,
      screen: 'cetEvent',
      english: 22,
      money: 1180,
      cet4Score: null,
      cet6Score: null,
      cet4Registered: false,
      cet6Registered: false,
    }
  }

  if (screen === 'cetResult') {
    return {
      ...state,
      screen: 'cetResult',
      english: 42,
      money: 1180,
      cet4Score: 438,
      cet6Score: null,
      cet4Registered: false,
      cet6Registered: false,
    }
  }

  if (screen === 'vacation') {
    return {
      ...state,
      screen: 'vacation',
      plan: null,
      habit: 'timeManagement',
      vacation: { kind: 'winter', week: 1, totalWeeks: 2 },
      energy: 80,
      stress: 30,
      money: 700,
      prep: { math: 0 },
      results: [],
    }
  }

  if (screen === 'result' || screen === 'ending' || screen === 'yearend') {
    return {
      ...state,
      screen,
      prep: { math: 58 },
      results: [
        {
          course: FIRST_SEASON.courses[0],
          score: 84,
          gpa: 3.9,
          expectedMin: 79,
          expectedMax: 89,
          stressRelief: 5,
        },
      ],
      cumulativeCredits: 3,
      cumulativePoints: 11.7,
      finalNote:
        screen === 'yearend'
          ? '大一结束。你从解剖楼、图书馆和无数个早八里走过来，开始知道白大褂的重量。大二见。'
          : '大一秋结束。你第一次知道，大学的“及格”不是终点，而是一张继续往前的车票。',
    }
  }
  return state
}
