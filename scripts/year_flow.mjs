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

async function clickAction(name) {
  const card = page.locator('.action-card', { hasText: name })
  await card.first().click()
  await wait(80)
}
async function endWeek() {
  await page.locator('.action-footer .btn-primary').click()
  await wait(450)
}
async function choosePlan() {
  await page.locator('.plan-card', { hasText: '周期回顾' }).click()
  await page.locator('.habit-card', { hasText: '时间管理' }).click()
  await page.locator('.plan-footer .btn-primary').click()
  await wait(450)
}
async function prepAndResult(choiceText, shot) {
  await page.locator('.review-card', { hasText: choiceText }).first().click()
  if (shot) await page.screenshot({ path: shot })
  await page.locator('.prep-confirm .btn-primary').click()
  await wait(550)
}

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.locator('.title-actions .btn-primary').click()
await wait(300)
await page.locator('.field input').first().fill('林知夏')
await page.locator('.confirm-box .btn-primary').click()
await wait(350)
log('PLAN 1:', await page.locator('.plan-head h1').innerText())
await choosePlan()

// 大一秋: test repeatable library once
await clickAction('泡图书馆'); await clickAction('泡图书馆')
log('selected count after 2x library:', await page.locator('.selected-summary').innerText())
await endWeek()
for (let i=0;i<2;i++) { await clickAction('泡图书馆'); await clickAction('和朋友吃饭'); await endWeek() }
log('PREP 1 visible:', await page.locator('.prep-screen').count())
await prepAndResult('模拟考', '/tmp/shots/year-prep-small.png')
log('RESULT 1:', (await page.locator('.result-screen').innerText()).match(/学期结算[\s\S]{0,80}/)?.[0])
await page.locator('.result-actions .btn-primary').click()
await wait(450)
log('PLAN 2:', await page.locator('.plan-head h1').innerText())
await choosePlan()

// 大一冬 big exam
for (let i=0;i<3;i++) { await clickAction('泡图书馆'); await clickAction('纯粹的休息'); await endWeek() }
log('PREP 2 visible:', await page.locator('.prep-screen').count())
await page.screenshot({ path: '/tmp/shots/year-prep-big.png' })
await prepAndResult('均衡复习', '/tmp/shots/year-prep-big-selected.png')
await page.screenshot({ path: '/tmp/shots/year-result-big.png' })
log('RESULT 2 rows:', await page.locator('.report-table tbody tr').count())
await page.locator('.result-actions .btn-primary').click()
await wait(500)
log('VACATION visible:', await page.locator('.vacation-screen').count())
await page.screenshot({ path: '/tmp/shots/year-winter.png' })
// winter 2 weeks
await clickAction('纯粹的休息'); await clickAction('健身 / 运动'); await endWeek()
await clickAction('学英语'); await clickAction('纯粹的休息'); await endWeek()
log('PLAN 3:', await page.locator('.plan-head h1').innerText())
await choosePlan()

// 大一春
for (let i=0;i<3;i++) { await clickAction('泡图书馆'); await clickAction('纯粹的休息'); await endWeek() }
await prepAndResult('全力复习')
log('RESULT 3 visible:', await page.locator('.result-screen').count())
await page.locator('.result-actions .btn-primary').click()
await wait(450)
log('PLAN 4:', await page.locator('.plan-head h1').innerText())
await choosePlan()

// 大一夏
for (let i=0;i<3;i++) { await clickAction('泡图书馆'); await clickAction('纯粹的休息'); await endWeek() }
await prepAndResult('均衡复习')
log('RESULT 4 visible:', await page.locator('.result-screen').count())
await page.locator('.result-actions .btn-primary').click()
await wait(500)
log('SUMMER visible:', await page.locator('.vacation-screen').count())
// summer 3 weeks
for (let i=0;i<3;i++) { await clickAction('纯粹的休息'); await clickAction('健身 / 运动'); await endWeek() }
await wait(500)
log('YEAREND visible:', await page.locator('.ending-screen').count())
await page.screenshot({ path: '/tmp/shots/year-end.png' })
log('errors:', errors.length, errors.slice(0,5))
await browser.close()
