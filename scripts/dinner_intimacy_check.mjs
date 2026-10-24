import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1; s.money=1000; s.composite=10
  s.relationships=social.createInitialRelationships(demo.demoPlayer)
  const ids=[s.relationships[0].id,s.relationships[1].id]
  s.selected=['social','rest']; s.dinnerPlan={acceptedIds:ids,declinedIds:[],cost:45,summary:['A','B']}
  localStorage.setItem('clinical-five-years-save-v22',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v22')).game)
await page.locator('.action-footer .btn-primary',{hasText:'结束本周'}).click(); await page.waitForTimeout(500)
const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v22')).game)
const byId=Object.fromEntries(after.relationships.map(r=>[r.id,r.intimacy]))
console.log('composite:',before.composite,'->',after.composite)
console.log('intimacy gains:',before.relationships.slice(0,2).map(r=>[r.intimacy,byId[r.id]]))
console.log('errors',errors.slice(0,5))
await browser.close()
