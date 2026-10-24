import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1100} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const pre=await page.evaluate(async()=>{
  const {newGameState}=await import('/src/game.ts'); const {SEASONS}=await import('/src/data.ts'); const {demoPlayer}=await import('/src/demo.ts')
  const s=newGameState(demoPlayer); s.seasonIndex=1; s.season=SEASONS[1]; s.screen='week'; s.week=1; s.plan='B'; s.habit='timeManagement'; s.energy=80; s.stress=85
  localStorage.setItem('clinical-five-years-save-v10',JSON.stringify({game:s,savedAt:Date.now()}))
  return {screen:s.screen, stress:s.stress, season:s.season.seasonLabel}
})
console.log('pre',pre)
await page.reload({waitUntil:'networkidle'})
const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v10')))
console.log('stored before',{screen:stored.game.screen,stress:stored.game.stress,debuff:stored.game.highPressureDebuff})
await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(1500)
console.log('after', await page.evaluate(()=>{const x=JSON.parse(localStorage.getItem('clinical-five-years-save-v10')); return {screen:x.game.screen,stress:x.game.stress,debuff:x.game.highPressureDebuff}}))
console.log('body top', (await page.locator('.screen').first().getAttribute('class')))
console.log('h1', await page.locator('h1').first().innerText().catch(()=> 'none'))
await browser.close()
