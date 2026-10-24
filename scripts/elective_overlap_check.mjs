import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='plan'; s.electiveSelectionDone=false; s.electiveOffers=g.generateElectiveOffers([],[],[])
  localStorage.setItem('clinical-five-years-save-v19',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
const boxes=await page.locator('.elective-card').evaluateAll(cards=>cards.map(card=>{
  const prob=card.querySelector('.elective-card-top span:last-child').getBoundingClientRect()
  const pick=card.querySelector('.elective-pick').getBoundingClientRect()
  return {prob:{x:prob.x,y:prob.y,w:prob.width,h:prob.height},pick:{x:pick.x,y:pick.y,w:pick.width,h:pick.height},overlap:!(prob.right<pick.left||pick.right<prob.left||prob.bottom<pick.top||pick.bottom<prob.top)}
}))
console.log(boxes)
console.log('errors',errors.slice(0,5))
await page.screenshot({path:'/tmp/shots/elective-fixed.png',fullPage:true})
await browser.close()
