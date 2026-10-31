import { useEffect, useRef, useState } from 'react'
import {
  ACTION_BY_ID,
  CET,
  ELECTIVE_COURSE_BY_ID,
  PE_COURSES,
  isPeResultSeason,
  isPeSecondTerm,
  pePairKey,
  HABIT_BY_ID,
  SEASONS,
  VACATION_ACTION_BY_ID,
  VACATIONS,
} from './data'
import { buildDemoState, demoPlayer } from './demo'
import {
  buildTimetable,
  timetableActivityAt,
  timetableCourseAt,
} from './timetable'
import {
  backgroundAllowance,
  clamp,
  courseK,
  courseDifficulty,
  focusAdjustedGains,
  composeCourseScore,
  courseScoreWeights,
  usualScoreFor,
  cetScore,
  getReviewEffect,
  gpaFromScore,
  KAOYAN_PASS,
  kaoyanScoreFor,
  makeupGpa,
  newGameState,
  peGpaFor,
  peScoreFor,
  peTestName,
  peCoursePredictedRange,
  rollPeCourseScore,
  PE_FLOOR_TEXT,
  postgradChanceFor,
  scholarshipFor,
  effectiveEnergyCost,
  libraryCosts,
  labChoreEnergyCost,
  literatureEnergyCost,
  researchGainForComprehension,
  estimateRange,
  generateElectiveOffers,
  estimateScore,
  prepGainMultiplier,
  stressReliefForScore,
  dailyLivingCostFor,
  planDailyCost,
  sleepRecoveryFor,
  planPassive,
  simulateWeek,
  signed,
  applyOpeningTalent,
  applyWeeklyOpeningTalent,
  applyScoreRescue,
  coursePrepTalentMultiplier,
  examCoffeeMultiplier,
  examReviewTalentMultiplier,
  rollForgetPenalty,
  attendancePrepGain,
} from './game'
import { applyGrowthCarry } from './growth'
import { pickSleepText } from './sleepTexts'
import { FAMILY_CRISIS_TALK } from './familyTexts'
import type {
  AttrKey,
  DemoName,
  ExamResult,
  GameState,
  HabitId,
  OpeningTalentId,
  PatEvent,
  PatResult,
  GameEmail,
  MentorApplication,
  MentorInterview,
  MentorProfile,
  ResearchStage,
  PlanId,
  Player,
  BirthdayGiftResult,
  BondActionResult,
  BondType,
  ConfessionResult,
  DinnerInviteResult,
  LoverContactResult,
  PostgradChoice,
  Relationship,
  ReviewChoice,
  ScreenName,
  VacationKind,
  WeekLog,
  SoloInvite,
  SoloChatRecord,
  SemesterStats,
} from './types'
import { CetEventScreen } from './screens/CetEvent'
import { CetResultScreen } from './screens/CetResult'
import { CreateScreen } from './screens/Create'
import { EndingScreen } from './screens/Ending'
import { YearEndScreen } from './screens/YearEnd'
import { FailureReport } from './screens/FailureReport'
import type { MentorInterviewSceneData } from './screens/MentorInterview'
import type { ChatLaunch } from './screens/Chat'
import { PlanScreen } from './screens/Plan'
import {
  BaoyanResultScreen,
  KaoyanExamScreen,
  KaoyanResultScreen,
  RouteScreen,
} from './screens/Postgrad'
import { GraduationScoreScreen } from './screens/GraduationScore'
import { HealthEventModal } from './screens/HealthEvent'
import { createPreGraduationState } from './devPreGraduation'
import { PrepScreen } from './screens/Prep'
import { ScholarshipScreen } from './screens/Scholarship'
import { CrisisScreen, type CrisisKind } from './screens/Crisis'
import { ResultScreen } from './screens/Result'
import { TitleScreen } from './screens/Title'
import { VacationScreen } from './screens/Vacation'
import { WeekScreen } from './screens/Week'
import { ClinicalScreen } from './screens/Clinical'
import { WhoAmIScreen } from './screens/WhoAmI'
import { TalentSelectScreen } from './screens/TalentSelect'
import { OpeningTalentEventScreen } from './screens/OpeningTalentEvent'
import {
  applyEvent,
  createFamilyReliefEvent,
  rollRelationshipWeekly,
  rollWeeklyEvent,
} from './events'
import { RandomEventModal } from './screens/RandomEvent'
import { WhoIsTAScreen } from './screens/WhoIsTA'
import {
  ResearchNoticeProvider,
  useResearchNotice,
} from './screens/ResearchNotice'
import { EncounterProvider, useEncounter } from './screens/Encounter'
import { TravelEventProvider, useTravelEvents } from './screens/TravelEvent'
import { pickTravelEvent } from './travelEvents'
import { pickExpulsionText } from './expulsionTexts'
import {
  CONSUMPTION_EVENTS,
  pickConsumptionEvent,
} from './consumptionEvents'
import {
  addImmediateConsumptionEffects,
  applyConsumptionWeekStart,
  applyDailyConsumptionEffects,
  applyBreakfastConsumptionEffect,
  applyWeeklyConsumptionEffects,
  chargeConsumptionInstallments,
  consumptionAppearanceMultiplier,
  consumptionExcludedIds,
  consumptionSoloDateCost,
  consumptionCoffeeCost,
  consumptionSelfCareCost,
  consumptionSoloChanceBonus,
  consumptionLibraryMultiplier,
  consumptionExamReviewStressReduction,
  consumptionExamPrepGainMultiplier,
  hasConsumption,
  makeConsumptionPurchase,
} from './consumption'
import {
  ROOMMATE_TALKS,
  STRESS_ENDING_TEXT,
  STRESS_TALKS,
  pickStressEnding,
} from './stressTalks'
import { ENCOUNTER_CHATS } from './encounters'
import {
  MENTOR_BY_ID,
  MENTOR_LIBRARY,
  createMentorRelationship,
  mentorGender,
  pickMentorProfile,
} from './mentors'
import {
  absoluteSlot,
  chooseFreeSlotAfter,
  currentMailTimeLabel,
  decodeAbs,
  formatAbsTime,
  interviewSuccessChance,
  nextGameDayStartAbs,
  nextNormalWeek,
  nextNormalWeekKey,
  rollMentorReply,
  createApplicationEmail,
  createLabAccessEmail,
  createMedicalFamilyAcceptance,
  createMedicalFamilyGreeting,
  createProjectOfferEmail,
  createReplyEmail,
  createWelcomeEmail,
} from './mentorMail'
import { ClubRecruitment } from './screens/ClubRecruitment'
import { pushCampusNotice } from './campusBroadcast'
import { bumpCareerStats, bumpCareerMonths } from './careerStats'
import { pickConfessionText } from './confessionOutcomes'
import { pickLoverEvent } from './loverEvents'
import { pickBondReaction } from './bondTexts'
import { BROTHER_BOND_TEXT, SISTER_BOND_TEXT } from './bonds'
import {
  CLUB_EVENT_CHANCE,
  pickClubEvent,
  type ClubEvent,
} from './clubEvents'
import {
  clubProjectDefForOrg,
  clubProjectDefForProject,
  clubProjectForSeason,
  createClubProjectState,
  currentPhaseFor,
  personalOutcomeFor,
  projectEffectLine,
} from './clubProjects'
import {
  CLUB_LEAVE_EXPEL_TEXT,
  CLUB_LEAVE_WARNING_TEXT,
  pickClubLeaveText,
} from './clubLeaveTexts'
import {
  CLUB_REJECTIONS,
  ORGANIZATIONS,
  ORG_BY_ID,
  clubApplicationChance,
  organizationBenefitLines,
  pickClubRejection,
  roleBenefitMultiplier,
  roleLabel,
} from './organizations'
import { HYPOTHESIS_BY_ID, pickHypothesis } from './hypotheses'
import { createClinicalState, examineRotation, isClinicalSeason } from './clinical'
import { createClinicalTestState } from './clinicalTest'
import { pickPublicationAcceptanceText } from './publicationTexts'
import {
  createLiteratureReplyEmail,
  createLiteratureReportEmail,
  pickLiteratureReportText,
  pickLiteratureReplyText,
} from './literature'
import {
  advanceHealthForNewWeek,
  applyHealthTreatment,
  healthEnergyCap,
  healthEnergyPenalty,
  healthPrepMultiplier,
  healthStressPenalty,
  tickHealthDay,
} from './health'
import {
  DEBATE_ORG_ID,
  bestDebaterChance,
  createDebateCupRecord,
  debateCupRecordFor,
  debateEditionForState,
  debateMember,
} from './debateCup'
import {
  askGossip,
  attemptNpcClueByChat,
  attemptNpcClueByInvestigation,
  createInitialNpcSocial,
  ensureNpcSocial,
  maybeCreateNpcRevealEvent,
} from './npcRelations'
import {
  canConfess,
  canPat,
  confessionChance,
  createClubRelationship,
  createCourseFriend,
  createEventFriend,
  createInitialRelationships,
  createNpcContactFromProfile,
  createSeniorRelationship,
  DINNER_WEEKLY_LIMIT,
  dinnerPlansThisWeek,
  nextRoommateAction,
  normalizeRelationships,
  adjustIntimacyDelta,
  applyFriendContactDecay,
  applyMissedBirthdayPenalties,
  currentWeekKey,
  gameDate,
  intimacyMultiplier,
  patRelationship,
  progressWeek,
  patRemainingThisWeek,
  isStaffRelation,
  clearBondNickname,
  applyBondNickname,
  setBondNicknameDisplay,
  closeFriendCount,
  isPeerFriend,
  revealMaybe,
  vacationTravelInviteKey,
  academicYearForSeason,
  isAutumnSeasonIndex,
  isYearFinalSeasonIndex,
} from './social'

const SAVE_KEY = 'clinical-five-years-save-v46'
const GAME_SAVE_PREFIX = 'clinical-five-years-save-'
const SAVE_SLOT_PREFIX = 'clinical-five-years-slot-'
const ACTIVE_SAVE_SLOT_KEY = 'clinical-five-years-active-slot'

export interface SaveSlotSummary {
  id: string
  savedAt: number
  playerName: string
  seasonLabel: string
  screenLabel: string
}

interface SaveSlotPayload {
  game?: GameState
  savedAt?: number
}

let activeSaveSlotId: string | null = null
try {
  activeSaveSlotId = localStorage.getItem(ACTIVE_SAVE_SLOT_KEY)
} catch {
  /* localStorage may be unavailable */
}

function saveSlotKey(id: string): string {
  return `${SAVE_SLOT_PREFIX}${id}`
}

