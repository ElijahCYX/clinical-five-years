import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=1; s.season=SEASONS[1]; s.screen='week'; s.week=2; s.plan='B'; s.habit='timeManagement'; s.prep=Object.fromEntries(SEASONS[1].courses.map(c=>[c.id,20])); s.money=1500
  localStorage.setItem('clinical-five-years-save-v7',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(350)
await page.locator('.action-card',{hasText:'纯粹的休息'}).click(); await page.locator('.action-card',{hasText:'运动'}).click(); await page.locator('.action-footer .btn-primary').click(); await page.waitForTimeout(400)
console.log('title:', await page.locator('.event-title').innerText().catch(()=> 'none'))
console.log('body:', (await page.locator('.event-card').innerText()).replace(/\n/g,' | ').slice(0,500))
await page.screenshot({path:'/tmp/shots/cet-winter-event.png',fullPage:true})
console.log('errors:', errors.slice(0,5))
await browser.close()
