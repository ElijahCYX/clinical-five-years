import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const data=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const s=g.newGameState(demo.demoPlayer)
  const seasonCredits=d.SEASONS.reduce((sum,se)=>sum+se.courses.reduce((x,c)=>x+c.credits,0),0)
  const counts={water:0,interest:0,group:0}
  for(const c of d.ELECTIVE_COURSES) counts[c.electiveType]++
  return {seasonCredits,plusPE:seasonCredits+10,electiveCount:d.ELECTIVE_COURSES.length,counts,offers:s.electiveOffers,grad:g.GRADUATION_CREDITS}
})
console.log(JSON.stringify(data,null,2))
await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await page.waitForTimeout(250)
await page.locator('.field input').first().fill('选修测试'); await page.locator('.confirm-box .btn-primary').click(); await page.waitForTimeout(300)
await page.locator('.opening-talent-card').first().click(); await page.locator('.talent-select-footer .btn-primary').click(); await page.waitForTimeout(400)
console.log('elective screen:', await page.locator('.elective-screen').count(), 'cards:', await page.locator('.elective-card').count())
console.log('elective title:', await page.locator('.page-title').innerText().catch(()=> 'none'))
if(await page.locator('.elective-card').count()) await page.locator('.elective-card').first().click()
await page.locator('.elective-footer .btn-primary').click(); await page.waitForTimeout(300)
console.log('result:', (await page.locator('.elective-result').innerText()).replace(/\n/g,' | ').slice(0,300))
await page.screenshot({path:'/tmp/shots/elective.png',fullPage:true})
await page.locator('.elective-result .btn-primary').click(); await page.waitForTimeout(400)
console.log('plan cards after:', await page.locator('.plan-card').count(), 'courses:', await page.locator('.plan-course-card').count())
console.log('errors:', errors.slice(0,5))
await browser.close()
