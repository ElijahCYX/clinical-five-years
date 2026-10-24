import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function setup(known){await page.evaluate(async(known)=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer).map((r,i)=>{if(i===0){const knownStats={...r.stats,attrs:{memory:10,comprehension:9,dexterity:8,social:7,appearance:6,energy:5,constitution:4,resilience:2}};return {...r,statsKnown:known,knownStats:known?knownStats:null,stats:knownStats}};return r});s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v29',JSON.stringify({game:s,savedAt:Date.now()}))},known);await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400);await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(300)}
await setup(true);console.log('known orange/red',await page.locator('.whois-stat-chip.is-high').allInnerTexts(),await page.locator('.whois-stat-chip.is-critical').allInnerTexts())
await page.screenshot({path:'/tmp/shots/stat-highlight.png',fullPage:true})
await setup(false);console.log('unknown orange/red',await page.locator('.whois-stat-chip.is-high').allInnerTexts(),await page.locator('.whois-stat-chip.is-critical').allInnerTexts())
console.log('errors',errors.slice(0,5))
await browser.close()
