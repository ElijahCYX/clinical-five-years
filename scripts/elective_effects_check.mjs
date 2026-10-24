import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const base=g.newGameState(demo.demoPlayer); base.seasonIndex=0; base.season=d.SEASONS[0]; base.plan='B'; base.habits=['timeManagement','earlySleep']; base.selected=['library','rest']; base.weekFocus='balanced'
  const interest=d.ELECTIVE_COURE? d.ELECTIVE_COURSE_BY_ID['elective-piano'] : d.ELECTIVE_COURSE_BY_ID['elective-piano']
  const group=d.ELECTIVE_COURSE_BY_ID['elective-history']
  const water=d.ELECTIVE_COURSE_BY_ID['elective-tcm']
  const plain=g.simulateWeek(base)
  const withInterest=g.simulateWeek({...base,season:{...base.season,courses:[...base.season.courses,interest]}})
  const withGroup=g.simulateWeek({...base,season:{...base.season,courses:[...base.season.courses,group]}})
  const withWater=g.simulateWeek({...base,season:{...base.season,courses:[...base.season.courses,water]}})
  return {plain:{e:plain.energy,s:plain.stress,social:plain.socialGrowth},interest:{e:withInterest.energy,s:withInterest.stress},group:{e:withGroup.energy,social:withGroup.socialGrowth},waterGain:withWater.prep[water.id],baseWaterGain:plain.prep[water.id]}
})
console.log(JSON.stringify(r,null,2))
// abandon UI
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='result'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=4; s.plan='B'; s.habits=['timeManagement','earlySleep']
  const water=d.ELECTIVE_COURSE_BY_ID['elective-tcm']; s.season={...s.season,courses:[...s.season.courses,water]}; s.electiveHistory=[water.id]
  s.results=[{course:water,score:50,gpa:0,expectedMin:50,expectedMax:60,stressRelief:0}]
  localStorage.setItem('clinical-five-years-save-v18',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400)
console.log('abandon buttons:', await page.locator('.abandon-elective-btn').count())
await page.locator('.abandon-elective-btn').click(); await page.waitForTimeout(300)
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v18')).game)
console.log('after abandon results:', saved.results.length, 'electiveHistory:', saved.electiveHistory.length, 'seasonCourses:', saved.season.courses.length)
console.log('errors:', errors.slice(0,5))
await browser.close()
