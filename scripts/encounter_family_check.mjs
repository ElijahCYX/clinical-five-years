import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const chats=await page.evaluate(async()=>{const e=await import('/src/encounters.ts'); const s=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts'); const base=g=>{const s=g.newGameState(demo.demoPlayer);s.seasonIndex=0;s.season=d.SEASONS[0];s.plan='B';s.habits=['reading'];s.electiveSelectionDone=true;s.weekFocus='balanced';s.relationships=social.createInitialRelationships(demo.demoPlayer);return s}; const reading=base(s); reading.labEntered=false; const r=s.simulateWeek(reading); const family=base(s); family.habits=['familyCall']; const f=s.simulateWeek(family); return {count:e.ENCOUNTER_CHATS.length, options:e.ENCOUNTER_CHATS.every(x=>x.options.length===3), readingResearch:r.research-reading.research, readingMentor:r.mentorIntimacyGain, familyAffection:f.familyAffectionGain, familyStress:f.stress-family.stress}})
console.log(chats)
async function inject(mode){
 await page.evaluate(async(mode)=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=mode==='family'?['familyCall']:['meditation']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=0; s.money=300
  s.relationships=social.createInitialRelationships(demo.demoPlayer)
  if(mode==='family') s.familyAffection=20
  localStorage.setItem('clinical-five-years-save-v27',JSON.stringify({game:s,savedAt:Date.now()}))
 },mode)
 await page.reload({waitUntil:'networkidle'})
}
async function open(){await page.evaluate(()=>{Math.random=()=>0.01}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(600)}
await inject('family'); await open()
console.log('family event title:',await page.locator('.random-event-title').innerText().catch(()=> 'none'))
if(await page.locator('.random-event-footer .btn-primary').count()){await page.locator('.random-event-footer .btn-primary').click();await page.waitForTimeout(400)}
let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v27')).game)
console.log('family money:',saved.money)
await inject('encounter')
// re-enable normal random for page reload: override after reload
await page.evaluate(()=>{Math.random=()=>0.01}); await open()
console.log('encounter modal:',await page.locator('.encounter-modal').count(),'choices:',await page.locator('.encounter-options button').count())
if(await page.locator('.encounter-options button').count()){await page.locator('.encounter-options button').first().click();await page.waitForTimeout(300);console.log('result:',(await page.locator('.encounter-result').innerText()).slice(0,120))}
console.log('errors',errors.slice(0,8))
await browser.close()
