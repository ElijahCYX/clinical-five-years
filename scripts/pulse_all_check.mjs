import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=[];localStorage.setItem('clinical-five-years-save-v28',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400);await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(300)
await page.screenshot({path:'/tmp/shots/ui-new-relation-pulse.png',fullPage:true})
let n=0
while(await page.locator('.whois-row.is-new-relation').count() && n<8){await page.locator('.whois-row.is-new-relation').first().click();await page.waitForTimeout(150);n++}
console.log('clicked',n,'remaining pulses',await page.locator('.whois-new-pulse').count(),'badges',await page.locator('.interface-badge').allInnerTexts())
const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v28')).game);console.log('seen',s.seenRelationIds.length,'rels',s.relationships.length,'errors',errors.slice(0,3))
await browser.close()
