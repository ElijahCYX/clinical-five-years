import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1200,height:800} })
try {
  await page.goto('https://a52b2530458429.lhr.life/?demo=week', {waitUntil:'networkidle', timeout:30000})
  console.log('title:', await page.title())
  console.log('game:', await page.locator('.game-screen').count())
  console.log('rail:', await page.locator('.game-left').count())
} catch(e) { console.log('ERR', e.message.slice(0,200)) }
await browser.close()
