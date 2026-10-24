import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function setup(intimacy){await page.evaluate(async(intimacy)=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer).map((r,i)=>i===0?{...r,intimacy,orientation:'bisexual'}:r);s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v29',JSON.stringify({game:s,savedAt:Date.now()}))},intimacy);await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400);await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(300)}
await setup(79);console.log('79 orientations',await page.locator('.whois-orientation').count())
await page.screenshot({path:'/tmp/shots/orientation-79.png',fullPage:true})
await setup(80);console.log('80 orientations',await page.locator('.whois-orientation').allInnerTexts())
await page.screenshot({path:'/tmp/shots/orientation-80.png',fullPage:true})
console.log('errors',errors.slice(0,5))
await browser.close()
