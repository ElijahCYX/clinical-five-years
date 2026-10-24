import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors=[]
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://127.0.0.1:5173/?demo=week', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/shots/preview-week-demo.png' })
console.log('status:', (await page.locator('.status-card').innerText()).replace(/\n/g,' | '))
console.log('exam:', (await page.locator('.exam-banner').innerText()).replace(/\n/g,' | '))
console.log('errors:', errors)
await browser.close()
