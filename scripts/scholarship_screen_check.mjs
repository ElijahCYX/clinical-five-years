import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
console.log('version:', await page.locator('#app-version').innerText())
await page.evaluate(async()=>{
  const {newGameState, scholarshipFor}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=4; s.season=SEASONS[4]; s.screen='scholarship'; s.plan='B'; s.habit='timeManagement'; s.composite=40; s.research=100; s.cumulativeCredits=83; s.cumulativePoints=300
  const rec={year:1,gpa:3.9,compositeGain:40,researchGain:100,papers:1,failed:false,cumulativeCredits:83,cumulativePoints:300,cumulativeComposite:40,cumulativeResearch:100,evaluated:false,award:null,score:null}
  const score=scholarshipFor(rec,s.player,[],false); rec.evaluated=true; rec.award=score.award; rec.score=score; s.yearRecords=[rec]
  localStorage.setItem('clinical-five-years-save-v8',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400)
console.log('title:', await page.locator('.event-title').innerText().catch(()=> 'none'))
console.log('body:', (await page.locator('.event-card').innerText()).replace(/\n/g,' | ').slice(0,700))
await page.screenshot({path:'/tmp/shots/scholarship.png', fullPage:true})
console.log('errors:', errors.slice(0,5))
await browser.close()
