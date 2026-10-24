import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})
const mobile = await browser.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
await mobile.goto('http://127.0.0.1:5173/?demo=week', { waitUntil: 'networkidle' })
await mobile.waitForTimeout(250)
await mobile.screenshot({ path: 'shots/ui-mobile-week.png' })
await mobile.goto('http://127.0.0.1:5173/?demo=title', { waitUntil: 'networkidle' })
await mobile.waitForTimeout(250)
await mobile.screenshot({ path: 'shots/ui-mobile-title.png' })
await browser.close()
console.log('mobile done')
