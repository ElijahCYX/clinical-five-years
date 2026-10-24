import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
console.log('version:', await page.locator('#app-version').innerText())
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=1; s.season=SEASONS[1]; s.screen='prep'; s.week=4; s.plan='B'; s.habit='timeManagement'; s.energy=80; s.stress=30; s.english=20; s.prep=Object.fromEntries(SEASONS[1].courses.map(c=>[c.id,50])); s.money=1200; s.cetWindow='winter'; s.cet4Registered=true
  localStorage.setItem('clinical-five-years-save-v7',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(350)
await page.locator('.boost-btn',{hasText:'背一轮'}).click(); await page.waitForTimeout(250)
const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v7')).game)
console.log('bonus:', {attempt:save.cetAttemptBonus, flag:save.examEnglishPrep, english:save.english})
await browser.close()
