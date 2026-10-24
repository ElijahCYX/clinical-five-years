import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100} })
await page.goto('http://127.0.0.1:5173/?demo=week',{waitUntil:'networkidle'})
await page.waitForTimeout(250)
// demo has library + social; swap social for rest
await page.locator('.action-card',{hasText:'和朋友吃饭'}).click()
await page.locator('.action-card',{hasText:'纯粹的休息'}).click()
await page.waitForTimeout(250)
console.log((await page.locator('.status-card').innerText()).replace(/\n/g,' | '))
console.log((await page.locator('.action-card',{hasText:'纯粹的休息'}).innerText()).replace(/\n/g,' | '))
await browser.close()
