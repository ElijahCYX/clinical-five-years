import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] })
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
try {
  await page.goto('https://3ddc2ce04f8026d3-117-147-106-170.serveousercontent.com/?demo=week', { waitUntil: 'networkidle', timeout: 30000 })
  console.log('PUBLIC TITLE:', await page.title())
  console.log('PUBLIC WEEK:', await page.locator('.game-screen').count())
  await page.screenshot({ path: '/tmp/shots/public-check.png' })
} catch (e) {
  console.log('PUBLIC ERROR:', e.message.slice(0,300))
}
await browser.close()
