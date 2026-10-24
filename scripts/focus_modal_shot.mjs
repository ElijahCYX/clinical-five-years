import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await page.waitForTimeout(250)
await page.locator('.field input').first().fill('焦点测试'); await page.locator('.confirm-box .btn-primary').click(); await page.waitForTimeout(300)
await page.locator('.plan-card',{hasText:'周期回顾'}).click(); await page.locator('.habit-card',{hasText:'时间管理'}).click(); await page.locator('.habit-card',{hasText:'早睡'}).click(); await page.locator('.plan-footer .btn-primary').click(); await page.waitForTimeout(400)
await page.screenshot({path:'/tmp/shots/focus-modal.png',fullPage:true})
await browser.close()
