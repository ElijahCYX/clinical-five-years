import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const vals=await page.evaluate(async()=>{
  const s=await import('/src/social.ts'); const demo=await import('/src/demo.ts'); const g=await import('/src/game.ts'); const d=await import('/src/data.ts')
  const rels=s.createInitialRelationships({...demo.demoPlayer,orientation:'bisexual'})
  const full=s.revealAtFullIntimacy({...rels[0],intimacy:100})
  return {costs:[s.dinnerCost(1),s.dinnerCost(2),s.dinnerCost(3)],roommateGender:rels.filter(r=>r.kind==='roommate').map(r=>r.gender),initialIntimacy:rels.map(r=>r.intimacy),hidden:rels.map(r=>r.statsKnown),fullKnown:full.statsKnown,fullStats:full.knownStats}
})
console.log(JSON.stringify(vals,null,2).slice(0,1000))
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1; s.money=500
  s.relationships=social.createInitialRelationships(demo.demoPlayer)
  localStorage.setItem('clinical-five-years-save-v21',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
await page.locator('.interface-btn',{hasText:'TA 是谁'}).click(); await page.waitForTimeout(300)
await page.screenshot({path:'/tmp/shots/whois.png',fullPage:true})
await page.locator('.interface-btn',{hasText:'主界面'}).click(); await page.waitForTimeout(200); await page.locator('.tabs button',{hasText:'舍友'}).click(); await page.waitForTimeout(300)
await page.screenshot({path:'/tmp/shots/roommates.png',fullPage:true})
await browser.close()
