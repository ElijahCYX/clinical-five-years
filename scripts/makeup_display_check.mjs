import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1624, height: 1048 } })
page.on('pageerror', e => console.log('ERR', e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  const g = await import('/src/game.ts'); const d = await import('/src/data.ts'); const demo = await import('/src/demo.ts')
  const s = g.newGameState(demo.demoPlayer)
  const math = { ...d.SEASONS[0].courses[0], id: 'makeup-math-0', makeup: true, originalGpa: 0, originalScore: 51 }
  s.screen = 'week'; s.seasonIndex = 1; s.season = { ...d.SEASONS[1], courses: [...d.SEASONS[1].courses, math] }; s.week = 1; s.plan = 'B'; s.habits = []; s.electiveSelectionDone = true; s.electiveOffers = []; s.energy = 80; s.stress = 20; s.money = 1000; s.pendingEvent = null; s.eventWeek = 4; s.weekSlot = 0; s.weekFocus = 'balanced'; s.prep = Object.fromEntries(s.season.courses.map(c => [c.id, 0])); s.pendingMakeups = [math]; s.results = []; s.courseRecords = []; s.outstandingFails = { math: 3 }; s.everFailed = true
  localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
})
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(300); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log(await page.evaluate(() => ({ timetableHasMakeup: document.body.innerText.includes('大学数学补考'), timetableCells: [...document.querySelectorAll('.timetable-slot')].map(e=>e.innerText).filter(t=>t.includes('大学数学')) })))
await page.locator('.interface-btn', { hasText: '我是谁' }).click(); await page.waitForTimeout(400)
console.log(await page.evaluate(() => ({ pending: document.querySelector('.dossier-warning')?.innerText, hasTag: document.body.innerText.includes('待补考') })))
await browser.close()
