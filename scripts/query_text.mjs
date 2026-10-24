import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
await page.goto('http://127.0.0.1:5173/?demo=plan', { waitUntil: 'networkidle' })
console.log('PLAN HEAD:', (await page.locator('.plan-head').innerText()).replace(/\n/g,' | '))
await page.goto('http://127.0.0.1:5173/?demo=title', { waitUntil: 'networkidle' })
console.log('TITLE:', (await page.locator('.title-screen').innerText()).replace(/\n/g,' | ').slice(0,220))
await browser.close()
