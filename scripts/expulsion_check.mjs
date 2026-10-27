import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1624, height: 1048 } })
page.on('pageerror', e => console.log('ERR', e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  const g = await import('/src/game.ts'); const d = await import('/src/data.ts'); const demo = await import('/src/demo.ts')
  const s = g.newGameState(demo.demoPlayer)
  const c1 = d.SEASONS[0].courses[0]
  s.screen = 'result'; s.seasonIndex = 0; s.season = d.SEASONS[0]; s.week = 4; s.plan = 'C'; s.habits = []; s.electiveSelectionDone = true; s.electiveOffers = []; s.energy = 50; s.stress = 40; s.money = 1000; s.weekSlot = 20; s.prep = { math: 0, introMedicine: 0 }
  s.results = [{ course: c1, score: 42, gpa: 0, expectedMin: 40, expectedMax: 50, stressRelief: 0, usualScore: 20, paperScore: 22 }]
  s.outstandingFails = { math: 3, introMedicine: 1, organic: 5, generalChem: 5, anatomy: 3, diagnostics: 5 }
  s.semesterStats = { library: 0, attend: 2, skip: 4, sleepIn: 5, coffee: 1, selfCare: 0, exercise: 0, social: 1, partTime: 0, research: 0, club: 0, english: 0, electiveHomework: 0, date: 0 }
  localStorage.setItem('clinical-five-years-save-v44', JSON.stringify({ game: s, savedAt: Date.now() }))
})
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(300); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('warning', await page.evaluate(() => ({
  expelClass: document.querySelector('.failure-report-card')?.classList.contains('is-expulsion'),
  heading: document.querySelector('.failure-report-head h2')?.textContent,
  figures: document.querySelector('.failure-report-figures')?.innerText,
  button: [...document.querySelectorAll('.failure-report-card button')].map(e => e.textContent.trim()),
})))
await page.screenshot({ path: '/tmp/expulsion-warning.png' })
await page.locator('.failure-report-card button', { hasText: '接受退学处理' }).click(); await page.waitForTimeout(500)
console.log('ending', await page.evaluate(() => ({
  ending: !!document.querySelector('.ending-screen.is-danger'),
  title: document.querySelector('.ending-title')?.innerText,
  description: document.querySelector('.ending-lede')?.textContent,
  note: document.querySelector('.ending-card')?.innerText.slice(-500),
})))
await page.screenshot({ path: '/tmp/expulsion-ending.png' })
await browser.close()
