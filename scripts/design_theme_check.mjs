import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const errors=[]
async function inject(page, {stress=30,energy=80}={}){
  await page.evaluate(async({stress,energy})=>{
    const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
    const s=g.newGameState(demo.demoPlayer); s.seasonIndex=0; s.season=d.SEASONS[0]; s.screen='week'; s.week=1; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.stress=stress; s.energy=energy
    localStorage.setItem('clinical-five-years-save-v19',JSON.stringify({game:s,savedAt:Date.now()}))
  },{stress,energy})
}
async function open(page){await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(600)}
const page=await browser.newPage({viewport:{width:1500,height:1200}})
page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await inject(page); await open(page)
console.log('desktop fonts', await page.evaluate(()=>{const q=s=>getComputedStyle(document.querySelector(s)).fontSize; return {action:q('.action-effect'), memo:q('.memo-text'), card:q('.card-head'), body:q('body')}}))
await page.screenshot({path:'/tmp/shots/design-desktop.png',fullPage:true})
await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(300)
console.log('mobile columns', await page.locator('.actions-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns), 'height', await page.evaluate(()=>document.body.scrollHeight))
await page.screenshot({path:'/tmp/shots/design-mobile.png',fullPage:true})
await page.setViewportSize({width:1500,height:1200}); await inject(page,{stress:85,energy:80}); await open(page)
console.log('stress classes', await page.evaluate(()=>document.body.className), 'title', await page.locator('.event-title').innerText().catch(()=> 'none'))
await page.screenshot({path:'/tmp/shots/theme-stress.png',fullPage:true})
await inject(page,{stress:30,energy:15}); await open(page)
console.log('energy classes', await page.evaluate(()=>document.body.className), 'title', await page.locator('.event-title').innerText().catch(()=> 'none'))
await page.screenshot({path:'/tmp/shots/theme-energy.png',fullPage:true})
console.log('errors',errors.slice(0,5))
await browser.close()
