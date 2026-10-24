import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] })
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
try {
  await page.goto('https://d30b465ec9bc25.lhr.life/?demo=week', { waitUntil: 'networkidle', timeout: 30000 })
  console.log('TITLE:', await page.title())
  console.log('URL:', page.url())
  console.log('GAME:', await page.locator('.game-screen').count())
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/shots/public-localhost-run.png' })
} catch (e) { console.log('ERR:', e.message.slice(0,200)) }
await browser.close()
