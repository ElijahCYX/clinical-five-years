import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
for (const plan of ['A', 'B', 'C']) {
  const ctx = await browser.newContext({ viewport: { width: 1624, height: 1048 } })
  const page = await ctx.newPage()
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.evaluate(async ({ plan }) => {
    const g = await import('/src/game.ts'); const d = await import('/src/data.ts'); const demo = await import('/src/demo.ts')
    const s = g.newGameState(demo.demoPlayer)
    s.screen = 'prep'; s.seasonIndex = 0; s.season = d.SEASONS[0]; s.week = 4; s.plan = plan; s.habits = []; s.electiveSelectionDone = true; s.electiveOffers = []; s.energy = 100; s.stress = 20; s.money = 1500; s.pendingEvent = null; s.eventWeek = 4; s.weekSlot = 0; s.weekFocus = 'balanced'; s.prep = { math: 42, introMedicine: 20 }; s.results = []; s.pendingMakeups = []; s.outstandingFails = {}; s.semesterStats = { library: 0, attend: 9, skip: 0, sleepIn: 0, coffee: 0, selfCare: 0, exercise: 0, social: 0, partTime: 0, research: 0, club: 0, english: 0, electiveHomework: 0, date: 0 }; s.pendingElectiveRetakes = []; s.courseRecords = []; s.cumulativeCredits = 0; s.cumulativePoints = 0; s.everFailed = false; s.yearFailed = false
    localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
  }, { plan })
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(250); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(350)
  const note = await page.locator('.prep-forget-note').innerText().catch(() => '')
  await page.locator('.review-card', { hasText: '休息调整' }).click(); await page.waitForTimeout(100); await page.locator('button', { hasText: '走进考场' }).click(); await page.waitForTimeout(600)
  const data = await page.evaluate(() => { const g = JSON.parse(localStorage.getItem('clinical-five-years-save-v44')).game; return { results: g.results.map(r => ({ name: r.course.name, score: r.score, forget: r.forgetPenalty })), warning: !!document.querySelector('.failure-report-card') } })
  console.log(plan, note, JSON.stringify(data))
  await ctx.close()
}
await browser.close()
