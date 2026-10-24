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
await page.screenshot({ path: '/tmp/shots/real-title.png' })

await page.locator('.title-actions .btn-primary').click()
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/shots/real-create.png' })

// Fill name and start
await page.locator('.field input').first().fill('林知夏')
await page.locator('.confirm-box .btn-primary').click()
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/shots/real-plan.png' })

// choose plan B and habit time management
await page.locator('.plan-card', { hasText: '周期回顾' }).click()
await page.locator('.habit-card', { hasText: '时间管理' }).click()
await page.locator('.plan-footer .btn-primary').click()
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/shots/real-week1.png' })

for (let week = 1; week <= 3; week++) {
  await page.locator('.action-card', { hasText: '泡图书馆' }).click()
  await page.locator('.action-card', { hasText: '和朋友吃饭' }).click()
  await page.locator('.action-footer .btn-primary').click()
  await page.waitForTimeout(650)
  await page.screenshot({ path: `/tmp/shots/real-week${week}-end.png` })
}

await page.screenshot({ path: '/tmp/shots/real-prep.png' })
await page.locator('.review-card', { hasText: '全力复习' }).click()
await page.locator('.prep-confirm .btn-primary').click()
await page.waitForTimeout(700)
await page.screenshot({ path: '/tmp/shots/real-result.png' })
await page.locator('.result-actions .btn-primary').click()
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/shots/real-ending.png' })

console.log('errors:', errors)
console.log('page text check:', (await page.locator('body').innerText()).slice(0, 120).replace(/\n/g, ' | '))
await browser.close()
