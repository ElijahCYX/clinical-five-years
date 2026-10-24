import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts'); const mentors=await import('/src/mentors.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1; s.mentorContactUnlocked=true; s.labEntered=true; s.mentorProfileId='mentor-01'; s.researchProgress=68
  s.relationships=[...social.createInitialRelationships(demo.demoPlayer), mentors.createMentorRelationship(mentors.MENTOR_LIBRARY[0],demo.demoPlayer)]
  localStorage.setItem('clinical-five-years-save-v25',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
await page.locator('.tabs button',{hasText:'科研'}).click(); await page.waitForTimeout(300)
console.log((await page.locator('.tab-panel').last().innerText()).slice(0,500))
await page.screenshot({path:'/tmp/shots/research-tab.png',fullPage:true})
await browser.close()
