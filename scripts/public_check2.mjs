import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] })
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
await page.goto('https://3ddc2ce04f8026d3-117-147-106-170.serveousercontent.com/?demo=week', { waitUntil: 'networkidle', timeout: 30000 })
if (await page.locator('text=Continue to Site').count()) {
  await page.locator('text=Continue to Site').click()
  await page.waitForTimeout(1500)
}
console.log('TITLE:', await page.title())
console.log('WEEK:', await page.locator('.game-screen').count())
await page.screenshot({ path: '/tmp/shots/public-check2.png' })
await browser.close()
