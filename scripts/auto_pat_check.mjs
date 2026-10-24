import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function setup(){await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=[];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);s.relationships=s.relationships.map((r,i)=>({...r,intimacy:[90,80,70,60,50,40,30][i]??35,lastPatAbsWeek:[10,20,30,40,50,60,70][i]??80}));localStorage.setItem('clinical-five-years-save-v38',JSON.stringify({game:s,savedAt:Date.now()}))});await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400);await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(400);await page.evaluate(()=>{Math.random=()=>0.99})}
await setup();await page.locator('.whois-bulk-pat').click();await page.waitForTimeout(250)
console.log('modal',await page.locator('.auto-pat-modal').count(),'options',await page.locator('.auto-pat-option').count(),await page.locator('.auto-pat-option strong').allInnerTexts())
await page.locator('.auto-pat-option').first().click();await page.waitForTimeout(400)
let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v38')).game);console.log('close pats',s.relationships.filter(r=>r.lastPatKey===`${s.season.id}-w1`).map(r=>r.intimacy))
await setup();await page.locator('.whois-bulk-pat').click();await page.waitForTimeout(200);await page.locator('.auto-pat-option').nth(1).click();await page.waitForTimeout(400)
s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v38')).game);console.log('long pats',s.relationships.filter(r=>r.lastPatKey===`${s.season.id}-w1`).map(r=>({int:r.intimacy,last:r.lastPatAbsWeek})))
console.log('errors',errors.slice(0,3));await browser.close()
