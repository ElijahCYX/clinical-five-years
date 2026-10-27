import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1624, height: 1048 } })
page.on('pageerror', e => console.log('ERR', e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  const g = await import('/src/game.ts')
  const d = await import('/src/data.ts')
  const demo = await import('/src/demo.ts')
  const s = g.newGameState(demo.demoPlayer)
  s.screen = 'prep'
  s.seasonIndex = 0
  s.season = d.SEASONS[0]
  s.week = 4
  s.plan = 'C'
  s.habits = ['earlySleep', 'familyCall']
  s.electiveSelectionDone = true
  s.electiveOffers = []
  s.energy = 100
  s.stress = 20
  s.money = 1500
  s.pendingEvent = null
  s.eventWeek = 4
  s.weekSlot = 0
  s.weekFocus = 'balanced'
  s.prep = { math: 0, introMedicine: 0 }
  s.results = []
  s.pendingMakeups = []
  s.pendingElectiveRetakes = []
  s.courseRecords = []
  s.cumulativeCredits = 0
  s.cumulativePoints = 0
  s.everFailed = false
  s.yearFailed = false
  localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await page.locator('.title-actions .btn-ghost').click()
await page.waitForTimeout(500)
console.log('prep', await page.evaluate(() => ({
  screen: !!document.querySelector('.prep-screen'),
  options: [...document.querySelectorAll('.review-card')].map(e => e.innerText.slice(0, 80)),
})))
await page.locator('.review-card', { hasText: '休息调整' }).click()
await page.waitForTimeout(200)
await page.locator('button', { hasText: '走进考场' }).click()
await page.waitForTimeout(700)
console.log('result', await page.evaluate(() => {
  const g = JSON.parse(localStorage.getItem('clinical-five-years-save-v44')).game
  return {
    screen: g.screen,
    results: g.results.map(r => ({ name: r.course.name, score: r.score, gpa: r.gpa, makeup: !!r.course.makeup, originalGpa: r.course.originalGpa })),
    pending: g.pendingMakeups.map(c => ({ id: c.id, name: c.name, makeup: !!c.makeup, credits: c.credits, originalGpa: c.originalGpa })),
    everFailed: g.everFailed,
    yearFailed: g.yearFailed,
    cumulativeCredits: g.cumulativeCredits,
  }
}))
await page.screenshot({ path: '/tmp/makeup-result-fail.png' })
const cont = page.locator('button', { hasText: /继续|下一/ }).first()
console.log('continue count', await cont.count())
await cont.click()
await page.waitForTimeout(700)
console.log('winter elective', await page.evaluate(() => {
  const g = JSON.parse(localStorage.getItem('clinical-five-years-save-v44')).game
  return {
    hasElective: !!document.querySelector('.elective-screen'),
    hasPlan: !!document.querySelector('.plan-screen'),
    body: document.body.innerText.slice(0, 500),
    screen: g.screen,
    season: g.season.seasonLabel,
    courses: g.season.courses.map(c => ({ name: c.name, id: c.id, makeup: !!c.makeup, credits: c.credits })),
    pending: g.pendingMakeups,
    electiveDone: g.electiveSelectionDone,
    everFailed: g.everFailed,
    cumulativeCredits: g.cumulativeCredits,
  }
}))
await page.screenshot({ path: '/tmp/makeup-winter-elective.png' })
await browser.close()
