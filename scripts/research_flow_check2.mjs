import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function inject(mode){
 await page.evaluate(async(mode)=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts'); const mentors=await import('/src/mentors.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=0; s.money=500
  s.relationships=social.createInitialRelationships(demo.demoPlayer)
  if(mode!=='mentor'){
    const profile=mentors.MENTOR_LIBRARY[0]; s.mentorProfileId=profile.id; s.mentorContactUnlocked=true; s.labEntered=mode==='research'; s.relationships.push(mentors.createMentorRelationship(profile,demo.demoPlayer)); const r=s.relationships[s.relationships.length-1]; r.intimacy=60
  }
  if(mode==='research'){s.researchProgress=99; s.labEntered=true; s.eventWeek=1}
  localStorage.setItem('clinical-five-years-save-v25',JSON.stringify({game:s,savedAt:Date.now()}))
 },mode)
 await page.reload({waitUntil:'networkidle'})
}
async function open(){ await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(650) }
// mentor encounter
await inject('mentor'); await page.evaluate(()=>{Math.random=()=>0.01}); await open()
console.log('mentor event:',await page.locator('.random-event-title').innerText().catch(()=> 'none'))
if(await page.locator('.random-event-footer .btn-primary').count()){await page.locator('.random-event-footer .btn-primary').click(); await page.waitForTimeout(500)}
let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v25')).game)
console.log('mentor unlocked:',{flag:saved.mentorContactUnlocked,profile:saved.mentorProfileId,mentors:saved.relationships.filter(r=>r.kind==='mentor').length})
// lab notice
await inject('lab'); await open()
console.log('lab notice:',await page.locator('.research-notice-modal').count(),'title:',await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=> 'none'))
if(await page.locator('.research-notice-modal .btn-primary').count()){await page.locator('.research-notice-modal .btn-primary').click(); await page.waitForTimeout(500)}
saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v25')).game)
console.log('labEntered:',saved.labEntered)
// research action and publish
await inject('research'); await open()
console.log('research action disabled:',await page.locator('.action-card',{hasText:'科研相关'}).isDisabled())
await page.evaluate(()=>{Math.random=()=>0.99})
await page.locator('.action-card',{hasText:'科研相关'}).click(); await page.locator('.action-card',{hasText:'纯粹的休息'}).click(); await page.waitForTimeout(300)
await page.locator('.action-footer .btn-primary',{hasText:'结束本周'}).click(); await page.waitForTimeout(800)
saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v25')).game)
console.log('research progress:',saved.researchProgress,'published:',saved.researchPublished,'journal:',saved.researchJournal)
console.log('notice?',await page.locator('.research-notice-modal').count(),'title:',await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=> 'none'))
console.log('errors',errors.slice(0,8))
await browser.close()
