import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const formula=await page.evaluate(async()=>{const g=await import('/src/game.ts'); return [80,85,90,79,91].map(s=>[s,g.stressReliefForScore(s,85)])})
console.log('formula center85:', JSON.stringify(formula))
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=0; s.season=SEASONS[0]; s.screen='result'; s.stress=50; s.cumulativeCredits=3; s.cumulativePoints=11.7
  s.results=SEASONS[0].courses.slice(0,2).map((c,i)=>({course:c,score:[80,90][i],gpa:[3.6,5][i],expectedMin:80,expectedMax:90,stressRelief:[0,10][i]}))
  s.stressRewardedCourses=[s.results[0].course.id,s.results[1].course.id]
  localStorage.setItem('clinical-five-years-save-v11',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(450)
console.log('table:', (await page.locator('.report-table').innerText()).replace(/\n/g,' | '))
console.log('relief note:', await page.locator('.result-relief').innerText().catch(()=> 'none'))
await page.screenshot({path:'/tmp/shots/stress-relief-result.png',fullPage:true})
console.log('errors:',errors.slice(0,5))
await browser.close()
