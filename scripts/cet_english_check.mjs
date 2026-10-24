import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
const SAVE='clinical-five-years-save-v7'
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const version = await page.locator('#app-version').innerText().catch(()=> 'none')
console.log('version:', version)
await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=1; s.season=SEASONS[1]; s.screen='prep'; s.week=4; s.plan='B'; s.habit='timeManagement'; s.energy=80; s.stress=30; s.english=20; s.cetWindow='winter'; s.cet4Registered=true; s.prep=Object.fromEntries(SEASONS[1].courses.map(c=>[c.id,50])); s.money=1200
  localStorage.setItem('clinical-five-years-save-v7',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400)
console.log('prep:', await page.locator('.prep-screen').count(), 'english row:', await page.locator('.boost-row',{hasText:'英语备考'}).count())
await page.locator('.boost-btn',{hasText:'背一轮'}).click(); await page.waitForTimeout(300)
console.log('disabled:', await page.locator('.boost-btn',{hasText:'已备考'}).isDisabled())
const save = await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v7')).game)
console.log('after english:', {energy:save.energy,stress:save.stress,english:save.english,cetBonus:save.cetBonus,flag:save.examEnglishPrep})
console.log('option:', (await page.locator('.review-options').innerText()).replace(/\n/g,' | ').slice(0,500))
await page.screenshot({path:'/tmp/shots/english-prep.png',fullPage:true})
console.log('errors:', errors.slice(0,5))
await browser.close()