function createSaveSlotId(): string {
  return `slot-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function setActiveSaveSlot(id: string) {
  activeSaveSlotId = id
  try {
    localStorage.setItem(ACTIVE_SAVE_SLOT_KEY, id)
  } catch {
    /* localStorage may be unavailable */
  }
}

function readSlotPayload(id: string): SaveSlotPayload | null {
  try {
    const raw = localStorage.getItem(saveSlotKey(id))
    if (!raw) return null
    return JSON.parse(raw) as SaveSlotPayload
  } catch {
    return null
  }
}

export function listSaveSlots(): SaveSlotSummary[] {
  const slots: SaveSlotSummary[] = []
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key || !key.startsWith(SAVE_SLOT_PREFIX)) continue
      const id = key.slice(SAVE_SLOT_PREFIX.length)
      const payload = readSlotPayload(id)
      const savedGame = payload?.game
      if (!savedGame?.player) continue
      slots.push({
        id,
        savedAt: payload?.savedAt ?? 0,
        playerName: savedGame.player.name,
        seasonLabel: savedGame.season?.seasonLabel ?? `第 ${savedGame.seasonIndex + 1} 季`,
        screenLabel: savedGame.screen === 'clinical' ? '临床轮转' : savedGame.screen === 'result' ? '考试结算' : savedGame.screen === 'vacation' ? '假期' : '校园生活',
      })
    }
  } catch {
    /* localStorage may be unavailable */
  }
  return slots.sort((a, b) => b.savedAt - a.savedAt)
}

function migrateLegacySave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return
    const id = createSaveSlotId()
    localStorage.setItem(saveSlotKey(id), raw)
    if (!localStorage.getItem(ACTIVE_SAVE_SLOT_KEY)) setActiveSaveSlot(id)
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* localStorage may be unavailable */
  }
}

function readActiveSaveRaw(): string | null {
  try {
    if (!activeSaveSlotId) {
      const slots = listSaveSlots()
      if (slots[0]) setActiveSaveSlot(slots[0].id)
    }
    if (activeSaveSlotId) {
      const active = localStorage.getItem(saveSlotKey(activeSaveSlotId))
      if (active) return active
    }
    const slots = listSaveSlots()
    if (slots[0]) {
      setActiveSaveSlot(slots[0].id)
      return localStorage.getItem(saveSlotKey(slots[0].id))
    }
  } catch {
    /* localStorage may be unavailable */
  }
  return null
}

function writeActiveSave(game: GameState) {
  try {
    if (!activeSaveSlotId) setActiveSaveSlot(createSaveSlotId())
    if (!activeSaveSlotId) return
    localStorage.setItem(
      saveSlotKey(activeSaveSlotId),
      JSON.stringify({ game, savedAt: Date.now() }),
    )
    localStorage.setItem(ACTIVE_SAVE_SLOT_KEY, activeSaveSlotId)
  } catch {
    /* localStorage may be unavailable */
  }
}

function deleteSaveSlot(id: string) {
  try {
    localStorage.removeItem(saveSlotKey(id))
    if (activeSaveSlotId === id) {
      activeSaveSlotId = null
      localStorage.removeItem(ACTIVE_SAVE_SLOT_KEY)
      const latest = listSaveSlots()[0]
      if (latest) setActiveSaveSlot(latest.id)
    }
  } catch {
    /* localStorage may be unavailable */
  }
}

export function beginNewSaveSlot(): string {
  const id = createSaveSlotId()
  setActiveSaveSlot(id)
  return id
}

export function activateSaveSlot(id: string) {
  setActiveSaveSlot(id)
}

migrateLegacySave()


type View = ScreenName | 'crisis' | 'whoami' | 'whois'

function persist(game: GameState) {
  writeActiveSave(game)
}

/** 开发模式专用：把当前存档里的舍友临时转成闺蜜，方便测试聊天/代称。 */
function devRoommatesToSisters(game: GameState): GameState {
  const roommates = game.relationships.filter((relation) => relation.kind === 'roommate')
  if (roommates.length === 0) return game
  const now = progressWeek(game)
  const relationships = game.relationships.map((relation) =>
    relation.kind === 'roommate'
      ? {
          ...relation,
          gender: '女' as const,
          partner: false,
          bondType: 'sister' as const,
          brokenBondType: undefined,
          bondBreakWeek: undefined,
          bondCalmUntilWeek: undefined,
          bondReconcileAttempted: false,
          intimacy: Math.max(60, relation.intimacy),
          partnerSinceSeasonIndex: game.seasonIndex,
          partnerSinceWeek: game.week,
          partnerSinceLabel: game.season.seasonLabel,
          bondNickname: undefined,
          bondOriginalName: undefined,
          bondNicknameEnabled: true,
          lastContactKey: '',
          metAbsWeek: now,
        }
      : relation,
  )
  return { ...game, relationships }
}

function migrateLegacySeasonLayout(game: GameState): GameState {
  // v42 and older used 20 terms with 大三夏 merged into 大三·临床前.
  const mappedIndex = game.seasonIndex === 11 ? 12 : game.seasonIndex >= 12 ? game.seasonIndex + 1 : game.seasonIndex
  const mapIndex = (index: number) => (index === 11 ? 12 : index >= 12 ? index + 1 : index)
  return {
    ...game,
    seasonIndex: mappedIndex,
    season: SEASONS[mappedIndex] ?? game.season,
    clubMemberships: (game.clubMemberships ?? []).map((membership) => ({
      ...membership,
      joinedSeasonIndex: mapIndex(membership.joinedSeasonIndex ?? 0),
      roleSinceSeasonIndex: mapIndex(membership.roleSinceSeasonIndex ?? 0),
      presidentStartSeasonIndex:
        membership.presidentStartSeasonIndex === null
          ? null
          : mapIndex(membership.presidentStartSeasonIndex),
      activitySeasonIndex: mapIndex(membership.activitySeasonIndex ?? 0),
    })),
    clubHistory: (game.clubHistory ?? []).map((entry) => ({
      ...entry,
      joinedSeasonIndex: mapIndex(entry.joinedSeasonIndex ?? 0),
      leftSeasonIndex: mapIndex(entry.leftSeasonIndex ?? 0),
    })),
    relationships: (game.relationships ?? []).map((relation) => ({
      ...relation,
      partnerSinceSeasonIndex:
        typeof relation.partnerSinceSeasonIndex === 'number'
          ? mapIndex(relation.partnerSinceSeasonIndex)
          : relation.partnerSinceSeasonIndex,
    })),
    screen:
      game.screen === 'randomEvent'
        ? 'week'
        : game.seasonIndex === 11 && game.screen === 'result'
          ? 'result'
          : game.screen,
  }
}

function earlySleepApplies(state: GameState, nextSlot: number): boolean {
  if (!state.habits.includes('earlySleep')) return false
  if (state.week > 3) return false
  if (state.weekSlot % 3 !== 2) return false
  if (nextSlot >= 21) return state.week < 3
  const nextDay = Math.floor(nextSlot / 3)
  return nextDay <= 4
}

function deriveOutstandingFails(
  game: GameState,
): Record<string, number> {
  if (game.outstandingFails) return game.outstandingFails
  const entries: Array<[string, number]> = []
  const pending = game.pendingMakeups ?? []
  for (const course of pending) {
    if (!course.electiveType) entries.push([baseCourseId(course.id), course.credits])
  }
  const currentMakeups = (game.season?.courses ?? []).filter(
    (course) => course.makeup && !course.electiveType,
  )
  for (const course of currentMakeups) {
    entries.push([baseCourseId(course.id), course.credits])
  }
  for (const id of game.pendingElectiveRetakes ?? []) {
    const course = ELECTIVE_COURSE_BY_ID[id]
    if (course?.electiveType === 'politics') entries.push([baseCourseId(id), course.credits])
  }
  return Object.fromEntries(entries)
}

function readSave(): GameState | null {
  try {
    const currentRaw = readActiveSaveRaw()
    if (!currentRaw) return null
    const parsed = JSON.parse(currentRaw) as { game?: GameState }
    if (!parsed.game) return null
    const game = parsed.game
    const legacyMembership = (
      game as GameState & { clubMembership?: GameState['clubMemberships'][number] | null }
    ).clubMembership
    const clubMemberships = (
      game.clubMemberships ?? (legacyMembership ? [legacyMembership] : [])
    ).map((membership) => {
      const projectDef = clubProjectDefForOrg(membership.orgId)
      return {
        ...membership,
        inactivityWarningIssued: membership.inactivityWarningIssued ?? false,
        inactivityWarningSeasonIndex:
          membership.inactivityWarningSeasonIndex ??
          (membership.inactivityWarningIssued ? game.seasonIndex : undefined),
        semesterLeaves: membership.semesterLeaves ?? 0,
        project:
          membership.project?.seasonId === game.season.id &&
          Array.isArray(membership.project.phaseChoices)
            ? membership.project
            : projectDef
              ? createClubProjectState(membership.orgId, game.season.id)
              : null,
        contribution: membership.contribution ?? 0,
      }
    })
    return {
      ...game,
      screen: game.screen === 'randomEvent' ? 'week' : game.screen,
      englishGrowth: game.englishGrowth ?? 0,
      player: game.player
        ? { ...game.player, orientation: game.player.orientation ?? 'heterosexual' }
        : null,
      eventWeek: game.eventWeek ?? 0,
      eventHistory: game.eventHistory ?? [],
      pendingEvent: game.pendingEvent ?? null,
      socialModuleUnlocked: game.socialModuleUnlocked ?? false,
      relationships:
        game.relationships && game.relationships.length > 0
          ? normalizeRelationships(game.relationships)
          : game.player
            ? createInitialRelationships(game.player)
            : [],
      dinnerPlan: game.dinnerPlan ?? null,
      dinnerPlans:
        game.dinnerPlans ??
        (game.dinnerPlan?.committed ? [game.dinnerPlan] : []),
      dinnerInvites: game.dinnerInvites ?? null,
      romanceUnlocked: game.romanceUnlocked ?? false,
      courseRecords: game.courseRecords ?? [],
      pendingPeCourseId: game.pendingPeCourseId ?? null,
      pendingPePairKey: game.pendingPePairKey ?? null,
      peCourseHistory: game.peCourseHistory ?? [],
      peCourseResults: game.peCourseResults ?? [],
      peCourseCredits: game.peCourseCredits ?? 0,
      peCourseCount: game.peCourseCount ?? 0,
      peGraduationExempt: game.peGraduationExempt ?? false,
      weekSlot: game.weekSlot ?? 0,
      weekSlotSkipped: game.weekSlotSkipped ?? false,
      weekSlotActions: game.weekSlotActions ?? [],
      skipCaught: game.skipCaught ?? {},
      coffeeDayKey: game.coffeeDayKey ?? null,
      breakfastDayKey: game.breakfastDayKey ?? null,
      selfCareDayKey: game.selfCareDayKey ?? null,
      selfCareDayCount: game.selfCareDayCount ?? 0,
      eveningCoffeeDayKey: game.eveningCoffeeDayKey ?? null,
      campusRunDayKey: game.campusRunDayKey ?? null,
      peRunCount: game.peRunCount ?? 0,
      romanceRisk: game.romanceRisk ?? 0,
      teacherScandalRisk: game.teacherScandalRisk ?? 0,
      pendingConfession: game.pendingConfession ?? null,
      mentorProfileId: game.mentorProfileId ?? null,
      researchStage: game.researchStage ?? 1,
      mentorApplication: game.mentorApplication ?? null,
      mentorInterview: game.mentorInterview
        ? { ...game.mentorInterview, prompted: false }
        : null,
      mentorInterviewHistory: game.mentorInterviewHistory ?? [],
      failedMentorIds: game.failedMentorIds ?? [],
      emails: (game.emails ?? []).map((email) => {
        if (!email.project) return email
        const hypothesis = HYPOTHESIS_BY_ID[email.project.hypothesisId]
        if (!hypothesis) return email
        const oldTitle = email.project.title
        return {
          ...email,
          subject: `课题邀请：${hypothesis.title}`,
          body: oldTitle ? email.body.split(oldTitle).join(hypothesis.title) : email.body,
          project: { ...email.project, title: hypothesis.title },
        }
      }),
      mailSentWeekKey: game.mailSentWeekKey ?? null,
      literatureStudyWeekKey: game.literatureStudyWeekKey ?? '',
      literatureStudyCount: game.literatureStudyCount ?? 0,
      literatureReportWeekKey: game.literatureReportWeekKey ?? null,
      pendingLiteratureReport: game.pendingLiteratureReport ?? null,
      medicalFamilyMentorId: game.medicalFamilyMentorId ?? null,
      medicalFamilyAcceptanceAtAbs: game.medicalFamilyAcceptanceAtAbs ?? null,
      welcomeMailSent: game.welcomeMailSent ?? false,
      seniorsGenerated: game.seniorsGenerated ?? false,
      labAccessMailSent: game.labAccessMailSent ?? false,
      labAccessPendingAtAbs: game.labAccessPendingAtAbs ?? null,
      projectOfferMailSent: game.projectOfferMailSent ?? false,
      projectOfferPendingAtAbs: game.projectOfferPendingAtAbs ?? null,
      researchProgress: game.researchProgress ?? 0,
      researchPreparation: game.researchPreparation ?? 0,
      experimentPreparation: game.experimentPreparation ?? 0,
      researchPublished: game.researchPublished ?? false,
      researchJournal: game.researchJournal ?? null,
      publishedPapers: game.publishedPapers ?? 0,
      awaitingNextProject: game.awaitingNextProject ?? false,
      researchStarted: game.researchStarted ?? false,
      activeHypothesisId: game.activeHypothesisId ?? null,
      activeHypothesisTitle: game.activeHypothesisId
        ? HYPOTHESIS_BY_ID[game.activeHypothesisId]?.title ?? game.activeHypothesisTitle ?? null
        : game.activeHypothesisTitle ?? null,
      lastResearchWeek: game.lastResearchWeek ?? 0,
      lastResearchWarningWeek: game.lastResearchWarningWeek ?? 0,
      lastHypothesisOfferSeason: game.lastHypothesisOfferSeason ?? null,
      familyAffection: game.familyAffection ?? 0,
      weather: game.weather ?? 'sunny',
      weatherWeekKey: game.weatherWeekKey ?? '',
      healthConditions: game.healthConditions ?? [],
      pendingHealthEvent: game.pendingHealthEvent ?? null,
      healthHistory: game.healthHistory ?? [],
      healthIllnessSeason: game.healthIllnessSeason ?? null,
      comprehensionGrowth: game.comprehensionGrowth ?? 0,
      debateCups: game.debateCups ?? [],
      debateHonors: game.debateHonors ?? [],
      familyCrisisRescued: game.familyCrisisRescued ?? false,
      soloInvites: game.soloInvites ?? [],
      soloChatRecords: game.soloChatRecords ?? [],
      npcRelations: game.npcRelations ?? [],
      npcProfiles: game.npcProfiles ?? {},
      npcClueAsked: game.npcClueAsked ?? {},
      gossipAsked: game.gossipAsked ?? {},
      gossipRecords: game.gossipRecords ?? [],
      soloRefusals: game.soloRefusals ?? {},
      mentorRecognition: game.mentorRecognition ?? 0,
      walkEncounterWeekKey: game.walkEncounterWeekKey ?? null,
      walkEncounterDayKey: game.walkEncounterDayKey ?? null,
      walkEncounterCount: game.walkEncounterCount ?? 0,
      habits: (game.habits ?? []).filter((id) => Boolean(HABIT_BY_ID[id])),
      familyReliefWeek: game.familyReliefWeek ?? 0,
      seenRelationIds:
        game.seenRelationIds ?? game.relationships.map((relation) => relation.id),
      vacationTravel: game.vacationTravel ?? null,
      vacationTravelInvites: game.vacationTravelInvites ?? null,
      pendingConsumption: game.pendingConsumption
        ? CONSUMPTION_EVENTS.find(
            (event) => event.id === game.pendingConsumption!.id,
          ) ?? game.pendingConsumption
        : null,
      consumptionEventWeek: game.consumptionEventWeek ?? 0,
      consumptionPurchases: game.consumptionPurchases ?? [],
      consumptionConcertDays: game.consumptionConcertDays ?? 0,
      consumptionConcertStartDay: game.consumptionConcertStartDay ?? 0,
      sleepInDayKey: game.sleepInDayKey ?? null,
      clubMemberships,
      clubHistory: game.clubHistory ?? [],
      clubInitialRecruitmentDone: game.clubInitialRecruitmentDone ?? false,
      clubInvites: game.clubInvites ?? null,
      outstandingFails: deriveOutstandingFails(game),
      semesterStats: game.semesterStats ?? {
        library: 0, attend: 0, skip: 0, sleepIn: 0, coffee: 0, selfCare: 0,
        exercise: 0, social: 0, partTime: 0, research: 0, club: 0,
        english: 0, electiveHomework: 0, date: 0,
      },
      careerStats: game.careerStats ?? {
        library: 0, attend: 0, skip: 0, sleepIn: 0, coffee: 0, selfCare: 0,
        exercise: 0, social: 0, partTime: 0, research: 0, club: 0,
        english: 0, electiveHomework: 0, date: 0, campusRun: 0, dinner: 0,
        travel: 0, weeks: 0,
      },
      expulsionText: game.expulsionText ?? null,
      expulsionCredits: game.expulsionCredits ?? 0,
      expulsionCourses: game.expulsionCourses ?? [],
      clubActivityPlan: game.clubActivityPlan ?? null,
      clubLastBenefitSeason: game.clubLastBenefitSeason ?? null,
      clubLastPromotionSeason: game.clubLastPromotionSeason ?? null,
      clubAnnualBonusSeason: game.clubAnnualBonusSeason ?? null,
      noticeFeed: game.noticeFeed ?? [],
      highPressureDebuff: game.highPressureDebuff ?? false,
      stressHearts: game.stressHearts ?? 3,
      stressHeartBreakWeek: game.stressHeartBreakWeek ?? 0,
      stressEndingText: game.stressEndingText ?? null,
      stressEndingMethod: game.stressEndingMethod ?? null,
    }
  } catch {
    return null
  }
}

function buildWeekLog(
  game: GameState,
  next: {
    energy: number
    stress: number
    money: number
    prep: number
    studyCount: number
    habitApplied: boolean
  },
): WeekLog {
  const selectedNames = game.selected
    .map((id) => ACTION_BY_ID[id]?.name)
    .filter(Boolean)
    .join('、')

  const titles = [
    `${game.season.seasonLabel} · 第 1 周`,
    `${game.season.seasonLabel} · 第 2 周`,
    `${game.season.seasonLabel} · 第 3 周`,
  ]
  const texts = [
    `${game.season.seasonLabel}开始了。你把这周的时间分给了${selectedNames || '一些琐事'}。`,
    `课程开始加速。这周你选择了${selectedNames || '按部就班'}，并开始习惯大学的速度。`,
    `离考试只剩一周。你把这周交给了${selectedNames || '日常'}，并在心里默默计算还差多少。`,
  ]

  const energyDelta = Math.round(next.energy - game.energy)
  const stressDelta = Math.round(next.stress - game.stress)
  const moneyDelta = Math.round(next.money - game.money)
  const prepDelta = Math.round(
    next.prep - Object.values(game.prep).reduce((sum, value) => sum + value, 0),
  )

  const deltas: string[] = []
  if (energyDelta !== 0) deltas.push(`精力 ${signed(energyDelta)}`)
  if (stressDelta !== 0) deltas.push(`压力 ${signed(stressDelta)}`)
  if (moneyDelta !== 0) deltas.push(`生活费 ${signed(moneyDelta)}`)
  if (prepDelta !== 0) deltas.push(`准备度 ${signed(prepDelta)}`)
  if (next.habitApplied) deltas.push('习惯生效')
  if (next.studyCount > 0) deltas.push(`学习 ${next.studyCount} 次`)

  return {
    seasonIndex: game.seasonIndex,
    week: game.week,
    title: titles[game.week - 1] ?? `${game.season.seasonLabel} · 第 ${game.week} 周`,
    text: texts[game.week - 1] ?? texts[0],
    deltas,
  }
}

function buildVacationLog(
  game: GameState,
  next: { energy: number; stress: number; money: number; habitApplied: boolean },
): WeekLog {
  const meta = game.vacation ? VACATIONS[game.vacation.kind] : null
  const selectedNames = game.selected
    .map((id) => VACATION_ACTION_BY_ID[id]?.name)
    .filter(Boolean)
    .join('、')
  const week = game.vacation?.week ?? 1

  const energyDelta = Math.round(next.energy - game.energy)
  const stressDelta = Math.round(next.stress - game.stress)
  const moneyDelta = Math.round(next.money - game.money)
  const deltas: string[] = []
  if (energyDelta !== 0) deltas.push(`精力 ${signed(energyDelta)}`)
  if (stressDelta !== 0) deltas.push(`压力 ${signed(stressDelta)}`)
  if (moneyDelta !== 0) deltas.push(`生活费 ${signed(moneyDelta)}`)
  if (next.habitApplied) deltas.push('习惯生效')

  return {
    seasonIndex: game.seasonIndex,
    week,
    title: `${meta?.name ?? '假期'} · 第 ${week} 周`,
    text: `没有早八的一周。你把这周的时间分给了${selectedNames || '一些小事'}。`,
    deltas,
  }
}

function resultNextLabel(index: number): string {
  if (index === 12 || index === 16) return '学年结算'
  if (index === 17) return '推免结果'
  if (index === 18) return '考研初试'
  if (index === 19) return '考研结果'
  if (index === 20) return '毕业结算'
  if (index === 1 || index === 5 || index === 9) return '寒假'
  if (index === 3 || index === 7) return '暑假'
  return SEASONS[index + 1]?.seasonLabel ?? '继续'
}

function yearNumber(index: number): number {
  return academicYearForSeason(index)
}

function yearName(index: number): string {
  return ['大一', '大二', '大三', '大四', '大五'][yearNumber(index) - 1] ?? `第 ${yearNumber(index)} 学年`
}

function isYearFinal(index: number): boolean {
  return isYearFinalSeasonIndex(index)
}

function finalizeYear(base: GameState): GameState {
  const year = yearNumber(base.seasonIndex)
  if (base.yearRecords.some((record) => record.year === year)) return base
  const previous = base.yearRecords[base.yearRecords.length - 1]
  const prevCredits = previous?.cumulativeCredits ?? 0
  const prevPoints = previous?.cumulativePoints ?? 0
  const prevComposite = previous?.cumulativeComposite ?? 0
  const prevResearch = previous?.cumulativeResearch ?? 0
  const creditsGain = base.cumulativeCredits - prevCredits
  const pointsGain = base.cumulativePoints - prevPoints
  const gpa = creditsGain > 0 ? pointsGain / creditsGain : 0
  const compositeGain = base.composite - prevComposite
  const paperGain =
    Math.floor(base.research / 100) - Math.floor(prevResearch / 100)
  const record = {
    year,
    gpa,
    compositeGain,
    researchGain: base.research - prevResearch,
    papers: Math.max(0, paperGain),
    failed: base.yearFailed,
    cumulativeCredits: base.cumulativeCredits,
    cumulativePoints: base.cumulativePoints,
    cumulativeComposite: base.composite,
    cumulativeResearch: base.research,
    evaluated: false,
    award: null,
    awards: [],
    score: null,
    careerStats: base.careerStats,
    attrs: base.player ? { ...base.player.attrs } : undefined,
  }
  return {
    ...base,
    yearRecords: [...base.yearRecords, record],
    yearFailed: false,
  }
}

function evaluateScholarship(base: GameState, index: number): GameState | null {
  if (!base.player) return null
  const record = base.yearRecords.find(
    (item) => !item.evaluated && item.year === yearNumber(index) - 1,
  )
  if (!record) return null
  const prior = base.yearRecords.filter((item) => item.year < record.year)
  const score = scholarshipFor(record, base.player, prior, base.everFailed)
  return {
    ...base,
    money: base.money + score.reward,
    yearRecords: base.yearRecords.map((item) =>
      item === record
        ? {
            ...item,
            evaluated: true,
            award: score.award,
            awards: score.awards,
            score,
          }
        : item,
    ),
  }
}

function settlePe(base: GameState): GameState {
  const year = yearNumber(base.seasonIndex)
  if (base.peResults.some((item) => item.year === year)) return base
  const constitution = base.player?.attrs.constitution ?? 2
  const score = peScoreFor(constitution)
  const gpa = peGpaFor(score)
  const passed = score >= 60
  return {
    ...base,
    peResults: [...base.peResults, { year, score, gpa, passed }],
    cumulativeCredits: base.cumulativeCredits + (passed ? 2 : 0),
    cumulativePoints: base.cumulativePoints + (passed ? 2 * gpa : 0),
    everFailed: base.everFailed || !passed,
    yearFailed: base.yearFailed || !passed,
  }
}

function prepareSeason(base: GameState, index: number): GameState {
  const baseSeason = SEASONS[index]
  const pending = base.pendingMakeups ?? []
  const retakeCourses = (base.pendingElectiveRetakes ?? [])
    .map((id) => ELECTIVE_COURSE_BY_ID[id])
    .filter(Boolean)
  const extraCourses = [...pending, ...retakeCourses]
  const season = extraCourses.length > 0
    ? { ...baseSeason, courses: [...baseSeason.courses, ...extraCourses] }
    : baseSeason
  return {
    ...base,
    screen: 'plan',
    season,
    seasonIndex: index,
    plan: null,
    habits: [],
    weekFocus: null,
    electiveOffers:
      index < 12
        ? generateElectiveOffers(
            base.electiveHistory ?? [],
            base.politicsCompleted ?? [],
            base.pendingElectiveRetakes ?? [],
          )
        : [],
    electiveSelectionDone: false,
    pendingElectiveRetakes: [],
    week: 1,
    money: base.money + (base.player ? backgroundAllowance(base.player) : 0),
    prep: Object.fromEntries(season.courses.map((course) => [course.id, 0])),
    results: [],
    selected: [],
    actionsUsed: 0,
    weekSlot: 0,
    weekSlotSkipped: false,
    weekSlotActions: [],
    vacation: null,
    cetEventDone: false,
    examCoffee: false,
    examAllNighter: false,
    examEnglishPrep: false,
    pendingMakeups: pending,
    clubMemberships: (base.clubMemberships ?? []).map((membership) => {
      const projectDef = clubProjectDefForOrg(membership.orgId)
      if (!projectDef) return membership
      if (membership.project?.seasonId === baseSeason.id) return membership
      return {
        ...membership,
        project: createClubProjectState(membership.orgId, baseSeason.id),
      }
    }),
    semesterStats: {
      library: 0, attend: 0, skip: 0, sleepIn: 0, coffee: 0, selfCare: 0,
      exercise: 0, social: 0, partTime: 0, research: 0, club: 0,
      english: 0, electiveHomework: 0, date: 0,
    },
  }
}

function prepareVacation(base: GameState, kind: VacationKind): GameState {
  const meta = VACATIONS[kind]
  return {
    ...base,
    screen: 'vacation',
    plan: null,
    week: 1,
    results: [],
    selected: [],
    actionsUsed: 0,
    vacation: { kind, week: 1, totalWeeks: meta.weeks },
    vacationTravel: null,
    vacationTravelInvites: null,
  }
}

function growAttributes(
  attrs: Record<AttrKey, number>,
  constitutionGrowth: number,
  appearanceGrowth: number,
  socialGrowth: number,
  comprehensionGrowth: number,
  english: number,
  englishGrowth: number,
) {
  return applyGrowthCarry({
    attrs,
    english,
    constitutionGrowth,
    appearanceGrowth,
    socialGrowth,
    englishGrowth,
  })
}

function carryGrowthState(state: GameState): GameState {
  if (!state.player) return state
  const grown = applyGrowthCarry({
    attrs: state.player.attrs,
    english: state.english,
    englishGrowth: state.englishGrowth,
    constitutionGrowth: state.constitutionGrowth,
    appearanceGrowth: state.appearanceGrowth,
    socialGrowth: state.socialGrowth,
    comprehensionGrowth: state.comprehensionGrowth,
  })
  return {
    ...state,
    player: { ...state.player, attrs: grown.attrs },
    english: grown.english,
    englishGrowth: grown.englishGrowth,
    constitutionGrowth: grown.constitutionGrowth,
    appearanceGrowth: grown.appearanceGrowth,
    socialGrowth: grown.socialGrowth,
    comprehensionGrowth: grown.comprehensionGrowth,
  }
}

function getCount(selected: string[], id: string): number {
  return selected.filter((item) => item === id).length
}

function absoluteWeek(state: GameState): number {
  return state.seasonIndex * 4 + state.week
}

function baseCourseId(courseId: string): string {
  return courseId.replace(/^makeup-/, '').replace(/-\d+$/, '')
}

function bumpSemesterStats(
  stats: SemesterStats | undefined,
  actionId: string,
): SemesterStats {
  const next: SemesterStats = {
    library: 0,
    attend: 0,
    skip: 0,
    sleepIn: 0,
    coffee: 0,
    selfCare: 0,
    exercise: 0,
    social: 0,
    partTime: 0,
    research: 0,
    club: 0,
    english: 0,
    electiveHomework: 0,
    date: 0,
    ...(stats ?? {}),
  }
  if (actionId === 'library') next.library += 1
  else if (actionId === 'skip') next.skip += 1
  else if (actionId === 'exercise') next.exercise += 1
  else if (actionId.startsWith('attend:')) next.attend += 1
  else if (actionId === 'sleepIn') next.sleepIn += 1
  else if (actionId === 'social') next.social += 1
  else if (actionId === 'partTime') next.partTime += 1
  else if (actionId === 'sport') next.exercise += 1
  else if (actionId === 'research') next.research += 1
  else if (actionId === 'english') next.english += 1
  else if (actionId === 'club') next.club += 1
  else if (actionId.startsWith('clubAttend:')) next.club += 1
  else if (actionId === 'electiveHomework') next.electiveHomework += 1
  else if (actionId.startsWith('soloDate:')) next.date += 1
  return next
}

function RealApp() {
  const { showResearchNotice } = useResearchNotice()
  const announceSleep = (result: ReturnType<typeof sleepRecoveryFor>, stress: number) => {
    if (result.tier === 0) return
    const reduction = Math.round(result.reduction * 100)
    const coffeeNote = result.coffeeBoosted
      ? '今晚那杯咖啡还在起作用，你比平时更难进入深睡。\n\n'
      : ''
    showResearchNotice({
      kind: 'sleep',
      title: result.coffeeBoosted
        ? '咖啡因还没退'
        : result.tier === 3
          ? '几乎没合眼'
          : result.tier === 2
            ? '一夜没睡好'
            : '睡得不踏实',
      text: coffeeNote + pickSleepText(result.tier as 1 | 2 | 3),
      ruleText: `${result.coffeeBoosted ? '晚间喝咖啡导致睡眠影响 +1 级 · ' : ''}压力 ${stress} · 睡眠基础恢复 +${result.base} · 高压折减 -${reduction}% · 实际精力 +${result.gain}`,
      ruleLabel: '睡眠恢复',
    })
  }
  const { showEncounter } = useEncounter()
  const { showTravelEvents } = useTravelEvents()
  const [view, setView] = useState<View>('title')
  const [game, setGame] = useState<GameState | null>(null)
  const gameRef = useRef<GameState | null>(null)
  gameRef.current = game
  const interfaceOriginView = useRef<View>('week')
  const [hasSave, setHasSave] = useState(false)
  const [saveSlots, setSaveSlots] = useState<SaveSlotSummary[]>([])
  const [crisisKind, setCrisisKind] = useState<CrisisKind | null>(null)
  const [crisisReturn, setCrisisReturn] = useState<View>('week')
  const [clubRecruitmentMode, setClubRecruitmentMode] = useState<'initial' | 'application'>('initial')
  const walkAttemptDayRef = useRef('')
  const [noticeTick, setNoticeTick] = useState(0)
  const [dismissedFailureKey, setDismissedFailureKey] = useState<string | null>(null)
  const [mentorInterviewScene, setMentorInterviewScene] =
    useState<MentorInterviewSceneData | null>(null)
  const [chatFocus, setChatFocus] = useState<ChatLaunch | null>(null)
  const devPreGraduationLoaded = useRef(false)

  useEffect(() => {
    if (devPreGraduationLoaded.current) return
    devPreGraduationLoaded.current = true
    if (!import.meta.env.DEV) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('dev') !== 'pre-graduation') return
    const seeded = createPreGraduationState()
    persist(seeded)
    setGame(seeded)
    setView('result')
    setHasSave(true)
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  // 上一篇论文接收后，不再弹窗追问；下一篇课题通过邮件发到邮箱。
  useEffect(() => {
    setGame((previous) => {
      if (!previous?.awaitingNextProject) return previous
      const mentor = mentorProfileOf(previous.mentorProfileId)
      const hypothesis = mentor ? pickHypothesis(mentor.id) : null
      if (!mentor || !hypothesis) {
        const cleared = { ...previous, awaitingNextProject: false }
        persist(cleared)
        return cleared
      }
      const next: GameState = {
        ...previous,
        awaitingNextProject: false,
        emails: [
          ...previous.emails,
          createProjectOfferEmail(previous, mentor, hypothesis, true),
        ],
      }
      persist(next)
      return next
    })
  }, [game?.awaitingNextProject])

  const openPublicationNotice = (
    journal: string,
    text: string,
  ) => {
    showResearchNotice({
      kind: 'published',
      title: '论文发表',
      text,
      journal,
      onAcknowledge: () => {
        setNoticeTick((value) => value + 1)
      },
    })
  }

  /**
   * TA/overlay actions receive a snapshot, but only patch the fields they
   * actually changed. The week loop remains the sole owner of the clock.
   * This prevents a stale snapshot from restoring an earlier week, slot,
   * prep value, or any other unrelated field.
   */
  const commitTaState = (next: GameState, base: GameState | null = game) => {
    const latest = gameRef.current
    if (!latest) {
      setGame(next)
      persist(next)
      return
    }
    const timeFields = new Set<keyof GameState>([
      'screen',
      'season',
      'seasonIndex',
      'week',
      'weekSlot',
      'weekSlotSkipped',
      'weekSlotActions',
      'logs',
      'eventWeek',
      'eventHistory',
    ])
    const patch: Partial<GameState> = {}
    if (base) {
      for (const rawKey of Object.keys(next)) {
        const key = rawKey as keyof GameState
        if (timeFields.has(key)) continue
        if (next[key] !== base[key]) {
          ;(patch as Record<string, unknown>)[key] = next[key]
        }
      }
    }
    const merged: GameState = { ...latest, ...patch }
    gameRef.current = merged
    setGame(merged)
    persist(merged)
  }

  useEffect(() => {
    const slots = listSaveSlots()
    setSaveSlots(slots)
    setHasSave(slots.length > 0)
  }, [])

  // 手动保存入口：固定在游戏页面右下角。
  const showSaveFab = Boolean(game) && view !== 'title' && view !== 'create'
  useEffect(() => {
    if (!showSaveFab) return
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'save-fab'
    button.textContent = '保存进度'
    let feedbackTimer = 0
    const handleSave = () => {
      const latest = gameRef.current
      if (!latest) return
      persist(latest)
      button.textContent = '✓ 已保存'
      if (feedbackTimer) window.clearTimeout(feedbackTimer)
      feedbackTimer = window.setTimeout(() => { button.textContent = '保存进度' }, 1600)
    }
    button.addEventListener('click', handleSave)
    document.body.appendChild(button)
    return () => {
      if (feedbackTimer) window.clearTimeout(feedbackTimer)
      button.removeEventListener('click', handleSave)
      button.remove()
    }
  }, [showSaveFab])

  // 生病/受伤期间精力上限临时下降；任何来源的恢复都不能超过这个上限。
  useEffect(() => {
    if (!game) return
    const cap = healthEnergyCap(game)
    if (game.energy <= cap) return
    const next = { ...game, energy: cap }
    gameRef.current = next
    setGame(next)
    persist(next)
  }, [game])


  useEffect(() => {
    const body = document.body
    const active =
      Boolean(game) && view !== 'title' && view !== 'create'
    const stress = active ? game!.stress : 0
    const energy = active ? game!.energy : 100
    body.classList.toggle('stress-high', stress > 79)
    body.classList.toggle('stress-critical', stress > 80)
    body.classList.toggle('energy-low', energy < 20)
    return () => {
      body.classList.remove('stress-high', 'stress-critical', 'energy-low')
    }
  }, [game, view])

  useEffect(() => {
    if (!game) return
    const now = progressWeek(game)
    const isFrozen = (relation: GameState['relationships'][number]) =>
      relation.intimacyFrozenSeason === game.season.id ||
      (typeof relation.intimacyFrozenUntilWeek === 'number' &&
        now <= relation.intimacyFrozenUntilWeek)
    const frozen = game.relationships.filter(
      (relation) =>
        isFrozen(relation) &&
        typeof relation.frozenIntimacy === 'number' &&
        relation.intimacy !== relation.frozenIntimacy,
    )
    if (frozen.length === 0) return
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((relation) =>
        isFrozen(relation) &&
        typeof relation.frozenIntimacy === 'number' &&
        relation.intimacy !== relation.frozenIntimacy
          ? { ...relation, intimacy: relation.frozenIntimacy }
          : relation,
      ),
    }
    setGame(next)
    persist(next)
  }, [game])

  useEffect(() => {
    if (!game) return
    const now = progressWeek(game)
    const hadExpired = game.relationships.some(
      (relation) =>
        relation.brokenBondType &&
        typeof relation.bondCalmUntilWeek === 'number' &&
        now > relation.bondCalmUntilWeek,
    )
    if (!hadExpired) return
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((relation) =>
        relation.brokenBondType &&
        typeof relation.bondCalmUntilWeek === 'number' &&
        now > relation.bondCalmUntilWeek
          ? {
              ...relation,
              brokenBondType: undefined,
              bondBreakWeek: undefined,
              bondCalmUntilWeek: undefined,
              bondReconcileAttempted: false,
              intimacyFrozenUntilWeek: undefined,
              frozenIntimacy: undefined,
            }
          : relation,
      ),
    }
    setGame(next)
    persist(next)
  }, [game])

  // 考试周前检查本学期请假次数：两次及以上第一次警告，再次发生则退出。
  useEffect(() => {
    if (!game || view !== 'week' || game.week !== 3) return
    const target = (game.clubMemberships ?? []).find(
      (membership) =>
        membership.activitySeasonIndex === game.seasonIndex &&
        (membership.semesterLeaves ?? 0) >= 2,
    )
    if (!target) return
    if (
      target.inactivityWarningIssued &&
      target.inactivityWarningSeasonIndex !== game.seasonIndex
    ) {
      const next: GameState = {
        ...game,
        clubMemberships: game.clubMemberships.filter(
          (membership) => membership.orgId !== target.orgId,
        ),
        clubHistory: [
          ...game.clubHistory,
          {
            orgId: target.orgId,
            orgName: ORG_BY_ID[target.orgId]?.name ?? target.orgId,
            highestRole: target.highestRole,
            joinedSeasonIndex: target.joinedSeasonIndex,
            leftSeasonIndex: game.seasonIndex,
            reason: 'expelled',
          },
        ],
      }
      setGame(next)
      persist(next)
      showResearchNotice({
        kind: 'club',
        title: '移出组织通知',
        text: CLUB_LEAVE_EXPEL_TEXT,
      })
      return
    }
    if (target.inactivityWarningIssued) return
    const next: GameState = {
      ...game,
      clubMemberships: game.clubMemberships.map((membership) =>
        membership.orgId === target.orgId
          ? {
              ...membership,
              inactivityWarningIssued: true,
              inactivityWarningSeasonIndex: game.seasonIndex,
            }
          : membership,
      ),
    }
    setGame(next)
    persist(next)
    showResearchNotice({
      kind: 'club',
      title: '组织考勤警告',
      text: CLUB_LEAVE_WARNING_TEXT,
    })
  }, [game, view])

  useEffect(() => {
    if (!game || view !== 'week') return

    const memberships = game.clubMemberships ?? []

    if (game.week === 1 && memberships.length > 0) {
      const pending = memberships.some(
        (membership) => membership.activitySeasonIndex !== game.seasonIndex,
      )
      if (pending) {
        const next: GameState = {
          ...game,
          clubMemberships: memberships.map((membership) =>
            membership.activitySeasonIndex !== game.seasonIndex
              ? {
                  ...membership,
                  semesterActivities: 0,
                  semesterLeaves: 0,
                  activitySeasonIndex: game.seasonIndex,
                }
              : membership,
          ),
        }
        setGame(next)
        persist(next)
        return
      }
    }

    if (
      game.week === 1 &&
      memberships.length > 0 &&
      game.seasonIndex > 0 &&
      isAutumnSeasonIndex(game.seasonIndex) &&
      game.clubLastPromotionSeason !== game.season.id
    ) {
      const notices: string[] = []
      const updatedMemberships = memberships.map((membership) => {
        const org = ORG_BY_ID[membership.orgId]
        const orgName = org?.name ?? '组织'
        if (
          membership.role === 'president' &&
          game.seasonIndex -
            (membership.presidentStartSeasonIndex ?? game.seasonIndex) >=
            4
        ) {
          notices.push(
            `你在${orgName}的${roleLabel(membership.category, 'president')}任期结束了。交接会上，大家把一本写满名字的旧笔记本递给你：“以后就是荣誉成员了，想来就来。”你继续保留组织领导层的福利，但不再需要参加每周活动。`,
          )
          return {
            ...membership,
            role: 'honorary' as const,
            roleSinceSeasonIndex: game.seasonIndex,
            highestRole: 'president' as const,
          }
        }
        if (
          membership.orgId === DEBATE_ORG_ID &&
          membership.role === 'member' &&
          membership.totalActivities >= 15 &&
          (membership.contribution ?? 0) >= 15 &&
          game.seasonIndex - membership.roleSinceSeasonIndex >= 1
        ) {
          notices.push(
            `${orgName}的秋季例会上，你凭借累计活动和赛事贡献，被推选为${roleLabel('debate', 'officer')}。`,
          )
          return {
            ...membership,
            role: 'officer' as const,
            roleSinceSeasonIndex: game.seasonIndex,
            highestRole: 'officer' as const,
          }
        }
        if (
          membership.orgId === DEBATE_ORG_ID &&
          membership.role === 'officer' &&
          membership.totalActivities >= 30 &&
          (membership.contribution ?? 0) >= 30 &&
          game.seasonIndex - membership.roleSinceSeasonIndex >= 1
        ) {
          notices.push(
            `${orgName}的换届会上，你成为新一任${roleLabel('debate', 'president')}。`,
          )
          return {
            ...membership,
            role: 'president' as const,
            roleSinceSeasonIndex: game.seasonIndex,
            presidentStartSeasonIndex: game.seasonIndex,
            highestRole: 'president' as const,
          }
        }
        if (
          membership.role === 'member' &&
          membership.totalActivities >= 25 &&
          game.seasonIndex - membership.roleSinceSeasonIndex >= 1
        ) {
          notices.push(
            `秋季例会上，${orgName}宣布你从${roleLabel(membership.category, 'member')}升为${roleLabel(membership.category, 'officer')}。你的组织收益提高了 15%，接下来要承担更多具体工作。`,
          )
          return {
            ...membership,
            role: 'officer' as const,
            roleSinceSeasonIndex: game.seasonIndex,
            highestRole: 'officer' as const,
          }
        }
        if (
          membership.role === 'officer' &&
          membership.totalActivities >= 60 &&
          game.seasonIndex - membership.roleSinceSeasonIndex >= 4
        ) {
          notices.push(
            `经过一年的干事工作，你被推选为${orgName}的${roleLabel(membership.category, 'president')}。你的组织收益提高到 30%，同时也要开始为整个组织负责。`,
          )
          return {
            ...membership,
            role: 'president' as const,
            roleSinceSeasonIndex: game.seasonIndex,
            presidentStartSeasonIndex: game.seasonIndex,
            highestRole: 'president' as const,
          }
        }
        return membership
      })
      const next: GameState = {
        ...game,
        clubMemberships: updatedMemberships,
        clubLastPromotionSeason: game.season.id,
      }
      setGame(next)
      persist(next)
      if (notices.length > 0) {
        showResearchNotice({
          kind: 'club',
          title: notices.length > 1 ? '组织职务变动' : '组织晋升',
          text: notices.join(' '),
        })
      }
      return
    }

    if (
      game.stressHearts <= 0 &&
      game.stress >= 80 &&
      game.selected.length === 0 &&
      progressWeek(game) > game.stressHeartBreakWeek
    ) {
      if (game.familyAffection > 50 && !game.familyCrisisRescued) {
        const next: GameState = {
          ...game,
          stress: 0,
          familyCrisisRescued: true,
        }
        setGame(next)
        persist(next)
        showResearchNotice({
          kind: 'family',
          title: '家里的电话',
          text: FAMILY_CRISIS_TALK,
          ruleText: '家人好感 > 50 · 压力已清零 · 这一次，家里人把你从悬崖边拉了回来。',
          ruleLabel: '家人的支持',
        })
        return
      }
      const ending = pickStressEnding()
      commit(
        {
          ...game,
          screen: 'stressEnding',
          stressEndingText: ending.text,
          stressEndingMethod: ending.method,
        },
        'stressEnding',
      )
      return
    }

    if (
      game.pendingEvent ||
      game.pendingConfession ||
      game.pendingConsumption ||
      game.eventWeek === game.week
    ) {
      return
    }
    if (game.week < 1 || game.week > 3) return
    if (
      (!game.highPressureDebuff && game.stress > 80) ||
      (!game.lowEnergyAlert && game.energy < 20)
    ) {
      return
    }
    const consumptionKey = absoluteWeek(game)
    if (game.consumptionEventWeek !== consumptionKey) {
      if (Math.random() < 0.25) {
        const consumptionEvent = pickConsumptionEvent(
          consumptionExcludedIds(game),
        )
        if (!consumptionEvent) return
        const next: GameState = {
          ...game,
          pendingConsumption: consumptionEvent,
          consumptionEventWeek: consumptionKey,
          pendingEvent: null,
          pendingConfession: null,
          screen: 'week',
        }
        setGame(next)
        persist(next)
        return
      }
    }
    const mentorRelation = game.relationships.find(
      (relation) => relation.kind === 'mentor',
    )
    const mentor = mentorRelation
    const currentAbsoluteWeek = absoluteWeek(game)
    if (
      mentor &&
      game.researchStarted &&
      !game.researchPublished &&
      currentAbsoluteWeek - game.lastResearchWeek > 3 &&
      (game.lastResearchWarningWeek === 0 ||
        currentAbsoluteWeek - game.lastResearchWarningWeek >= 3)
    ) {
      const warningNext: GameState = {
        ...game,
        eventWeek: game.week,
        lastResearchWarningWeek: currentAbsoluteWeek,
        stress: Math.min(100, game.stress + 5),
        pendingEvent: null,
        pendingConfession: null,
        screen: 'week',
      }
      setGame(warningNext)
      persist(warningNext)
      showResearchNotice({
        kind: 'warning',
        title: '导师的电话',
        text: `导师在电话里沉默了几秒，然后说：“课题不是挂在墙上的画。你已经三周没有推进了，再这样下去，我只能当你还没准备好。”你握着手机，压力一下子涨了上来。`,
      })
      return
    }

    if (
      game.familyAffection >= 20 &&
      Math.random() < Math.min(0.35, 0.05 + game.familyAffection / 500)
    ) {
      const next: GameState = {
        ...game,
        eventWeek: game.week,
        familyReliefWeek: absoluteWeek(game),
        pendingEvent: createFamilyReliefEvent(game.familyAffection),
        pendingConfession: null,
        screen: 'week',
      }
      setGame(next)
      persist(next)
      return
    }
    const social = rollRelationshipWeekly(game)
    if (social.pendingEvent || social.pendingConfession) {
      const next: GameState = {
        ...social.state,
        eventWeek: game.week,
        pendingEvent: social.pendingEvent,
        pendingConfession: social.pendingConfession,
        screen: 'week',
      }
      setGame(next)
      persist(next)
      return
    }
    const npcReveal = maybeCreateNpcRevealEvent(social.state)
    const pending = npcReveal ?? rollWeeklyEvent(social.state)
    const next: GameState = {
      ...social.state,
      eventWeek: game.week,
      pendingEvent: pending,
      pendingConfession: null,
      screen: 'week',
    }
    setGame(next)
    persist(next)

  }, [game, view, noticeTick])

  useEffect(() => {
    if (!game || !game.player || view !== 'week') return
    if (!game.habits.includes('meditation') || game.stress > 60) return
    if (game.week < 1 || game.week > 3) return
    if (
      game.pendingEvent ||
      game.pendingConfession ||
      game.pendingConsumption
    ) {
      return
    }
    const dayIndex = Math.floor(game.weekSlot / 3)
    if (dayIndex > 4) return
    const weekKey = `${game.season.id}-${game.week}`
    const dayKey = `${weekKey}-${dayIndex}`
    if (walkAttemptDayRef.current === dayKey) return
    walkAttemptDayRef.current = dayKey
    const count =
      game.walkEncounterWeekKey === weekKey ? game.walkEncounterCount : 0
    if (count >= 2) return
    if (Math.random() >= 0.25) return

    // A “？？” met during a previous gossip clue can appear on campus.
    // First encounter reveals the name; the next one turns them into a contact.
    const pendingNpc = Object.entries(game.npcProfiles ?? {}).filter(
      ([id, profile]) =>
        !game.relationships.some((relation) => relation.id === id) &&
        (game.npcRelations ?? []).some(
          (relation) =>
            relation.known &&
            (relation.aId === id || relation.bId === id),
        ),
    )
    if (pendingNpc.length > 0 && Math.random() < 0.55) {
      const [npcId, profile] = pendingNpc[Math.floor(Math.random() * pendingNpc.length)]
      const chat =
        ENCOUNTER_CHATS[Math.floor(Math.random() * ENCOUNTER_CHATS.length)]
      const baseNext: GameState = {
        ...game,
        eventWeek: game.week,
        walkEncounterWeekKey: weekKey,
        walkEncounterDayKey: dayKey,
        walkEncounterCount: count + 1,
        pendingEvent: null,
        pendingConfession: null,
        screen: 'week',
      }
      if (!profile.revealed) {
        const next = {
          ...baseNext,
          npcProfiles: {
            ...(game.npcProfiles ?? {}),
            [npcId]: { ...profile, revealed: true },
          },
        }
        setGame(next)
        persist(next)
        showEncounter({
          name: profile.name,
          identity: '校园偶遇的陌生同学',
          chat,
          intimacyMultiplier: 1,
          onResolve: () => undefined,
        })
        return
      }
      const relation = createNpcContactFromProfile(
        game.player!,
        profile,
        npcId,
        progressWeek(game),
      )
      const next: GameState = {
        ...baseNext,
        relationships: [...game.relationships, relation],
      }
      setGame(next)
      persist(next)
      showEncounter({
        name: relation.name,
        identity: relation.identity,
        chat,
        intimacyMultiplier: intimacyMultiplier(next, relation),
        onResolve: (intimacy) => {
          setGame((previous) => {
            if (!previous) return previous
            const updated: GameState = {
              ...previous,
              relationships: previous.relationships.map((item) =>
                item.id === relation.id
                  ? {
                      ...item,
                      intimacy: Math.max(
                        0,
                        Math.min(
                          100,
                          item.intimacy +
                            adjustIntimacyDelta(previous, item, intimacy),
                        ),
                      ),
                    }
                  : item,
              ),
            }
            persist(updated)
            return updated
          })
        },
      })
      return
    }

    const known = game.relationships.filter(
      (relation) =>
        relation.kind !== 'mentor' && relation.kind !== 'counselor',
    )
    let next = game
    let relation = known.length > 0
      ? known[Math.floor(Math.random() * known.length)]
      : null
    if (!relation || Math.random() < 0.32) {
      relation = {
        ...createEventFriend(game.player),
        identity: '校园偶遇认识的人',
        metAbsWeek: progressWeek(game),
      }
      next = {
        ...game,
        relationships: [...game.relationships, relation],
      }
    }
    const chat =
      ENCOUNTER_CHATS[Math.floor(Math.random() * ENCOUNTER_CHATS.length)]
    const nextWithWeek: GameState = {
      ...next,
      eventWeek: game.week,
      walkEncounterWeekKey: weekKey,
      walkEncounterDayKey: dayKey,
      walkEncounterCount: count + 1,
      pendingEvent: null,
      pendingConfession: null,
      screen: 'week',
    }
    setGame(nextWithWeek)
    persist(nextWithWeek)
    showEncounter({
      name: relation.name,
      identity: relation.identity,
      chat,
      intimacyMultiplier: intimacyMultiplier(nextWithWeek, relation),
      onResolve: (intimacy) => {
        setGame((previous) => {
          if (!previous) return previous
          const updated: GameState = {
            ...previous,
            relationships: previous.relationships.map((item) =>
              item.id === relation!.id
                ? {
                    ...item,
                    intimacy: Math.max(
                      0,
                      Math.min(
                        100,
                        item.intimacy +
                          adjustIntimacyDelta(previous, item, intimacy),
                      ),
                    ),
                  }
                : item,
            ),
          }
          persist(updated)
          return updated
        })
      },
    })
  }, [game, view, noticeTick])

  useEffect(() => {
    if (
      !game ||
      view === 'title' ||
      view === 'create' ||
      view === 'stressEnding' ||
      game.stress < 80 ||
      game.stressHearts <= 0
    ) {
      return
    }
    const heartsBefore = game.stressHearts
    const stage = 4 - heartsBefore
    const mentor = game.relationships.find((relation) => relation.kind === 'mentor')
    const counselor = game.relationships.find((relation) => relation.kind === 'counselor')
    const speaker =
      stage === 3
        ? '舍友们'
        : stage === 2 && mentor
          ? mentor.name
          : counselor?.name ?? '辅导员'
    const title =
      stage === 3
        ? '舍友们的夜谈'
        : stage === 2 && mentor
          ? '导师的谈心'
          : '辅导员的谈心'
    const pool =
      stage === 3
        ? ROOMMATE_TALKS
        : STRESS_TALKS
    const text = pool[Math.floor(Math.random() * pool.length)]
    const nextStress = stage === 1 ? 60 : stage === 2 ? 70 : game.stress
    const ruleText =
      stage === 1
        ? '压力达到 80 会碎掉一颗心。当前已碎 1 颗，辅导员介入后压力降至 60。三颗心全部碎掉后，下一个新的每周行动阶段若压力仍 ≥80，将直接触发自尽结局。'
        : stage === 2
          ? '当前只剩 1 颗心。下一次压力达到 80 会碎掉最后一颗；从再下一个新的每周行动阶段起，若压力仍 ≥80，将直接触发自尽结局。'
          : '最后一颗心已经碎了。下一个新的每周行动阶段开始时，如果压力仍 ≥80，将直接触发自尽结局。'
    const next: GameState = {
      ...game,
      stressHearts: Math.max(0, game.stressHearts - 1),
      stressHeartBreakWeek: progressWeek(game),
      stress: Math.max(0, Math.min(100, nextStress)),
      highPressureDebuff: stage === 3,
    }
    setGame(next)
    persist(next)
    showResearchNotice({
      kind: 'stress',
      title,
      text,
      ruleText,
    })
  }, [game, view])

  useEffect(() => {
    if (
      !game ||
      crisisKind ||
      view === 'title' ||
      view === 'create' ||
      view === 'crisis'
    ) {
      return
    }

    if (game.stress < 60 && game.highPressureDebuff) {
      const next = { ...game, highPressureDebuff: false }
      setGame(next)
      persist(next)
      return
    }

    if (game.energy < 20 && !game.lowEnergyAlert) {
      const next = { ...game, lowEnergyAlert: true }
      setGame(next)
      persist(next)
      setCrisisReturn(view)
      setCrisisKind('energy')
      setView('crisis')
      return
    }

    if (game.energy >= 20 && game.lowEnergyAlert) {
      const next = { ...game, lowEnergyAlert: false }
      setGame(next)
      persist(next)
    }
  }, [game, view, crisisKind])

  const commit = (next: GameState, nextView: View) => {
    setGame(next)
    setView(nextView)
    persist(next)
    setHasSave(true)
  }

  const goTitle = () => {
    const latest = gameRef.current ?? game
    if (latest) {
      persist(latest)
      setHasSave(true)
    }
    setCrisisKind(null)
    setSaveSlots(listSaveSlots())
    setView('title')
  }

  const startCreate = () => {
    beginNewSaveSlot()
    setCrisisKind(null)
    setGame(null)
    setView('create')
  }

  const handleCreate = (player: Player) => {
    setCrisisKind(null)
    const base = {
      ...newGameState(player),
      screen: 'talentSelect' as const,
      relationships: createInitialRelationships(player),
    }
    const next = createInitialNpcSocial(base)
    commit(next, 'talentSelect')
  }

  const handleOpeningTalent = (talents: OpeningTalentId[]) => {
    if (!game) return
    let next = applyOpeningTalent({ ...game, screen: 'plan' }, talents)
    if (talents.includes('medicalFamily') && next.player) {
      const mentor = pickMentorProfile()
      const background = next.player.background
      const parentHint =
        background === 'affluent'
          ? '你家里长辈和我很熟，说你从小就在医院走廊里长大。'
          : background === 'middle'
            ? '你父母托我多关照你，说你一直想学医。'
            : '你家里人和我提过你，说你读书很用功。'
      const greeting = createMedicalFamilyGreeting(next, mentor, parentHint)
      next = {
        ...next,
        mentorProfileId: mentor.id,
        medicalFamilyMentorId: mentor.id,
        medicalFamilyAcceptanceAtAbs: nextGameDayStartAbs(next),
        emails: [...next.emails, greeting],
      }
    }
    if (talents.includes('modelMonster') && next.player) {
      const chance = Math.min(0.75, next.player.attrs.appearance * 0.08)
      if (Math.random() < chance) {
        next = {
          ...next,
          screen: 'talentEvent',
          roommateBond: true,
          socialGrowth: next.socialGrowth + 20,
        }
        commit(next, 'talentEvent')
        return
      }
    }
    commit(next, 'plan')
  }

  const handleTalentEventContinue = () => {
    if (!game) return
    commit({ ...game, screen: 'plan' }, 'plan')
  }

  const resolveConsumption = (
    accept: boolean,
    mode: 'full' | 'installment' = 'full',
  ) => {
    if (!game || !game.pendingConsumption) return
    const consumption = game.pendingConsumption
    let next: GameState = {
      ...game,
      pendingConsumption: null,
      consumptionEventWeek: absoluteWeek(game),
    }
    if (accept) {
      const installment = consumption.installment
      const payment =
        mode === 'installment' ? (installment?.amount ?? 0) : consumption.cost
      if (
        mode === 'installment' &&
        (!installment || game.money < installment.amount)
      ) {
        return
      }
      if (mode === 'full' && game.money < consumption.cost) return
      const purchase = makeConsumptionPurchase(game, consumption, mode)
      next = {
        ...next,
        money: Math.max(0, game.money - payment),
        consumptionPurchases: [...(game.consumptionPurchases ?? []), purchase],
      }
      next = addImmediateConsumptionEffects(next, consumption)
      next = applyWeeklyConsumptionEffects(next)
    }
    setGame(next)
    persist(next)
  }

  const handleRandomEventContinue = () => {
    if (!game || !game.pendingEvent) return
    const withNotice = pushCampusNotice(
      game,
      game.pendingEvent.title,
      game.pendingEvent.text,
    )
    const next = applyEvent(withNotice, game.pendingEvent)
    commit(next, 'week')
  }

  const handleNpcConfession = (accept: boolean) => {
    if (!game || !game.pendingConfession) return
    const pending = game.pendingConfession
    const relation = game.relationships.find(
      (item) => item.id === pending.relationshipId,
    )
    if (!relation) {
      commit({ ...game, pendingConfession: null }, 'week')
      return
    }
    const updated: typeof relation = accept
      ? {
          ...relation,
          partner: true,
          intimacy: Math.min(
            100,
            relation.intimacy + adjustIntimacyDelta(game, relation, 5),
          ),
          confessionRisk: 0,
          breakupRisk: 0,
          ex: false,
          exWeek: 0,
          exPenalty: false,
        }
      : {
          ...relation,
          intimacy: Math.max(
            0,
            relation.intimacy + adjustIntimacyDelta(game, relation, -5),
          ),
          confessionRisk: 0,
        }
    const next: GameState = {
      ...game,
      pendingConfession: null,
      relationships: game.relationships.map((item) =>
        item.id === relation.id ? updated : item,
      ),
      romanceUnlocked: game.romanceUnlocked || accept,
      teacherScandalRisk:
        accept && isStaffRelation(relation)
          ? Math.max(5, game.teacherScandalRisk)
          : game.teacherScandalRisk,
      stress: accept ? game.stress : clamp(game.stress + 2, 0, 100),
    }
    commit(next, 'week')
  }

  const confirmElectives = (acceptedIds: string[]) => {
    if (!game) return
    const allAccepted = acceptedIds
      .map((id) => ELECTIVE_COURSE_BY_ID[id])
      .filter(Boolean)
    const peCourse = allAccepted.find((course) => course.electiveType === 'pe')
    const electiveCourses = allAccepted.filter(
      (course) => course.electiveType !== 'pe',
    )
    const pairKey = peCourse ? pePairKey(game.seasonIndex) : null
    const next: GameState = {
      ...game,
      screen: 'plan',
      season: {
        ...game.season,
        courses: [...game.season.courses, ...electiveCourses],
      },
      electiveHistory: [
        ...new Set([
          ...game.electiveHistory,
          ...electiveCourses
            .filter((course) => course.electiveType !== 'politics')
            .map((course) => course.id),
        ]),
      ],
      pendingPeCourseId: peCourse?.id ?? game.pendingPeCourseId,
      pendingPePairKey: pairKey ?? game.pendingPePairKey,
      peCourseHistory: peCourse
        ? [...new Set([...game.peCourseHistory, peCourse.id])]
        : game.peCourseHistory,
      peRunCount: peCourse ? 0 : game.peRunCount,
      electiveOffers: [],
      electiveSelectionDone: true,
      relationships:
        electiveCourses.length > 0 && game.player
          ? [
              ...game.relationships,
              createCourseFriend(game.player, electiveCourses[0].name),
            ]
          : game.relationships,
    }
    commit(next, 'plan')
  }

  const joinClubState = (base: GameState, orgId: string): GameState => {
    if (!base.player) return base
    const org = ORG_BY_ID[orgId]
    if (!org) return base
    const existing = base.clubMemberships ?? []
    if (existing.some((membership) => membership.orgId === orgId)) return base
    if (existing.length >= 2) return base
    const existingClubs = existing.filter(
      (membership) =>
        membership.category === 'academic' ||
        membership.category === 'interest' ||
        membership.category === 'practice',
    )
    if (org.category === 'union' || org.category === 'debate') {
      if (existing.length > 0) return base
    } else {
      if (existing.some((membership) => membership.category === 'union' || membership.category === 'debate')) {
        return base
      }
      if (existingClubs.length >= 2) return base
    }
    const roles = [
      roleLabel(org.category, 'president'),
      roleLabel(org.category, 'member'),
      roleLabel(org.category, 'member'),
      roleLabel(org.category, 'member'),
    ]
    const newRelations = roles.map((role) =>
      createClubRelationship(base.player!, org.id, org.name, role, progressWeek(base)),
    )
    return {
      ...base,
      screen: 'week',
      clubMemberships: [
        ...existing,
        {
          orgId: org.id,
          category: org.category,
          role: 'member',
          joinedSeasonIndex: base.seasonIndex,
          totalActivities: 0,
          semesterActivities: 0,
          semesterLeaves: 0,
          roleSinceSeasonIndex: base.seasonIndex,
          presidentStartSeasonIndex: null,
          memberIds: newRelations.map((relation) => relation.id),
          highestRole: 'member',
          activitySeasonIndex: base.seasonIndex,
          inactivityWarningIssued: false,
          project: createClubProjectState(org.id, base.season.id),
          contribution: 0,
        },
      ],
      clubInitialRecruitmentDone: true,
      clubInvites: null,
      relationships: [...base.relationships, ...newRelations],
    }
  }

  const showClubWelcome = (orgId: string) => {
    const org = ORG_BY_ID[orgId]
    if (!org) return
    const lines = organizationBenefitLines(org, roleBenefitMultiplier('member'))
    showResearchNotice({
      kind: 'club',
      title: `欢迎加入${org.name}`,
      text: `你正式成为${org.name}的一员。${org.description} 每学期第 3 周后，你会获得一次组织福利。每周也可以选择「组织活动」，与组织里的朋友共事。`,
      ruleText: `学期福利：${lines.join('；')}。组织朋友会出现在你的关系列表里。`,
      ruleLabel: '组织收益',
    })
  }

  const handleInitialClubSubmit = (orgId: string) => {
    if (!game) return
    const next = joinClubState(game, orgId)
    setGame(next)
    persist(next)
    setView('week')
    showClubWelcome(orgId)
  }

  const handleClubRecruitmentSkip = () => {
    if (!game) return
    if (clubRecruitmentMode === 'initial') {
      const next: GameState = {
        ...game,
        screen: 'week',
        clubInitialRecruitmentDone: true,
      }
      setGame(next)
      persist(next)
    } else {
      const next: GameState = {
        ...game,
        screen: 'week',
        selected: game.selected.filter((id) => id !== 'club'),
        clubActivityPlan: null,
      }
      setGame(next)
      persist(next)
    }
    setView('week')
  }

  const handleClubRecruitmentTitle = () => {
    if (game && clubRecruitmentMode === 'application') {
      const next: GameState = {
        ...game,
        screen: 'week',
        selected: game.selected.filter((id) => id !== 'club'),
        clubActivityPlan: null,
      }
      setGame(next)
      persist(next)
      setHasSave(true)
    }
    setCrisisKind(null)
    setView('title')
  }

  const startClubApplication = () => {
    if (!game) return
    const exists = game.clubMemberships ?? []
    const allClubs = exists.every(
      (membership) =>
        membership.category === 'academic' ||
        membership.category === 'interest' ||
        membership.category === 'practice',
    )
    if (exists.length >= 2 || (exists.length > 0 && !allClubs)) return
    if (game.selected.includes('club') || game.selected.length >= 2) return
    const next: GameState = {
      ...game,
      selected: [...game.selected, 'club'],
      clubActivityPlan: {
        mode: 'application',
        acceptedIds: [],
        declinedIds: [],
        committed: true,
      },
      clubInvites: null,
      screen: 'clubRecruitment',
    }
    setGame(next)
    persist(next)
    setClubRecruitmentMode('application')
    setView('clubRecruitment')
  }

  const handleClubApplicationSubmit = (orgId: string) => {
    if (!game) return
    const org = ORG_BY_ID[orgId]
    if (!org) return
    const completeApplication = (state: GameState) => {
      const nextSlot = state.weekSlot + 1
      const finishedDay = Math.floor(state.weekSlot / 3)
      const daily =
        state.weekSlot % 3 === 2 && state.plan
          ? planDailyCost(state.plan, finishedDay)
          : { energy: 0, stress: 0 }
      const stressAfterDay = clamp(state.stress + daily.stress, 0, 100)
      const livingCost =
        state.weekSlot % 3 === 2
          ? dailyLivingCostFor(state.player?.background)
          : 0
      const dayKey = `${state.seasonIndex}-${state.week}-${finishedDay}`
      const coffeeBoosted =
        state.weekSlot % 3 === 2 && state.eveningCoffeeDayKey === dayKey
      const earlySleep = earlySleepApplies(state, nextSlot)
      const sleepStress = clamp(
        stressAfterDay - (earlySleep ? 10 : 0),
        0,
        100,
      )
      const sleep =
        state.weekSlot % 3 === 2
          ? sleepRecoveryFor(sleepStress, coffeeBoosted ? 1 : 0)
          : {
              base: 0,
              tier: 0 as const,
              reduction: 0,
              gain: 0,
              coffeeBoosted: false,
            }
      if (earlySleep) sleep.gain += 5
      const advanced: GameState = {
        ...state,
        screen: 'week',
        weekSlot: nextSlot,
        weekSlotSkipped: false,
        weekSlotActions: [...state.weekSlotActions, 'clubApplication'],
        selected: state.selected.filter((id) => id !== 'club'),
        energy: clamp(state.energy + daily.energy + sleep.gain, 0, 100),
        stress: stressAfterDay,
        money: Math.max(0, state.money - livingCost),
        eveningCoffeeDayKey:
          state.weekSlot % 3 === 2 ? null : state.eveningCoffeeDayKey,
      }
      if (nextSlot >= 21) {
        endWeek(advanced)
        announceSleep(sleep, advanced.stress)
        return
      }
      setGame(advanced)
      persist(advanced)
      setView('week')
      announceSleep(sleep, advanced.stress)
    }
    const success = Math.random() < clubApplicationChance(game, org)
    if (success) {
      const joined = joinClubState(game, orgId)
      if (joined === game) {
        completeApplication({ ...game, screen: 'week' })
        showResearchNotice({
          kind: 'club',
          title: '申请结果',
          text: '你提交了申请，但组织那边表示你已经在名单里，或者名额已经满了。这次申请没有带来新的成员身份。',
        })
        return
      }
      const next: GameState = {
        ...joined,
        screen: 'week',
        clubActivityPlan: {
          mode: 'application',
          acceptedIds: [],
          declinedIds: [],
          committed: true,
        },
      }
      completeApplication(next)
      showClubWelcome(orgId)
    } else {
      completeApplication({ ...game, screen: 'week' })
      showResearchNotice({
        kind: 'club',
        title: '申请结果',
        text: `你向${org.name}提交了申请。负责人看完后，给了你一个很客气的答复：“${pickClubRejection()}”`,
      })
    }
  }

  const handlePlan = (plan: PlanId, habits: HabitId[]) => {
    if (!game) return
    if (isClinicalSeason(game.seasonIndex)) {
      const next: GameState = {
        ...game,
        screen: 'clinical',
        plan,
        habits,
        clinical: game.clinical ?? createClinicalState(game.season.courses),
        week: 1,
        selected: [],
        actionsUsed: 0,
        weekSlot: 0,
        weekSlotSkipped: false,
        weekSlotActions: [],
      }
      setGame(next)
      persist(next)
      setView('clinical')
      return
    }
    const next: GameState = {
      ...game,
      screen: 'week',
      plan,
      habits,
      weekFocus: null,
      week: 1,
      selected: [],
      actionsUsed: 0,
      weekSlot: 0,
      weekSlotSkipped: false,
      weekSlotActions: [],
    }
    const finalNext = applyWeeklyOpeningTalent(next)
    const initialSleep = sleepRecoveryFor(finalNext.stress)
    const withInitialSleep = {
      ...finalNext,
      energy: clamp(finalNext.energy + initialSleep.gain, 0, 100),
    }
    if (!withInitialSleep.clubInitialRecruitmentDone) {
      setGame({ ...withInitialSleep, screen: 'clubRecruitment' })
      persist({ ...withInitialSleep, screen: 'clubRecruitment' })
      setClubRecruitmentMode('initial')
      setView('clubRecruitment')
      return
    }
    const withInitialHealth = advanceHealthForNewWeek(withInitialSleep, [])
    const withLiteratureWeek = {
      ...withInitialHealth,
      literatureStudyWeekKey: currentWeekKey(withInitialHealth),
      literatureStudyCount: 0,
      literatureReportWeekKey: null,
    }
    commit(withLiteratureWeek, 'week')
    announceSleep(initialSleep, withInitialSleep.stress)
  }

  const toggleSelected = (prev: GameState, id: string, repeatable: boolean): GameState => {
    const count = getCount(prev.selected, id)
    if (repeatable) {
      const isFull = prev.selected.length >= 2
      // 已选中的可重复行动：选满时优先取消一次，而不是尝试再增加
      if (count > 0 && (isFull || count >= 2)) {
        // 已选两次时再次点击，两次都取消；已选一次但行动槽已满时，取消该次。
        return {
          ...prev,
          selected: prev.selected.filter((item) => item !== id),
        }
      }
      if (isFull) return prev
      return { ...prev, selected: [...prev.selected, id] }
    }
    if (count > 0) {
      return { ...prev, selected: prev.selected.filter((item) => item !== id) }
    }
    if (prev.selected.length >= 2) return prev
    return { ...prev, selected: [...prev.selected, id] }
  }

  const rememberInterfaceOrigin = () => {
    // Overlays are reached from several hosts. Remember the host view rather
    // than guessing from game.screen, which can be deliberately out of sync
    // during prep/vacation transitions.
    if (
      view === 'week' ||
      view === 'clinical' ||
      view === 'prep' ||
      view === 'vacation' ||
      view === 'plan'
    ) {
      interfaceOriginView.current = view
    }
  }

  const openWhoAmI = () => {
    const latest = gameRef.current ?? game
    if (!latest) return
    rememberInterfaceOrigin()
    persist(latest)
    setView('whoami')
  }

  const openWhoIs = () => {
    const latest = gameRef.current ?? game
    if (!latest) return
    rememberInterfaceOrigin()
    persist(latest)
    setView('whois')
  }

  const returnToMain = () => {
    const latest = gameRef.current ?? game
    if (latest) persist(latest)
    setView(interfaceOriginView.current)
  }

  const markRelationSeen = (relationshipId: string) => {
    // Use the functional form so a bubbled row click can never overwrite a
    // newer pat/event state (including week and course prep) with an old
    // render snapshot.
    setGame((previous) => {
      if (!previous || previous.seenRelationIds.includes(relationshipId)) {
        return previous
      }
      const next: GameState = {
        ...previous,
        seenRelationIds: [...previous.seenRelationIds, relationshipId],
      }
      persist(next)
      return next
    })
  }

  const markAllRelationsSeen = () => {
    setGame((previous) => {
      if (!previous) return previous
      const seen = previous.relationships.map((relation) => relation.id)
      if (seen.every((id) => previous.seenRelationIds.includes(id))) {
        return previous
      }
      const next: GameState = {
        ...previous,
        seenRelationIds: seen,
      }
      persist(next)
      return next
    })
  }

  const giveBirthdayGift = (
    relationshipId: string,
  ): BirthdayGiftResult => {
    const fail = (message: string): BirthdayGiftResult => ({
      message,
      gain: 0,
      before: game?.relationships.find((item) => item.id === relationshipId)?.intimacy ?? 0,
      after: game?.relationships.find((item) => item.id === relationshipId)?.intimacy ?? 0,
    })
    if (!game) return fail('现在还不能送。')
    const relation = game.relationships.find((item) => item.id === relationshipId)
    if (!relation) return fail('你找不到这个人。')
    if (relation.intimacy < 40) return fail('你们还没有熟到可以送生日礼物。')
    const currentDate = gameDate(game)
    if (relation.birthdayMonth !== currentDate.month) {
      return fail('现在还不是 TA 的生日月份。')
    }
    if (relation.birthdayGiftYear === currentDate.year) {
      return fail('今年的生日礼物已经送过了。')
    }
    if (game.money < 150) return fail('生活费不足，买不起生日礼物。')
    const gain = adjustIntimacyDelta(game, relation, 15, { major: true })
    const updated: GameState = {
      ...game,
      money: game.money - 150,
      relationships: game.relationships.map((item) =>
        item.id === relationshipId
          ? {
              ...item,
              intimacy: Math.min(100, item.intimacy + gain),
              birthdayGiftYear: currentDate.year,
              birthdayContactType: 'gift',
              birthdayNextYear: currentDate.year + 1,
            }
          : item,
      ),
    }
    commitTaState(updated, game)
    return {
      message: `你送出了生日礼物。${relation.name} 的亲密度 +${gain}。`,
      gain,
      before: relation.intimacy,
      after: Math.min(100, relation.intimacy + gain),
    }
  }

  const giveBirthdayBlessing = (
    relationshipId: string,
  ): BirthdayGiftResult => {
    const fail = (message: string): BirthdayGiftResult => {
      const relation = game?.relationships.find((item) => item.id === relationshipId)
      return {
        message,
        gain: 0,
        before: relation?.intimacy ?? 0,
        after: relation?.intimacy ?? 0,
      }
    }
    if (!game) return fail('现在还不能送出祝福。')
    const relation = game.relationships.find((item) => item.id === relationshipId)
    if (!relation) return fail('你找不到这个人。')
    if (relation.intimacy < 40) return fail('你们还没有熟到可以单独祝福生日。')
    const currentDate = gameDate(game)
    if (relation.birthdayMonth !== currentDate.month) {
      return fail('现在还不是 TA 的生日月份。')
    }
    if (relation.birthdayGiftYear === currentDate.year) {
      return fail('今年的生日已经联系过了。')
    }
    const gain = adjustIntimacyDelta(game, relation, 5, { major: true })
    const updated: GameState = {
      ...game,
      relationships: game.relationships.map((item) =>
        item.id === relationshipId
          ? {
              ...item,
              intimacy: Math.min(100, item.intimacy + gain),
              birthdayGiftYear: currentDate.year,
              birthdayContactType: 'blessing',
              birthdayNextYear: currentDate.year + 1,
            }
          : item,
      ),
    }
    commitTaState(updated, game)
    return {
      message: `你送上了生日祝福。${relation.name} 的亲密度 +${gain}。`,
      gain,
      before: relation.intimacy,
      after: Math.min(100, relation.intimacy + gain),
    }
  }

  const saveDinnerResults = (results: DinnerInviteResult[]) => {
    if (!game) return
    const next: GameState = {
      ...game,
      dinnerInvites: { weekKey: currentWeekKey(game), results },
    }
    commitTaState(next, game)
  }

  const quitClub = (orgId: string) => {
    if (!game) return
    const membership = game.clubMemberships.find((item) => item.orgId === orgId)
    if (!membership) return
    const next: GameState = {
      ...game,
      clubMemberships: game.clubMemberships.filter((item) => item.orgId !== orgId),
      clubInvites: null,
      clubActivityPlan: null,
      selected: game.selected.filter((id) => id !== 'club'),
      clubHistory: [
        ...game.clubHistory,
        {
          orgId: membership.orgId,
          orgName: ORG_BY_ID[membership.orgId]?.name ?? membership.orgId,
          highestRole: membership.highestRole,
          joinedSeasonIndex: membership.joinedSeasonIndex,
          leftSeasonIndex: game.seasonIndex,
          reason: 'quit',
        },
      ],
    }
    commitTaState(next, game)
  }

  const saveClubInvites = (results: DinnerInviteResult[], orgId: string) => {
    if (!game) return
    const next: GameState = {
      ...game,
      clubInvites: { weekKey: currentWeekKey(game), orgId, results },
    }
    commitTaState(next, game)
  }

  const applyClubEvent = (
    base: GameState,
    membership: GameState['clubMemberships'][number],
    event: ClubEvent,
  ): { next: GameState; lines: string[] } => {
    const multiplier = roleBenefitMultiplier(membership.role)
    const scaled = (value?: number) =>
      value === undefined ? undefined : Math.round(value * multiplier)
    const effects = event.effects
    const lines: string[] = []
    let next: GameState = {
      ...base,
      energy: Math.max(0, Math.min(100, base.energy + (scaled(effects.energy) ?? 0))),
      stress: Math.max(0, Math.min(100, base.stress + (scaled(effects.stress) ?? 0))),
      money: Math.max(0, base.money + (scaled(effects.money) ?? 0)),
      composite: Math.max(0, base.composite + (scaled(effects.composite) ?? 0)),
      socialGrowth: Math.max(0, base.socialGrowth + (scaled(effects.socialGrowth) ?? 0)),
      englishGrowth: base.englishGrowth + (scaled(effects.english) ?? 0),
    }
    if (effects.energy) lines.push(`精力 ${effects.energy > 0 ? '+' : ''}${scaled(effects.energy)}`)
    if (effects.stress) lines.push(`压力 ${effects.stress > 0 ? '+' : ''}${scaled(effects.stress)}`)
    if (effects.money) lines.push(`生活费 ${effects.money > 0 ? '+' : ''}${scaled(effects.money)}`)
    if (effects.composite) lines.push(`综测 +${scaled(effects.composite)}`)
    if (effects.socialGrowth) lines.push(`人际成长 +${scaled(effects.socialGrowth)}`)
    if (effects.english) lines.push(`英语成长 +${scaled(effects.english)}%`)
    if (effects.prep) {
      const courses = base.season.courses
      if (courses.length > 0) {
        const course = courses[Math.floor(Math.random() * courses.length)]
        next = {
          ...next,
          prep: {
            ...next.prep,
            [course.id]: Math.min(
              100,
              (next.prep[course.id] ?? 0) + (scaled(effects.prep) ?? 0),
            ),
          },
        }
        lines.push(`《${course.name}》准备度 +${scaled(effects.prep)}`)
      }
    }
    if (effects.intimacy) {
      const memberId =
        membership.memberIds[
          Math.floor(Math.random() * membership.memberIds.length)
        ]
      const relation = base.relationships.find((item) => item.id === memberId)
      if (relation) {
        const gain = adjustIntimacyDelta(base, relation, scaled(effects.intimacy) ?? 0)
        next = {
          ...next,
          relationships: next.relationships.map((item) =>
            item.id === relation.id
              ? { ...item, intimacy: Math.min(100, item.intimacy + gain) }
              : item,
          ),
        }
        lines.push(`与${relation.name}亲密度 +${gain}`)
      }
    }
    if (membership.category === 'academic' && !base.labEntered && next.researchPreparation < 100) {
      const prepGain = 2
      next = {
        ...next,
        researchPreparation: Math.min(100, next.researchPreparation + prepGain),
      }
      lines.push(`科研准备度 +${prepGain}%`)
    } else if (
      membership.category === 'academic' &&
      base.labEntered &&
      !base.researchPublished
    ) {
      const progressGain = 0.5
      next = {
        ...next,
        researchProgress: Math.min(100, next.researchProgress + progressGain),
        research: next.research + progressGain,
      }
      lines.push('科研进度 +0.5%')
    }
    if (next.player) {
      const grown = applyGrowthCarry({
        attrs: next.player.attrs,
        english: next.english,
        englishGrowth: next.englishGrowth,
        constitutionGrowth: next.constitutionGrowth,
        appearanceGrowth: next.appearanceGrowth,
        socialGrowth: next.socialGrowth,
        comprehensionGrowth: next.comprehensionGrowth,
      })
      next = {
        ...next,
        player: { ...next.player, attrs: grown.attrs },
        english: grown.english,
        englishGrowth: grown.englishGrowth,
        constitutionGrowth: grown.constitutionGrowth,
        appearanceGrowth: grown.appearanceGrowth,
        socialGrowth: grown.socialGrowth,
        comprehensionGrowth: grown.comprehensionGrowth,
      }
    }
    return { next, lines }
  }

  const arrangeClubActivity = (
    orgId: string,
    acceptedIds: string[],
    declinedIds: string[],
  ) => {
    const membership = game?.clubMemberships.find((item) => item.orgId === orgId)
    if (
      !game ||
      !membership ||
      game.selected.includes('club') ||
      game.selected.length >= 2
    ) {
      return
    }
    const roleMultiplier = roleBenefitMultiplier(membership.role)
    const socialGain = Math.round(5 * roleMultiplier)
    const intimacyGain = Math.round(5 * roleMultiplier)
    const next: GameState = {
      ...game,
      selected: [...game.selected, 'club'],
      energy: Math.max(0, game.energy - 12),
      stress: Math.min(100, game.stress + 5),
      money: Math.max(0, game.money - 20),
      socialGrowth: game.socialGrowth + socialGain,
      clubMemberships: game.clubMemberships.map((item) =>
        item.orgId === membership.orgId
          ? {
              ...item,
              totalActivities: item.totalActivities + 1,
              semesterActivities: item.semesterActivities + 1,
            }
          : item,
      ),
      clubActivityPlan: {
        mode: 'activity',
        orgId: membership.orgId,
        acceptedIds,
        declinedIds,
        committed: true,
      },
      clubInvites: null,
      relationships: game.relationships.map((relation) =>
        acceptedIds.includes(relation.id)
          ? {
              ...relation,
              intimacy: Math.min(
                100,
                relation.intimacy +
                  adjustIntimacyDelta(game, relation, intimacyGain),
              ),
            }
          : relation,
      ),
    }
    let finalNext = next
    let clubEventNotice: { event: ClubEvent; lines: string[] } | null = null
    if (Math.random() < CLUB_EVENT_CHANCE) {
      const event = pickClubEvent(membership.category)
      const applied = applyClubEvent(finalNext, membership, event)
      finalNext = applied.next
      clubEventNotice = { event, lines: applied.lines }
    }
    if (clubEventNotice) {
      finalNext = pushCampusNotice(
        finalNext,
        clubEventNotice.event.title,
        clubEventNotice.event.text,
      )
    }
    setGame(finalNext)
    persist(finalNext)
    if (clubEventNotice) {
      showResearchNotice({
        kind: 'club',
        title: clubEventNotice.event.title,
        text: clubEventNotice.event.text,
        ruleText:
          clubEventNotice.lines.length > 0
            ? clubEventNotice.lines.join('；')
            : undefined,
        ruleLabel: '事件结果',
      })
    }
  }

  const recordClubProjectPhase = (orgId: string, choiceId: string | null) => {
    const current = gameRef.current ?? game
    if (!current || !current.player) return
    const membership = current.clubMemberships.find(
      (item) => item.orgId === orgId,
    )
    if (!membership) return
    const project = clubProjectForSeason(membership, current.season.id)
    const def = clubProjectDefForProject(project)
    if (!def || !project || project.settled) return
    const phase = currentPhaseFor(project, def, current.week)
    if (!phase) return
    if (project.phaseChoices[phase.index] !== null) return
    const choice = choiceId
      ? phase.stage.choices.find((item) => item.id === choiceId)
      : null
    if (choiceId && !choice) return

    const activityMembership = {
      ...membership,
      totalActivities: membership.totalActivities + 1,
      semesterActivities: membership.semesterActivities + 1,
    }
    let next: GameState = {
      ...current,
      energy: Math.max(0, Math.min(100, current.energy - 5)),
      clubInvites: null,
      clubMemberships: current.clubMemberships.map((item) =>
        item.orgId === orgId ? activityMembership : item,
      ),
    }
    const lines: string[] = ['精力 -5']
    if (choice) {
      const applied = applyClubEvent(next, activityMembership, {
        id: choice.id,
        category:
          membership.category === 'academic' ||
          membership.category === 'interest' ||
          membership.category === 'practice'
            ? membership.category
            : 'interest',
        title: `${def.title} · ${phase.stage.title}`,
        text: phase.stage.description,
        effects: choice.effects,
      })
      next = applied.next
      lines.push(...applied.lines, `贡献 +${choice.contribution}`)
    }

    const updatedProject = {
      ...project,
      phaseChoices: project.phaseChoices.map((item, index) =>
        index === phase.index ? choice?.id ?? '__skip__' : item,
      ),
      contribution: project.contribution + (choice?.contribution ?? 0),
    }
    next = {
      ...next,
      clubMemberships: next.clubMemberships.map((item) =>
        item.orgId === orgId ? { ...item, project: updatedProject } : item,
      ),
    }
    finishWeekSlot(next, 'club')
    showResearchNotice({
      kind: 'club',
      title: `${def.title} · ${phase.stage.title}`,
      text: choice
        ? `${phase.stage.description}\n\n你负责：${choice.description}`
        : '这次例会你只是来听了听，没有接下本周的具体任务。活动仍会按计划推进，你可以在最终活动时去看它办成什么样。',
      ruleText: lines.length > 0 ? lines.join('；') : undefined,
      ruleLabel: '本周例会',
    })
  }

  const recordClubProjectEvent = (
    orgId: string,
    eventIndex: number,
    attend: boolean,
  ) => {
    const current = gameRef.current ?? game
    if (!current || !current.player) return
    const membership = current.clubMemberships.find(
      (item) => item.orgId === orgId,
    )
    if (!membership) return
    const project = clubProjectForSeason(membership, current.season.id)
    const def = clubProjectDefForProject(project)
    if (!def || !project || project.settled) return
    if (current.week !== project.eventWeek) return
    if (current.weekSlot !== project.eventSlots[eventIndex]) return
    if (project.attendance[eventIndex]) return

    const attendance = project.attendance.map((value, index) =>
      index === eventIndex ? attend : value,
    )
    let next: GameState = {
      ...current,
      clubMemberships: current.clubMemberships.map((item) =>
        item.orgId === orgId
          ? {
              ...item,
              project: { ...project, attendance },
            }
          : item,
      ),
    }
    const lastEvent = eventIndex >= project.eventSlots.length - 1
    let result: { title: string; text: string; lines: string[] } | null = null
    if (lastEvent) {
      const outcome = personalOutcomeFor({ ...project, attendance })
      const feedback = def.personalFeedback[outcome]
      const settledProject = {
        ...project,
        attendance,
        settled: true,
        personalOutcome: outcome,
      }
      const settledMembership = {
        ...next.clubMemberships.find((item) => item.orgId === orgId)!,
        project: settledProject,
      }
      const applied = applyClubEvent(next, settledMembership, {
        id: `settle-${def.id}`,
        category: 'interest',
        title: def.worldTitle,
        text: def.worldText,
        effects: feedback.effects,
      })
      next = applied.next
      next = pushCampusNotice(
        next,
        `${def.title} · ${def.worldTitle}`,
        `${def.worldText}\n\n${feedback.text}`,
      )
      result = {
        title: `${def.title} · ${def.worldTitle}`,
        text: `${def.worldText}\n\n${feedback.title}：${feedback.text}`,
        lines: [...projectEffectLine(feedback.effects)],
      }
      next = {
        ...next,
        clubMemberships: next.clubMemberships.map((item) =>
          item.orgId === orgId
            ? { ...item, project: settledProject }
            : item,
        ),
      }
    }
    finishWeekSlot(next, 'club')
    if (result) {
      showResearchNotice({
        kind: 'club',
        title: result.title,
        text: result.text,
        ruleText: result.lines.length > 0 ? result.lines.join('；') : undefined,
        ruleLabel: '活动结算',
      })
    }
  }

  const addComprehensionGrowth = (state: GameState, amount: number): GameState =>
    carryGrowthState({
      ...state,
      comprehensionGrowth: state.comprehensionGrowth + amount,
    })

  const finishDebateRound = (
    next: GameState,
    editionLabel: string,
    roundLabel: string,
    noticeTitle: string,
    noticeText: string,
    lines: string[],
  ) => {
    finishWeekSlot(next, 'club')
    showResearchNotice({
      kind: 'club',
      title: noticeTitle,
      text: noticeText,
      ruleText: lines.length > 0 ? lines.join('；') : undefined,
      ruleLabel: roundLabel,
    })
  }

  const attendDebatePractice = (orgId: string) => {
    const current = gameRef.current ?? game
    if (!current || !current.player) return
    const membership = current.clubMemberships.find((item) => item.orgId === orgId)
    if (!membership || orgId !== DEBATE_ORG_ID) return
    let next: GameState = {
      ...current,
      energy: Math.max(0, current.energy - 5),
      clubMemberships: current.clubMemberships.map((item) =>
        item.orgId === orgId
          ? {
              ...item,
              totalActivities: item.totalActivities + 1,
              semesterActivities: item.semesterActivities + 1,
              contribution: (item.contribution ?? 0) + 1,
            }
          : item,
      ),
    }
    next = addComprehensionGrowth(next, 10)
    finishDebateRound(
      next,
      current.season.seasonLabel,
      '队内模辩',
      '队内模辩',
      '这一周的例会是一场队内模辩。你完成了一次立论和一轮攻防，悟性成长值 +10%。',
      ['精力 -5', '悟性成长 +10%', '活动次数 +1', '组织贡献 +1'],
    )
  }

  const resolveDebateCupRound = (
    roundIndex: number,
    mode: 'play' | 'watch' | 'skip',
  ) => {
    const current = gameRef.current ?? game
    if (!current || !current.player) return
    const edition = debateEditionForState(current)
    if (!edition) return
    const membership = debateMember(current)
    const isMember = Boolean(membership)
    if (isMember && mode === 'watch') return
    if (!isMember && mode === 'play') return
    const record =
      debateCupRecordFor(current, edition.id) ?? createDebateCupRecord(edition)
    const appearances = [...record.appearances]
    const watched = [...record.watched]
    let next: GameState = { ...current }
    const lines: string[] = []
    if (isMember && mode === 'play' && roundIndex >= 0 && roundIndex < 3) {
      appearances[roundIndex] = true
      lines.push('比赛出场', '悟性成长 +10%', '活动次数 +1', '组织贡献 +5', '综测 +1')
      next = addComprehensionGrowth(next, 10)
      next = {
        ...next,
        composite: next.composite + 1,
        clubMemberships: next.clubMemberships.map((item) =>
          item.orgId === DEBATE_ORG_ID
            ? {
                ...item,
                totalActivities: item.totalActivities + 1,
                semesterActivities: item.semesterActivities + 1,
                contribution: (item.contribution ?? 0) + 5,
              }
            : item,
        ),
      }
    } else if (!isMember && mode === 'watch' && roundIndex >= 0 && roundIndex < 3) {
      watched[roundIndex] = true
      lines.push('观赛', '悟性成长 +20%', '压力 -5', '综测 +1')
      next = addComprehensionGrowth(next, 20)
      next = {
        ...next,
        stress: Math.max(0, next.stress - 5),
        composite: next.composite + 1,
      }
    }

    let playerBest = record.playerBestDebater
    let honors = next.debateHonors
    let noticeTitle = `永昰杯 · ${record.label} · ${['小组赛', '预决赛', '总决赛'][roundIndex]}`
    let noticeText = isMember
      ? mode === 'play'
        ? '你作为医学院辩论队成员出场。队伍赢下了这一轮。'
        : '你没有出场，在台下看完了这一轮。医学院辩论队照常获胜。'
      : mode === 'watch'
        ? '你坐在观众席看完了这一轮。医学院辩论队赢下了比赛。'
        : '你没有去观赛。'
    if (record.teamChampion) {
      // Team outcome is fixed independently of player participation.
      noticeText += ''
    }

    if (roundIndex === 2) {
      const appearedAny = appearances.some(Boolean)
      playerBest =
        isMember &&
        appearances[2] &&
        record.teamBestDebater &&
        Math.random() < bestDebaterChance(current.player.attrs.comprehension)
      const newHonors: typeof honors = [...honors]
      if (isMember && appearedAny) {
        const teamKind = record.teamChampion ? 'champion' : 'runner-up'
        const teamLabel = record.teamChampion
          ? `永昰杯 · ${record.label}冠军`
          : `永昰杯 · ${record.label}亚军`
        const teamHonorId = `${edition.id}-${teamKind}`
        if (!newHonors.some((item) => item.id === teamHonorId)) {
          newHonors.push({
            id: teamHonorId,
            editionLabel: record.label,
            kind: teamKind,
            label: teamLabel,
          })
        }
        next = {
          ...next,
          composite: next.composite + (record.teamChampion ? 8 : 5),
          clubMemberships: next.clubMemberships.map((item) =>
            item.orgId === DEBATE_ORG_ID
              ? {
                  ...item,
                  contribution: (item.contribution ?? 0) + (record.teamChampion ? 8 : 5),
                }
              : item,
          ),
        }
        lines.push(record.teamChampion ? '冠军 · 综测 +8 · 组织贡献 +8' : '亚军 · 综测 +5 · 组织贡献 +5')
      }
      if (playerBest) {
        const bestId = `${edition.id}-best-debater`
        if (!newHonors.some((item) => item.id === bestId)) {
          newHonors.push({
            id: bestId,
            editionLabel: record.label,
            kind: 'best-debater',
            label: `永昰杯 · ${record.label}最佳辩手`,
          })
        }
        next = {
          ...next,
          composite: next.composite + 4,
          clubMemberships: next.clubMemberships.map((item) =>
            item.orgId === DEBATE_ORG_ID
              ? { ...item, contribution: (item.contribution ?? 0) + 4 }
              : item,
          ),
        }
        lines.push('最佳辩手 · 综测 +4 · 组织贡献 +4')
      }
      honors = newHonors
      noticeTitle = `永昰杯 · ${record.label}结算`
      noticeText = `医学院辩论队获得${record.teamChampion ? '冠军' : '亚军'}。${
        record.teamBestDebater
          ? playerBest
            ? '最佳辩手也落在了你身上。'
            : '队伍拿到了最佳辩手，但这次不是你。'
          : '这次没有拿到最佳辩手。'
      }`
    }

    const updatedRecord = {
      ...record,
      appearances,
      watched,
      playerBestDebater: playerBest,
      settled: roundIndex === 2 ? true : record.settled,
    }
    next = {
      ...next,
      debateHonors: honors,
      debateCups: [
        ...next.debateCups.filter((item) => item.editionId !== edition.id),
        updatedRecord,
      ],
    }
    finishDebateRound(next, edition.label, lines[0] ?? '赛事', noticeTitle, noticeText, lines)
  }

  const treatHealth = (treatment: import('./types').HealthTreatment) => {
    const current = gameRef.current ?? game
    if (!current) return
    const next = applyHealthTreatment(current, treatment)
    gameRef.current = next
    setGame(next)
    persist(next)
  }

  const arrangeDinner = (
    acceptedIds: string[],
    declinedIds: string[],
    cost: number,
  ) => {
    if (
      !game ||
      game.selected.length >= 2 ||
      acceptedIds.length === 0 ||
      cost >game.money
    ) {
      return
    }
    const plans = dinnerPlansThisWeek(game)
    if (plans.length >= DINNER_WEEKLY_LIMIT) return
    const summary = acceptedIds
      .map((id) => game.relationships.find((relation) => relation.id === id)?.name)
      .filter(Boolean) as string[]
    const attendedIds = new Set(plans.flatMap((plan) => plan.acceptedIds))
    const firstTimerIds = acceptedIds.filter((id) => !attendedIds.has(id))
    const plan = {
      acceptedIds,
      declinedIds,
      cost,
      summary,
      committed: true,
      weekKey: currentWeekKey(game),
      weekSlot: game.weekSlot,
      firstTimerIds,
    }
    const next: GameState = {
      ...game,
      selected: game.selected.includes('social')
        ? game.selected
        : [...game.selected, 'social'],
      energy: Math.min(100, game.energy + 8),
      stress: Math.max(0, game.stress - 8),
      money: game.money - cost,
      dinnerPlan: plan,
      dinnerPlans: [...plans, plan],
      careerStats: bumpCareerStats(game.careerStats, 'dinner'),
      dinnerInvites: null,
      relationships: game.relationships.map((relation) =>
        firstTimerIds.includes(relation.id)
          ? revealMaybe({
              ...relation,
              intimacy: Math.min(100, relation.intimacy + 3),
            })
          : relation,
      ),
    }
    commitTaState(next, game)
  }

  const patOutcome = (
    current: GameState,
    relation: Relationship,
  ): {
    next: GameState
    message: string
    events: PatEvent[]
    publication?: { journal: string }
  } => {
    const updatedRelation = patRelationship(relation, current)
    if (updatedRelation.lastPatKey === relation.lastPatKey) {
      return {
        next: current,
        message: `${relation.name}本周已经拍过了。`,
        events: [],
      }
    }
    const actualPatGain = updatedRelation.intimacy - relation.intimacy
    const messages = [
      `你拍了拍${relation.name}，亲密度 ${
        actualPatGain >= 0 ? '+' : ''
      }${actualPatGain}。`,
    ]
    if (
      isPeerFriend(relation) &&
      relation.intimacy < 60 &&
      closeFriendCount(current) >= 5
    ) {
      messages.push('交心朋友已经满 5 人，TA 的亲密度最高停在 59。')
    }
    let next: GameState = {
      ...current,
      relationships: current.relationships.map((item) =>
        item.id === relation.id ? updatedRelation : item,
      ),
    }
    const events: PatEvent[] = []

    if (relation.kind === 'mentor') {
      if (
        Math.random() < 0.25 &&
        current.researchStarted &&
        !current.researchPublished
      ) {
        const progress = Math.min(100, current.researchProgress + 2)
        messages.push('导师顺手提点了你的课题，科研进度 +2。')
        events.push({
          id: `${relation.id}-research`,
          name: relation.name,
          title: '导师的指点',
          text: `${relation.name}顺手在你的论文草稿上圈了两处，说：“这里再补一组数据，就能讲故事了。”`,
          lines: ['科研进度 +2'],
        })
        next = { ...next, researchProgress: progress }
        if (progress >= 100) {
          const profile = current.mentorProfileId
            ? MENTOR_BY_ID[current.mentorProfileId]
            : null
          const journal =
            profile && profile.journals.length > 0
              ? profile.journals[
                  Math.floor(Math.random() * profile.journals.length)
                ]
              : '待定期刊'
          next = {
            ...next,
            researchPublished: true,
            researchJournal: journal,
            publishedPapers: (current.publishedPapers ?? 0) + 1,
            awaitingNextProject: true,
          }
          return {
            next,
            message: messages.join(' '),
            events,
            publication: { journal },
          }
        }
      }
    } else if (relation.kind === 'counselor') {
      if (Math.random() < 0.25) {
        next = { ...next, stress: Math.max(0, next.stress - 5) }
        messages.push('辅导员找你谈心，压力 -5。')
        events.push({
          id: `${relation.id}-counselor`,
          name: relation.name,
          title: '辅导员的关心',
          text: `${relation.name}看出你最近状态不太对，拉你聊了几句，没有问成绩，只问你昨晚睡得怎么样。`,
          lines: ['压力 -5'],
        })
      }
    } else {
      const onVacation =
        current.screen === 'vacation' || Boolean(current.vacation)
      // Course-note handouts assume an active semester and are unavailable
      // while the player is on vacation.
      if (!onVacation && Math.random() < 0.2) {
        const courses = current.season.courses
        if (courses.length > 0) {
          const course = courses[Math.floor(Math.random() * courses.length)]
          next = {
            ...next,
            prep: {
              ...next.prep,
              [course.id]: Math.min(100, (next.prep[course.id] ?? 0) + 3),
            },
          }
          messages.push(`TA把《${course.name}》的笔记借给你看，准备度 +3。`)
          events.push({
            id: `${relation.id}-notes`,
            name: relation.name,
            title: '借你笔记',
            text: `${relation.name}把《${course.name}》的笔记推到你面前：“重点我都标了，别客气。”`,
            lines: [`《${course.name}》准备度 +3`],
          })
        }
      }
      if (Math.random() < 0.1) {
        next = {
          ...next,
          stress: Math.max(0, next.stress - 5),
          energy: Math.min(100, next.energy + 5),
        }
        messages.push('TA请你喝奶茶/吃饭，压力 -5，精力 +5。')
        events.push({
          id: `${relation.id}-treat`,
          name: relation.name,
          title: '请你喝奶茶',
          text: `${relation.name}顺手给你带了一杯奶茶，说：“看你最近脸都绿了，补充点糖分。”`,
          lines: ['压力 -5', '精力 +5'],
        })
      }
    }

    return { next, message: messages.join(' '), events }
  }

  const autoPatTopRelations = (mode: 'close' | 'longtime'): PatResult => {
    if (!game) return { message: '现在还不能拍。', events: [] }
    const remaining = patRemainingThisWeek(game)
    if (remaining <= 0) return { message: '本周的拍一拍次数已经用完了。', events: [] }
    const targets = game.relationships
      .filter((relation) => canPat(game, relation))
      .sort((a, b) =>
        mode === 'close'
          ? b.intimacy - a.intimacy || a.id.localeCompare(b.id)
          : a.lastPatAbsWeek - b.lastPatAbsWeek ||
            b.intimacy - a.intimacy ||
            a.id.localeCompare(b.id),
      )
      .slice(0, remaining)
    if (targets.length === 0) return { message: '本周还没有可以拍的人。', events: [] }
    let next = game
    const messages: string[] = []
    const events: PatEvent[] = []
    let publication: { journal: string } | undefined
    for (const target of targets) {
      const relation = next.relationships.find((item) => item.id === target.id)
      if (!relation) continue
      const outcome = patOutcome(next, relation)
      next = outcome.next
      messages.push(outcome.message)
      events.push(...outcome.events)
      if (outcome.publication) publication = outcome.publication
    }
    commitTaState(next, game)
    if (publication) {
      openPublicationNotice(
        publication.journal,
        pickPublicationAcceptanceText(),
      )
    }
    return {
      message: `${
        mode === 'close'
          ? '你把这一周的拍一拍留给了最亲近的人：'
          : '你去问候了几位许久未见的朋友：'
      }${targets.map((relation) => relation.name).join('、')}。${messages.join(' ')}`,
      events,
    }
  }

  const patRelation = (id: string): PatResult => {
    if (!game || patRemainingThisWeek(game) <= 0) return { message: '本周的拍一拍次数已经用完了。', events: [] }
    const relation = game.relationships.find((item) => item.id === id)
    if (!relation) return { message: '你找不到这个人。', events: [] }
    const outcome = patOutcome(game, relation)
    commitTaState(outcome.next, game)
    if (outcome.publication) {
      openPublicationNotice(
        outcome.publication.journal,
        pickPublicationAcceptanceText(),
      )
    }
    return { message: outcome.message, events: outcome.events }
  }

  const confessRelation = (id: string): ConfessionResult => {
    if (!game || !game.player) {
      return { success: false, name: '', text: '现在还不是时候。' }
    }
    const relation = game.relationships.find((item) => item.id === id)
    if (!relation) {
      return { success: false, name: '', text: '你找不到这个人。' }
    }
    if (relation.partner || relation.bondType) {
      return {
        success: false,
        name: relation.name,
        text: '你们之间已经建立了羁绊。',
      }
    }
    if (relation.confessRejected) {
      return {
        success: false,
        name: relation.name,
        text: '你已经向 TA 表白过了。TA 的答案没有改变。',
      }
    }
    if (!canConfess(game.player, relation)) {
      return {
        success: false,
        name: relation.name,
        text: `你和${relation.name}还没有熟到可以表白。再拍一拍，或者一起经历点什么。`,
      }
    }
    const chance = confessionChance(game.player, relation)
    const success = Math.random() < chance
    const text = pickConfessionText(success)
    const gain = Math.min(
      5,
      Math.max(0, adjustIntimacyDelta(game, relation, 5, { major: true })),
    )
    const updated = success
      ? {
          ...relation,
          partner: true,
          bondType: 'lover' as const,
          intimacy: Math.max(60, Math.min(100, relation.intimacy + gain)),
          bondFiveYearDone: false,
          partnerSinceSeasonIndex: game.seasonIndex,
          partnerSinceWeek: game.week,
          partnerSinceLabel: game.season.seasonLabel,
          confessRejected: false,
          ex: false,
          exWeek: 0,
          exPenalty: false,
          breakupRisk: 0,
        }
      : {
          ...relation,
          confessRejected: true,
          intimacyFrozenSeason: game.season.id,
          frozenIntimacy: relation.intimacy,
        }
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((item) =>
        item.id === id ? updated : item,
      ),
      romanceUnlocked: game.romanceUnlocked || success,
    }
    commitTaState(next, game)
    return { success, name: relation.name, text, bondType: 'lover' }
  }

  const breakBond = (id: string): BondActionResult => {
    if (!game || !game.player) {
      return { success: false, type: 'lover', name: '', text: '现在还不能解除羁绊。' }
    }
    const relation = game.relationships.find((item) => item.id === id)
    if (!relation) {
      return { success: false, type: 'lover', name: '', text: '你找不到这个人。' }
    }
    const type =
      relation.bondType ?? (relation.partner ? 'lover' : undefined)
    if (!type) {
      return {
        success: false,
        type: 'lover',
        name: relation.name,
        text: '你们之间没有可以解除的羁绊。',
      }
    }
    if (relation.brokenBondType) {
      return {
        success: false,
        type,
        name: relation.name,
        text: '你们已经在冷静期里了。',
      }
    }
    const now = progressWeek(game)
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((item) =>
        item.id === relation.id
          ? clearBondNickname({
              ...item,
              bondType: undefined,
              partner: false,
              brokenBondType: type,
              bondBreakWeek: now,
              bondCalmUntilWeek: now + 2,
              bondReconcileAttempted: false,
              intimacyFrozenUntilWeek: now + 2,
              frozenIntimacy: item.intimacy,
            })
          : item,
      ),
    }
    commitTaState(next, game)
    return {
      success: true,
      type,
      name: relation.name,
      text: pickBondReaction(type, 'break'),
    }
  }

  const reconcileBond = (id: string): BondActionResult => {
    if (!game || !game.player) {
      return { success: false, type: 'lover', name: '', text: '现在还不能复合。' }
    }
    const relation = game.relationships.find((item) => item.id === id)
    if (!relation || !relation.brokenBondType) {
      return {
        success: false,
        type: 'lover',
        name: relation?.name ?? '',
        text: '你们现在没有处于冷静期的羁绊。',
      }
    }
    const type = relation.brokenBondType
    const now = progressWeek(game)
    if (
      typeof relation.bondCalmUntilWeek !== 'number' ||
      now > relation.bondCalmUntilWeek
    ) {
      return {
        success: false,
        type,
        name: relation.name,
        text: '冷静期已经结束。',
      }
    }
    if (relation.bondReconcileAttempted) {
      return {
        success: false,
        type,
        name: relation.name,
        text: '这个冷静期里已经尝试过复合了。',
      }
    }
    const calmWeek = Math.max(
      1,
      Math.min(3, now - (relation.bondBreakWeek ?? now) + 1),
    )
    const penalty = [20, 40, 60][calmWeek - 1] ?? 60
    const attrs = Object.values(game.player.attrs)
    const average = attrs.reduce((sum, value) => sum + value, 0) / attrs.length
    const chance = Math.max(
      0,
      Math.min(100, Math.round(relation.intimacy * 0.7 + average * 4 - penalty)),
    )
    const success = Math.random() * 100 < chance
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((item) =>
        item.id === relation.id
          ? success
            ? {
                ...item,
                bondType: type,
                partner: type === 'lover',
                brokenBondType: undefined,
                bondBreakWeek: undefined,
                bondCalmUntilWeek: undefined,
                bondReconcileAttempted: false,
                intimacyFrozenUntilWeek: undefined,
                frozenIntimacy: undefined,
              }
            : { ...item, bondReconcileAttempted: true }
          : item,
      ),
    }
    commitTaState(next, game)
    return {
      success,
      type,
      name: relation.name,
      text: pickBondReaction(type, success ? 'success' : 'fail'),
      chance,
    }
  }

  const contactLover = (id: string): LoverContactResult => {
    if (!game || !game.player) {
      return {
        answered: false,
        name: '',
        title: '暂时联系不上',
        text: '现在还不是联系 TA 的时候。',
        lines: [],
      }
    }
    const relation = game.relationships.find((item) => item.id === id)
    if (!relation || !relation.partner) {
      return {
        answered: false,
        name: relation?.name ?? '',
        title: '没有接通',
        text: '你还没有和这个人成为恋人。',
        lines: [],
      }
    }
    if (relation.lastContactKey === currentWeekKey(game)) {
      return {
        answered: false,
        name: relation.name,
        title: '本周已经联系过了',
        text: '电话已经打过了，这一周先让彼此过自己的生活。',
        lines: [],
      }
    }
    const chance = Math.max(
      0.15,
      Math.min(
        0.92,
        0.25 +
          relation.intimacy / 250 +
          game.player.attrs.appearance * 0.02 +
          game.player.attrs.social * 0.02,
      ),
    )
    const answered = Math.random() < chance
    if (!answered) {
      const stress = Math.min(5, 3)
      const next: GameState = {
        ...game,
        stress: Math.min(100, game.stress + stress),
        relationships: game.relationships.map((item) =>
          item.id === relation.id
            ? { ...item, lastContactKey: currentWeekKey(game) }
            : item,
        ),
      }
      setGame(next)
      persist(next)
      return {
        answered: false,
        name: relation.name,
        title: '电话没有接通',
        text: `电话响了很久，最后转进了语音信箱。你盯着屏幕看了一会儿，把想说的话又咽了回去。`,
        lines: [`压力 +${stress}`],
      }
    }
    const event = pickLoverEvent(game.stress, game.money)
    const moneyCost = Math.min(game.money, event.money ?? 0)
    const rawIntimacy = Math.max(0, event.intimacy ?? 0)
    const intimacyGain = Math.min(
      5,
      Math.max(0, adjustIntimacyDelta(game, relation, rawIntimacy)),
    )
    const stressCap = event.kind === 'support' ? 10 : 5
    const stressRelief = Math.min(
      stressCap,
      Math.abs(Math.min(0, event.stress ?? 0)),
    )
    const energyGain = Math.min(5, Math.max(0, event.energy ?? 0))
    const updated = {
      ...relation,
      intimacy: Math.min(100, relation.intimacy + intimacyGain),
    }
    const next: GameState = {
      ...game,
      money: Math.max(0, game.money - moneyCost),
      stress: Math.max(0, game.stress - stressRelief),
      energy: Math.min(100, game.energy + energyGain),
      relationships: game.relationships.map((item) =>
        item.id === relation.id
          ? { ...updated, lastContactKey: currentWeekKey(game) }
          : item,
      ),
    }
    commitTaState(next, game)
    const lines: string[] = []
    if (moneyCost > 0) lines.push(`生活费 -${moneyCost}`)
    if (intimacyGain > 0) lines.push(`亲密度 +${intimacyGain}`)
    if (stressRelief > 0) lines.push(`压力 -${stressRelief}`)
    if (energyGain > 0) lines.push(`精力 +${energyGain}`)
    return {
      answered: true,
      name: relation.name,
      title: event.title,
      text: event.text,
      lines,
    }
  }

  const establishFriendBond = (
    id: string,
    type: 'brother' | 'sister',
  ): ConfessionResult => {
    if (!game || !game.player) {
      return { success: false, name: '', text: '现在还不能建立羁绊。' }
    }
    const relation = game.relationships.find((item) => item.id === id)
    if (!relation) {
      return { success: false, name: '', text: '你找不到这个人。' }
    }
    if (relation.intimacy < 59) {
      return {
        success: false,
        name: relation.name,
        text: '你们的亲密度还不足以建立这段羁绊。',
      }
    }
    if (relation.partner || relation.bondType) {
      return {
        success: false,
        name: relation.name,
        text: '你们之间已经建立了羁绊。',
      }
    }
    const sameGender =
      type === 'brother'
        ? game.player.gender === '男' && relation.gender === '男'
        : game.player.gender === '女' && relation.gender === '女'
    if (!sameGender) {
      return {
        success: false,
        name: relation.name,
        text: '你们不符合这条羁绊的建立条件。',
      }
    }
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((item) =>
        item.id === relation.id
          ? {
              ...item,
              bondType: type,
              partner: false,
              intimacy: Math.max(60, relation.intimacy),
              bondFiveYearDone: false,
              partnerSinceSeasonIndex: game.seasonIndex,
              partnerSinceWeek: game.week,
              partnerSinceLabel: game.season.seasonLabel,
            }
          : item,
      ),
    }
    commitTaState(next, game)
    return {
      success: true,
      name: relation.name,
      text: type === 'brother' ? BROTHER_BOND_TEXT : SISTER_BOND_TEXT,
      bondType: type,
    }
  }

  const openBondChat = (relationshipId: string) => {
    setChatFocus({
      relationshipId,
      token: Date.now(),
      promptNickname: true,
    })
    setView('week')
  }

  const changeBondNickname = (relationshipId: string, nickname: string) => {
    const latest = gameRef.current ?? game
    if (!latest) return
    const clean = nickname.trim().slice(0, 12)
    if (!clean) return
    const next: GameState = {
      ...latest,
      relationships: latest.relationships.map((relation) =>
        relation.id === relationshipId
          ? {
              ...applyBondNickname(relation, clean),
              bondNicknameAnnouncement: `我要叫你 ${clean}！`,
              bondNicknameAnnouncementAt: {
                seasonIndex: latest.seasonIndex,
                week: latest.week,
                weekSlot: latest.weekSlot,
                atMs: Date.now(),
              },
            }
          : relation,
      ),
      soloInvites: latest.soloInvites.map((invite) =>
        invite.relationshipId === relationshipId
          ? { ...invite, partnerName: clean }
          : invite,
      ),
      soloChatRecords: latest.soloChatRecords.map((record) =>
        record.relationshipId === relationshipId
          ? { ...record, partnerName: clean }
          : record,
      ),
    }
    // 昵称属于羁绊操作，不能覆盖当前周次/时间段。
    commitTaState(next, latest)
  }

  const changeBondNicknameDisplay = (
    relationshipId: string,
    enabled: boolean,
  ) => {
    const latest = gameRef.current ?? game
    if (!latest) return
    const renamed = latest.relationships.find(
      (relation) => relation.id === relationshipId,
    )
    const visibleName = renamed
      ? setBondNicknameDisplay(renamed, enabled).name
      : null
    const next: GameState = {
      ...latest,
      relationships: latest.relationships.map((relation) =>
        relation.id === relationshipId
          ? setBondNicknameDisplay(relation, enabled)
          : relation,
      ),
      soloInvites: visibleName
        ? latest.soloInvites.map((invite) =>
            invite.relationshipId === relationshipId
              ? { ...invite, partnerName: visibleName }
              : invite,
          )
        : latest.soloInvites,
      soloChatRecords: visibleName
        ? latest.soloChatRecords.map((record) =>
            record.relationshipId === relationshipId
              ? { ...record, partnerName: visibleName }
              : record,
          )
        : latest.soloChatRecords,
    }
    commitTaState(next, latest)
  }

  const askBondGossip = (relationshipId: string) => {
    if (!game) return
    if (game.gossipAsked?.[relationshipId] === currentWeekKey(game)) return
    const result = askGossip(game, relationshipId)
    commitTaState(result.state, game)
  }

  const followBondGossipClue = (partnerId: string, relationId: string) => {
    if (!game) return
    const result = attemptNpcClueByChat(game, partnerId, relationId)
    if (!result) return
    commitTaState(result.state, gameRef.current ?? game)
  }

  const investigateNpcClue = (relationId: string) => {
    if (!game) return null
    const result = attemptNpcClueByInvestigation(game, relationId)
    if (!result) return null
    setGame(result.state)
    persist(result.state)
    return {
      success: result.success,
      chance: result.chance,
      message: result.message,
      name: result.name,
      attemptedThisWeek: result.attemptedThisWeek,
    }
  }

  const withdrawElective = (courseId: string) => {
    if (!game || game.week !== 1) return
    const target = game.season.courses.find(
      (course) => course.id === courseId && course.electiveType,
    )
    if (!target) return
    const next: GameState = {
      ...game,
      season: {
        ...game.season,
        courses: game.season.courses.filter((course) => course.id !== courseId),
      },
      electiveHistory: game.electiveHistory.filter((id) => id !== courseId),
    }
    setGame(next)
    persist(next)
  }

  const abandonElective = (courseId: string) => {
    if (!game) return
    const target = game.results.find((result) => result.course.id === courseId)
    if (!target || !target.course.electiveType) return
    if (
      target.course.electiveType === 'group' ||
      target.course.electiveType === 'politics' ||
      target.score >= 60
    ) {
      return
    }
    const next: GameState = {
      ...game,
      results: game.results.filter((result) => result.course.id !== courseId),
      season: {
        ...game.season,
        courses: game.season.courses.filter((course) => course.id !== courseId),
      },
      electiveHistory: game.electiveHistory.filter((id) => id !== courseId),
    }
    setGame(next)
    persist(next)
  }

  const chooseWeekFocus = (focus: string, addLibrary = false) => {
    if (!game) return
    const selected =
      addLibrary &&
      game.selected.length < 2 &&
      !game.selected.includes('library')
        ? [...game.selected, 'library']
        : game.selected
    const next = { ...game, weekFocus: focus, selected }
    setGame(next)
    persist(next)
  }

  const toggleAction = (id: string) => {
    if (!game) return
    if (id === 'social' && game.dinnerPlan?.committed) return
    const next = toggleSelected(
      game,
      id,
      id === 'library' || id === 'research',
    )
    setGame(id === 'social' ? { ...next, dinnerPlan: null } : next)
    if (id === 'social') persist({ ...next, dinnerPlan: null })
  }

  const toggleVacationAction = (id: string) => {
    if (!game) return
    setGame(toggleSelected(game, id, false))
  }

  const endWeek = (baseArg: GameState | null = null) => {
    const base = baseArg ?? game
    if (!base || !base.plan || !base.player) return
    const slotMode = Boolean(baseArg)
    if (!slotMode && base.selected.length !== 2) return
    const player = base.player
    if (!player) return

    const sim = simulateWeek(
      slotMode ? { ...base, selected: [] } : base,
      slotMode ? base.weekSlotActions : [],
    )
    const grown = growAttributes(
      sim.attrs,
      sim.constitutionGrowth,
      sim.appearanceGrowth,
      sim.socialGrowth,
      sim.comprehensionGrowth,
      sim.english,
      sim.englishGrowth,
    )
    const healthMult = healthPrepMultiplier(base)
    if (healthMult < 1) {
      sim.prep = Object.fromEntries(
        Object.entries(sim.prep).map(([id, value]) => [
          id,
          (base.prep[id] ?? 0) + (value - (base.prep[id] ?? 0)) * healthMult,
        ]),
      )
    }
    sim.energy = Math.max(0, sim.energy - healthEnergyPenalty(base))
    sim.stress = Math.min(100, sim.stress + healthStressPenalty(base))
    const prepTotal = Object.values(sim.prep).reduce((sum, value) => sum + value, 0)
    const log = buildWeekLog(base, {
      energy: sim.energy,
      stress: sim.stress,
      money: sim.money,
      prep: prepTotal,
      studyCount: sim.studyCount,
      habitApplied: sim.habitApplied,
    })

    const researchProgress = clamp(
      base.researchProgress + sim.researchProgressGain,
      0,
      100,
    )
    const publishedNow = researchProgress >= 100 && !base.researchPublished
    const mentorProfile = base.mentorProfileId
      ? MENTOR_BY_ID[base.mentorProfileId]
      : null
    const publishedJournal =
      publishedNow && mentorProfile && mentorProfile.journals.length > 0
        ? mentorProfile.journals[
            Math.floor(Math.random() * mentorProfile.journals.length)
          ]
        : base.researchJournal

    const shouldPrepare = base.week >= 3
    const isCetEvent =
      (base.season.seasonLabel.endsWith('夏') || base.season.seasonLabel.endsWith('冬')) &&
      base.seasonIndex !== 19 &&
      base.week === 2 &&
      !base.cetEventDone
    const dinnerAccepted = base.dinnerPlan?.committed
      ? []
      : base.dinnerPlan?.acceptedIds ?? []
    const dinnerIntimacyGain =
      dinnerAccepted.length > 0
        ? Math.max(1, Math.floor(6 / dinnerAccepted.length))
        : 0
    const relationshipsWithBirthdayMisses = applyMissedBirthdayPenalties({
      ...base,
      relationships: applyFriendContactDecay(
      {
        ...base,
        relationships: base.relationships.map((relation) => {
          let updated = relation
          if (relation.kind === 'roommate') {
            updated = {
              ...updated,
              weeklyAction: nextRoommateAction(),
              intimacy: Math.min(
                100,
                updated.intimacy + adjustIntimacyDelta(base, relation, 3),
              ),
            }
          }
          if (dinnerAccepted.includes(relation.id)) {
            updated = revealMaybe({
              ...updated,
              intimacy: Math.min(
                100,
                updated.intimacy +
                  adjustIntimacyDelta(base, relation, dinnerIntimacyGain),
              ),
            })
          }
          return updated
        }),
      },
      progressWeek(base),
      ),
    })
    const relationships = relationshipsWithBirthdayMisses
    const next: GameState = {
      ...base,
      screen: isCetEvent ? 'cetEvent' : shouldPrepare ? 'prep' : 'week',
      relationships,
      dinnerPlan: null,
      dinnerPlans: [],
      careerStats: bumpCareerMonths(base.careerStats, 'weeks'),
      dinnerInvites: null,
      clubActivityPlan: null,
      clubInvites: null,
      player: { ...player, attrs: grown.attrs },
      week: shouldPrepare ? 4 : base.week + 1,
      energy: sim.energy,
      stress: sim.stress,
      money: sim.money,
      english: grown.english,
      englishGrowth: grown.englishGrowth,
      composite: sim.composite,
      research: sim.research,
      prep: sim.prep,
      kaoyanPrep: sim.kaoyanPrep,
      constitutionGrowth: grown.constitutionGrowth,
      appearanceGrowth: grown.appearanceGrowth,
      socialGrowth: grown.socialGrowth,
      familyAffection: Math.min(
        100,
        base.familyAffection + sim.familyAffectionGain,
      ),
      mentorRecognition: base.mentorRecognition + sim.mentorRecognitionGain,
      researchProgress,
      researchPreparation: base.labEntered
        ? 100
        : Math.min(100, base.researchPreparation + sim.researchPreparationGain),
      experimentPreparation: Math.min(
        100,
        base.experimentPreparation + sim.experimentPreparationGain,
      ),
      researchPublished: base.researchPublished || publishedNow,
      researchJournal: publishedJournal,
      publishedPapers:
        base.publishedPapers + (publishedNow ? 1 : 0),
      awaitingNextProject:
        base.awaitingNextProject || publishedNow,
      lastResearchWeek:
        base.researchStarted &&
        (slotMode ? base.weekSlotActions : base.selected).includes('research')
          ? absoluteWeek(base)
          : base.lastResearchWeek,
      weekFocus: null,
      selected: [],
      actionsUsed: 0,
      weekSlot: 0,
      weekSlotSkipped: false,
      weekSlotActions: [],
      logs: [...base.logs, log],
    }

    const clubBenefit = applyClubSemesterBenefit(next, base)
    const finalNext = advanceHealthForNewWeek(
      applyConsumptionWeekStart(applyWeeklyOpeningTalent(clubBenefit.next)),
      base.selected,
    )
    const cappedFinalNext = {
      ...finalNext,
      energy: Math.min(finalNext.energy, healthEnergyCap(finalNext)),
      literatureStudyWeekKey: currentWeekKey(finalNext),
      literatureStudyCount: 0,
    }
    commit(
      cappedFinalNext,
      isCetEvent ? 'cetEvent' : shouldPrepare ? 'prep' : 'week',
    )
    if (clubBenefit.notice) {
      showResearchNotice({
        kind: 'club',
        title: clubBenefit.notice.title,
        text: clubBenefit.notice.text,
        ruleText: clubBenefit.notice.lines.join('；'),
        ruleLabel: '组织收益',
      })
    }
    if (publishedNow) {
      openPublicationNotice(
        publishedJournal ?? '待定期刊',
        pickPublicationAcceptanceText(),
      )
    }
  }

  const applySlotAction = (base: GameState, actionId: string): GameState => {
    if (!base.player) return base
    const action = ACTION_BY_ID[actionId]
    if (!action) return base
    const player = base.player
    let energy = base.energy
    let stress = base.stress
    let money = base.money
    let english = base.english
    let englishGrowth = base.englishGrowth
    let composite = base.composite
    let research = base.research
    let kaoyanPrep = base.kaoyanPrep
    let constitutionGrowth = base.constitutionGrowth
    let appearanceGrowth = base.appearanceGrowth
    let socialGrowth = base.socialGrowth
    let prep = { ...base.prep }
    let researchProgress = base.researchProgress
    let experimentPreparation = base.experimentPreparation
    const sportGainsHalved =
      action.id === 'sport' && (base.habits ?? []).includes('fitness')

    if (action.id === 'research' && !base.labEntered) {
      const weekKey = currentWeekKey(base)
      return {
        ...base,
        energy: clamp(
          base.energy - literatureEnergyCost(player.attrs.comprehension),
          0,
          100,
        ),
        researchPreparation: Math.min(100, base.researchPreparation + 5),
        literatureStudyWeekKey: weekKey,
        literatureStudyCount:
          base.literatureStudyWeekKey === weekKey
            ? base.literatureStudyCount + 1
            : 1,
      }
    }

    if (action.id === 'library') {
      const costs = libraryCosts(base)
      energy += costs.energy
      stress += costs.stress
      const timeBonus = base.habits.includes('timeManagement') ? 0.1 : 0
      const nominal = Object.fromEntries(
        base.season.courses.map((course) => [
          course.id,
          1 *
            courseK(course, player.attrs) *
            consumptionLibraryMultiplier(base) *
            (1 + timeBonus) *
            prepGainMultiplier(base) *
            coursePrepTalentMultiplier(base, course) *
            (base.energy < 40 ? 0.5 : 1),
        ]),
      )
      const allocated = focusAdjustedGains(
        nominal,
        base.weekFocus,
        base.season.courses,
      )
      for (const course of base.season.courses) {
        prep[course.id] = clamp(
          (prep[course.id] ?? 0) + (allocated[course.id] ?? 0),
          0,
          100,
        )
      }
    } else if (action.id === 'research') {
      if (base.labEntered && !base.researchStarted) {
        energy -= 10
        stress += 3
        experimentPreparation = Math.min(100, base.experimentPreparation + 10)
      } else if (base.labEntered && !base.researchPublished) {
        energy += effectiveEnergyCost(action.energy, base.energy)
        stress += action.stress
        const gain = researchGainForComprehension(player.attrs.comprehension)
        research += gain
        researchProgress = clamp(researchProgress + gain, 0, 100)
      }
    } else if (action.id === 'electiveHomework') {
      energy += effectiveEnergyCost(action.energy, base.energy)
      stress += action.stress
      for (const course of base.season.courses) {
        if (!course.electiveType) continue
        const gain = course.electiveType === 'politics' ? 8 : 10
        prep[course.id] = clamp((prep[course.id] ?? 0) + gain, 0, 100)
      }
    } else if (action.id === 'social') {
      energy += 8
      stress -= 15
      money -= 50
    } else if (action.id === 'club') {
      energy += effectiveEnergyCost(action.energy, base.energy)
      stress += action.stress
      money += action.money
      socialGrowth += 5
    } else {
      energy += effectiveEnergyCost(action.energy, base.energy)
      stress += sportGainsHalved ? action.stress * 0.5 : action.stress
      money += action.money
      englishGrowth += action.english ?? 0
      composite += action.composite ?? 0
      research += action.research ?? 0
      kaoyanPrep += action.kaoyanPrep ?? 0
      if (action.growth === 'constitution') {
        constitutionGrowth +=
          (action.growthAmount ?? 0) * (sportGainsHalved ? 0.5 : 1)
      }
    }

    const grown = applyGrowthCarry({
      attrs: player.attrs,
      english,
      englishGrowth,
      constitutionGrowth,
      appearanceGrowth,
      socialGrowth,
    })

    return {
      ...base,
      player: { ...player, attrs: grown.attrs },
      energy: clamp(energy, 0, 100),
      stress: clamp(stress, 0, 100),
      money: Math.max(0, money),
      english: grown.english,
      englishGrowth: grown.englishGrowth,
      composite,
      research,
      kaoyanPrep,
      prep,
      researchProgress,
      experimentPreparation,
      constitutionGrowth: grown.constitutionGrowth,
      appearanceGrowth: grown.appearanceGrowth,
      socialGrowth: grown.socialGrowth,
    }
  }

  const advanceWeekSlot = (
    base: GameState,
  ): { state: GameState; sleep: ReturnType<typeof sleepRecoveryFor> } => {
    const nextSlot = base.weekSlot + 1
    const finishedDay = Math.floor(base.weekSlot / 3)
    const daily =
      base.weekSlot % 3 === 2 && base.plan
        ? planDailyCost(base.plan, finishedDay)
        : { energy: 0, stress: 0 }
    const stressAfterDay = clamp(base.stress + daily.stress, 0, 100)
    const livingCost =
      base.weekSlot % 3 === 2
        ? dailyLivingCostFor(base.player?.background)
        : 0
    const dayKey = `${base.seasonIndex}-${base.week}-${finishedDay}`
    const coffeeBoosted =
      base.weekSlot % 3 === 2 && base.eveningCoffeeDayKey === dayKey
    const earlySleep = earlySleepApplies(base, nextSlot)
    const sleepStress = clamp(
      stressAfterDay - (earlySleep ? 10 : 0),
      0,
      100,
    )
    const sleep =
      base.weekSlot % 3 === 2
        ? sleepRecoveryFor(sleepStress, coffeeBoosted ? 1 : 0)
        : {
            base: 0,
            tier: 0 as const,
            reduction: 0,
            gain: 0,
            coffeeBoosted: false,
          }
    if (earlySleep) sleep.gain += 5
    const advanced: GameState = {
      ...base,
      weekSlot: nextSlot,
      weekSlotSkipped: false,
      weekSlotActions: base.weekSlotActions,
      energy: clamp(base.energy + daily.energy + sleep.gain, 0, 100),
      stress: stressAfterDay,
      money: Math.max(0, base.money - livingCost),
      eveningCoffeeDayKey:
        base.weekSlot % 3 === 2 ? null : base.eveningCoffeeDayKey,
    }
    const afterAfternoon =
      base.weekSlot % 3 === 1
        ? applyBreakfastConsumptionEffect(advanced, finishedDay)
        : advanced
    const withDailyEffects =
      base.weekSlot % 3 === 2
        ? applyDailyConsumptionEffects(afterAfternoon, finishedDay)
        : afterAfternoon
    return {
      // 病症按游戏日倒计时，不按周倒计时。
      state:
        base.weekSlot % 3 === 2
          ? tickHealthDay(withDailyEffects)
          : withDailyEffects,
      sleep,
    }
  }

  const performClinicalEveningAction = (actionId: string) => {
    const current = gameRef.current ?? game
    if (!current) return
    const action = ACTION_BY_ID[actionId]
    if (!action) return
    const applied = carryGrowthState(applySlotAction(current, actionId))
    const next = {
      ...applied,
      semesterStats: bumpSemesterStats(applied.semesterStats, actionId),
      careerStats: bumpCareerStats(applied.careerStats, actionId),
    }
    setGame(next)
    persist(next)
  }

  const finishClinicalEvening = (base: GameState): GameState => {
    const clinical = base.clinical
    if (!clinical) return base
    const course = clinical.courses[clinical.courseIndex]
    if (!course) return base
    let nextClinical = clinical
    if (clinical.dayIndex + 1 < course.clinicalDays) {
      nextClinical = {
        ...clinical,
        dayIndex: clinical.dayIndex + 1,
        mode: 'intro',
        currentDay: null,
        lastDaySummary: null,
      }
    } else {
      const result = examineRotation(clinical, course)
      nextClinical = {
        ...clinical,
        mode: 'exam',
        lastRotation: result,
        rotationResults: [
          ...clinical.rotationResults.filter((item) => item.courseId !== result.courseId),
          result,
        ],
      }
    }
    return { ...base, clinical: nextClinical, weekSlot: 2 }
  }

  const finishWeekSlot = (base: GameState, actionId?: string) => {
    const withStats = actionId
      ? {
          ...base,
          semesterStats: bumpSemesterStats(base.semesterStats, actionId),
          careerStats: bumpCareerStats(base.careerStats, actionId),
        }
      : base
    if (withStats.clinical?.mode === 'evening') {
      const next = finishClinicalEvening(withStats)
      setGame(next)
      persist(next)
      return
    }
    const normalized = carryGrowthState(withStats)
    const advancedResult = advanceWeekSlot({
      ...normalized,
      weekSlotActions: actionId
        ? [...normalized.weekSlotActions, actionId]
        : normalized.weekSlotActions,
    })
    const { state: advanced, sleep } = advancedResult
    if (advanced.weekSlot >= 21) {
      endWeek(advanced)
      announceSleep(sleep, advanced.stress)
      return
    }
    commit(advanced, 'week')
    announceSleep(sleep, advanced.stress)
  }

  const recordSoloAttempt = (
    record: SoloChatRecord,
    invite?: SoloInvite,
  ) => {
    setGame((previous) => {
      if (!previous) return previous
      const next: GameState = {
        ...previous,
        soloChatRecords: [
          ...(previous.soloChatRecords ?? []).filter(
            (item) =>
              !(
                item.weekKey === record.weekKey &&
                item.attemptSlot === record.attemptSlot &&
                item.relationshipId === record.relationshipId
              ),
          ),
          record,
        ],
        soloInvites: invite
          ? [...(previous.soloInvites ?? []), invite]
          : previous.soloInvites,
      }
      persist(next)
      return next
    })
  }

  const resolveSoloDate = (inviteId: string) => {
    if (!game) return
    const invite = game.soloInvites.find((item) => item.id === inviteId)
    if (!invite || invite.resolved || invite.slot !== game.weekSlot) return
    const dateRelation = game.relationships.find(
      (relation) => relation.id === invite.relationshipId,
    )
    if (!dateRelation) return
    const dateIntimacyGain = adjustIntimacyDelta(game, dateRelation, 5)
    const next: GameState = {
      ...game,
      energy: clamp(game.energy - 10, 0, 100),
      money: Math.max(0, game.money - consumptionSoloDateCost(game, invite)),
      relationships: game.relationships.map((relation) =>
        relation.id === invite.relationshipId
          ? {
              ...relation,
              intimacy: Math.min(
                100,
                relation.intimacy + dateIntimacyGain,
              ),
            }
          : relation,
      ),
      soloInvites: game.soloInvites.map((item) =>
        item.id === invite.id ? { ...item, resolved: true } : item,
      ),
    }
    finishWeekSlot(next, `soloDate:${invite.id}`)
  }

  const attendCurrentCourse = () => {
    if (!game || game.weekSlotSkipped) return
    const course = timetableCourseAt(game, game.weekSlot)
    if (!course) return
    const stars = courseDifficulty(course).stars
    const energyCost =
      10 + (stars >= 4 ? 2 : stars <= 2 ? -2 : 0)
    const earlyRiseBonus =
      game.habits.includes('earlyRise') &&
      game.weekSlot % 3 === 0 &&
      Math.floor(game.weekSlot / 3) <= 4
    finishWeekSlot(
      {
        ...game,
        energy: clamp(game.energy - energyCost, 0, 100),
        prep: {
          ...game.prep,
          [course.id]: clamp(
            (game.prep[course.id] ?? 0) +
              attendancePrepGain(course) +
              (earlyRiseBonus ? 1 : 0),
            0,
            100,
          ),
        },
      },
      `attend:${course.id}`,
    )
  }

  const resolveSkipCourse = (success: boolean) => {
    if (!game || game.weekSlotSkipped) return
    const course = timetableCourseAt(game, game.weekSlot)
    if (!course) return
    const next: GameState = {
      ...game,
      weekSlotSkipped: true,
      semesterStats: bumpSemesterStats(game.semesterStats, 'skip'),
      careerStats: bumpCareerStats(game.careerStats, 'skip'),
      stress: success ? game.stress : clamp(game.stress + 5, 0, 100),
      skipCaught: success
        ? game.skipCaught
        : {
            ...game.skipCaught,
            [course.id]: (game.skipCaught[course.id] ?? 0) + 1,
          },
    }
    setGame(next)
    persist(next)
  }

  const dailyActionKey = () =>
    `${game?.seasonIndex ?? 0}-${game?.week ?? 1}-${Math.floor((game?.weekSlot ?? 0) / 3)}`

  const drinkCoffee = (keyOverride?: string) => {
    const coffeeCost = consumptionCoffeeCost(
      game ?? ({} as GameState),
      game?.habits.includes('ledger') ? 5 : 10,
    )
    if (!game || game.money < coffeeCost || game.energy >= 100) return
    const key = keyOverride ?? dailyActionKey()
    if (game.coffeeDayKey === key) return
    const next: GameState = {
      ...game,
      energy: clamp(game.energy + 10, 0, 100),
      money: Math.max(0, game.money - coffeeCost),
      coffeeDayKey: key,
      semesterStats: bumpSemesterStats(game.semesterStats, 'coffee'),
      careerStats: bumpCareerStats(game.careerStats, 'coffee'),
      eveningCoffeeDayKey:
        game.weekSlot % 3 === 2 ? key : game.eveningCoffeeDayKey,
    }
    setGame(next)
    persist(next)
  }


  const performWeekSlotAction = (actionId: string) => {
    if (!game) return
    if (actionId === 'rest' && game.weekSlot % 3 === 0) return
    if (game.weekSlotSkipped) {
      // current slot was skipped and is now free
    } else if (timetableCourseAt(game, game.weekSlot)) {
      return
    }
    const next = applySlotAction(game, actionId)
    finishWeekSlot(next, actionId)
  }

  const sleepInCurrentSlot = () => {
    if (!game || game.weekSlot % 3 !== 0) return
    if (!game.weekSlotSkipped && timetableCourseAt(game, game.weekSlot)) return
    const dayKey = `${game.seasonIndex}-${game.week}-${Math.floor(game.weekSlot / 3)}`
    if (game.coffeeDayKey === dayKey) {
      return
    }
    if (game.habits.includes('earlyRise') && Math.floor(game.weekSlot / 3) <= 4) {
      return
    }
    const next = {
      ...game,
      energy: clamp(game.energy + 20, 0, 100),
      stress: clamp(game.stress - 10, 0, 100),
      sleepInDayKey: dayKey,
    }
    finishWeekSlot(next, 'sleepIn')
  }

  const attendClubActivity = () => {
    if (!game) return
    const activity = timetableActivityAt(game, game.weekSlot)
    if (!activity) return
    const membership = game.clubMemberships.find(
      (item) => item.orgId === activity.orgId,
    )
    if (!membership) return
    const updatedMembership = {
      ...membership,
      totalActivities: membership.totalActivities + 1,
      semesterActivities: membership.semesterActivities + 1,
    }
    const base: GameState = {
      ...game,
      energy: clamp(game.energy - 5, 0, 100),
      clubMemberships: game.clubMemberships.map((item) =>
        item.orgId === activity.orgId ? updatedMembership : item,
      ),
    }
    const event = pickClubEvent(membership.category)
    const applied = applyClubEvent(base, updatedMembership, event)
    const next = pushCampusNotice(applied.next, event.title, event.text)
    finishWeekSlot(next, `clubAttend:${activity.orgId}`)
    showResearchNotice({
      kind: 'club',
      title: event.title,
      text: event.text,
      ruleText: applied.lines.length > 0 ? applied.lines.join('；') : undefined,
      ruleLabel: '活动结果',
    })
  }

  const leaveClubActivity = () => {
    if (!game) return
    const activity = timetableActivityAt(game, game.weekSlot)
    if (!activity) return
    const membership = game.clubMemberships.find(
      (item) => item.orgId === activity.orgId,
    )
    if (!membership) return
    const next: GameState = {
      ...game,
      clubMemberships: game.clubMemberships.map((item) =>
        item.orgId === activity.orgId
          ? { ...item, semesterLeaves: (item.semesterLeaves ?? 0) + 1 }
          : item,
      ),
    }
    finishWeekSlot(next, `clubLeave:${activity.orgId}`)
    showResearchNotice({
      kind: 'club',
      title: '因故请假',
      text: `你向${activity.name}请了假。${pickClubLeaveText()}`,
    })
  }

  const performSlotLibrary = (focus: string) => {
    if (!game) return
    const next = applySlotAction({ ...game, weekFocus: focus }, 'library')
    finishWeekSlot(next, 'library')
  }

  const performSlotDinner = (
    acceptedIds: string[],
    declinedIds: string[],
    cost: number,
  ) => {
    if (!game || acceptedIds.length === 0 || cost > game.money) return
    const plans = dinnerPlansThisWeek(game)
    if (plans.length >= DINNER_WEEKLY_LIMIT) return
    const summary = acceptedIds
      .map((id) => game.relationships.find((relation) => relation.id === id)?.name)
      .filter(Boolean) as string[]
    const attendedIds = new Set(plans.flatMap((plan) => plan.acceptedIds))
    const firstTimerIds = acceptedIds.filter((id) => !attendedIds.has(id))
    const plan = {
      acceptedIds,
      declinedIds,
      cost,
      summary,
      committed: true,
      weekKey: currentWeekKey(game),
      weekSlot: game.weekSlot,
      firstTimerIds,
    }
    const next: GameState = {
      ...game,
      energy: clamp(game.energy + 8, 0, 100),
      stress: clamp(game.stress - 15, 0, 100),
      money: Math.max(0, game.money - cost),
      dinnerPlan: plan,
      dinnerPlans: [...plans, plan],
      careerStats: bumpCareerStats(game.careerStats, 'dinner'),
      dinnerInvites: null,
      relationships: game.relationships.map((relation) =>
        firstTimerIds.includes(relation.id)
          ? {
              ...relation,
              intimacy: Math.min(100, relation.intimacy + 3),
            }
          : relation,
      ),
    }
    finishWeekSlot(next, 'social')
  }

  const performSlotClubActivity = (
    orgId: string,
    acceptedIds: string[],
    declinedIds: string[],
  ) => {
    if (!game) return
    const membership = game.clubMemberships.find((item) => item.orgId === orgId)
    if (!membership) return
    const roleMultiplier = roleBenefitMultiplier(membership.role)
    const socialGain = Math.round(5 * roleMultiplier)
    const intimacyGain = Math.round(5 * roleMultiplier)
    let next: GameState = {
      ...game,
      energy: clamp(game.energy - 8, 0, 100),
      stress: clamp(game.stress + 3, 0, 100),
      money: Math.max(0, game.money - 5),
      socialGrowth: game.socialGrowth + socialGain,
      clubMemberships: game.clubMemberships.map((item) =>
        item.orgId === orgId
          ? {
              ...item,
              totalActivities: item.totalActivities + 1,
              semesterActivities: item.semesterActivities + 1,
            }
          : item,
      ),
      clubActivityPlan: null,
      clubInvites: null,
      relationships: game.relationships.map((relation) =>
        acceptedIds.includes(relation.id)
          ? {
              ...relation,
              intimacy: Math.min(
                100,
                relation.intimacy +
                  adjustIntimacyDelta(game, relation, intimacyGain),
              ),
            }
          : relation,
      ),
    }
    let notice: { title: string; text: string; lines: string[] } | null = null
    if (Math.random() < CLUB_EVENT_CHANCE) {
      const event = pickClubEvent(membership.category)
      const applied = applyClubEvent(next, membership, event)
      next = pushCampusNotice(applied.next, event.title, event.text)
      notice = { title: event.title, text: event.text, lines: applied.lines }
    }
    finishWeekSlot(next, 'club')
    if (notice) {
      showResearchNotice({
        kind: 'club',
        title: notice.title,
        text: notice.text,
        ruleText: notice.lines.length > 0 ? notice.lines.join('；') : undefined,
        ruleLabel: '事件结果',
      })
    }
  }

  const chooseReview = (choice: ReviewChoice) => {
    if (!game || !game.plan || !game.player) return
    const effect = getReviewEffect(choice, game.season.courses, game.player.attrs, game.plan)
    const gains = Object.fromEntries(
      game.season.courses.map((course) => [
        course.id,
        (effect.gains[course.id] ?? 0) *
          healthPrepMultiplier(game) *
          prepGainMultiplier(game) *
          examReviewTalentMultiplier(game) *
          coursePrepTalentMultiplier(game, course) *
          examCoffeeMultiplier(game) *
          consumptionExamPrepGainMultiplier(game) *
          (game.examEnglishPrep ? 0.9 : 1),
      ]),
    )
    const energy = clamp(
      game.energy + effectiveEnergyCost(effect.energy, game.energy),
      0,
      100,
    )
    let stress = clamp(
      game.stress + effect.stress - consumptionExamReviewStressReduction(game),
      0,
      100,
    )
    const money = Math.max(
      0,
      game.money -
        dailyLivingCostFor(game.player?.background) * 7,
    )
    const prep = { ...game.prep }
    const rewardedCourses = [...game.stressRewardedCourses]

    const results: ExamResult[] = game.season.courses.map((course) => {
      prep[course.id] = clamp((prep[course.id] ?? 0) + (gains[course.id] ?? 0), 0, 100)
      const forgetPenalty =
        !course.electiveType || course.electiveType === 'politics'
          ? rollForgetPenalty(game.plan ?? 'B', course.credits)
          : 0
      prep[course.id] = Math.max(0, prep[course.id] - forgetPenalty)
      const [rawMin, rawMax] = estimateRange(prep[course.id])
      const cap = effect.scoreCap ?? 100
      let rawScore =
        38 +
        prep[course.id] * 0.55 +
        (Math.random() * 2 * effect.variance - effect.variance)
      if (game.examAllNighter) {
        rawScore *= game.openingTalents.includes('caffeineImmune') ? 0.975 : 0.95
      }
      if (course.electiveType === 'interest') rawScore += 3
      const paperScore = applyScoreRescue(
        game,
        Math.max(0, Math.min(cap, Math.min(100, Math.trunc(rawScore)))),
      )
      const caught = game.skipCaught[course.id] ?? 0
      const { usualScore, finalScore } = composeCourseScore(
        course,
        paperScore,
        caught,
      )
      const { paperWeight } = courseScoreWeights(course)
      const expectedMin = Math.max(
        0,
        Math.min(
          cap,
          Math.round(
            usualScoreFor(course, caught) + Math.min(rawMin, cap) * (paperWeight / 100),
          ),
        ),
      )
      const expectedMax = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            usualScoreFor(course, caught) + Math.min(rawMax, cap) * (paperWeight / 100),
          ),
        ),
      )
      const expectedCenter = Math.min(
        100,
        Math.round(
          usualScoreFor(course, caught) +
            Math.min(estimateScore(prep[course.id]), cap) * (paperWeight / 100),
        ),
      )
      const score = finalScore
      const rawGpa = gpaFromScore(score)
      const gpa = course.makeup
        ? score >= 60
          ? makeupGpa(course.originalGpa ?? 0, rawGpa)
          : rawGpa
        : rawGpa
      const rewardKey = course.makeup
        ? course.id.replace(/^makeup-/, '').replace(/-\d+$/, '')
        : course.id
      const eligible = score >= 60 && !rewardedCourses.includes(rewardKey)
      const stressRelief = eligible
        ? stressReliefForScore(score, expectedCenter)
        : 0
      if (eligible) rewardedCourses.push(rewardKey)
      return {
        course,
        score,
        gpa,
        expectedMin,
        expectedMax,
        stressRelief,
        usualScore,
        paperScore,
        forgetPenalty,
      }
    })
    let peNoticeText: string | null = null
    if (
      isPeResultSeason(game.seasonIndex) &&
      game.pendingPeCourseId
    ) {
      const peCourse = ELECTIVE_COURSE_BY_ID[game.pendingPeCourseId]
      if (peCourse) {
        const roll = rollPeCourseScore(game, energy)
        const [peMin, peMax] = peCoursePredictedRange(game)
        const caught = game.skipCaught[peCourse.id] ?? 0
        const { usualScore, finalScore } = composeCourseScore(
          peCourse,
          roll.score,
          caught,
        )
        const { paperWeight } = courseScoreWeights(peCourse)
        const peScoreCap = 100
        const cappedScore = Math.min(finalScore, peScoreCap)
        results.push({
          course: peCourse,
          score: cappedScore,
          gpa: peGpaFor(cappedScore),
          expectedMin: Math.min(peMin, peMax, peScoreCap),
          expectedMax: Math.min(Math.max(peMin, peMax), peScoreCap),
          stressRelief: 0,
          usualScore,
          paperScore: roll.score,
          scoreCap: peScoreCap,
        })
        if (roll.floored) peNoticeText = PE_FLOOR_TEXT
      }
    }

    const totalStressRelief = results.reduce(
      (sum, result) => sum + result.stressRelief,
      0,
    )
    stress = clamp(stress - totalStressRelief, 0, 100)

    const passed = results.filter((result) => result.score >= 60)
    const failed = results.filter((result) => result.score < 60)
    const regularPassed = passed.filter((result) => !result.course.electiveType)
    const electivePassed = passed.filter(
      (result) =>
        result.course.electiveType &&
        result.course.electiveType !== 'politics' &&
        result.course.electiveType !== 'pe',
    )
    const politicsPassed = passed.filter(
      (result) => result.course.electiveType === 'politics',
    )
    const pePassed = passed.filter(
      (result) => result.course.electiveType === 'pe',
    )
    const regularCredits = regularPassed.reduce(
      (sum, result) => sum + result.course.credits,
      0,
    )
    const regularPoints = regularPassed.reduce(
      (sum, result) => sum + result.course.credits * result.gpa,
      0,
    )
    let electiveCreditRoom = Math.max(0, 10 - (game.electiveCredits ?? 0))
    let electiveCreditsGain = 0
    let electivePointsGain = 0
    for (const result of electivePassed) {
      const counted = Math.min(result.course.credits, electiveCreditRoom)
      if (counted <= 0) continue
      electiveCreditsGain += counted
      electivePointsGain += counted * result.gpa
      electiveCreditRoom -= counted
    }
    const politicsCreditsGain = politicsPassed.reduce(
      (sum, result) => sum + result.course.credits,
      0,
    )
    const politicsPointsGain = politicsPassed.reduce(
      (sum, result) => sum + result.course.credits * result.gpa,
      0,
    )
    const peCreditsGain = pePassed.reduce(
      (sum, result) => sum + result.course.credits,
      0,
    )
    const pePointsGain = pePassed.reduce(
      (sum, result) => sum + result.course.credits * result.gpa,
      0,
    )
    const creditGain =
      regularCredits + electiveCreditsGain + politicsCreditsGain + peCreditsGain
    const pointGain =
      regularPoints + electivePointsGain + politicsPointsGain + pePointsGain
    const pendingMakeups = failed
      .filter((result) => !result.course.electiveType)
      .map((result) =>
        result.course.makeup
          ? result.course
          : {
              ...result.course,
              id: `makeup-${result.course.id}-${game.seasonIndex}`,
              name: result.course.name,
              makeup: true,
              originalGpa: result.gpa,
              originalScore: result.score,
            },
      )
    const failedRequiredElectives = failed
      .filter(
        (result) =>
          result.course.electiveType === 'group' ||
          result.course.electiveType === 'politics',
      )
      .map((result) => result.course.id)
    const nextSkipCaught = { ...game.skipCaught }
    for (const result of results) delete nextSkipCaught[result.course.id]
    const outstandingFails = { ...(game.outstandingFails ?? {}) }
    for (const result of results) {
      const key = baseCourseId(result.course.id)
      const counts =
        !result.course.electiveType || result.course.electiveType === 'politics'
      if (!counts) continue
      if (result.gpa > 0) delete outstandingFails[key]
      else outstandingFails[key] = result.course.credits
    }
    const next: GameState = {
      ...game,
      skipCaught: nextSkipCaught,
      peRunCount: 0,
      screen: 'result',
      week: 4,
      energy,
      stress,
      money,
      prep,
      results,
      pendingMakeups,
      outstandingFails,
      everFailed: game.everFailed || failed.length > 0,
      yearFailed: game.yearFailed || failed.length > 0,
      cumulativeCredits: game.cumulativeCredits + creditGain,
      cumulativePoints: game.cumulativePoints + pointGain,
      pendingPeCourseId: isPeResultSeason(game.seasonIndex)
        ? null
        : game.pendingPeCourseId,
      pendingPePairKey: isPeResultSeason(game.seasonIndex)
        ? null
        : game.pendingPePairKey,
      peCourseCredits: game.peCourseCredits + peCreditsGain,
      peCourseCount: game.peCourseCount + pePassed.length,
      peCourseResults: [
        ...game.peCourseResults,
        ...pePassed.map((result) => ({
          courseId: result.course.id,
          name: result.course.name,
          score: result.score,
          gpa: result.gpa,
          credits: result.course.credits,
        })),
      ],
      electiveCredits: Math.min(
        10,
        (game.electiveCredits ?? 0) + electiveCreditsGain,
      ),
      pendingElectiveRetakes: [
        ...new Set([...game.pendingElectiveRetakes, ...failedRequiredElectives]),
      ],
      politicsCompleted: [
        ...new Set([
          ...game.politicsCompleted,
          ...politicsPassed.map((result) => result.course.id),
        ]),
      ],
      politicsCredits: game.politicsCredits + politicsCreditsGain,
      courseRecords: [
        ...game.courseRecords,
        ...passed
          .filter(
            (result) =>
              !game.courseRecords.some(
                (record) => record.id === result.course.id,
              ),
          )
          .map((result) => ({
            id: result.course.id,
            name: result.course.name,
            credits: result.course.credits,
            gpa: result.gpa,
            score: result.score,
            category: result.course.electiveType
              ? result.course.electiveType === 'politics'
                ? ('politics' as const)
                : result.course.electiveType === 'pe'
                  ? ('pe' as const)
                  : ('elective' as const)
              : ('professional' as const),
          })),
      ],
      stressRewardedCourses: rewardedCourses,
      selected: [],
      finalNote:
        failed.length === 0
          ? `${game.season.seasonLabel}结束。成绩单被收进档案，下一段日子已经在前面等你。`
          : `${game.season.seasonLabel}结束。成绩单上有一个不太好看的数字，补考在下一个学期等你。`,
    }

    commit(next, 'result')
    if (peNoticeText) {
      showResearchNotice({
        kind: 'pe',
        title: '体育课成绩被捞了',
        text: peNoticeText,
      })
    }
  }

  const handleCoffee = () => {
    if (!game || game.examCoffee || game.money < 50) return
    const next: GameState = {
      ...game,
      money: game.money - 50,
      energy: clamp(game.energy + 10, 0, 100),
      stress: clamp(
        game.stress + (game.openingTalents.includes('caffeineImmune') ? 0 : 5),
        0,
        100,
      ),
      examCoffee: true,
    }
    setGame(next)
    persist(next)
  }

  const eatBreakfast = (keyOverride?: string) => {
    if (!game) return
    const key = keyOverride ?? dailyActionKey()
    if (game.breakfastDayKey === key) return
    if (game.money < 10) return
    const next: GameState = {
      ...game,
      money: Math.max(0, game.money - 10),
      stress: clamp(game.stress - 10, 0, 100),
      breakfastDayKey: key,
    }
    setGame(next)
    persist(next)
  }

  const dailySelfCare = (keyOverride?: string) => {
    const selfCareCost = consumptionSelfCareCost(
      game ?? ({} as GameState),
      game?.habits.includes('ledger') ? 15 : 30,
    )
    if (!game || game.money < selfCareCost) return
    const key = keyOverride ?? dailyActionKey()
    const usedToday = game.selfCareDayKey === key ? (game.selfCareDayCount ?? 0) : 0
    if (usedToday >= 2) return
    const next = carryGrowthState({
      ...game,
      money: Math.max(0, game.money - selfCareCost),
      energy: clamp(game.energy + 10, 0, 100),
      stress: clamp(game.stress - 15, 0, 100),
      constitutionGrowth: game.constitutionGrowth - 5,
      selfCareDayKey: key,
      selfCareDayCount: usedToday + 1,
      semesterStats: bumpSemesterStats(game.semesterStats, 'selfCare'),
      careerStats: bumpCareerStats(game.careerStats, 'selfCare'),
    })
    setGame(next)
    persist(next)
  }

  const handleEnglishPrep = () => {
    if (!game || game.examEnglishPrep) return
    const next: GameState = {
      ...game,
      energy: clamp(game.energy + effectiveEnergyCost(-10, game.energy), 0, 100),
      stress: clamp(game.stress + 5, 0, 100),
      englishGrowth: game.englishGrowth + 5,
      cetAttemptBonus: game.cetWindow
        ? Math.min(0.5, game.cetAttemptBonus + 0.1)
        : game.cetAttemptBonus,
      examEnglishPrep: true,
    }
    const grown = applyGrowthCarry({
      attrs: game.player!.attrs,
      english: next.english,
      englishGrowth: next.englishGrowth,
      constitutionGrowth: next.constitutionGrowth,
      appearanceGrowth: next.appearanceGrowth,
      socialGrowth: next.socialGrowth,
    })
    next.english = grown.english
    next.englishGrowth = grown.englishGrowth
    next.player = { ...game.player!, attrs: grown.attrs }
    setGame(next)
    persist(next)
  }

  const handleAllNighter = () => {
    if (!game || game.examAllNighter) return
    const prep = { ...game.prep }
    const gain =
      15 *
      prepGainMultiplier(game) *
      examCoffeeMultiplier(game) *
      consumptionExamPrepGainMultiplier(game)
    for (const course of game.season.courses) {
      prep[course.id] = clamp((prep[course.id] ?? 0) + gain, 0, 100)
    }
    const next: GameState = {
      ...game,
      energy: clamp(game.energy + effectiveEnergyCost(-10, game.energy), 0, 100),
      stress: clamp(game.stress + 10, 0, 100),
      constitutionGrowth: Math.max(0, game.constitutionGrowth - 10),
      prep,
      examAllNighter: true,
    }
    const normalized = carryGrowthState(next)
    setGame(normalized)
    persist(normalized)
  }

  const handleCetRegister4 = () => {
    if (!game) return
    const cet4Passed = (game.cet4Score ?? 0) >= CET.pass4
    if (cet4Passed || game.money < CET.registrationCost) return
    const next: GameState = {
      ...game,
      money: game.money - CET.registrationCost,
      cet4Registered: true,
      cetEventDone: true,
      cetWindow: game.season.seasonLabel.includes('冬') ? 'winter' : 'summer',
      cetAttemptBonus: game.cetAttemptBonus,
      screen: 'week',
    }
    commit(next, 'week')
  }

  const handleCetRegister6 = () => {
    if (!game) return
    const cet4Passed = (game.cet4Score ?? 0) >= CET.pass4
    if (!cet4Passed || game.money < CET.registrationCost) return
    const next: GameState = {
      ...game,
      money: game.money - CET.registrationCost,
      cet6Registered: true,
      cetEventDone: true,
      cetWindow: game.season.seasonLabel.includes('冬') ? 'winter' : 'summer',
      cetAttemptBonus: game.cetAttemptBonus,
      screen: 'week',
    }
    commit(next, 'week')
  }

  const handleCetSkip = () => {
    if (!game) return
    commit({ ...game, cetEventDone: true, screen: 'week' }, 'week')
  }

  const finalizeGraduation = (base: GameState) => {
    const failedPe = base.peResults.filter((item) => !item.passed)
    let peMakeupPassed = base.peMakeupPassed
    let peMakeupScore = base.peMakeupScore
    let current = base
    const peGraduationExempt = failedPe.length === 0
    if (!peGraduationExempt) {
      peMakeupScore = peScoreFor(base.player!.attrs.constitution)
      peMakeupPassed = peMakeupScore >= 60
      if (peMakeupPassed) {
        const gpa = peGpaFor(peMakeupScore)
        current = {
          ...base,
          cumulativeCredits: base.cumulativeCredits + failedPe.length * 2,
          cumulativePoints: base.cumulativePoints + failedPe.length * 2 * gpa,
        }
      }
    }
    commit(
      {
        ...current,
        peMakeupPassed,
        peMakeupScore,
        peGraduationExempt,
        screen: 'graduation',
      },
      'graduation',
    )
  }

  const withCetResults = (base: GameState): GameState => {
    const tookCet4 = base.cet4Registered
    const tookCet6 = base.cet6Registered
    const bonus = Math.max(0, Math.min(1, base.cetAttemptBonus))
    let cet4Score = base.cet4Score
    let cet6Score = base.cet6Score
    if (tookCet4) {
      cet4Score = cetScore('cet4', base.english, base.player!.attrs.memory)
      if (cet4Score < CET.pass4 && Math.random() < bonus) cet4Score = CET.pass4
    }
    if (tookCet6) {
      const attempt = cetScore('cet6', base.english, base.player!.attrs.memory)
      const adjusted =
        attempt < CET.pass6 && Math.random() < bonus ? CET.pass6 : attempt
      cet6Score = Math.max(base.cet6Score ?? 0, adjusted)
    }
    return {
      ...base,
      cet4Score,
      cet6Score,
      cet4Registered: false,
      cet6Registered: false,
      cetWindow: null,
      cetAttemptBonus: 0,
    }
  }

  const handleCetResultContinue = () => {
    if (!game) return
    if (isAutumnSeasonIndex(game.seasonIndex) && game.seasonIndex > 0) {
      const withScholarship = evaluateScholarship(game, game.seasonIndex)
      if (withScholarship) {
        commit({ ...withScholarship, screen: 'scholarship' }, 'scholarship')
        return
      }
    }
    if (game.seasonIndex === 15 && !game.postgradChoice) {
      commit(
        {
          ...game,
          screen: 'route',
          postgradChance: game.postgradChance ?? postgradChanceFor(game),
        },
        'route',
      )
      return
    }
    commit({ ...game, screen: 'plan' }, 'plan')
  }

  const beginSeason = (base: GameState, index: number) => {
    const prepared = applyConsumptionWeekStart(prepareSeason(base, index))
    const pendingCet =
      (base.cetWindow === 'winter' && index >= 2 && !isAutumnSeasonIndex(index) && [2, 6, 10, 15, 19].includes(index)) ||
      (base.cetWindow === 'summer' && isAutumnSeasonIndex(index))
    if (pendingCet) {
      commit({ ...withCetResults(prepared), screen: 'cetResult' }, 'cetResult')
      return
    }
    if (index > 0 && isAutumnSeasonIndex(index)) {
      const withScholarship = evaluateScholarship(prepared, index)
      if (withScholarship) {
        commit({ ...withScholarship, screen: 'scholarship' }, 'scholarship')
        return
      }
    }
    if (index === 15 && !base.postgradChoice) {
      commit(
        { ...prepared, screen: 'route', postgradChance: postgradChanceFor(prepared) },
        'route',
      )
      return
    }
    commit(prepared, 'plan')
  }

  const startSeason = (index: number) => {
    if (!game) return
    beginSeason(game, index)
  }

  const startVacation = (kind: VacationKind) => {
    if (!game) return
    commit(prepareVacation(game, kind), 'vacation')
  }

  const handleRouteChoice = (choice: PostgradChoice) => {
    if (!game) return
    commit(
      {
        ...game,
        postgradChoice: choice,
        postgradChance: game.postgradChance ?? postgradChanceFor(game),
        screen: 'plan',
      },
      'plan',
    )
  }

  const handleBaoyanContinue = () => {
    if (!game) return
    beginSeason(game, 18)
  }

  const handleKaoyanRegister = () => {
    if (!game) return
    beginSeason({ ...game, kaoyanRegistered: true, screen: 'plan' }, 18)
  }

  const handleBaoyanEmployment = () => {
    if (!game) return
    beginSeason({ ...game, postgradChoice: 'employment', screen: 'plan' }, 18)
  }

  const handleKaoyanExamContinue = () => {
    if (!game) return
    beginSeason(game, 19)
  }

  const handleKaoyanResultContinue = () => {
    if (!game) return
    beginSeason(game, 20)
  }

  const handleScholarshipContinue = () => {
    if (!game) return
    commit({ ...game, screen: 'plan' }, 'plan')
  }

  const updateClinical = (clinical: GameState['clinical']) => {
    setGame((previous) => {
      if (!previous) return previous
      const next: GameState = {
        ...previous,
        clinical,
        ...(clinical?.mode === 'evening' ? { weekSlot: 2, weekSlotSkipped: false } : {}),
      }
      persist(next)
      return next
    })
  }

  const applyClinicalEffect = (effect: {
    stress?: number
    energy?: number
    kaoyanPrep?: number
    courseId?: string
    coursePrep?: number
  }) => {
    setGame((previous) => {
      if (!previous) return previous
      const next: GameState = {
        ...previous,
        stress: clamp(previous.stress + (effect.stress ?? 0), 0, 100),
        energy: clamp(previous.energy + (effect.energy ?? 0), 0, 100),
        kaoyanPrep: Math.max(0, previous.kaoyanPrep + (effect.kaoyanPrep ?? 0)),
        prep:
          effect.courseId && effect.coursePrep
            ? {
                ...previous.prep,
                [effect.courseId]: clamp(
                  (previous.prep[effect.courseId] ?? 0) + effect.coursePrep,
                  0,
                  100,
                ),
              }
            : previous.prep,
      }
      persist(next)
      return next
    })
  }

  const finishClinicalSeason = (clinical: NonNullable<GameState['clinical']>) => {
    const current = gameRef.current ?? game
    if (!current) return
    const results: ExamResult[] = clinical.rotationResults.map((rotation) => {
      const course =
        current.season.courses.find((item) => item.id === rotation.courseId) ?? {
          id: rotation.courseId,
          name: rotation.name,
          examType: '大考' as const,
          credits: rotation.credits,
          memory: '中' as const,
          comprehension: '中' as const,
        }
      return {
        course,
        score: rotation.score,
        gpa: rotation.gpa,
        expectedMin: 60,
        expectedMax: 100,
        stressRelief: 0,
      }
    })
    const creditGain = results.reduce((sum, result) => sum + result.course.credits, 0)
    const pointGain = results.reduce(
      (sum, result) => sum + result.course.credits * result.gpa,
      0,
    )
    const next: GameState = {
      ...current,
      screen: 'result',
      results,
      clinical: null,
      cumulativeCredits: current.cumulativeCredits + creditGain,
      cumulativePoints: current.cumulativePoints + pointGain,
      courseRecords: [
        ...current.courseRecords,
        ...results
          .filter(
            (result) =>
              !current.courseRecords.some((record) => record.id === result.course.id),
          )
          .map((result) => ({
            id: result.course.id,
            name: result.course.name,
            credits: result.course.credits,
            gpa: result.gpa,
            score: result.score,
            category: 'professional' as const,
          })),
      ],
      everFailed: current.everFailed || results.some((result) => result.score < 60),
      yearFailed: current.yearFailed || results.some((result) => result.score < 60),
      finalNote: `${current.season.seasonLabel}临床轮转结束。成绩、技能和科室认可度已经写入档案。`,
    }
    setGame(next)
    persist(next)
    setView('result')
  }

  const handleResultContinue = () => {
    if (!game) return
    let current = game
    if (
      current.clubMemberships.length > 0 &&
      isYearFinal(current.seasonIndex) &&
      current.clubAnnualBonusSeason !== current.season.id
    ) {
      const bonus = current.clubMemberships.reduce((sum, membership) => {
        const high =
          membership.category === 'union' || membership.category === 'debate'
        if (membership.role === 'member') return sum + (high ? 2 : 1)
        if (membership.role === 'officer') return sum + (high ? 4 : 3)
        return sum + (high ? 6 : 5)
      }, 0)
      current = {
        ...current,
        composite: current.composite + bonus,
        clubAnnualBonusSeason: current.season.id,
      }
    }
    const previousPeCount = current.peResults.length
    if (isYearFinal(current.seasonIndex)) current = settlePe(current)
    const newPe = current.peResults[previousPeCount]
    const index = current.seasonIndex

    // 大五夏：先结算体测（五），再判断毕业生体测免修/补测
    if (index === 20) {
      const failedPe = current.peResults.filter((item) => !item.passed)
      const graduateExempt = failedPe.length === 0
      const graduateScore = graduateExempt
        ? null
        : peScoreFor(current.player!.attrs.constitution)
      const graduatePassed =
        graduateExempt || (graduateScore !== null && graduateScore >= 60)
      const fifthLine = newPe
        ? `${peTestName(newPe.year)}成绩 ${newPe.score} 分，${newPe.passed ? '通过' : '未通过'}。`
        : ''
      const graduationLine = graduateExempt
        ? '五次体测全部通过，毕业生体测免修。'
        : `此前有 ${failedPe.length} 次体测未通过，需要参加毕业生体测。毕业生体测成绩 ${graduateScore} 分，${graduatePassed ? '通过，达到毕业要求。' : '未通过，毕业要求尚未满足。'}`
      showResearchNotice({
        kind: 'pe',
        title: '体测（五）与毕业生体测',
        text: `${fifthLine}${graduationLine}`,
      })
      finalizeGraduation(current)
      return
    }

    if (newPe) {
      showResearchNotice({
        kind: 'pe',
        title: peTestName(newPe.year),
        text: `${peTestName(newPe.year)}结束。你的成绩是 ${newPe.score} 分，${
          newPe.passed
            ? '达到 60 分合格线，体测通过。'
            : '未达到 60 分，记录为未通过，毕业前需要参加毕业生体测。'
        }`,
      })
    }

    // 大三临床前、大四夏：学年结算（大四无暑假）
    if (index === 12 || index === 16) {
      current = finalizeYear(current)
      commit({ ...current, screen: 'yearend', vacation: null }, 'yearend')
      return
    }

    // 非临床学年：夏/寒假
    if (index === 3 || index === 7) {
      commit(prepareVacation(current, 'summer'), 'vacation')
      return
    }
    if (index === 1 || index === 5 || index === 9) {
      commit(prepareVacation(current, 'winter'), 'vacation')
      return
    }

    // 大五秋：推免结果
    if (index === 17) {
      if (current.postgradChoice && current.postgradChoice !== 'employment') {
        const success =
          Math.random() < (current.postgradChance ?? postgradChanceFor(current))
        commit(
          {
            ...current,
            baoyanResult: success ? 'success' : 'fail',
            screen: 'baoyanResult',
          },
          'baoyanResult',
        )
        return
      }
      beginSeason(current, 18)
      return
    }

    // 大五冬：考研初试
    if (index === 18) {
      if (current.kaoyanRegistered) {
        commit(
          {
            ...current,
            kaoyanScore: kaoyanScoreFor(current),
            screen: 'kaoyanExam',
          },
          'kaoyanExam',
        )
        return
      }
      beginSeason(current, 19)
      return
    }

    // 大五春：考研结果
    if (index === 19) {
      if (current.kaoyanRegistered) {
        commit(
          {
            ...current,
            kaoyanResult:
              (current.kaoyanScore ?? 0) >= KAOYAN_PASS ? 'success' : 'fail',
            screen: 'kaoyanResult',
          },
          'kaoyanResult',
        )
        return
      }
      beginSeason(current, 20)
      return
    }

    // 临床年秋季/春季（无寒假、无暑假）
    beginSeason(current, index + 1)
  }

  const handleYearEndContinue = () => {
    if (!game) return
    const nextIndex = game.seasonIndex + 1
    if (nextIndex < SEASONS.length) startSeason(nextIndex)
  }

  const saveVacationTravelResults = (results: DinnerInviteResult[]) => {
    if (!game || !game.vacation) return
    const next: GameState = {
      ...game,
      vacationTravelInvites: {
        weekKey: vacationTravelInviteKey(game),
        results,
      },
    }
    setGame(next)
    persist(next)
  }

  const arrangeVacationTravel = (
    acceptedIds: string[],
    declinedIds: string[],
    cost: number,
  ) => {
    if (
      !game ||
      !game.vacation ||
      game.selected.includes('vacTravel') ||
      game.selected.length >= 2 ||
      cost > game.money
    ) {
      return
    }
    const travelAction = VACATION_ACTION_BY_ID.vacTravel
    const next: GameState = {
      ...game,
      selected: [...game.selected, 'vacTravel'],
      energy: clamp(
        game.energy + effectiveEnergyCost(travelAction.energy, game.energy),
        0,
        100,
      ),
      stress: clamp(game.stress + travelAction.stress, 0, 100),
      money: game.money - cost,
      vacationTravel: {
        companionIds: acceptedIds,
        declinedIds,
        cost,
        summary: acceptedIds
          .map((id) => game.relationships.find((r) => r.id === id)?.name)
          .filter(Boolean) as string[],
        committed: true,
      },
      vacationTravelInvites: null,
      careerStats: bumpCareerStats(game.careerStats, 'travel'),
    }
    setGame(next)
    persist(next)
  }

  const removeVacationTravel = () => {
    if (!game || !game.vacation || game.vacationTravel?.committed) return
    const next: GameState = {
      ...game,
      selected: game.selected.filter((id) => id !== 'vacTravel'),
      vacationTravel: null,
    }
    setGame(next)
    persist(next)
  }

  const applyClubSemesterBenefit = (
    draft: GameState,
    base: GameState,
  ): { next: GameState; notice?: { title: string; text: string; lines: string[] } } => {
    if (base.week !== 3) return { next: draft }
    if (base.clubLastBenefitSeason === base.season.id) return { next: draft }
    const memberships = base.clubMemberships ?? []
    if (memberships.length === 0) return { next: draft }
    const penalty = memberships.length === 2 ? 0.8 : 1
    let next = { ...draft, clubLastBenefitSeason: base.season.id }
    const lines: string[] = []
    for (const membership of memberships) {
      if (
        membership.semesterActivities <= 0 &&
        membership.role !== 'honorary'
      ) {
        continue
      }
      const org = ORG_BY_ID[membership.orgId]
      if (!org) continue
      const multiplier = roleBenefitMultiplier(membership.role) * penalty
      const prefix = memberships.length > 1 ? `${org.name}：` : ''
      const round = (value: number) => Math.round(value * multiplier)
      next = {
        ...next,
        stress: Math.max(0, Math.min(100, next.stress + round(org.benefit.stress ?? 0))),
        energy: Math.max(0, Math.min(100, next.energy + round(org.benefit.energy ?? 0))),
        composite: Math.max(0, next.composite + round(org.benefit.composite ?? 0)),
        socialGrowth: Math.max(0, next.socialGrowth + round(org.benefit.socialGrowth ?? 0)),
        englishGrowth: Math.max(0, next.englishGrowth + round(org.benefit.english ?? 0)),
      }
      if (org.benefit.stress) lines.push(`${prefix}压力 ${round(org.benefit.stress)}`)
      if (org.benefit.energy) lines.push(`${prefix}精力 +${round(org.benefit.energy)}`)
      if (org.benefit.composite) lines.push(`${prefix}综测 +${round(org.benefit.composite)}`)
      if (org.benefit.socialGrowth) lines.push(`${prefix}人际成长 +${round(org.benefit.socialGrowth)}`)
      if (org.benefit.english) lines.push(`${prefix}英语成长 +${round(org.benefit.english)}%`)
      if (org.benefit.allPrep) {
        const prep = { ...next.prep }
        for (const course of base.season.courses) {
          prep[course.id] = Math.min(
            100,
            (prep[course.id] ?? 0) + round(org.benefit.allPrep),
          )
        }
        next = { ...next, prep }
        lines.push(`${prefix}全部课程准备度 +${round(org.benefit.allPrep)}`)
      }
      if (org.benefit.prep) {
        const courses = base.season.courses
        if (courses.length > 0) {
          const course = courses[Math.floor(Math.random() * courses.length)]
          next = {
            ...next,
            prep: {
              ...next.prep,
              [course.id]: Math.min(
                100,
                (next.prep[course.id] ?? 0) + round(org.benefit.prep),
              ),
            },
          }
          lines.push(`${prefix}《${course.name}》准备度 +${round(org.benefit.prep)}`)
        }
      }
      if (membership.memberIds.length > 0) {
        const relation = base.relationships.find(
          (item) =>
            item.id ===
            membership.memberIds[
              Math.floor(Math.random() * membership.memberIds.length)
            ],
        )
        if (relation) {
          const gain = adjustIntimacyDelta(
            base,
            relation,
            Math.max(1, Math.round(5 * multiplier)),
          )
          next = {
            ...next,
            relationships: next.relationships.map((item) =>
              item.id === relation.id
                ? { ...item, intimacy: Math.min(100, item.intimacy + gain) }
                : item,
            ),
          }
          lines.push(`${prefix}与${relation.name}亲密度 +${gain}`)
        }
      }
    }
    if (lines.length === 0) return { next: draft }
    const grownNext = carryGrowthState(next)
    return {
      next: grownNext,
      notice: {
        title: '组织学期福利',
        text:
          memberships.length === 2
            ? '同时参与两个组织，本学期每个组织的收益按 80% 结算。'
            : '你所在的社团/学生会发来了这学期的组织福利。',
        lines,
      },
    }
  }

  const endVacationWeek = () => {
    if (!game || !game.vacation || !game.player || game.selected.length !== 2) return
    const player = game.player
    const habits = (game.habits ?? [])
      .map((id) => HABIT_BY_ID[id])
      .filter(Boolean)
    const habitApplied = habits.length > 0 && game.stress <= 60

    let energy = game.energy
    let stress = game.stress
    let money = game.money
    let english = game.english
    let englishGrowth = game.englishGrowth
    let composite = game.composite
    let research = game.research
    let researchProgress = game.researchProgress
    let constitutionGrowth = game.constitutionGrowth
    let appearanceGrowth = game.appearanceGrowth
    let socialGrowth = game.socialGrowth
    const attrs = { ...player.attrs }

    for (const id of game.selected) {
      const action = VACATION_ACTION_BY_ID[id]
      if (!action) continue
      if (action.id === 'vacTravel' && game.vacationTravel?.committed) {
        continue
      }
      energy += effectiveEnergyCost(action.energy, game.energy)
      stress += action.stress
      if (action.id === 'vacTravel' && game.vacationTravel) {
        money -= game.vacationTravel.cost
      } else {
        money += action.money
      }
      englishGrowth += action.english ?? 0
      composite += action.composite ?? 0
      research += action.research ?? 0
      if (
        action.id === 'vacLab' &&
        game.researchStarted &&
        !game.researchPublished
      ) {
        researchProgress = clamp(researchProgress + 5, 0, 100)
      }
      if (action.growth === 'constitution') {
        constitutionGrowth += action.growthAmount ?? 0
      }
      if (action.growth === 'social') {
        socialGrowth += action.growthAmount ?? 0
      }
    }

    // 假期不触发习惯收益。
    const vacationHabitApplied = false

    energy = clamp(energy + 15, 0, 100)
    stress = clamp(stress, 0, 100)
    // 假期在家，不扣本学期每日固定生活费

    const grown = growAttributes(attrs, constitutionGrowth, appearanceGrowth, socialGrowth, game.comprehensionGrowth, english, englishGrowth)
    const log = buildVacationLog(game, { energy, stress, money, habitApplied: vacationHabitApplied })
    const isLastWeek = game.vacation.week >= game.vacation.totalWeeks
    const vacationPublished =
      game.researchStarted &&
      !game.researchPublished &&
      researchProgress >= 100
    const vacationJournal = vacationPublished
      ? game.mentorProfileId && MENTOR_BY_ID[game.mentorProfileId]
        ? MENTOR_BY_ID[game.mentorProfileId].journals[
            Math.floor(
              Math.random() * MENTOR_BY_ID[game.mentorProfileId].journals.length,
            )
          ] ?? '待定期刊'
        : '待定期刊'
      : game.researchJournal
    if (vacationPublished) {
      openPublicationNotice(
        vacationJournal ?? '待定期刊',
        pickPublicationAcceptanceText(),
      )
    }
    const base: GameState = {
      ...game,
      player: { ...player, attrs: grown.attrs },
      relationships: applyMissedBirthdayPenalties({
        ...game,
        relationships: applyFriendContactDecay(game, progressWeek(game)),
      }),
      energy,
      stress,
      money,
      english: grown.english,
      englishGrowth: grown.englishGrowth,
      composite,
      research,
      researchProgress,
      researchPublished: game.researchPublished || vacationPublished,
      researchJournal: vacationJournal,
      publishedPapers:
        game.publishedPapers + (vacationPublished ? 1 : 0),
      awaitingNextProject:
        game.awaitingNextProject || vacationPublished,
      constitutionGrowth: grown.constitutionGrowth,
      appearanceGrowth: grown.appearanceGrowth,
      socialGrowth: grown.socialGrowth,
      selected: [],
      actionsUsed: 0,
      vacationTravel: null,
      vacationTravelInvites: null,
      logs: [...game.logs, log],
    }

    const travelPlan = game.vacationTravel
    const travelCompanions =
      travelPlan && game.selected.includes('vacTravel')
        ? travelPlan.companionIds
            .map((id) => game.relationships.find((relation) => relation.id === id))
            .filter(Boolean)
        : []
    if (travelCompanions.length > 0) {
      let eventCount = 1
      if (Math.random() < 0.5) eventCount = 2
      if (eventCount === 2 && Math.random() < 0.25) eventCount = 3
      const items = Array.from({ length: eventCount }, () => {
        const companion =
          travelCompanions[
            Math.floor(Math.random() * travelCompanions.length)
          ]!
        return {
          event: pickTravelEvent(),
          companionId: companion.id,
          companionName: companion.name,
          intimacyMultiplier: intimacyMultiplier(game, companion),
        }
      })
      showTravelEvents({
        items,
        onResolve: (item, option) => {
          setGame((previous) => {
            if (!previous) return previous
            const effects = option.effects
            const updated: GameState = {
              ...previous,
              money: Math.max(0, previous.money + (effects.money ?? 0)),
              energy: Math.max(
                0,
                Math.min(100, previous.energy + (effects.energy ?? 0)),
              ),
              stress: Math.max(
                0,
                Math.min(100, previous.stress + (effects.stress ?? 0)),
              ),
              relationships: previous.relationships.map((relation) =>
                relation.id === item.companionId
                  ? {
                      ...relation,
                      intimacy: Math.max(
                        0,
                        Math.min(
                          100,
                          relation.intimacy +
                            adjustIntimacyDelta(
                              previous,
                              relation,
                              effects.intimacy ?? 0,
                              { major: true },
                            ),
                        ),
                      ),
                    }
                  : relation,
              ),
            }
            persist(updated)
            return updated
          })
        },
      })
    }

    if (!isLastWeek) {
      commit(
        {
          ...base,
          screen: 'vacation',
          vacation: { ...game.vacation, week: game.vacation.week + 1 },
        },
        'vacation',
      )
      return
    }

    if (game.vacation.kind === 'winter') {
      beginSeason(base, game.seasonIndex + 1)
    } else {
      const finalized = finalizeYear(base)
      commit({ ...finalized, screen: 'yearend', vacation: null }, 'yearend')
    }
  }

  const startClinicalTest = () => {
    beginNewSaveSlot()
    const testState = createClinicalTestState()
    setGame(testState)
    persist(testState)
    setHasSave(true)
    setSaveSlots(listSaveSlots())
    setCrisisKind(null)
    setView('clinical')
  }

  const handleContinueSave = () => {
    let saved = readSave()
    if (!saved) return
    saved = ensureNpcSocial(saved)
    setCrisisKind(null)
    const params = new URLSearchParams(window.location.search)
    if (import.meta.env.DEV && params.get('dev') === 'make-sisters') {
      saved = devRoommatesToSisters(saved)
      persist(saved)
      setHasSave(true)
      window.history.replaceState({}, '', window.location.pathname)
      const firstSister = saved.relationships.find(
        (relation) => relation.kind === 'roommate',
      )
      if (firstSister) {
        setChatFocus({
          relationshipId: firstSister.id,
          token: Date.now(),
          promptNickname: true,
        })
      }
      setGame(saved)
      setView('week')
      return
    }
    // 旧存档进入大四/大五时，直接切到新的临床轮转界面。
    if (
      isClinicalSeason(saved.seasonIndex) &&
      (saved.screen === 'week' || saved.screen === 'prep')
    ) {
      saved = {
        ...saved,
        screen: 'clinical',
        clinical: saved.clinical ?? createClinicalState(saved.season.courses),
      }
      persist(saved)
    }
    setGame(saved)
    setView(
      saved.screen === 'title' || saved.screen === 'randomEvent'
        ? 'week'
        : saved.screen,
    )
  }


  const handleDeleteSlot = (slotId: string) => {
    deleteSaveSlot(slotId)
    const slots = listSaveSlots()
    setSaveSlots(slots)
    setHasSave(slots.length > 0)
  }

  const handleLoadSlot = (slotId: string) => {
    activateSaveSlot(slotId)
    handleContinueSave()
  }

  const handleRestart = () => {
    beginNewSaveSlot()
    setCrisisKind(null)
    setGame(null)
    setView('create')
  }

  const mentorProfileOf = (mentorId: string | null | undefined) =>
    mentorId ? MENTOR_BY_ID[mentorId] ?? null : null

  const mentorRelationOf = (source: GameState) =>
    source.relationships.find((relation) => relation.kind === 'mentor') ?? null

  const canComposeMentorMail = (mentorId: string): string | null => {
    if (!game) return '现在还不能写邮件。'
    if (game.researchStage !== 1) return '你已经进入导师联系流程。'
    if (game.medicalFamilyMentorId) return '医学世家已经为你联系了导师，等导师的邮件即可。'
    if (game.mentorApplication) return '上一封自荐信还在等待回复。'
    if (game.mailSentWeekKey === currentWeekKey(game)) return '本周已经给导师发过一封邮件了。'
    if (game.failedMentorIds.includes(mentorId)) return '这位导师已经拒绝过你的申请。'
    if (!MENTOR_BY_ID[mentorId]) return '找不到这位导师。'
    return null
  }

  const composeMentorMail = (mentorId: string): { draft: GameEmail | null; error: string | null } => {
    const error = canComposeMentorMail(mentorId)
    if (error) return { draft: null, error }
    if (!game) return { draft: null, error: '现在还不能写邮件。' }
    const mentor = MENTOR_BY_ID[mentorId]
    if (!mentor) return { draft: null, error: '找不到这位导师。' }
    return {
      draft: createApplicationEmail(game, mentor),
      error: null,
    }
  }

  const sendMentorMail = (draft: GameEmail): { ok: boolean; error?: string } => {
    if (!game || !draft.mentorId) return { ok: false, error: '邮件发送失败。' }
    const error = canComposeMentorMail(draft.mentorId)
    if (error) return { ok: false, error }
    const replyKind = rollMentorReply(game)
    const nowAbs = absoluteSlot(game)
    const replyAtAbs =
      replyKind === 'none' ? null : chooseFreeSlotAfter(game, nowAbs)
    const sentEmail: GameEmail = {
      ...draft,
      sentAtAbs: nowAbs,
      timeLabel: currentMailTimeLabel(game),
      read: true,
    }
    const application: MentorApplication = {
      mentorId: draft.mentorId,
      sentAtAbs: nowAbs,
      sentWeekKey: currentWeekKey(game),
      replyKind,
      replyAtAbs,
      replyEmailId: null,
      noReplyWeekKey:
        replyKind === 'none'
          ? nextNormalWeekKey(game) ?? currentWeekKey(game)
          : null,
    }
    const next: GameState = {
      ...game,
      emails: [...game.emails, sentEmail],
      mentorApplication: application,
      mailSentWeekKey: currentWeekKey(game),
    }
    setGame(next)
    persist(next)
    return { ok: true }
  }

  const withMentorRelationship = (
    source: GameState,
    mentor: MentorProfile,
  ): GameState => {
    if (!source.player) return source
    if (source.relationships.some((relation) => relation.kind === 'mentor')) {
      return source
    }
    return {
      ...source,
      relationships: [
        ...source.relationships,
        createMentorRelationship(mentor, source.player),
      ],
    }
  }

  const withResearchSeniors = (
    source: GameState,
    mentor: MentorProfile,
  ): GameState => {
    if (source.seniorsGenerated || !source.player) return source
    const seniors = Array.from({ length: 3 }, () =>
      createSeniorRelationship(source.player!, mentor.alias),
    )
    return {
      ...source,
      relationships: [...source.relationships, ...seniors],
      seniorsGenerated: true,
    }
  }

  const makeMentorInterview = (
    source: GameState,
    mentorId: string,
    fromAbs = absoluteSlot(source) + 1,
  ): MentorInterview => {
    const atAbs = chooseFreeSlotAfter(source, fromAbs)
    const decoded = decodeAbs(atAbs)
    return {
      mentorId,
      atAbs,
      seasonIndex: decoded.seasonIndex,
      week: decoded.week,
      weekSlot: decoded.weekSlot,
      label: formatAbsTime(source, atAbs),
      rescheduled: false,
      prompted: false,
    }
  }

  const beginMentorInterview = (interview: MentorInterview) => {
    if (!game) return
    const mentor = mentorProfileOf(interview.mentorId)
    if (!mentor) return
    const chance = interviewSuccessChance(game)
    const success = Math.random() < chance
    setMentorInterviewScene({
      interview,
      mentorName: mentor.alias,
      success,
      chance,
    })
  }

  const confirmMentorInterview = () => {
    if (!game || !mentorInterviewScene) return
    const { interview, success, chance } = mentorInterviewScene
    const mentor = mentorProfileOf(interview.mentorId)
    if (!mentor) return
    const record = {
      mentorId: interview.mentorId,
      seasonIndex: interview.seasonIndex,
      week: interview.week,
      weekSlot: interview.weekSlot,
      label: interview.label,
      success,
    }
    let next: GameState = {
      ...game,
      mentorInterview: null,
      mentorInterviewHistory: [...game.mentorInterviewHistory, record],
      mentorApplication: null,
    }
    if (success) {
      next = withMentorRelationship(
        {
          ...next,
          researchStage: 4,
          mentorContactUnlocked: true,
          mentorProfileId: mentor.id,
          welcomeMailSent: true,
        },
        mentor,
      )
      const welcome = createWelcomeEmail(next, mentor)
      next = { ...next, emails: [...next.emails, welcome] }
    } else {
      next = {
        ...next,
        researchStage: 1,
        mentorContactUnlocked: false,
        mentorProfileId: null,
        failedMentorIds: [...new Set([...next.failedMentorIds, mentor.id])],
        welcomeMailSent: false,
        seniorsGenerated: false,
      }
    }
    setMentorInterviewScene(null)
    finishWeekSlot(next, 'mentorInterview')
  }

  const acceptMentorProject = (emailId: string) => {
    const current = gameRef.current ?? game
    if (!current) return
    const email = current.emails.find(
      (item) =>
        item.id === emailId &&
        item.direction === 'inbox' &&
        item.kind === 'projectOffer',
    )
    if (!email || !email.project || current.researchStage < 5) return
    const next: GameState = {
      ...current,
      researchStage: 6,
      researchStarted: true,
      researchProgress: 0,
      activeHypothesisId: email.project.hypothesisId,
      activeHypothesisTitle: email.project.title,
      lastResearchWeek: absoluteWeek(current),
      lastResearchWarningWeek: absoluteWeek(current),
      researchPublished: false,
      researchJournal: null,
      awaitingNextProject: false,
      emails: current.emails.map((item) =>
        item.id === emailId
          ? { ...item, read: true, projectDecision: 'accepted' }
          : item,
      ),
    }
    commitTaState(next, current)
    showResearchNotice({
      kind: 'mentor',
      title: '课题开始',
      text: `你回复了${MENTOR_BY_ID[email.mentorId ?? '']?.alias ?? '导师'}老师：愿意接这个课题。\n\n从今天起，你的科研进度开始从 0 累积。组会、文献、实验和返修，都会变成具体数字。`,
      ruleText: '阶段6 · 科学研究',
      ruleLabel: '课题已接受',
    })
  }

  const declineMentorProject = (emailId: string) => {
    const current = gameRef.current ?? game
    if (!current) return
    const email = current.emails.find(
      (item) =>
        item.id === emailId &&
        item.direction === 'inbox' &&
        item.kind === 'projectOffer',
    )
    if (!email || email.projectDecision) return
    const next: GameState = {
      ...current,
      projectOfferMailSent: false,
      projectOfferPendingAtAbs: absoluteSlot(current) + 21,
      emails: current.emails.map((item) =>
        item.id === emailId
          ? { ...item, read: true, projectDecision: 'declined' as const }
          : item,
      ),
    }
    commitTaState(next, current)
    showResearchNotice({
      kind: 'mentor',
      title: '暂时没有接课题',
      text: '你告诉导师自己还没有准备好。导师没有多说什么，只让你继续在实验室里做基础工作。下周会重新考虑新的题目。',
      ruleText: '实验准备度保留 · 一周后可能收到新课题',
      ruleLabel: '课题邀请',
    })
  }

  const submitLiteratureReport = (): GameEmail | null => {
    const current = gameRef.current ?? game
    if (!current || !current.player) return null
    if (current.labEntered || !current.mentorContactUnlocked) return null
    const mentor = mentorProfileOf(current.mentorProfileId)
    if (!mentor) return null
    if (current.pendingLiteratureReport) return null
    const sessions =
      current.literatureStudyCount +
      current.selected.filter((id) => id === 'research').length
    if (sessions < 2) return null
    if (current.literatureReportWeekKey === currentWeekKey(current)) return null
    return {
      ...createLiteratureReportEmail(current, mentor, pickLiteratureReportText()),
      sentAtAbs: absoluteSlot(current),
      timeLabel: currentMailTimeLabel(current),
    }
  }

  const sendLiteratureReportDraft = (
    draft: GameEmail,
  ): { ok: boolean; error?: string } => {
    const current = gameRef.current ?? game
    if (!current || !current.player) return { ok: false, error: '现在还不能发送汇报。' }
    if (draft.kind !== 'literatureReport') return { ok: false, error: '这不是文献汇报。' }
    if (current.labEntered) return { ok: false, error: '你已经在实验室学习了。' }
    const mentor = mentorProfileOf(current.mentorProfileId)
    if (!mentor) return { ok: false, error: '还没有可以汇报的导师。' }
    if (current.pendingLiteratureReport) return { ok: false, error: '上一封汇报还在等待回复。' }
    const sessions =
      current.literatureStudyCount +
      current.selected.filter((id) => id === 'research').length
    if (sessions < 2) return { ok: false, error: '本周文献学习还不够两个时段。' }
    if (current.literatureReportWeekKey === currentWeekKey(current)) {
      return { ok: false, error: '本周已经汇报过了。' }
    }
    const nowAbs = absoluteSlot(current)
    const replyAtAbs = nowAbs + (1 + Math.floor(Math.random() * 3)) * 3
    const next: GameState = {
      ...current,
      emails: [
        ...current.emails,
        { ...draft, sentAtAbs: nowAbs, timeLabel: currentMailTimeLabel(current), read: true },
      ],
      literatureReportWeekKey: currentWeekKey(current),
      pendingLiteratureReport: { mentorId: mentor.id, replyAtAbs },
    }
    commitTaState(next, current)
    return { ok: true }
  }

  const readMentorEmail = (emailId: string) => {
    if (!game) return
    const email = game.emails.find((item) => item.id === emailId)
    if (!email || email.direction !== 'inbox' || email.read) return
    const mentor = mentorProfileOf(email.mentorId)
    let next: GameState = {
      ...game,
      emails: game.emails.map((item) =>
        item.id === emailId ? { ...item, read: true } : item,
      ),
    }
    let notice: { title: string; text: string; ruleText?: string } | null = null

    if (email.kind === 'positiveReply' && mentor) {
      if (game.researchStage === 1) {
        let interview = email.interview ?? makeMentorInterview(next, mentor.id)
        if (interview && absoluteSlot(next) >= interview.atAbs) {
          const replacement = makeMentorInterview(
            next,
            mentor.id,
            absoluteSlot(next) + 1,
          )
          interview = {
            ...replacement,
            rescheduled: true,
          }
          next = {
            ...next,
            emails: next.emails.map((item) =>
              item.id === email.id
                ? {
                    ...item,
                    interview,
                    body: item.body.replace(
                      email.interview?.label ?? '',
                      interview.label,
                    ),
                  }
                : item,
            ),
          }
        }
        next = {
          ...next,
          researchStage: 2,
          mentorContactUnlocked: true,
          mentorProfileId: mentor.id,
          mentorApplication: null,
          mentorInterview: interview,
        }
        notice = {
          title: '导师回复了',
          text: `${mentor.alias}老师同意和你聊一聊。面谈时间写在邮件里，去邮箱确认一下。`,
          ruleText: '阶段2 · 已联系上导师',
        }
      }
    } else if (email.kind === 'negativeReply' && mentor) {
      next = {
        ...next,
        mentorApplication: null,
        mentorProfileId: null,
        mentorContactUnlocked: false,
        failedMentorIds: [...new Set([...next.failedMentorIds, mentor.id])],
      }
      notice = {
        title: '导师婉拒了',
        text: `${mentor.alias}老师回复了一封礼貌的拒绝信。你仍然停留在阶段1，可以留意其他导师。`,
        ruleText: '阶段1 · 未联系导师',
      }
    } else if (
      (email.kind === 'welcome' || email.kind === 'medicalAcceptance') &&
      mentor
    ) {
      next = withMentorRelationship(
        {
          ...next,
          researchStage: 4,
          mentorContactUnlocked: true,
          mentorProfileId: mentor.id,
          mentorApplication: null,
          welcomeMailSent: true,
        },
        mentor,
      )
      const beforeIds = new Set(next.relationships.map((relation) => relation.id))
      next = withResearchSeniors(next, mentor)
      const newSeniors = next.relationships.filter(
        (relation) => relation.kind === 'senior' && !beforeIds.has(relation.id),
      )
      notice = {
        title: '欢迎加入课题组',
        text: `你被拉进了一个名为「${mentor.alias}课题组」的微信群。\n\n${newSeniors
          .map((senior) => `${senior.name}：欢迎欢迎！`)
          .join('\n')}\n\n导师在群里发了一句：“以后多带带新同学。”然后 @ 了你。`,
        ruleText: '阶段4 · 正式加入课题组',
      }
    } else if (email.kind === 'labAccess') {
      const pendingAt = nextGameDayStartAbs(next)
      next = {
        ...next,
        labAccessPendingAtAbs: pendingAt,
      }
      notice = {
        title: '实验室门禁已开通',
        text: `导师回复了实验室门禁和安全培训的安排。从下一个游戏日开始，你可以进入实验室学习。`,
        ruleText: `阶段5 将于 ${formatAbsTime(next, pendingAt)} 开始`,
      }
    } else if (email.kind === 'projectOffer') {
      notice = {
        title: '导师发来课题邀请',
        text: '导师把课题发到了你的邮箱。读完邮件后，你可以在邮件里直接接受课题。',
        ruleText: '阶段5 · 等待接受课题',
      }
    } else if (email.kind === 'literatureReply' && mentor) {
      next = {
        ...next,
        researchPreparation: Math.min(100, next.researchPreparation + 5),
      }
      notice = {
        title: '导师回复了文献汇报',
        text: `${mentor.alias}老师读完了你的本周汇报，并在邮件里回答了你的问题。科研准备度 +5%。`,
        ruleText: '科研准备度 +5% · 继续积累，准备进入实验室',
      }
    }

    setGame(next)
    persist(next)
    if (notice) {
      showResearchNotice({
        kind: 'mentor',
        title: notice.title,
        text: notice.text,
        ruleText: notice.ruleText,
        ruleLabel: '科研邮件',
      })
    }
  }

  // 认识满四年的羁绊关系，触发唯一“四年纪念”里程碑。
  useEffect(() => {
    if (!game) return
    const relation = game.relationships.find(
      (item) =>
        (item.partner || item.bondType) &&
        !item.bondFiveYearDone &&
        item.intimacy >= 90 &&
        progressWeek(game) - (item.metAbsWeek ?? 0) >= 64,
    )
    if (!relation) return
    const next: GameState = {
      ...game,
      relationships: game.relationships.map((item) =>
        item.id === relation.id
          ? { ...item, intimacy: 100, bondFiveYearDone: true }
          : item,
      ),
    }
    setGame(next)
    persist(next)
    showResearchNotice({
      kind: 'family',
      title: '四年纪念',
      text: `你和${relation.name}已经认识四年了。你们没有把这一天过得很隆重，只是很自然地待在一起。亲密度达到了 100。`,
      ruleText: '唯一关系里程碑 · 亲密度 100',
      ruleLabel: '四年纪念',
    })
  }, [game, view])

  // 文献汇报发出后 1–3 个自然日收到导师回复。
  useEffect(() => {
    if (!game?.pendingLiteratureReport) return
    const pending = game.pendingLiteratureReport
    if (absoluteSlot(game) < pending.replyAtAbs) return
    const mentor = mentorProfileOf(pending.mentorId)
    if (!mentor) {
      const next = { ...game, pendingLiteratureReport: null }
      setGame(next)
      persist(next)
      return
    }
    const reply = {
      ...createLiteratureReplyEmail(
        game,
        mentor,
        pickLiteratureReplyText(),
      ),
      sentAtAbs: absoluteSlot(game),
      timeLabel: currentMailTimeLabel(game),
    }
    const next: GameState = {
      ...game,
      pendingLiteratureReport: null,
      emails: [...game.emails, reply],
    }
    setGame(next)
    persist(next)
  }, [game, view])

  // 邮件投递、拒信提醒、阶段5/6的自动推进。
  useEffect(() => {
    if (!game) return
    let next = game
    let changed = false
    let stage5Started = false
    const nowAbs = absoluteSlot(game)

    if (
      next.medicalFamilyAcceptanceAtAbs !== null &&
      nowAbs >= next.medicalFamilyAcceptanceAtAbs
    ) {
      const mentor = mentorProfileOf(next.medicalFamilyMentorId)
      if (mentor) {
        next = {
          ...next,
          emails: [
            ...next.emails,
            createMedicalFamilyAcceptance(next, mentor),
          ],
          medicalFamilyAcceptanceAtAbs: null,
        }
        changed = true
      }
    }

    const application = next.mentorApplication
    if (
      application &&
      application.replyKind !== null &&
      application.replyKind !== 'none' &&
      application.replyAtAbs !== null &&
      application.replyEmailId === null &&
      nowAbs >= application.replyAtAbs
    ) {
      const mentor = mentorProfileOf(application.mentorId)
      if (mentor) {
        let email: GameEmail
        if (application.replyKind === 'positive') {
          const interview = makeMentorInterview(next, mentor.id, nowAbs + 1)
          email = createReplyEmail(next, mentor, 'positive', interview)
        } else {
          email = createReplyEmail(next, mentor, 'negative')
        }
        next = {
          ...next,
          emails: [...next.emails, email],
          mentorApplication: {
            ...application,
            replyEmailId: email.id,
          },
        }
        changed = true
      }
    }

    let noReplyName: string | null = null
    if (
      next.mentorApplication?.replyKind === 'none' &&
      next.mentorApplication.noReplyWeekKey === currentWeekKey(next)
    ) {
      noReplyName =
        mentorProfileOf(next.mentorApplication.mentorId)?.alias ?? '导师'
      next = { ...next, mentorApplication: null }
      changed = true
    }

    const mentorProfile = mentorProfileOf(next.mentorProfileId)
    const mentorRelation = mentorRelationOf(next)
    if (
      mentorProfile &&
      mentorRelation &&
      next.researchStage === 4 &&
      !next.labAccessMailSent &&
      next.researchPreparation >= 100
    ) {
      next = {
        ...next,
        emails: [...next.emails, createLabAccessEmail(next, mentorProfile)],
        labAccessMailSent: true,
        projectOfferPendingAtAbs: nextGameDayStartAbs(next),
      }
      changed = true
    }

    if (
      next.labAccessPendingAtAbs !== null &&
      nowAbs >= next.labAccessPendingAtAbs &&
      next.researchPreparation >= 100
    ) {
      next = {
        ...next,
        researchStage: 5,
        labEntered: true,
        experimentPreparation: 0,
        labAccessPendingAtAbs: null,
      }
      stage5Started = true
      changed = true
    }

    if (
      mentorProfile &&
      mentorRelation &&
      next.researchStage >= 5 &&
      !next.projectOfferMailSent &&
      !next.awaitingNextProject &&
      !next.researchPublished &&
      next.experimentPreparation >= 100 &&
      (next.projectOfferPendingAtAbs === null || nowAbs >= next.projectOfferPendingAtAbs)
    ) {
      const hypothesis = pickHypothesis(mentorProfile.id)
      if (hypothesis) {
        next = {
          ...next,
          emails: [
            ...next.emails,
            createProjectOfferEmail(next, mentorProfile, hypothesis),
          ],
          projectOfferMailSent: true,
          projectOfferPendingAtAbs: null,
        }
        changed = true
      }
    }

    if (changed) {
      setGame(next)
      persist(next)
    }
    if (stage5Started) {
      showResearchNotice({
        kind: 'mentor',
        title: '实验室门禁已经生效',
        text: '第二天，你刷卡进入实验室。门禁灯变绿的那一下，你终于觉得自己不只是“来旁听”的人了。接下来的阶段是熟悉实验室、跟着师兄师姐学习，但真正的科研进度要等导师正式分配课题后才开始。',
        ruleText: '阶段5 · 允许进入实验室学习',
        ruleLabel: '科研阶段推进',
      })
    }
    if (noReplyName) {
      showResearchNotice({
        kind: 'mentor',
        title: '导师一直没有回复',
        text: `${noReplyName}老师这周似乎忘记了回复你的邮件。邮箱里没有新的回信。你可以等下一周再联系其他导师。`,
        ruleText: '本周没有收到回复 · 可继续联系其他导师',
        ruleLabel: '邮箱提醒',
      })
    }
  }, [game, view])

  // 面谈时间到达：自动改约一次，然后在当前时间段弹出赴约提示。
  useEffect(() => {
    if (
      !game ||
      !game.mentorInterview ||
      (game.researchStage !== 2 && game.researchStage !== 3)
    ) {
      return
    }
    const interview = game.mentorInterview
    const nowAbs = absoluteSlot(game)
    if (nowAbs < interview.atAbs) return
    if (nowAbs > interview.atAbs && !interview.rescheduled) {
      const replacement = makeMentorInterview(game, interview.mentorId, nowAbs + 1)
      setGame({
        ...game,
        mentorInterview: {
          ...replacement,
          rescheduled: true,
        },
      })
      persist({
        ...game,
        mentorInterview: {
          ...replacement,
          rescheduled: true,
        },
      })
      return
    }
    if (interview.prompted) return
    const mentor = mentorProfileOf(interview.mentorId)
    if (!mentor) return
    const prompted = { ...interview, prompted: true }
    const staged: GameState = {
      ...game,
      researchStage: 3,
      mentorInterview: prompted,
    }
    setGame(staged)
    persist(staged)
    showResearchNotice({
      kind: 'mentor',
      title: '该去面谈了',
      text: `${mentor.alias}老师在办公室等你。面谈会占用当前整个时间段。\n\n地点：${mentor.department}。`,
      ruleText: `面谈时间：${interview.label}`,
      ruleLabel: '阶段3 · 与导师面谈',
      choices: [
        {
          label: '去面谈',
          primary: true,
          onClick: () => beginMentorInterview(prompted),
        },
      ],
    })
  }, [game, view])

  if (view === 'title') {
    return (
      <TitleScreen
        hasSave={hasSave}
        saveSlots={saveSlots}
        onStart={startCreate}
        onContinue={handleContinueSave}
        onLoadSlot={handleLoadSlot}
        onDeleteSlot={handleDeleteSlot}
        onTestClinical={startClinicalTest}
      />
    )
  }

  if (view === 'create') {
    return <CreateScreen onBack={goTitle} onConfirm={handleCreate} />
  }

  if (!game || !game.player) {
    return (
      <TitleScreen
        hasSave={hasSave}
        saveSlots={saveSlots}
        onStart={startCreate}
        onContinue={handleContinueSave}
        onLoadSlot={handleLoadSlot}
        onDeleteSlot={handleDeleteSlot}
        onTestClinical={startClinicalTest}
      />
    )
  }

  if (view === 'crisis' && crisisKind) {
    return (
      <CrisisScreen
        state={game}
        kind={crisisKind}
        onDismiss={() => {
          setCrisisKind(null)
          setView(crisisReturn)
        }}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'talentSelect') {
    return (
      <TalentSelectScreen
        state={game}
        onConfirm={handleOpeningTalent}
        onBack={goTitle}
      />
    )
  }

  if (view === 'talentEvent') {
    return (
      <OpeningTalentEventScreen
        state={game}
        onContinue={handleTalentEventContinue}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'whoami') {
    return (
      <WhoAmIScreen
        state={game}
        onMain={returnToMain}
        onTA={openWhoIs}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'whois') {
    return (
      <WhoIsTAScreen
        state={game}
        onPat={patRelation}
        onAutoPat={autoPatTopRelations}
        onConfess={confessRelation}
        onEstablishBond={establishFriendBond}
        onBondEstablished={openBondChat}
        onViewRelation={markRelationSeen}
        onMarkAllSeen={markAllRelationsSeen}
        onBirthdayGift={giveBirthdayGift}
        onBirthdayBlessing={giveBirthdayBlessing}
        onMain={returnToMain}
        onWho={() => setView('whoami')}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'clubRecruitment') {
    const isApplication = game.clubActivityPlan?.mode === 'application'
    return (
      <ClubRecruitment
        mode={isApplication ? 'application' : 'initial'}
        hasExistingClub={game.clubMemberships.length > 0}
        onSubmit={
          isApplication ? handleClubApplicationSubmit : handleInitialClubSubmit
        }
        onSkip={handleClubRecruitmentSkip}
        onTitle={
          clubRecruitmentMode === 'application'
            ? handleClubRecruitmentTitle
            : goTitle
        }
      />
    )
  }

  if (view === 'cetEvent') {
    return (
      <CetEventScreen
        state={game}
        onRegister={(kind) => (kind === 'cet4' ? handleCetRegister4() : handleCetRegister6())}
        onSkip={handleCetSkip}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'cetResult') {
    return (
      <CetResultScreen
        state={game}
        nextLabel={game.season.seasonLabel}
        onContinue={handleCetResultContinue}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'scholarship') {
    const record = game.yearRecords[game.yearRecords.length - 1]
    return (
      <ScholarshipScreen
        state={game}
        record={record}
        onContinue={handleScholarshipContinue}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'route') {
    return (
      <RouteScreen
        state={game}
        onChoose={handleRouteChoice}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'baoyanResult') {
    return (
      <BaoyanResultScreen
        state={game}
        onContinue={handleBaoyanContinue}
        onKaoyan={handleKaoyanRegister}
        onEmployment={handleBaoyanEmployment}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'kaoyanExam') {
    return (
      <KaoyanExamScreen state={game} onContinue={handleKaoyanExamContinue} onTitle={goTitle} />
    )
  }

  if (view === 'kaoyanResult') {
    return (
      <KaoyanResultScreen
        state={game}
        onContinue={handleKaoyanResultContinue}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'graduation') {
    return (
      <GraduationScoreScreen
        state={game}
        onRestart={handleRestart}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'plan') {
    const pendingPeCourse = game.pendingPeCourseId
      ? ELECTIVE_COURSE_BY_ID[game.pendingPeCourseId]
      : undefined
    const planCourses =
      pendingPeCourse &&
      !game.season.courses.some((course) => course.id === pendingPeCourse.id)
        ? [...game.season.courses, pendingPeCourse]
        : game.season.courses
    return (
      <PlanScreen
        player={game.player}
        seasonLabel={game.season.seasonLabel}
        initialPlan={game.plan}
        initialHabits={game.habits}
        courses={planCourses}
        state={game}
        onConfirmElectives={confirmElectives}
        onBack={() => setView('create')}
        onConfirm={handlePlan}
        onWho={openWhoAmI}
        onTA={openWhoIs}
      />
    )
  }

  if (view === 'clinical' && game && game.clinical?.mode === 'evening') {
    return (
      <>
        <WeekScreen
          state={game}
          eveningMode
          onEveningEnd={() => {
            const current = gameRef.current ?? game
            if (!current) return
            const next = finishClinicalEvening(current)
            setGame(next)
            persist(next)
          }}
          onToggleAction={toggleAction}
          onEndWeek={endWeek}
          onAttendCourse={attendCurrentCourse}
          onSkipResolved={resolveSkipCourse}
          onSlotAction={performWeekSlotAction}
          onSleepIn={sleepInCurrentSlot}
          onDrinkCoffee={drinkCoffee}
          onDailySelfCare={dailySelfCare}
          onSoloAttempt={recordSoloAttempt}
          onResolveSoloDate={resolveSoloDate}
          onSlotLibraryFocus={performSlotLibrary}
          onSlotDinner={performSlotDinner}
          onSlotClubActivity={performSlotClubActivity}
          onAttendClubActivity={attendClubActivity}
          onLeaveClubActivity={leaveClubActivity}
          onChooseFocus={chooseWeekFocus}
          onWithdrawElective={withdrawElective}
          onOpenWhoAmI={openWhoAmI}
          onOpenTA={openWhoIs}
          onArrangeDinner={arrangeDinner}
          onSaveDinnerResults={saveDinnerResults}
          onApplyClub={startClubApplication}
          onArrangeClubActivity={arrangeClubActivity}
          onRecordClubProjectPhase={recordClubProjectPhase}
          onRecordClubProjectEvent={recordClubProjectEvent}
          onAttendDebatePractice={attendDebatePractice}
          onLiteratureReport={submitLiteratureReport}
          onSendLiteratureReport={sendLiteratureReportDraft}
          onResolveDebateCupRound={resolveDebateCupRound}
          onSaveClubInvites={saveClubInvites}
          onQuitClub={quitClub}
          onContactLover={contactLover}
          onBreakBond={breakBond}
          onReconcileBond={reconcileBond}
          onNpcConfession={handleNpcConfession}
          onResolveConsumption={resolveConsumption}
          onComposeMentorMail={composeMentorMail}
          onSendMentorMail={sendMentorMail}
          onReadMentorEmail={readMentorEmail}
          onAcceptMentorProject={acceptMentorProject}
          onDeclineMentorProject={declineMentorProject}
          chatFocus={chatFocus}
          onChatFocusConsumed={() => setChatFocus(null)}
          onBondNicknameChange={changeBondNickname}
          onBondNicknameDisplayChange={changeBondNicknameDisplay}
          onAskGossip={askBondGossip}
          onFollowGossipClue={followBondGossipClue}
          onInvestigateNpcClue={investigateNpcClue}
          interviewScene={mentorInterviewScene}
          onConfirmMentorInterview={confirmMentorInterview}
          onTitle={goTitle}
        />
        {game.pendingEvent && (
          <RandomEventModal
            state={game}
            event={game.pendingEvent}
            onContinue={handleRandomEventContinue}
          />
        )}
        {game.pendingHealthEvent && (
          <HealthEventModal state={game} onTreat={treatHealth} />
        )}
      </>
    )
  }

  if (view === 'clinical' && game) {
    return (
      <ClinicalScreen
        state={game}
        onUpdateClinical={updateClinical}
        onFinishSeason={finishClinicalSeason}
        onGameEffect={applyClinicalEffect}
        onTitle={goTitle}
        onOpenWhoAmI={openWhoAmI}
        onOpenTA={openWhoIs}
        onDrinkCoffee={drinkCoffee}
        onEatBreakfast={eatBreakfast}
        onDailySelfCare={dailySelfCare}
        onClinicalEveningAction={performClinicalEveningAction}
      />
    )
  }

  if (view === 'week') {
    return (
      <>
        <WeekScreen
          state={game}
          onToggleAction={toggleAction}
          onEndWeek={endWeek}
          onAttendCourse={attendCurrentCourse}
          onSkipResolved={resolveSkipCourse}
          onSlotAction={performWeekSlotAction}
          onSleepIn={sleepInCurrentSlot}
          onDrinkCoffee={drinkCoffee}
          onDailySelfCare={dailySelfCare}
          onSoloAttempt={recordSoloAttempt}
          onResolveSoloDate={resolveSoloDate}
          onSlotLibraryFocus={performSlotLibrary}
          onSlotDinner={performSlotDinner}
          onSlotClubActivity={performSlotClubActivity}
          onAttendClubActivity={attendClubActivity}
          onLeaveClubActivity={leaveClubActivity}
          onChooseFocus={chooseWeekFocus}
          onWithdrawElective={withdrawElective}
          onOpenWhoAmI={openWhoAmI}
          onOpenTA={openWhoIs}
          onArrangeDinner={arrangeDinner}
          onSaveDinnerResults={saveDinnerResults}
          onApplyClub={startClubApplication}
          onArrangeClubActivity={arrangeClubActivity}
          onRecordClubProjectPhase={recordClubProjectPhase}
          onRecordClubProjectEvent={recordClubProjectEvent}
          onAttendDebatePractice={attendDebatePractice}
          onLiteratureReport={submitLiteratureReport}
          onSendLiteratureReport={sendLiteratureReportDraft}
          onResolveDebateCupRound={resolveDebateCupRound}
          onSaveClubInvites={saveClubInvites}
          onQuitClub={quitClub}
          onContactLover={contactLover}
          onBreakBond={breakBond}
          onReconcileBond={reconcileBond}
          onNpcConfession={handleNpcConfession}
          onResolveConsumption={resolveConsumption}
          onComposeMentorMail={composeMentorMail}
          onSendMentorMail={sendMentorMail}
          onReadMentorEmail={readMentorEmail}
          onAcceptMentorProject={acceptMentorProject}
          onDeclineMentorProject={declineMentorProject}
          chatFocus={chatFocus}
          onChatFocusConsumed={() => setChatFocus(null)}
          onBondNicknameChange={changeBondNickname}
          onBondNicknameDisplayChange={changeBondNicknameDisplay}
          onAskGossip={askBondGossip}
          onFollowGossipClue={followBondGossipClue}
          onInvestigateNpcClue={investigateNpcClue}
          interviewScene={mentorInterviewScene}
          onConfirmMentorInterview={confirmMentorInterview}
          onTitle={goTitle}
        />
        {game.pendingEvent && (
          <RandomEventModal
            state={game}
            event={game.pendingEvent}
            onContinue={handleRandomEventContinue}
          />
        )}
        {game.pendingHealthEvent && (
          <HealthEventModal state={game} onTreat={treatHealth} />
        )}
      </>
    )
  }

  if (view === 'prep') {
    return (
      <PrepScreen
        key={game.season.id}
        state={game}
        onChoose={chooseReview}
        onCoffee={handleCoffee}
        onAllNighter={handleAllNighter}
        onEnglishPrep={handleEnglishPrep}
        onTitle={goTitle}
        onWho={openWhoAmI}
        onTA={openWhoIs}
      />
    )
  }

  if (view === 'result') {
    const failedResults = game.results.filter((result) => result.score < 60)
    const resultKey = `${game.season.id}|${game.results
      .map((result) => `${result.course.id}:${result.score}`)
      .join(',')}`
    const outstandingCredits = Object.values(game.outstandingFails ?? {}).reduce(
      (sum, value) => sum + value,
      0,
    )
    const willExpel = outstandingCredits >= 20
    const acknowledgeFailure = () => {
      setDismissedFailureKey(resultKey)
      if (willExpel) {
        const expulsion = pickExpulsionText()
        commit(
          {
            ...game,
            screen: 'expulsion',
            expulsionText: expulsion.text,
            expulsionCredits: outstandingCredits,
            expulsionCourses: failedResults.map((result) => result.course.name),
          },
          'expulsion',
        )
      }
    }
    return (
      <>
        <ResultScreen
          state={game}
          nextLabel={resultNextLabel(game.seasonIndex)}
          onContinue={handleResultContinue}
          onAbandonElective={abandonElective}
          onTitle={goTitle}
        />
        {failedResults.length > 0 && dismissedFailureKey !== resultKey && (
          <FailureReport
            state={game}
            results={game.results}
            outstandingCredits={outstandingCredits}
            willExpel={willExpel}
            onAcknowledge={acknowledgeFailure}
          />
        )}
      </>
    )
  }

  if (view === 'vacation') {
    return (
      <VacationScreen
        state={game}
        onToggleAction={toggleVacationAction}
        onEndWeek={endVacationWeek}
        onTitle={goTitle}
        onWho={openWhoAmI}
        onTA={openWhoIs}
        onArrangeTravel={arrangeVacationTravel}
        onRemoveTravel={removeVacationTravel}
        onSaveTravelResults={saveVacationTravelResults}
      />
    )
  }

  if (view === 'yearend') {
    const completedYear = yearNumber(game.seasonIndex)
    const nextSeason = SEASONS[game.seasonIndex + 1]
    return (
      <YearEndScreen
        state={game}
        year={completedYear}
        onContinue={nextSeason ? handleYearEndContinue : undefined}
        onRestart={handleRestart}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'expulsion') {
    return (
      <EndingScreen
        state={game}
        eyebrow="ACADEMIC DISMISSAL / 学业终止"
        titleMain="这一局，"
        titleAccent="退学了"
        description={
          game.expulsionText ??
          '累计未通过学分达到了学校的退学线。你的五年，在这里提前结束。'
        }
        tone="danger"
        note={`累计未通过学分：${game.expulsionCredits} 分。${
          game.expulsionCourses.length > 0
            ? `本次涉及课程：${game.expulsionCourses.join('、')}。`
            : ''
        }这不是一次补考，而是学业处理结果。`}
        onRestart={handleRestart}
        onTitle={goTitle}
      />
    )
  }

  if (view === 'stressEnding') {
    return (
      <EndingScreen
        state={game}
        eyebrow={`INCIDENT / PRESSURE ENDING · ${game.stressEndingMethod ?? ''}`}
        titleMain="这一局，"
        titleAccent="停在这里"
        description={game.stressEndingText ?? STRESS_ENDING_TEXT}
        note="如果身边有人正在经历类似的痛苦，请让 TA 去求助。游戏可以重开，人不能。"
        onRestart={handleRestart}
        onTitle={goTitle}
      />
    )
  }

  return (
    <EndingScreen
      state={game}
      description={game.finalNote ?? undefined}
      onRestart={handleRestart}
      onTitle={goTitle}
    />
  )
}

function goDemo(name: DemoName) {
  const url = new URL(window.location.href)
  url.searchParams.set('demo', name)
  window.location.href = url.toString()
}

function DemoWeek() {
  const [state, setState] = useState<GameState>(() => ({
    ...buildDemoState('week'),
    selected: ['library', 'social'],
  }))

  const toggle = (id: string) => {
    setState((prev) => {
      const count = getCount(prev.selected, id)
      if (id === 'library') {
        if (count >= 2) return { ...prev, selected: prev.selected.filter((item) => item !== id) }
        if (prev.selected.length >= 2) return prev
        return { ...prev, selected: [...prev.selected, id] }
      }
      if (count > 0) return { ...prev, selected: prev.selected.filter((item) => item !== id) }
      if (prev.selected.length >= 2) return prev
      return { ...prev, selected: [...prev.selected, id] }
    })
  }

  return (
    <WeekScreen
      state={state}
      onToggleAction={toggle}
      onEndWeek={() => goDemo('prep')}
      onChooseFocus={() => undefined}
      onComposeMentorMail={() => ({ draft: null, error: '演示模式不能发邮件。' })}
      onSendMentorMail={() => ({ ok: false, error: '演示模式不能发邮件。' })}
      onReadMentorEmail={() => undefined}
      onAcceptMentorProject={() => undefined}
      chatFocus={null}
      onChatFocusConsumed={() => undefined}
      onBondNicknameChange={() => undefined}
      onBondNicknameDisplayChange={() => undefined}
      onAskGossip={() => undefined}
      interviewScene={null}
      onConfirmMentorInterview={() => undefined}
      onTitle={() => goDemo('title')}
    />
  )
}

function DemoApp({ screen }: { screen: DemoName }) {
  if (screen === 'title') {
    return (
      <TitleScreen hasSave={false} onStart={() => goDemo('create')} onContinue={() => undefined} />
    )
  }
  if (screen === 'create') {
    return (
      <CreateScreen
        initialPlayer={demoPlayer}
        onBack={() => goDemo('title')}
        onConfirm={() => goDemo('plan')}
      />
    )
  }
  if (screen === 'plan') {
    return (
      <PlanScreen
        player={demoPlayer}
        initialPlan="B"
        initialHabits={["timeManagement", "earlySleep"]}
        courses={SEASONS[0].courses}
        onBack={() => goDemo('create')}
        onConfirm={() => goDemo('week')}
      />
    )
  }
  if (screen === 'week') return <DemoWeek />
  if (screen === 'prep') {
    return (
      <PrepScreen
        state={buildDemoState('prep')}
        initialChoice="mock"
        onChoose={() => goDemo('result')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'result') {
    return (
      <ResultScreen
        state={buildDemoState('result')}
        nextLabel="大一 · 冬"
        onContinue={() => goDemo('vacation')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'cetEvent') {
    return (
      <CetEventScreen
        state={buildDemoState('cetEvent')}
        onRegister={() => goDemo('week')}
        onSkip={() => goDemo('week')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'cetResult') {
    return (
      <CetResultScreen
        state={buildDemoState('cetResult')}
        onContinue={() => goDemo('yearend')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'vacation') {
    return (
      <VacationScreen
        state={buildDemoState('vacation')}
        onToggleAction={() => undefined}
        onEndWeek={() => goDemo('yearend')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  if (screen === 'yearend') {
    return (
      <EndingScreen
        state={buildDemoState('yearend')}
        titleMain="大一学年"
        titleAccent="完"
        description="大一结束。你从解剖楼、图书馆和无数个早八里走过来，开始知道白大褂的重量。大二见。"
        note="寒假、暑假与大一的四个学期已经走完。大二、临床年、事件卡、人物关系、科研与奖学金会在后续版本接入。"
        onRestart={() => goDemo('create')}
        onTitle={() => goDemo('title')}
      />
    )
  }
  return (
    <EndingScreen
      state={buildDemoState('ending')}
      onRestart={() => goDemo('create')}
      onTitle={() => goDemo('title')}
    />
  )
}

export default function App() {
  const demo = new URLSearchParams(window.location.search).get('demo') as DemoName | null
  if (demo) return <DemoApp screen={demo} />
  return (
    <ResearchNoticeProvider>
      <EncounterProvider>
        <TravelEventProvider>
          <RealApp />
        </TravelEventProvider>
      </EncounterProvider>
    </ResearchNoticeProvider>
  )
}
