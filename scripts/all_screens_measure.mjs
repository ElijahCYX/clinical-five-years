import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1600,height:1000} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const base = async (screen, extra='') => { await page.evaluate(async ({screen,extra})=>{
 const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts'); const post=await import('/src/screens/Postgrad.tsx').catch(()=>null)
 const s=g.newGameState(demo.demoPlayer); s.screen=screen; s.seasonIndex=0; s.season=d.SEASONS[0]; s.week=1; s.plan='B'; s.habits=[]; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1; s.money=3000; s.relationships=social.createInitialRelationships(demo.demoPlayer); s.seenRelationIds=s.relationships.map(r=>r.id)
 if(extra==='results'){s.results=s.season.courses.map(c=>({course:c,score:80,gpa:3.2,expectedMin:70,expectedMax:90}))}
 if(extra==='vacation'){s.vacation={kind:'winter',week:1,totalWeeks:3};}
 if(extra==='prep'){s.week=4;}
 if(extra==='scholarship'){s.screen='scholarship';s.seasonIndex=4;s.season=d.SEASONS[4];s.yearRecords=[{year:1,gpa:3.2,compositeGain:50,researchGain:10,papers:0,failed:false,cumulativeCredits:20,cumulativePoints:64,cumulativeComposite:50,cumulativeResearch:10,evaluated:true,score:{total:80},awards:['school'],award:'school'}];}
 if(extra==='yearend'||extra==='graduation'||extra==='ending'){s.yearRecords=[{year:1,gpa:3.2,compositeGain:50,researchGain:10,papers:0,failed:false,cumulativeCredits:20,cumulativePoints:64,cumulativeComposite:50,cumulativeResearch:10,evaluated:true,score:{total:80},awards:[],award:null}]}
 localStorage.setItem('clinical-five-years-save-v41',JSON.stringify({game:s,savedAt:Date.now()}))
},{screen,extra}); await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(450) }
const measure=async(label)=>{const r=await page.evaluate(()=>{const shell=document.querySelector('.screen .shell')||document.querySelector('.shell');const rect=shell?.getBoundingClientRect();return {label:document.querySelector('.screen')?.className||'none',shellH:shell?.clientHeight,shellScroll:shell?.scrollHeight,bodyH:document.body.scrollHeight,innerH:innerHeight,rect:rect?{w:rect.width,h:rect.height}:null,visible:!!shell}});console.log(JSON.stringify(r))}
// title
await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(200);await measure('title')
// create
await page.locator('.title-actions .btn-primary').click();await page.waitForTimeout(450);await measure('create')
for(const screen of ['talentSelect','talentEvent','plan','clubRecruitment','week','prep','vacation','result','cetEvent','cetResult','route','baoyanResult','kaoyanExam','kaoyanResult','scholarship','yearend','graduation','ending']){
 const extra=screen==='prep'?'prep':screen==='vacation'?'vacation':screen==='result'?'results':screen==='scholarship'?'scholarship':['yearend','graduation','ending'].includes(screen)?'year':null
 try{await base(screen,extra||'');await measure(screen)}catch(e){console.log('ERR',screen,String(e).slice(0,120))}
}
// whoami/whois via week
await base('week','');await page.locator('.interface-btn',{hasText:'我是谁'}).click();await page.waitForTimeout(350);await measure('whoami')
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(350);await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(350);await measure('whois')
console.log('pageerrors',errors.slice(0,5));await browser.close()
