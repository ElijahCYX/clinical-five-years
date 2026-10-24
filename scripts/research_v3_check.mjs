import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const lib=await page.evaluate(async()=>{const m=await import('/src/mentors.ts'); const h=await import('/src/hypotheses.ts'); const e=await import('/src/events.ts'); return {mentors:m.MENTOR_LIBRARY.length,hypEach:Object.fromEntries(Object.entries(h.HYPOTHESES_BY_MENTOR).slice(0,3).map(([k,v])=>[k,v.length])),events:e.EVENT_LIBRARY.length}})
console.log(lib)
async function inject(mode){
 await page.evaluate(async(mode)=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts'); const mentors=await import('/src/mentors.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1; s.money=500
  const profile=mentors.MENTOR_LIBRARY[0]; s.mentorProfileId=profile.id; s.mentorContactUnlocked=true; s.labEntered=true; s.relationships=[...social.createInitialRelationships(demo.demoPlayer), mentors.createMentorRelationship(profile,demo.demoPlayer)]; const r=s.relationships[s.relationships.length-1]
  if(mode==='chore'){r.intimacy=45;s.researchStarted=false;s.researchProgress=0}
  if(mode==='publish'){r.intimacy=70;s.researchStarted=true;s.activeHypothesisTitle='测试课题';s.researchProgress=99;s.lastResearchWeek=1}
  localStorage.setItem('clinical-five-years-save-v26',JSON.stringify({game:s,savedAt:Date.now()}))
 },mode)
 await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
}
await inject('chore')
console.log('chore action:',await page.locator('.action-card',{hasText:'实验室打杂'}).count())
await page.locator('.action-card',{hasText:'实验室打杂'}).click(); await page.locator('.action-card',{hasText:'纯粹的休息'}).click(); await page.locator('.action-footer .btn-primary',{hasText:'结束本周'}).click(); await page.waitForTimeout(600)
let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v26')).game)
console.log('after chore:',{intimacy:saved.relationships.find(r=>r.kind==='mentor').intimacy,progress:saved.researchProgress,started:saved.researchStarted})
await inject('publish')
await page.evaluate(()=>{Math.random=()=>0.99})
await page.locator('.action-card',{hasText:'科研'}).click(); await page.locator('.action-card',{hasText:'纯粹的休息'}).click(); await page.locator('.action-footer .btn-primary',{hasText:'结束本周'}).click(); await page.waitForTimeout(700)
saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v26')).game)
console.log('after publish:',{progress:saved.researchProgress,published:saved.researchPublished,journal:saved.researchJournal})
console.log('notice:',await page.locator('.research-notice-modal').count(),await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=> 'none'))
console.log('errors',errors.slice(0,8))
await browser.close()
