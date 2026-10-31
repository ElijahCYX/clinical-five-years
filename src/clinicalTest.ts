import { SEASONS } from './data'
import { createClinicalState } from './clinical'
import {
  archetypeFor,
  evenAllocation,
  gpaFromScore,
  newGameState,
} from './game'
import { createInitialNpcSocial } from './npcRelations'
import { createInitialRelationships } from './social'
import type { CourseRecord, GameState, Player } from './types'

/** 临时测试入口：精英天赋、均衡发展、大三临床前成绩已出，直接进入大四见习。 */
export function createClinicalTestState(): GameState {
  const attrs = evenAllocation('elite')
  const player: Player = {
    name: '林知夏',
    gender: '女',
    orientation: 'heterosexual',
    background: 'middle',
    talent: 'elite',
    attrs,
    archiveTitle: archetypeFor(attrs),
  }
  const base = newGameState(player)
  const seasonIndex = 13
  const season = SEASONS[seasonIndex]

  // 前三年成绩：整体 GPA 约 3.4，稳定在中上位置。
  const priorRecords: CourseRecord[] = []
  for (let index = 0; index < seasonIndex; index += 1) {
    const priorSeason = SEASONS[index]
    priorSeason.courses.forEach((course, courseIndex) => {
      if (course.electiveType && course.electiveType !== 'politics') return
      const score = 76 + ((index + courseIndex) % 4) * 2
      priorRecords.push({
        id: course.id,
        name: course.name,
        credits: course.credits,
        gpa: gpaFromScore(score),
        score,
        category: course.electiveType === 'politics' ? 'politics' : 'professional',
      })
    })
  }
  const cumulativeCredits = priorRecords.reduce(
    (sum, record) => sum + record.credits,
    0,
  )
  const cumulativePoints = priorRecords.reduce(
    (sum, record) => sum + record.credits * record.gpa,
    0,
  )

  const game: GameState = {
    ...base,
    screen: 'clinical',
    season,
    seasonIndex,
    player,
    plan: 'A',
    habits: ['earlyRise', 'earlySleep'],
    week: 1,
    weekSlot: 0,
    energy: 82,
    stress: 28,
    money: 3800,
    english: 55,
    composite: 58,
    research: 45,
    kaoyanPrep: 30,
    prep: Object.fromEntries(season.courses.map((course) => [course.id, 0])),
    clinical: createClinicalState(season.courses),
    courseRecords: priorRecords,
    cumulativeCredits,
    cumulativePoints,
    everFailed: false,
    yearFailed: false,
    relationships: createInitialRelationships(player),
    clubInitialRecruitmentDone: true,
    electiveSelectionDone: true,
    openingTalents: [],
    finalNote: '大三临床前课程成绩已出。大四见习即将开始。',
  }
  const social = createInitialNpcSocial(game)
  return {
    ...game,
    npcRelations: social.npcRelations,
    npcProfiles: social.npcProfiles,
  }
}
