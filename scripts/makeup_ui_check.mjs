import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1624, height: 1048 } })
page.on('pageerror', e => console.log('ERR', e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  const g = await import('/src/game.ts'); const d = await import('/src/data.ts'); const demo = await import('/src/demo.ts')
  const s = g.newGameState(demo.demoPlayer)
  s.screen = 'prep'; s.seasonIndex = 0; s.season = d.SEASONS[0]; s.week = 4; s.plan = 'C'; s.habits = []; s.electiveSelectionDone = true; s.electiveOffers = []; s.energy = 100; s.stress = 20; s.money = 1500; s.pendingEvent = null; s.eventWeek = 4; s.weekSlot = 0; s.weekFocus = 'balanced'; s.prep = { math: 0, introMedicine: 0 }; s.results = []; s.pendingMakeups = []; s.pendingElectiveRetakes = []; s.courseRecords = []; s.cumulativeCredits = 0; s.cumulativePoints = 0; s.everFailed = false; s.yearFailed = false
  localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
})
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(250); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400)
await page.locator('.review-card', { hasText: '休息调整' }).click(); await page.waitForTimeout(120); await page.locator('button', { hasText: '走进考场' }).click(); await page.waitForTimeout(600)
await page.locator('.failure-report-card button', { hasText: '继续' }).click(); await page.waitForTimeout(250)
await page.locator('.result-screen button', { hasText: /继续/ }).first().click(); await page.waitForTimeout(600)
console.log('winter pending', await page.evaluate(() => { const g = JSON.parse(localStorage.getItem('clinical-five-years-save-v44')).game; return { pending: g.pendingMakeups.map(c=>c.name), courses: g.season.courses.map(c=>({name:c.name,makeup:!!c.makeup})), stats: g.semesterStats } }))
// choose PE and submit
const pe = page.locator('button', { hasText: '选择这门体育课' }); if(await pe.count()) await pe.click(); await page.waitForTimeout(200)
const submit = page.locator('button', { hasText: '提交选课' }); if(await submit.count() && !(await submit.isDisabled())) await submit.click(); await page.waitForTimeout(400)
const enter = page.locator('button', { hasText: '进入学期计划' }); if(await enter.count()) await enter.click(); await page.waitForTimeout(500)
console.log('plan tags', await page.evaluate(() => ({ hasPlan: !!document.querySelector('.plan-screen'), cards: [...document.querySelectorAll('.plan-course-card')].map(e=>e.innerText.slice(0,80)), text: document.body.innerText.includes('补考') })))
await page.screenshot({ path: '/tmp/makeup-plan-tagged.png' })
await browser.close()
