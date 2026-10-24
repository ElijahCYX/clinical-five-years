import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors = []
page.on('pageerror', (e) => { errors.push('pageerror: ' + e.message); console.log('PAGEERROR', e.message) })
page.on('console', (m) => { if (m.type() === 'error') { errors.push('console: ' + m.text()); console.log('CONSOLE', m.text()) } })
const log = (...a) => console.log(...a)
const wait = (ms=350) => page.waitForTimeout(ms)
async function clickAction(name) { await page.locator('.action-card', { hasText: name }).first().click(); await wait(70) }
async function endWeek() { await page.locator('.action-footer .btn-primary').click(); await wait(500) }
async function choosePlan() {
  await page.locator('.plan-card', { hasText: '周期回顾' }).click()
  await page.locator('.habit-card', { hasText: '时间管理' }).click()
  await page.locator('.plan-footer .btn-primary').click()
  await wait(450)
}
async function playWeeks(weeks = 3) {
  for (let i=0;i<weeks;i++) { await clickAction('泡图书馆'); await clickAction('纯粹的休息'); await endWeek() }
}
async function prepAndResult(label) {
  await page.locator('.review-card', { hasText: label }).first().click()
  await page.locator('.prep-confirm .btn-primary').click()
  await wait(600)
}

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.locator('.title-actions .btn-primary').click(); await wait(300)
await page.locator('.field input').first().fill('林知夏')
await page.locator('.confirm-box .btn-primary').click(); await wait(350)
await choosePlan()

// 大一秋; test library repeat
await clickAction('泡图书馆'); await clickAction('泡图书馆')
log('library count:', await page.locator('.selected-summary').innerText())
await endWeek()
await playWeeks(2)
log('PREP 1:', await page.locator('.prep-screen').count())
// use exam boosts
await page.locator('.boost-btn', { hasText: '来一杯' }).click(); await wait(200)
await page.locator('.boost-btn', { hasText: '刷一夜' }).click(); await wait(200)
log('boost state:', await page.locator('.boost-card').innerText())
await page.screenshot({ path: '/tmp/shots/cet-prep-boost.png' })
await prepAndResult('历年卷')
log('RESULT 1 note:', await page.locator('.result-extra').count())
await page.locator('.result-actions .btn-primary').click(); await wait(450)

// 大一冬
await choosePlan(); await playWeeks(3)
log('PREP 2:', await page.locator('.prep-screen').count())
await prepAndResult('均衡复习')
log('RESULT 2 rows:', await page.locator('.report-table tbody tr').count())
await page.locator('.result-actions .btn-primary').click(); await wait(500)

// 寒假
log('WINTER:', await page.locator('.vacation-screen').count())
await clickAction('纯粹的休息'); await clickAction('健身 / 运动'); await endWeek()
await clickAction('学英语'); await clickAction('纯粹的休息'); await endWeek()
log('PLAN 3:', await page.locator('.plan-head h1').innerText())
await choosePlan()

// 大一春
await playWeeks(3)
await prepAndResult('全力复习')
await page.locator('.result-actions .btn-primary').click(); await wait(450)

// 大一夏
await choosePlan(); await playWeeks(2)
log('CET event visible after week2:', await page.locator('.event-screen').count())
await page.screenshot({ path: '/tmp/shots/cet-event-real.png' })
await page.locator('.cet-option', { hasText: '报名四级' }).click()
await page.locator('.event-actions .btn-primary').click(); await wait(500)
log('WEEK 3 visible:', await page.locator('.game-screen').count())
await clickAction('泡图书馆'); await clickAction('纯粹的休息'); await endWeek()
log('PREP 4:', await page.locator('.prep-screen').count())
await prepAndResult('均衡复习')
log('RESULT 4:', await page.locator('.result-screen').count())
await page.locator('.result-actions .btn-primary').click(); await wait(500)
log('SUMMER:', await page.locator('.vacation-screen').count())
for (let i=0;i<3;i++) { await clickAction('纯粹的休息'); await clickAction('健身 / 运动'); await endWeek() }
await wait(500)
log('CET RESULT:', await page.locator('.cet-result-card').count())
await page.screenshot({ path: '/tmp/shots/cet-result-real.png' })
if (await page.locator('.cet-result-card').count()) {
  await page.locator('.cet-result-card .btn-primary').click(); await wait(500)
}
log('YEAREND:', await page.locator('.ending-screen').count())
await page.screenshot({ path: '/tmp/shots/year-end2.png' })
log('errors:', errors.length, errors.slice(0,10))
await browser.close()
