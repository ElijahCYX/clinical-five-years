import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const water=d.ELECTIVE_COURSE_BY_ID['elective-tcm']; const politics=d.POLITICS_COURSES[0]
  const base=g.newGameState(demo.demoPlayer); base.seasonIndex=0; base.season={...d.SEASONS[0],courses:[...d.SEASONS[0].courses,water,politics]}; base.plan='B'; base.habits=['timeManagement','earlySleep']; base.weekFocus='balanced'; base.selected=['electiveHomework','rest']
  const sim=g.simulateWeek(base)
  return {water:sim.prep[water.id],politics:sim.prep[politics.id]}
})
console.log('gains:',r)
await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await page.waitForTimeout(250)
await page.locator('.field input').first().fill('作业测试'); await page.locator('.confirm-box .btn-primary').click(); await page.waitForTimeout(300)
await page.locator('.opening-talent-card').first().click(); await page.locator('.talent-select-footer .btn-primary').click(); await page.waitForTimeout(350)
// elective stage submit no courses to get to plan
await page.locator('.elective-footer .btn-primary').click(); await page.waitForTimeout(200); await page.locator('.elective-result .btn-primary').click(); await page.waitForTimeout(250)
await page.locator('.plan-card',{hasText:'周期回顾'}).click(); await page.locator('.habit-card',{hasText:'时间管理'}).click(); await page.locator('.habit-card',{hasText:'早睡'}).click(); await page.locator('.plan-footer .btn-primary').click(); await page.waitForTimeout(350)
const card=page.locator('.action-card',{hasText:'小组作业 / 选修课程'}).first()
console.log('card count:', await card.count(), 'disabled without electives:', await card.isDisabled().catch(()=>false))
console.log('errors:',errors.slice(0,5))
await browser.close()
