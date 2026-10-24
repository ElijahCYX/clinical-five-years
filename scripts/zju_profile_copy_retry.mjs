import { chromium } from 'playwright-core'
const context = await chromium.launchPersistentContext('/tmp/zju-edge-profile', {
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: false,
  viewport: { width: 1400, height: 1000 },
  ignoreDefaultArgs: ['--disable-extensions'],
  args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--no-first-run', '--profile-directory=Default'],
})
const page = context.pages()[0] ?? await context.newPage()
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
})
page.on('response', async r => {
  if (r.url().includes('/server/api/front/psons/search')) {
    try { const t = await r.text(); console.log('API', r.status(), r.url(), t.slice(0, 2500)) } catch {}
  }
})
await page.goto('https://person.zju.edu.cn/index/search', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(6000)
console.log('TITLE', await page.title())
console.log('BODY', (await page.locator('body').innerText()).slice(0, 1500))
await page.screenshot({ path: '/tmp/zju-profile-copy.png', fullPage: true })
await context.close()
