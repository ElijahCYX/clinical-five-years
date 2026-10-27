import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
const prepByPlan = {
  A: { math: 42.6, introMedicine: 27.6 },
  B: { math: 34.2, introMedicine: 19.2 },
  C: { math: 30, introMedicine: 15 },
}
const choices = [
  ['均衡复习', 'balanced'],
  ['主攻 大学数学', 'focus-math'],
  ['主攻 医学导论', 'focus-intro'],
  ['历年卷 + zsy 笔记', 'mock'],
]
for (const plan of ['A', 'B', 'C']) {
  for (const [label, tag] of choices) {
    const ctx = await browser.newContext({ viewport: { width: 1624, height: 1048 } })
    const page = await ctx.newPage()
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
    await page.evaluate(async ({ plan, prep }) => {
      const g = await import('/src/game.ts'); const d = await import('/src/data.ts'); const demo = await import('/src/demo.ts')
      const s = g.newGameState(demo.demoPlayer)
      s.player = { ...s.player, attrs: { ...s.player.attrs, memory: 10, comprehension: 10 } }
      s.screen = 'prep'; s.seasonIndex = 0; s.season = d.SEASONS[0]; s.week = 4; s.plan = plan; s.habits = []; s.electiveSelectionDone = true; s.electiveOffers = []; s.energy = 100; s.stress = 20; s.money = 1500; s.pendingEvent = null; s.eventWeek = 4; s.weekSlot = 0; s.weekFocus = 'balanced'; s.prep = prep; s.results = []; s.pendingMakeups = []; s.outstandingFails = {}; s.semesterStats = { library: 0, attend: 9, skip: 0, sleepIn: 0, coffee: 0, selfCare: 0, exercise: 0, social: 0, partTime: 0, research: 0, club: 0, english: 0, electiveHomework: 0, date: 0 }; s.pendingElectiveRetakes = []; s.courseRecords = []; s.cumulativeCredits = 0; s.cumulativePoints = 0; s.everFailed = false; s.yearFailed = false
      localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
    }, { plan, prep: prepByPlan[plan] })
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(220); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(300)
    await page.locator('.review-card', { hasText: label }).first().click(); await page.waitForTimeout(80)
    await page.locator('button', { hasText: '走进考场' }).click(); await page.waitForTimeout(480)
    const data = await page.evaluate(() => { const g = JSON.parse(localStorage.getItem('clinical-five-years-save-v44')).game; return g.results.map(r => ({ n: r.course.name, s: r.score, f: r.forgetPenalty })) })
    console.log(plan, tag, JSON.stringify(data))
    await ctx.close()
  }
}
await browser.close()
