import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors = []
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))
page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console: ' + msg.text()) })

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.locator('.title-actions .btn-primary').click()
await page.waitForTimeout(300)
await page.locator('.field input').first().fill('林知夏')
await page.locator('.confirm-box .btn-primary').click()
await page.waitForTimeout(300)
await page.locator('.plan-card', { hasText: '周期回顾' }).click()
await page.locator('.habit-card', { hasText: '时间管理' }).click()
await page.locator('.plan-footer .btn-primary').click()
await page.waitForTimeout(500)

// week 1
await page.locator('.action-card', { hasText: '泡图书馆' }).click()
await page.locator('.action-card', { hasText: '和朋友吃饭' }).click()
await page.locator('.action-footer .btn-primary').click()
await page.waitForTimeout(600)
const memo = await page.locator('.memo-card').innerText()
console.log('MEMO:', memo.replace(/\n/g, ' | '))
console.log('has float:', /准备度 \+\d+\.\d+/.test(memo))
await page.screenshot({ path: '/tmp/shots/real3-week2.png' })

// weeks 2-3
for (let week = 2; week <= 3; week++) {
  await page.locator('.action-card', { hasText: '泡图书馆' }).click()
  await page.locator('.action-card', { hasText: '和朋友吃饭' }).click()
  await page.locator('.action-footer .btn-primary').click()
  await page.waitForTimeout(600)
}
console.log('prep visible:', await page.locator('.prep-screen').count())
await page.locator('.review-card', { hasText: '全力复习' }).click()
await page.locator('.prep-confirm .btn-primary').click()
await page.waitForTimeout(500)
console.log('result visible:', await page.locator('.result-screen').count())
await page.screenshot({ path: '/tmp/shots/real3-result.png' })
// back to title from result
await page.locator('.topbar .text-btn').last().click()
await page.waitForTimeout(500)
const continueEnabled = await page.locator('.title-actions .btn-ghost').isEnabled()
console.log('continue enabled after save:', continueEnabled)
await page.locator('.title-actions .btn-ghost').click()
await page.waitForTimeout(500)
console.log('loaded screen:', await page.locator('.result-screen, .week-screen, .prep-screen').count())
console.log('errors:', errors)
await browser.close()
