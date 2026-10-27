import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
for (const high of [true, false]) {
  const k = high ? 1.4 : 0.6
  for (const plan of ['A', 'B', 'C']) {
    for (const [label, tag] of [['全力复习','full'],['历年卷 + zsy 笔记','mock'],['休息调整','rest']]) {
      const ctx = await browser.newContext({ viewport: { width: 1624, height: 1048 } })
      const page = await ctx.newPage()
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
      await page.evaluate(async ({ high, plan, k }) => {
        const g = await import('/src/game.ts'); const d = await import('/src/data.ts'); const demo = await import('/src/demo.ts')
        const s = g.newGameState(demo.demoPlayer)
        s.player = { ...s.player, attrs: { ...s.player.attrs, memory: high ? 10 : 2, comprehension: high ? 10 : 2, dexterity: high ? 10 : 2 } }
        const season = d.SEASONS[8]
        s.screen = 'prep'; s.seasonIndex = 8; s.season = season; s.week = 4; s.plan = plan; s.habits = []; s.electiveSelectionDone = true; s.electiveOffers = []; s.energy = 100; s.stress = 20; s.money = 3000; s.pendingEvent = null; s.eventWeek = 4; s.weekSlot = 0; s.weekFocus = 'balanced'; s.pendingMakeups = []; s.outstandingFails = {}; s.semesterStats = { library: 0, attend: 9, skip: 0, sleepIn: 0, coffee: 0, selfCare: 0, exercise: 0, social: 0, partTime: 0, research: 0, club: 0, english: 0, electiveHomework: 0, date: 0 }; s.pendingElectiveRetakes = []; s.courseRecords = []; s.cumulativeCredits = 0; s.cumulativePoints = 0; s.everFailed = false; s.yearFailed = false
        s.prep = Object.fromEntries(season.courses.map(c => [c.id, 27 + (plan === 'A' ? 3 : plan === 'B' ? 1 : 0) * k * 3]))
        localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
      }, { high, plan, k })
      await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(200); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(280)
      await page.locator('.review-card', { hasText: label }).first().click(); await page.waitForTimeout(70); await page.locator('button', { hasText: '走进考场' }).click(); await page.waitForTimeout(350)
      const data = await page.evaluate(() => { const g = JSON.parse(localStorage.getItem('clinical-five-years-save-v44')).game; return g.results.map(r => ({ n: r.course.name, s: r.score, f: r.forgetPenalty })) })
      console.log(high ? 'high' : 'low', plan, tag, JSON.stringify(data))
      await ctx.close()
    }
  }
}
await browser.close()
