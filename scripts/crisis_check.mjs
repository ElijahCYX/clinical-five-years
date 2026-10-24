import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
const save='clinical-five-years-save-v10'
async function inject(fn){ await page.evaluate(async(fnStr)=>{ const mods=await import('/src/game.ts'); const data=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const s=mods.newGameState(demo.demoPlayer); eval(fnStr); localStorage.setItem('clinical-five-years-save-v10',JSON.stringify({game:s,savedAt:Date.now()})) }, fn.toString().replace(/^[^{]*{/,'').replace(/}$/,'')) }
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
// stress case
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=1; s.season=SEASONS[1]; s.screen='week'; s.week=1; s.plan='B'; s.habit='timeManagement'; s.energy=80; s.stress=85
  localStorage.setItem('clinical-five-years-save-v10',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('stress crisis:', await page.locator('.crisis-screen').count(), await page.locator('.event-title').innerText().catch(()=> 'none'))
console.log('debuff saved:', await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v10')).game.highPressureDebuff))
await page.screenshot({path:'/tmp/shots/crisis-stress.png',fullPage:true})
await page.locator('.event-actions .btn-primary').click(); await page.waitForTimeout(350)
console.log('after dismiss week:', await page.locator('.week-screen').count().catch(()=>0), 'stored view ok')
// energy case
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=1; s.season=SEASONS[1]; s.screen='week'; s.week=1; s.plan='B'; s.habit='timeManagement'; s.energy=15; s.stress=50
  localStorage.setItem('clinical-five-years-save-v10',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('energy crisis:', await page.locator('.crisis-screen').count(), await page.locator('.event-title').innerText().catch(()=> 'none'))
await page.screenshot({path:'/tmp/shots/crisis-energy.png',fullPage:true})
await page.locator('.event-actions .btn-primary').click(); await page.waitForTimeout(350)
console.log('low energy alert saved:', await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v10')).game.lowEnergyAlert))
const locked=await page.locator('.action-card.is-locked').count(); const total=await page.locator('.action-card').count();
const rest=await page.locator('.action-card',{hasText:'纯粹的休息'}).first().isDisabled().catch(()=>true)
console.log('locked cards:', locked, '/', total, 'rest disabled:', rest)
console.log('errors:', errors.slice(0,5))
await browser.close()
