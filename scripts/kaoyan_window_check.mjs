import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=17; s.season=SEASONS[17]; s.screen='week'; s.week=1; s.plan='B'; s.habit='timeManagement'; s.postgradChoice='both'; s.baoyanResult='fail'; s.kaoyanRegistered=true; s.prep=Object.fromEntries(SEASONS[17].courses.map(c=>[c.id,20])); s.money=1200
  localStorage.setItem('clinical-five-years-save-v5',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400)
console.log('kaoyan action:', await page.locator('.action-card',{hasText:'考研复习'}).count())
await page.locator('.action-card',{hasText:'考研复习'}).click(); await page.locator('.action-card',{hasText:'纯粹的休息'}).click(); await page.waitForTimeout(200)
console.log('selected:', (await page.locator('.selected-summary').innerText()).replace(/\n/g,' | '))
await page.screenshot({path:'/tmp/shots/kaoyan-week.png',fullPage:true})
await browser.close()
