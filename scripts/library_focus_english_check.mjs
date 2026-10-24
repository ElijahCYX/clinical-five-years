import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const gains=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const data=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const base=g.newGameState(demo.demoPlayer); base.seasonIndex=0; base.season=data.SEASONS[0]; base.plan='B'; base.habits=['timeManagement','earlySleep']; base.selected=['english'];
  const out={}
  for (const m of [2,4,6,8,10]) { const s={...base,player:{...base.player,attrs:{...base.player.attrs,memory:m}},weekFocus:null}; const sim=g.simulateWeek(s); out[m]=sim.english }
  return out
})
console.log('english gains by memory:', gains)
await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await page.waitForTimeout(250)
await page.locator('.field input').first().fill('英语测试'); await page.locator('.confirm-box .btn-primary').click(); await page.waitForTimeout(300)
await page.locator('.plan-card',{hasText:'周期回顾'}).click(); await page.locator('.habit-card',{hasText:'时间管理'}).click(); await page.locator('.habit-card',{hasText:'早睡'}).click(); await page.locator('.plan-footer .btn-primary').click(); await page.waitForTimeout(350)
console.log('modal at start:', await page.locator('.focus-modal').count())
await page.locator('.action-card',{hasText:'泡图书馆'}).first().click(); await page.waitForTimeout(300)
console.log('modal after library:', await page.locator('.focus-modal').count())
await page.locator('.focus-choice').first().click(); await page.waitForTimeout(300)
console.log('summary after focus:', (await page.locator('.selected-summary').innerText()).replace(/\n/g,' | '))
console.log('focus bar:', (await page.locator('.week-focus-bar').innerText()).replace(/\n/g,' | '))
const englishCard=page.locator('.action-card',{hasText:'学英语'}).first()
console.log('english effect:', (await englishCard.innerText()).split('\n').slice(-8).join(' | '))
console.log('errors:', errors.slice(0,5))
await page.screenshot({path:'/tmp/shots/library-focus.png',fullPage:true})
await browser.close()
