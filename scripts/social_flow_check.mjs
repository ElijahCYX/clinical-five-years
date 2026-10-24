import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1; s.money=1000
  s.relationships=social.createInitialRelationships({...demo.demoPlayer,orientation:'bisexual'}); s.relationships[0].intimacy=70; s.player={...s.player,orientation:'bisexual'}
  s.selected=['social']; s.dinnerPlan={acceptedIds:[s.relationships[0].id],declinedIds:[],cost:50,summary:[s.relationships[0].name]}
  localStorage.setItem('clinical-five-years-save-v21',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('debug load',await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('clinical-five-years-save-v21')).game;return {week:s.week,eventWeek:s.eventWeek,pending:s.pendingEvent?.title??null}}), 'overlay', await page.locator('.random-event-overlay').count())
// self-care card state money1000 -> enabled
console.log('selfCare disabled at 1000:', await page.locator('.action-card',{hasText:'对自己好一点'}).isDisabled())
// add rest then end
await page.locator('.action-card',{hasText:'纯粹的休息'}).click(); await page.waitForTimeout(200)
const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v21')).game)
await page.locator('.action-footer .btn-primary',{hasText:'结束本周'}).click(); await page.waitForTimeout(500)
const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v21')).game)
console.log('after week money:',before.money,'->',after.money, 'rel intimacy:',after.relationships[0].intimacy, 'dinner:',after.dinnerPlan)
// TA confession button
await page.evaluate(async()=>{
  const s=JSON.parse(localStorage.getItem('clinical-five-years-save-v21')).game; s.screen='week'; s.week=1; s.eventWeek=1; s.relationships[0].intimacy=70; s.relationships[0].statsKnown=false; s.relationships[0].knownStats=null; localStorage.setItem('clinical-five-years-save-v21',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400); await page.locator('.interface-btn',{hasText:'TA 是谁'}).click(); await page.waitForTimeout(300)
console.log('confess button:', await page.locator('.whois-confess').first().innerText(), 'disabled:', await page.locator('.whois-confess').first().isDisabled())
console.log('errors',errors.slice(0,6))
await browser.close()
