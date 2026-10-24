import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const e=await import('/src/events.ts'); const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=0
  Math.random=()=>0.01
  const pending=e.rollWeeklyEvent(s); s.pendingEvent=pending; s.screen='randomEvent'; s.eventWeek=1
  localStorage.setItem('clinical-five-years-save-v20',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('title:',await page.locator('.random-event-screen .page-title').innerText(), 'kind:',await page.locator('.random-event-kind-row .pill').innerText())
await page.screenshot({path:'/tmp/shots/event-screen.png',fullPage:true})
await browser.close()
