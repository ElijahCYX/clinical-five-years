import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
async function inject(oldWeeks){
  await page.evaluate(async(oldWeeks)=>{const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts'); const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=0; s.relationships=social.createInitialRelationships(demo.demoPlayer); const r=s.relationships[0]; r.ex=true; r.partner=false; r.exWeek=1-oldWeeks; r.exPenalty=false; r.intimacy=70; localStorage.setItem('clinical-five-years-save-v24',JSON.stringify({game:s,savedAt:Date.now()}))},oldWeeks)
  await page.reload({waitUntil:'networkidle'}); await page.evaluate(()=>{Math.random=()=>0.01}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(600)
}
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await inject(1)
console.log('reconcile modal:',await page.locator('.random-event-title').innerText().catch(()=> 'none'))
if(await page.locator('.random-event-footer .btn-primary').count()) { await page.locator('.random-event-footer .btn-primary').click(); await page.waitForTimeout(400) }
let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v24')))
saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v24')).game)
console.log('after reconcile:',{partner:saved.relationships[0].partner,ex:saved.relationships[0].ex,intimacy:saved.relationships[0].intimacy})
// expired ex: set 4 weeks and no event
await page.evaluate(async()=>{const s=JSON.parse(localStorage.getItem('clinical-five-years-save-v24')).game; s.screen='week'; s.week=2; s.eventWeek=1; s.pendingEvent=null; s.pendingConfession=null; s.relationships[1].ex=true; s.relationships[1].partner=false; s.relationships[1].exWeek=2-4; s.relationships[1].exPenalty=false; s.relationships[1].intimacy=80; localStorage.setItem('clinical-five-years-save-v24',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'}); await page.evaluate(()=>{Math.random=()=>0.99}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v24')).game)
console.log('expired:',{ex:saved.relationships[1].ex,penalty:saved.relationships[1].exPenalty})
const chance=await page.evaluate(async()=>{const s=await import('/src/social.ts'); const demo=await import('/src/demo.ts'); const base={id:'x',name:'x',gender:'男',orientation:'bisexual',kind:'friend',identity:'朋友',intimacy:80,statsKnown:false,knownStats:null,stats:null,weeklyAction:'',lastPatKey:'',partner:false,confessionRisk:0,breakupRisk:0,ex:true,exWeek:0,exPenalty:true}; return s.confessionChance({...demo.demoPlayer,orientation:'bisexual'},base)})
console.log('ex confession chance:',chance)
console.log('errors',errors.slice(0,5))
await browser.close()
