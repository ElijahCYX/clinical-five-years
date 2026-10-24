import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
await page.goto('http://127.0.0.1:5173/?demo=title', { waitUntil: 'networkidle' })
await page.screenshot({ path: '/tmp/shots/pw-title.png' })
console.log('title:', await page.title())
await browser.close()
