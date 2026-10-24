import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const helper=await page.evaluate(async()=>{const g=await import('/src/game.ts'); return [g.examCoffeeMultiplier({examCoffee:false}),g.examCoffeeMultiplier({examCoffee:true})]})
console.log('multipliers',helper)
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='prep'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=4; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.energy=60; s.stress=30; s.money=100; s.electiveSelectionDone=true
  localStorage.setItem('clinical-five-years-save-v19',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('coffee text:', (await page.locator('.boost-row',{hasText:'喝咖啡'}).innerText()).replace(/\n/g,' | ').slice(0,220))
await page.locator('.boost-row',{hasText:'喝咖啡'}).locator('.boost-btn').click(); await page.waitForTimeout(300)
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v19')).game)
console.log({money:saved.money,energy:saved.energy,stress:saved.stress,coffee:saved.examCoffee})
console.log('errors',errors.slice(0,5))
await browser.close()
