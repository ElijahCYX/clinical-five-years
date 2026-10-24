import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const meta=await page.evaluate(async()=>{
  const e=await import('/src/events.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const roles=[]
  for(const o of ['heterosexual','homosexual','bisexual']){
    for(const g of ['女','男']){
      const p={...demo.demoPlayer,gender:g,orientation:o}; const set=new Set(); for(let i=0;i<40;i++) set.add(e.npcRole(p)); roles.push([g,o,[...set].sort()])
    }
  }
  return {roles}
})
console.log(meta)
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=0
  localStorage.setItem('clinical-five-years-save-v20',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'})
await page.evaluate(()=>{Math.random=()=>0.01})
await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(700)
console.log('event screen:',await page.locator('.random-event-overlay').count(), 'title:',await page.locator('.random-event-overlay .random-event-title').innerText().catch(()=> 'none'))
console.log('event text:',(await page.locator('.random-event-text').innerText().catch(()=> 'none')).slice(0,100))
console.log('effects:',await page.locator('.random-event-effect').allInnerTexts())
await page.locator('.random-event-footer .btn-primary').click(); await page.waitForTimeout(400)
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v20')).game)
console.log('after event:',{screen:saved.screen,eventWeek:saved.eventWeek,history:saved.eventHistory.slice(-1),pending:saved.pendingEvent})
console.log('errors',errors.slice(0,5))
await browser.close()
