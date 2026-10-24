import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
const wait=(ms=250)=>page.waitForTimeout(ms)
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await wait(200)
await page.locator('.field input').first().fill('补考测试'); await page.locator('.confirm-box .btn-primary').click(); await wait(250)
// plan C, no habit
await page.locator('.plan-card',{hasText:'考前突击'}).click(); await page.locator('.habit-card',{hasText:'时间管理'}).click(); await page.locator('.plan-footer .btn-primary').click(); await wait(300)
for(let i=0;i<3;i++){ await page.locator('.action-card',{hasText:'纯粹的休息'}).first().click(); await page.locator('.action-card',{hasText:'运动'}).first().click(); await page.locator('.action-footer .btn-primary').click(); await wait(300) }
console.log('prep:', await page.locator('.prep-screen').count())
await page.locator('.review-card',{hasText:'休息调整'}).first().click(); await page.locator('.prep-confirm .btn-primary').click(); await wait(500)
console.log('result rows:', (await page.locator('.report-table tbody').innerText()).replace(/\n/g,' | '))
console.log('continue:', await page.locator('.result-actions .btn-primary').innerText())
await page.locator('.result-actions .btn-primary').click(); await wait(400)
if (await page.locator('.plan-screen').count()) {
  await page.locator('.plan-card',{hasText:'考前突击'}).click();
  await page.locator('.habit-card',{hasText:'时间管理'}).click();
  await page.locator('.plan-footer .btn-primary').click(); await wait(350)
}
console.log('makeup tags in next term:', await page.locator('.makeup-tag').count())
if(await page.locator('.game-screen').count()) {
  console.log('week course text:', (await page.locator('.course-card').innerText()).replace(/\n/g,' | ').slice(0,500))
}
await page.screenshot({path:'/tmp/shots/makeup-next-term.png', fullPage:true})
console.log('errors:', errors.slice(0,5))
await browser.close()
