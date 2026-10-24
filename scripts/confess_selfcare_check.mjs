import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
  const s=g.newGameState({...demo.demoPlayer,orientation:'bisexual'}); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1; s.money=50
  s.relationships=social.createInitialRelationships({...demo.demoPlayer,orientation:'bisexual'}); s.relationships[0].intimacy=70
  localStorage.setItem('clinical-five-years-save-v21',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
console.log('selfCare disabled at 50:',await page.locator('.action-card',{hasText:'对自己好一点'}).isDisabled())
console.log('social disabled at 50:',await page.locator('.action-card',{hasText:'和朋友吃饭'}).isDisabled())
await page.locator('.interface-btn',{hasText:'TA 是谁'}).click(); await page.waitForTimeout(300)
const btn=page.locator('.whois-confess').first(); console.log('confess:',await btn.innerText(),'disabled:',await btn.isDisabled())
await btn.click(); await page.waitForTimeout(400)
console.log('message:',(await page.locator('.whois-message').innerText().catch(()=> 'none')).slice(0,150))
console.log('errors',errors.slice(0,6))
await browser.close()
