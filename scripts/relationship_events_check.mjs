import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
async function setup(mode){
  await page.evaluate(async(mode)=>{
    const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
    const s=g.newGameState({...demo.demoPlayer,orientation:'bisexual'}); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=0; s.player={...s.player,orientation:'bisexual',attrs:{...s.player.attrs,social:6}}
    s.relationships=social.createInitialRelationships(s.player)
    for(const r of s.relationships){r.orientation='bisexual'}
    if(mode==='confess'){s.relationships[0].intimacy=70;s.relationships[0].confessionRisk=90}
    if(mode==='breakup'){s.relationships[0].partner=true;s.relationships[0].intimacy=30;s.relationships[0].breakupRisk=90}
    if(mode==='scandal'){const staff=s.relationships.find(r=>r.kind==='mentor'||r.kind==='counselor'); staff.partner=true; staff.intimacy=70; s.teacherScandalRisk=90}
    localStorage.setItem('clinical-five-years-save-v24',JSON.stringify({game:s,savedAt:Date.now()}))
  },mode)
  await page.reload({waitUntil:'networkidle'}); await page.evaluate(()=>{Math.random=()=>0.01}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(600)
}
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await setup('confess')
console.log('confess modal:',await page.locator('.npc-confession-modal').count(),'title:',await page.locator('.npc-confession-modal .random-event-title').innerText().catch(()=> ''))
await page.locator('.npc-confession-footer .btn-primary').click(); await page.waitForTimeout(400)
let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v24')).game)
console.log('accepted partner:',saved.relationships[0].partner,'pending:',saved.pendingConfession)
await setup('breakup')
console.log('breakup modal:',await page.locator('.random-event-modal').count(),'title:',await page.locator('.random-event-title').innerText().catch(()=> ''))
await page.locator('.random-event-footer .btn-primary').click(); await page.waitForTimeout(400)
saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v24')).game)
console.log('after breakup partner:',saved.relationships[0].partner)
await setup('scandal')
console.log('scandal modal:',await page.locator('.random-event-modal').count(),'title:',await page.locator('.random-event-title').innerText().catch(()=> ''))
await page.locator('.random-event-footer .btn-primary').click(); await page.waitForTimeout(400)
saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v24')).game)
console.log('after scandal staff partners:',saved.relationships.filter(r=>r.partner).length,'social:',saved.player.attrs.social,'risk:',saved.teacherScandalRisk)
const chance=await page.evaluate(async()=>{const s=await import('/src/social.ts'); const demo=await import('/src/demo.ts'); const rel={id:'x',name:'x',gender:'男',orientation:'bisexual',kind:'mentor',identity:'导师',intimacy:80,statsKnown:false,knownStats:null,stats:{},weeklyAction:'',lastPatKey:'',partner:false,confessionRisk:0,breakupRisk:0}; return s.confessionChance({...demo.demoPlayer,orientation:'bisexual'},rel)})
console.log('staff player confession chance:',chance)
console.log('errors',errors.slice(0,6))
await browser.close()
