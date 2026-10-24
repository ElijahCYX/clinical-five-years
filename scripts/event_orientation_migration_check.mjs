import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const roles=await page.evaluate(async()=>{const e=await import('/src/events.ts'); const demo=await import('/src/demo.ts'); const out={}; for(const o of ['heterosexual','homosexual','bisexual']) for(const g of ['女','男']) {const p={...demo.demoPlayer,gender:g,orientation:o}; const set=new Set(); for(let i=0;i<80;i++) set.add(e.npcRole(p)); out[g+'-'+o]=[...set].sort().join('/')} return out})
console.log(roles)
// migrate a v19 save without new event/orientation fields
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]
  delete s.player.orientation; delete s.eventWeek; delete s.eventHistory; delete s.pendingEvent; delete s.socialModuleUnlocked
  localStorage.removeItem('clinical-five-years-save-v20'); localStorage.setItem('clinical-five-years-save-v19',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(700)
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v20')||'null'))
console.log('migrated:',saved?{orientation:saved.game.player.orientation,eventWeek:saved.game.eventWeek,history:saved.game.eventHistory.length}:null)
console.log('errors',errors.slice(0,5))
await browser.close()
