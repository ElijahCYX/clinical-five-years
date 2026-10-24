import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
const wait=(ms=250)=>page.waitForTimeout(ms)
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=1; s.season=SEASONS[1]; s.screen='week'; s.week=3; s.plan='B'; s.habit='timeManagement'; s.energy=90; s.stress=20; s.english=30; s.money=1200; s.cetWindow='winter'; s.cet4Registered=true; s.prep=Object.fromEntries(SEASONS[1].courses.map(c=>[c.id,30])); s.examKind=undefined
  localStorage.setItem('clinical-five-years-save-v7',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(350)
// end week 3 -> prep
await page.locator('.action-card',{hasText:'纯粹的休息'}).click(); await page.locator('.action-card',{hasText:'运动'}).click(); await page.locator('.action-footer .btn-primary').click(); await page.waitForTimeout(350)
console.log('prep:', await page.locator('.prep-screen').count())
await page.locator('.review-card',{hasText:'休息调整'}).first().click(); await page.locator('.prep-confirm .btn-primary').click(); await page.waitForTimeout(500)
await page.locator('.result-actions .btn-primary').click(); await page.waitForTimeout(350)
console.log('vacation:', await page.locator('.vacation-screen').count())
for(let i=0;i<2;i++){ await page.locator('.action-card',{hasText:'纯粹的休息'}).click(); await page.locator('.action-card',{hasText:'健身 / 运动'}).click(); await page.locator('.action-footer .btn-primary').click(); await page.waitForTimeout(400) }
await page.waitForTimeout(400)
console.log('cet result:', await page.locator('.event-screen').count(), await page.locator('.event-title').innerText().catch(()=> 'none'))
console.log('sub:', await page.locator('.event-sub').innerText().catch(()=> 'none'))
console.log('errors:', errors.slice(0,5))
await page.screenshot({path:'/tmp/shots/cet-winter-result.png',fullPage:true})
await browser.close()
