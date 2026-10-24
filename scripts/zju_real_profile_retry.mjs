import { chromium } from 'playwright-core'
const profile = `${process.env.HOME}/Library/Application Support/Microsoft Edge`
const browser = await chromium.launchPersistentContext(profile, {
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: false,
  viewport: { width: 1400, height: 1000 },
  args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--no-first-run', '--profile-directory=Default'],
})
const pages = browser.pages()
const page = pages[0] ?? await browser.newPage()
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
})
const api = []
page.on('response', async r => {
  if (r.url().includes('/server/api/front/psons/search')) {
    try { const t = await r.text(); console.log('API', r.status(), r.url(), t.slice(0, 2000)) } catch {}
  }
})
console.log('opening...')
await page.goto('https://person.zju.edu.cn/index/search', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(8000)
console.log('TITLE', await page.title())
console.log('BODY', (await page.locator('body').innerText()).slice(0, 1500))
await page.screenshot({ path: '/tmp/zju-real-profile.png', fullPage: true })
// Give the user a moment to interact with any challenge if needed
await page.waitForTimeout(3000)
console.log('API_CALLS', api.length)
await browser.close()
