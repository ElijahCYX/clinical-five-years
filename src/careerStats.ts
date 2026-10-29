import type { CareerStats } from './types'

export function emptyCareerStats(): CareerStats {
  return {
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
    campusRun: 0,
    dinner: 0,
    travel: 0,
    weeks: 0,
  }
}

function normalized(stats: CareerStats | undefined): CareerStats {
  return { ...emptyCareerStats(), ...(stats ?? {}) }
}

/** Lifetime counters are intentionally separate from the semester summary. */
export function bumpCareerStats(
  stats: CareerStats | undefined,
  actionId: string,
): CareerStats {
  const next = normalized(stats)
  if (actionId === 'library') next.library += 1
  else if (actionId.startsWith('attend:')) next.attend += 1
  else if (actionId === 'skip') next.skip += 1
  else if (actionId === 'sleepIn') next.sleepIn += 1
  else if (actionId === 'coffee') next.coffee += 1
  else if (actionId === 'selfCare') next.selfCare += 1
  else if (actionId === 'exercise' || actionId === 'sport') next.exercise += 1
  else if (actionId === 'campusRun') next.campusRun += 1
  else if (actionId === 'social') next.social += 1
  else if (actionId === 'partTime') next.partTime += 1
  else if (actionId === 'research') next.research += 1
  else if (actionId === 'club' || actionId.startsWith('clubAttend:')) next.club += 1
  else if (actionId === 'english') next.english += 1
  else if (actionId === 'electiveHomework') next.electiveHomework += 1
  else if (actionId.startsWith('soloDate:')) next.date += 1
  else if (actionId === 'dinner') next.dinner += 1
  else if (actionId === 'travel') next.travel += 1
  return next
}

export function bumpCareerMonths(
  stats: CareerStats | undefined,
  field: 'weeks',
  amount = 1,
): CareerStats {
  const next = normalized(stats)
  next[field] += amount
  return next
}
