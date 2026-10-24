import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
  const s=g.newGameState({...demo.demoPlayer,attrs:{...demo.demoPlayer.attrs,social:6}}); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=0
  s.relationships=social.createInitialRelationships(s.player); s.relationships[0].partner=true; s.relationships[1].partner=true; s.relationships[0].intimacy=80; s.relationships[1].intimacy=80; s.romanceRisk=70
  localStorage.setItem('clinical-five-years-save-v23',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.evaluate(()=>{Math.random=()=>0.01}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(600)
console.log('event title:',await page.locator('.random-event-title').innerText().catch(()=> 'none'))
console.log('event kind:',await page.locator('.random-event-kind-row .pill').innerText().catch(()=> 'none'))
console.log('event text:',(await page.locator('.random-event-text').innerText().catch(()=> 'none')).slice(0,100))
await page.locator('.random-event-footer .btn-primary').click(); await page.waitForTimeout(500)
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v23')).game)
console.log('after:',{partners:saved.relationships.filter(r=>r.partner).length,social:saved.player.attrs.social,risk:saved.romanceRisk,stress:saved.stress,history:saved.eventHistory.slice(-1)})
console.log('errors',errors.slice(0,6))
await browser.close()
