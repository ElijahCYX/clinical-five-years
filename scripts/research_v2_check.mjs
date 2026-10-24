import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const formula=await page.evaluate(async()=>{const m=await import('/src/mentors.ts'); const demo=await import('/src/demo.ts'); const p={...demo.demoPlayer,attrs:{...demo.demoPlayer.attrs,appearance:2}}; const a=m.createMentorRelationship(m.MENTOR_LIBRARY[0],p); const p2={...p,attrs:{...p.attrs,appearance:10}}; const b=m.createMentorRelationship(m.MENTOR_LIBRARY[0],p2); return {a:a.intimacy,b:b.intimacy,appearanceIgnored:a.intimacy===b.intimacy}})
console.log('formula',formula)
async function inject(mode){
 await page.evaluate(async(mode)=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts'); const mentors=await import('/src/mentors.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=0; s.money=500
  const profile=mentors.MENTOR_LIBRARY[0]; s.mentorProfileId=profile.id; s.mentorContactUnlocked=true; s.relationships=[...social.createInitialRelationships(demo.demoPlayer), mentors.createMentorRelationship(profile,demo.demoPlayer)]; const r=s.relationships[s.relationships.length-1]
  s.labEntered=mode!=='lab'; r.intimacy=mode==='lab'?40:60
  if(mode==='project'){s.labEntered=true; s.lastHypothesisOfferSeason=null}
  if(mode==='active'){s.labEntered=true;s.researchStarted=true;s.activeHypothesisId='hyp-x';s.activeHypothesisTitle='测试课题';s.lastResearchWeek=0;s.lastResearchWarningWeek=0}
  if(mode==='chore'){s.labEntered=true;s.researchStarted=false;r.intimacy=45; s.eventWeek=1}
  if(mode==='warn'){s.labEntered=true;s.researchStarted=true;s.activeHypothesisTitle='测试课题';s.lastResearchWeek=-4;s.lastResearchWarningWeek=0;s.eventWeek=0}
  localStorage.setItem('clinical-five-years-save-v26',JSON.stringify({game:s,savedAt:Date.now()}))
 },mode)
 await page.reload({waitUntil:'networkidle'})
}
async function open(){await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(600)}
// lab
await inject('lab'); await open()
console.log('lab notice',await page.locator('.research-notice-modal').count(),await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=> 'none'))
if(await page.locator('.research-notice-modal .btn-primary').count()) {await page.locator('.research-notice-modal .btn-primary').click(); await page.waitForTimeout(400)}
let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v26')).game)
console.log('labEntered',saved.labEntered)
// project offer
await inject('project'); await open()
console.log('idea notice',await page.locator('.research-notice-modal').count(),await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=> 'none'),'choices',await page.locator('.research-notice-choices button').allInnerTexts())
if(await page.locator('.research-notice-choices button').count()){await page.locator('.research-notice-choices button').first().click();await page.waitForTimeout(400)}
saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v26')).game)
console.log('project accepted:',saved.researchStarted,saved.activeHypothesisTitle)
// action name
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(400)
console.log('action name:',await page.locator('.action-card',{hasText:'科研'}).innerText().catch(()=> 'none'))
// warn
await inject('warn'); await open()
console.log('warn notice',await page.locator('.research-notice-modal').count(),await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=> 'none'))
console.log('errors',errors.slice(0,8))
await browser.close()
