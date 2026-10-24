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

for (let week = 1; week <= 3; week++) {
  await page.locator('.action-card', { hasText: '泡图书馆' }).click()
  await page.locator('.action-card', { hasText: '和朋友吃饭' }).click()
  await page.locator('.action-footer .btn-primary').click()
  await page.waitForTimeout(500)
  if (week === 1) await page.screenshot({ path: '/tmp/shots/real2-week2.png' })
}
const memo = await page.locator('.memo-card').innerText()
console.log('MEMO:', memo.replace(/\n/g, ' | '))
await page.locator('.review-card', { hasText: '全力复习' }).click()
await page.locator('.prep-confirm .btn-primary').click()
await page.waitForTimeout(500)
await page.locator('.result-actions .btn-primary').click()
await page.waitForTimeout(300)
await page.locator('.topbar .text-btn').last().click()
await page.waitForTimeout(400)
const hasContinue = await page.locator('.title-actions .btn-ghost').isEnabled()
console.log('continue enabled after save:', hasContinue)
await page.locator('.title-actions .btn-ghost').click()
await page.waitForTimeout(400)
console.log('loaded page text:', (await page.locator('body').innerText()).slice(0, 40).replace(/\n/g, ' | '))
console.log('errors:', errors)
await browser.close()
