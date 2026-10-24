import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const data=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const base=g.newGameState(demo.demoPlayer); base.seasonIndex=0; base.season=data.SEASONS[0]; base.plan='B'; base.weekFocus='balanced'; base.constitutionGrowth=20
  base.habits=['timeManagement','earlySleep']; base.selected=['library','rest']
  const noExercise=g.simulateWeek(base)
  const withSport=g.simulateWeek({...base,selected:['library','sport']})
  const withFitness=g.simulateWeek({...base,habits:['fitness','earlySleep']})
  return {base:base.constitutionGrowth,noExercise:noExercise.constitutionGrowth,withSport:withSport.constitutionGrowth,withFitness:withFitness.constitutionGrowth,difficulties:data.SEASONS[0].courses.map(c=>[c.name,g.courseDifficulty(c)])}
})
console.log(JSON.stringify(r,null,2))
await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await page.waitForTimeout(250)
await page.locator('.field input').first().fill('计划测试'); await page.locator('.confirm-box .btn-primary').click(); await page.waitForTimeout(300)
await page.locator('.opening-talent-card').first().click(); await page.locator('.talent-select-footer .btn-primary').click(); await page.waitForTimeout(350)
console.log('course cards:', await page.locator('.plan-course-card').count())
console.log('first course:', (await page.locator('.plan-course-card').first().innerText()).replace(/\n/g,' | '))
await page.screenshot({path:'/tmp/shots/plan-courses.png',fullPage:true})
console.log('errors:', errors.slice(0,5))
await browser.close()
