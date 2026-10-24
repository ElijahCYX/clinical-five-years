import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='vacation';s.seasonIndex=1;s.season=d.SEASONS[1];s.week=1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.money=1000;s.stress=40;s.energy=60;s.vacation={kind:'winter',week:1,totalWeeks:3};s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);s.relationships[0].intimacy=80;localStorage.setItem('clinical-five-years-save-v28',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400)
console.log('nav',await page.locator('.interface-nav').count(),'badge',await page.locator('.interface-badge').allInnerTexts())
await page.evaluate(()=>{Math.random=()=>0.01})
await page.locator('.action-card',{hasText:'出门旅行'}).click();await page.waitForTimeout(250)
await page.locator('.dinner-person').first().click();await page.locator('.dinner-footer .btn-primary',{hasText:'发出邀请'}).click();await page.waitForTimeout(250)
console.log((await page.locator('.dinner-modal').innerText()).slice(-180))
await page.locator('.dinner-footer .btn-primary',{hasText:'确认同行'}).click();await page.waitForTimeout(250)
let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v28')).game);console.log('plan cost',s.vacationTravel?.cost,'selected',s.selected)
await page.locator('.action-card',{hasText:'纯粹的休息'}).click();await page.locator('.action-footer .btn-primary',{hasText:'结束本周'}).click();await page.waitForTimeout(500)
console.log('travel modal count',await page.locator('.travel-event-modal').count())
let seenTitles=[]; for(let i=0;i<3;i++){
 const title=await page.locator('.travel-event-modal .random-event-title').innerText().catch(()=>null); if(!title)break; seenTitles.push(title)
 const opts=page.locator('.travel-event-modal .encounter-options button'); if(await opts.count()){await opts.first().click();await page.waitForTimeout(150)}
 const next=page.locator('.travel-event-modal .random-event-footer .btn-primary'); if(await next.count()){await next.click();await page.waitForTimeout(200)} else break
}
console.log('travel titles',seenTitles)
s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v28')).game);console.log('money/week',s.money,s.vacation?.week,'travel',s.vacationTravel)
console.log('errors',errors.slice(0,5))
await browser.close()
