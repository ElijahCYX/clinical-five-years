import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=[];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=0;s.money=3000;s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v38',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(300);await page.evaluate(()=>{Math.random=()=>0.01});await page.waitForTimeout(500)
console.log('event',await page.locator('.random-event-screen').count())
if(await page.locator('.random-event-footer .btn-primary').count()){await page.locator('.random-event-footer .btn-primary').click();await page.waitForTimeout(500)}
const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v38')).game)
console.log('feed',s.noticeFeed?.length,s.noticeFeed?.[0])
console.log('ui notices',await page.locator('.campus-notice-item').count())
console.log('errors',errors.slice(0,3));await browser.close()
