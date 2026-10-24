import { chromium } from 'playwright-core'
const browser = await chromium.launchPersistentContext('/tmp/zju-chrome-profile', {
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: false,
  viewport: { width: 1400, height: 1000 },
  args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--no-first-run'],
})
const page = browser.pages()[0] ?? await browser.newPage()
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
  Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] })
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
})
const api = []
page.on('response', async r => {
  if (r.url().includes('/server/api/front/psons/search')) {
    try { const t = await r.text(); console.log('API', r.status(), r.url(), t.slice(0, 1500)) } catch {}
  }
})
await page.goto('https://person.zju.edu.cn/index/search', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(3000)
console.log('TITLE', await page.title())
console.log('BODY', (await page.locator('body').innerText()).slice(0, 1000))
await page.screenshot({ path: '/tmp/zju-stealth.png', fullPage: true })
await browser.close()
