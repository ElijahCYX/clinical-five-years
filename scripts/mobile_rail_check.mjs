import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:430,height:932}, deviceScaleFactor:2, isMobile:true, hasTouch:true })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
for (const name of ['week','prep']) {
  await page.goto(`http://127.0.0.1:5173/?demo=${name}`, {waitUntil:'networkidle'})
  await page.waitForTimeout(250)
  await page.screenshot({path:`/tmp/shots/mobile-${name}.png`, fullPage:true})
}
console.log('errors:', errors)
await browser.close()
