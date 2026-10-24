import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:390,height:844}, isMobile:true, deviceScaleFactor:2 })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await page.waitForTimeout(250)
await page.locator('.field input').first().fill('移动测试'); await page.locator('.confirm-box .btn-primary').click(); await page.waitForTimeout(300)
await page.locator('.opening-talent-card').first().click(); await page.locator('.talent-select-footer .btn-primary').click(); await page.waitForTimeout(350)
await page.locator('.plan-card',{hasText:'周期回顾'}).click(); await page.waitForTimeout(100)
const habitNames=await page.locator('.habit-card .habit-name').allInnerTexts()
// pick first two not disabled
for (const name of habitNames.slice(0,2)) { await page.locator('.habit-card',{hasText:name}).click(); await page.waitForTimeout(80) }
await page.locator('.plan-footer .btn-primary').click(); await page.waitForTimeout(350)
await page.locator('.action-card',{hasText:'泡图书馆'}).first().click(); await page.waitForTimeout(250)
if(await page.locator('.focus-modal').count()){await page.locator('.focus-choice').first().click(); await page.waitForTimeout(250)}
console.log('mobile hud:', await page.locator('.mobile-hud').count(), 'left:', await page.locator('.game-left').isVisible().catch(()=>false))
console.log('action columns:', await page.locator('.actions-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns).catch(()=> 'none'))
console.log('nav visible:', await page.locator('.interface-nav').isVisible().catch(()=>false), 'width:', (await page.locator('.interface-nav').boundingBox())?.width)
console.log('errors:', errors.slice(0,5))
await page.screenshot({path:'/tmp/shots/mobile-week.png',fullPage:true})
await page.locator('.interface-btn',{hasText:'我是谁'}).click(); await page.waitForTimeout(300)
await page.screenshot({path:'/tmp/shots/mobile-whoami.png',fullPage:true})
console.log('whoami:', await page.locator('.page-title').innerText())
await browser.close()
