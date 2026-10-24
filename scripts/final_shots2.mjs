import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})
const base = 'http://127.0.0.1:5173/'
const shots = [
  ['title', '?demo=title', 1600, 1000, false],
  ['create', '?demo=create', 1600, 1200, false],
  ['plan', '?demo=plan', 1600, 1100, false],
  ['week', '?demo=week', 1600, 1100, false],
  ['prep', '?demo=prep', 1600, 1100, false],
  ['result', '?demo=result', 1600, 1100, false],
  ['vacation', '?demo=vacation', 1600, 1100, false],
  ['yearend-demo', '?demo=yearend', 1600, 1100, false],
]
for (const [name, query, width, height, fullPage] of shots) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(base + query, { waitUntil: 'networkidle' })
  await page.waitForTimeout(250)
  await page.screenshot({ path: `shots/ui-${name}.png`, fullPage })
  await page.close()
}
const mobile = await browser.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
await mobile.goto(base + '?demo=week', { waitUntil: 'networkidle' })
await mobile.waitForTimeout(250)
await mobile.screenshot({ path: 'shots/ui-mobile-week.png', fullPage: true })
await mobile.goto(base + '?demo=title', { waitUntil: 'networkidle' })
await mobile.waitForTimeout(250)
await mobile.screenshot({ path: 'shots/ui-mobile-title.png' })
await browser.close()
console.log('final screenshots done')
