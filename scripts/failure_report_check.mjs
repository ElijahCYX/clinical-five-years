import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1624, height: 1048 } })
page.on('pageerror', e => console.log('ERR', e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  const g = await import('/src/game.ts'); const d = await import('/src/data.ts'); const demo = await import('/src/demo.ts')
  const s = g.newGameState(demo.demoPlayer)
  s.screen = 'prep'; s.seasonIndex = 0; s.season = d.SEASONS[0]; s.week = 4; s.plan = 'C'; s.habits = ['earlySleep', 'familyCall']; s.electiveSelectionDone = true; s.electiveOffers = []; s.energy = 100; s.stress = 20; s.money = 1500; s.pendingEvent = null; s.eventWeek = 4; s.weekSlot = 0; s.weekFocus = 'balanced'; s.prep = { math: 0, introMedicine: 0 }; s.results = []; s.pendingMakeups = []; s.pendingElectiveRetakes = []; s.courseRecords = []; s.cumulativeCredits = 0; s.cumulativePoints = 0; s.everFailed = false; s.yearFailed = false
  localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
})
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(250); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400)
await page.locator('.review-card', { hasText: '休息调整' }).click(); await page.waitForTimeout(150); await page.locator('button', { hasText: '走进考场' }).click(); await page.waitForTimeout(700)
console.log('warning', await page.evaluate(() => ({ open: !!document.querySelector('.failure-report-card'), title: document.querySelector('.failure-report-head h2')?.textContent, figures: document.querySelector('.failure-report-figures')?.innerText, body: document.querySelector('.failure-report-prose')?.innerText, expel: document.querySelector('.failure-report-card')?.classList.contains('is-expulsion'), state: (() => { const g = JSON.parse(localStorage.getItem('clinical-five-years-save-v44')).game; return { outstanding: g.outstandingFails, stats: g.semesterStats, screen: g.screen } })() })))
await page.screenshot({ path: '/tmp/failure-report.png' })
const ack = page.locator('.failure-report-card button', { hasText: '我知道了' })
console.log('ack', await ack.count()); await ack.click(); await page.waitForTimeout(300)
console.log('after ack', await page.evaluate(() => ({ warning: !!document.querySelector('.failure-report-card'), result: !!document.querySelector('.result-screen') })))
await browser.close()
