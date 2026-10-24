import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const s=g.newGameState(demo.demoPlayer); s.seasonIndex=0; s.season=d.SEASONS[0]; s.screen='week'; s.week=1; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.weekFocus='balanced'; s.electiveOffers=[]; s.electiveSelectionDone=true
  const c=d.ELECTIVE_COURSE_BY_ID['elective-piano']; s.season={...s.season,courses:[...s.season.courses,c]}; s.electiveHistory=[c.id]
  localStorage.setItem('clinical-five-years-save-v18',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400)
console.log('withdraw buttons:', await page.locator('.withdraw-elective-btn').count())
await page.locator('.withdraw-elective-btn').click(); await page.waitForTimeout(300)
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v18')).game)
console.log('season courses:', saved.season.courses.map(c=>c.id), 'history:', saved.electiveHistory)
console.log('errors:', errors.slice(0,5))
await browser.close()
