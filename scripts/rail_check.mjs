import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
const errors=[]; page.on('pageerror', e=>errors.push(e.message))
for (const name of ['week','prep']) {
  await page.goto(`http://127.0.0.1:5173/?demo=${name}`, { waitUntil:'networkidle' })
  await page.waitForTimeout(300)
  await page.screenshot({ path:`/tmp/shots/rail-${name}.png`, fullPage:true })
}
console.log('errors:', errors)
await browser.close()
