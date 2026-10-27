import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1624, height: 1048 } })
page.on('pageerror', e => console.log('ERR', e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  const g = await import('/src/game.ts')
  const d = await import('/src/data.ts')
  const demo = await import('/src/demo.ts')
  const base = g.newGameState(demo.demoPlayer)
  const autumn = d.SEASONS[0]
  const math = { ...autumn.courses[0], id: 'makeup-math-0', makeup: true, originalGpa: 0, originalScore: 51 }
  const intro = { ...autumn.courses[1], id: 'makeup-introMedicine-0', makeup: true, originalGpa: 0, originalScore: 51 }
  const winter = { ...d.SEASONS[1], courses: [...d.SEASONS[1].courses, math, intro] }
  const s = base
  s.screen = 'prep'
  s.seasonIndex = 1
  s.season = winter
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
  s.prep = Object.fromEntries(winter.courses.map(c => [c.id, 100]))
  s.results = []
  s.pendingMakeups = []
  s.pendingElectiveRetakes = []
  s.courseRecords = []
  s.cumulativeCredits = 0
  s.cumulativePoints = 0
  s.everFailed = true
  s.yearFailed = true
  localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
})
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(300); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('prep screen', await page.evaluate(() => !!document.querySelector(".prep-screen")))
await page.locator('.review-card', { hasText: '休息调整' }).click(); await page.waitForTimeout(150); await page.locator('button', { hasText: '走进考场' }).click(); await page.waitForTimeout(700)
console.log('pass result', JSON.stringify(await page.evaluate(() => {
  const g = JSON.parse(localStorage.getItem('clinical-five-years-save-v44')).game
  return { screen: g.screen, results: g.results.map(r => ({ id: r.course.id, name: r.course.name, score: r.score, gpa: r.gpa, makeup: !!r.course.makeup, originalGpa: r.course.originalGpa })), pending: g.pendingMakeups, cumulativeCredits: g.cumulativeCredits, cumulativePoints: g.cumulativePoints, records: g.courseRecords.map(r=>({id:r.id,name:r.name,credits:r.credits,gpa:r.gpa})), everFailed: g.everFailed }
})))
await page.screenshot({ path: '/tmp/makeup-pass-result.png' })
await browser.close()
