import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1; s.money=1000
  s.relationships=social.createInitialRelationships({...demo.demoPlayer,orientation:'bisexual'}); s.relationships[0].intimacy=70; s.player={...s.player,orientation:'bisexual'}
  s.selected=['social']; s.dinnerPlan={acceptedIds:[s.relationships[0].id],declinedIds:[],cost:50,summary:[s.relationships[0].name]}
  localStorage.setItem('clinical-five-years-save-v21',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(600)
console.log(await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('clinical-five-years-save-v21')).game; return {week:s.week,eventWeek:s.eventWeek,pending:s.pendingEvent?.title??null,screen:s.screen}}))
console.log('overlay',await page.locator('.random-event-overlay').count(),'week',await page.locator('.week-screen').count(),'title',await page.locator('.page-title').innerText().catch(()=>''))
await browser.close()
