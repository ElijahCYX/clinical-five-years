import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=0; s.season=SEASONS[0]; s.screen='result'; s.week=4; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.energy=70; s.stress=40; s.cumulativeCredits=3; s.cumulativePoints=11.7
  s.results=SEASONS[0].courses.slice(0,2).map((c,i)=>({course:c,score:[80,90][i],gpa:[3.6,5][i],expectedMin:80,expectedMax:90,stressRelief:[0,10][i]}))
  s.stressRewardedCourses=[s.results[0].course.id,s.results[1].course.id]
  localStorage.setItem('clinical-five-years-save-v12',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('topbar save:', await page.locator('.topbar .save-chip').count())
console.log('result save:', await page.locator('.result-actions .btn-save').count())
console.log('result actions:', (await page.locator('.result-actions').innerText()).replace(/\n/g,' | '))
const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v12')).savedAt)
await page.locator('.result-actions .btn-save').click(); await page.waitForTimeout(250)
const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v12')).savedAt)
console.log('savedAt moved:', after>before)
await page.screenshot({path:'/tmp/shots/result-save-button.png',fullPage:true})
console.log('errors:', errors.slice(0,5))
await browser.close()
