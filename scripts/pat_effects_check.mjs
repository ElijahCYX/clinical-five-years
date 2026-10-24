import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function setup(mode){
 await page.evaluate(async(mode)=>{
  const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const mentors=await import('/src/mentors.ts')
  const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.stress=40;s.energy=50;s.relationships=social.createInitialRelationships(demo.demoPlayer)
  s.mentorContactUnlocked=true;s.labEntered=true;s.mentorProfileId=mentors.MENTOR_LIBRARY[0].id;s.relationships.push(mentors.createMentorRelationship(mentors.MENTOR_LIBRARY[0],demo.demoPlayer));s.relationships[s.relationships.length-1].intimacy=50
  if(mode==='mentor'){s.researchStarted=true;s.researchProgress=0}
  localStorage.setItem('clinical-five-years-save-v27',JSON.stringify({game:s,savedAt:Date.now()}))
 },mode)
 await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400);await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(300)
}
async function clickPat(findText){const row=page.locator('.whois-row',{hasText:findText}).first();await row.locator('.whois-action',{hasText:'拍一拍'}).click();await page.waitForTimeout(300);console.log('msg',await page.locator('.whois-message').innerText())}
// peer
await setup('peer');await page.evaluate(()=>{Math.random=()=>0.01});await clickPat('舍友')
let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v27')).game)
console.log('peer state',{stress:s.stress,energy:s.energy,prep:s.prep})
// counselor
await setup('counselor');await page.evaluate(()=>{Math.random=()=>0.01});await clickPat('辅导员')
s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v27')).game);console.log('counselor stress',s.stress)
// mentor
await setup('mentor');await page.evaluate(()=>{Math.random=()=>0.01});await clickPat('导师')
s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v27')).game);console.log('mentor progress',s.researchProgress)
console.log('errors',errors.slice(0,5))
await browser.close()
