import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']})
const page=await browser.newPage({viewport:{width:1600,height:1000}})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const load=async(screen,extra='')=>{await page.evaluate(async({screen,extra})=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen=screen;s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=[];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);if(extra==='prep')s.week=4;localStorage.setItem('clinical-five-years-save-v41',JSON.stringify({game:s,savedAt:Date.now()}))},{screen,extra});await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(450)}
await load('plan');await page.screenshot({path:'/tmp/plan-compact.png',fullPage:false})
await load('prep','prep');await page.screenshot({path:'/tmp/prep-compact.png',fullPage:false})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(350);await page.locator('.interface-btn',{hasText:'我是谁'}).click();await page.waitForTimeout(350);await page.screenshot({path:'/tmp/whoami-compact.png',fullPage:false})
await browser.close()
