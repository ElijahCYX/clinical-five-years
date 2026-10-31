import type { ClinicalActionMode } from './types'

export interface ClinicalEventModeRule {
  duration: number
  energy: number
  stress: number
}

export const CLINICAL_EVENT_RULES: Record<string, Partial<Record<ClinicalActionMode, ClinicalEventModeRule>>> = {
  ecg: {
    observe: { duration: 15, energy: -5, stress: 0 },
    assist: { duration: 12, energy: -5, stress: 5 },
    supervise: { duration: 10, energy: -5, stress: 3 },
    independent: { duration: 10, energy: -5, stress: 1 },
  },
  admission: {
    observe: { duration: 45, energy: -10, stress: 0 },
    assist: { duration: 40, energy: -15, stress: 10 },
    supervise: { duration: 40, energy: -15, stress: 5 },
    independent: { duration: 30, energy: -15, stress: 3 },
  },
  consent: {
    observe: { duration: 20, energy: -5, stress: 0 },
    assist: { duration: 20, energy: -5, stress: 5 },
    supervise: { duration: 15, energy: -5, stress: 4 },
    independent: { duration: 10, energy: -5, stress: 3 },
  },
  dressing: {
    observe: { duration: 20, energy: -5, stress: 0 },
    assist: { duration: 20, energy: -5, stress: 3 },
    supervise: { duration: 15, energy: -5, stress: 2 },
    independent: { duration: 10, energy: -5, stress: 1 },
  },
  accompany: {
    independent: { duration: 30, energy: -15, stress: 3 },
  },
  authorization: {
    independent: { duration: 5, energy: -5, stress: 2 },
  },
  chartAudit: {
    observe: { duration: 30, energy: -20, stress: 0 },
    assist: { duration: 40, energy: -20, stress: 5 },
    supervise: { duration: 35, energy: -20, stress: 5 },
    independent: { duration: 30, energy: -20, stress: 5 },
  },
  dayPatientRecord: {
    observe: { duration: 30, energy: -10, stress: 0 },
    assist: { duration: 30, energy: -10, stress: 3 },
    supervise: { duration: 25, energy: -10, stress: 3 },
    independent: { duration: 20, energy: -10, stress: 3 },
  },
  thoracentesis: {
    observe: { duration: 25, energy: -20, stress: 0 },
    assist: { duration: 20, energy: -20, stress: 5 },
    supervise: { duration: 15, energy: -20, stress: 3 },
    independent: { duration: 12, energy: -20, stress: 2 },
  },
  abdominal: {
    observe: { duration: 25, energy: -20, stress: 0 },
    assist: { duration: 20, energy: -20, stress: 5 },
    supervise: { duration: 15, energy: -20, stress: 3 },
    independent: { duration: 12, energy: -20, stress: 2 },
  },
  boneMarrow: {
    observe: { duration: 25, energy: -20, stress: 0 },
    assist: { duration: 35, energy: -20, stress: 5 },
    supervise: { duration: 30, energy: -20, stress: 3 },
    independent: { duration: 25, energy: -20, stress: 2 },
  },
  lumbar: {
    observe: { duration: 30, energy: -20, stress: 0 },
    assist: { duration: 45, energy: -20, stress: 5 },
    supervise: { duration: 40, energy: -20, stress: 3 },
    independent: { duration: 35, energy: -20, stress: 2 },
  },
  urinary: {
    observe: { duration: 10, energy: -10, stress: 0 },
    assist: { duration: 15, energy: -10, stress: 5 },
    supervise: { duration: 12, energy: -10, stress: 3 },
    independent: { duration: 10, energy: -10, stress: 2 },
  },
  ngtube: {
    observe: { duration: 5, energy: -10, stress: 0 },
    assist: { duration: 10, energy: -10, stress: 5 },
    supervise: { duration: 8, energy: -10, stress: 3 },
    independent: { duration: 7, energy: -10, stress: 2 },
  },
  sterile: {
    independent: { duration: 120, energy: -25, stress: 10 },
  },
  physicalExam: {
    observe: { duration: 25, energy: -10, stress: 0 },
    assist: { duration: 20, energy: -10, stress: 5 },
    supervise: { duration: 20, energy: -10, stress: 3 },
    independent: { duration: 10, energy: -10, stress: 2 },
  },
  suture: {
    observe: { duration: 5, energy: -10, stress: 0 },
    assist: { duration: 15, energy: -10, stress: 5 },
    supervise: { duration: 12, energy: -10, stress: 3 },
    independent: { duration: 9, energy: -10, stress: 2 },
  },
  drainRemoval: {
    observe: { duration: 10, energy: -5, stress: 0 },
    assist: { duration: 15, energy: -5, stress: 3 },
    supervise: { duration: 13, energy: -5, stress: 2 },
    independent: { duration: 10, energy: -5, stress: 1 },
  },
  specimenThroat: {
    observe: { duration: 3, energy: -3, stress: 0 },
    assist: { duration: 5, energy: -3, stress: 1 },
    supervise: { duration: 5, energy: -3, stress: 0 },
    independent: { duration: 4, energy: -3, stress: 0 },
  },
  specimenNose: {
    observe: { duration: 3, energy: -3, stress: 0 },
    assist: { duration: 5, energy: -3, stress: 1 },
    supervise: { duration: 5, energy: -3, stress: 0 },
    independent: { duration: 4, energy: -3, stress: 0 },
  },
  specimenAscites: {
    observe: { duration: 3, energy: -3, stress: 0 },
    assist: { duration: 5, energy: -3, stress: 1 },
    supervise: { duration: 4, energy: -3, stress: 0 },
    independent: { duration: 3, energy: -3, stress: 0 },
  },
  specimenPleural: {
    observe: { duration: 3, energy: -3, stress: 0 },
    assist: { duration: 5, energy: -3, stress: 1 },
    supervise: { duration: 4, energy: -3, stress: 0 },
    independent: { duration: 3, energy: -3, stress: 0 },
  },
}
