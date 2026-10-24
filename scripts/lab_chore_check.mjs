import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const costs=await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const m=await import('/src/mentors.ts'); const mk=comp=>{const p={...demo.demoPlayer,attrs:{...demo.demoPlayer.attrs,comprehension:comp}};const s=g.newGameState(p);s.seasonIndex=0;s.season=d.SEASONS[0];s.plan='B';s.habits=['timeManagement'];s.electiveSelectionDone=true;s.weekFocus='balanced';s.labEntered=true;s.researchStarted=false;s.selected=['research'];s.relationships=[...social.createInitialRelationships(p),m.createMentorRelationship(m.MENTOR_LIBRARY[0],p)];const sim=g.simulateWeek(s);return sim.energy-s.energy}; return {low:mk(2),high:mk(10)}})
console.log('chore energy costs',costs)
async function inject(intimacy){
 await page.evaluate(async(intimacy)=>{
  const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const m=await import('/src/mentors.ts');
  const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=0;s.labEntered=true;s.researchStarted=false;s.mentorContactUnlocked=true;s.mentorProfileId=m.MENTOR_LIBRARY[0].id;s.relationships=[...social.createInitialRelationships(demo.demoPlayer),m.createMentorRelationship(m.MENTOR_LIBRARY[0],demo.demoPlayer)];const r=s.relationships[s.relationships.length-1];r.intimacy=intimacy;localStorage.setItem('clinical-five-years-save-v27',JSON.stringify({game:s,savedAt:Date.now()}))
 },intimacy)
 await page.reload({waitUntil:'networkidle'}); await page.evaluate(()=>{Math.random=()=>0.05}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
}
await inject(45)
console.log('chore effect',await page.locator('.action-card',{hasText:'实验室打杂'}).innerText())
console.log('project offer?',await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=> 'none'))
if(await page.locator('.research-notice-choices button').count()){await page.locator('.research-notice-choices button').first().click(); await page.waitForTimeout(300)}
let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v27')).game)
console.log('accepted',saved.researchStarted,saved.activeHypothesisTitle?'has-hypothesis':'none')
// after accept, force random and next week should not show project offer via boost
await page.reload({waitUntil:'networkidle'}); await page.evaluate(()=>{Math.random=()=>0.05}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
// actions remain from previous state? researchStarted true; check no idea offer immediately
console.log('post-accept offer?',await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=> 'none'))
console.log('errors',errors.slice(0,5))
await browser.close()
