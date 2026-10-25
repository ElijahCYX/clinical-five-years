import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']})
const page=await browser.newPage({viewport:{width:390,height:844}})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=[];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v41',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(450)
console.log('before',await page.locator('.mobile-hud').innerText())
await page.locator('.mobile-page-tabs button').nth(1).click();await page.waitForTimeout(400);await page.locator('.action-card',{hasText:'泡图书馆'}).click();await page.waitForTimeout(400)
console.log('after',await page.locator('.mobile-hud').innerText());await page.screenshot({path:'/tmp/mobile-hud-delta.png',fullPage:false});await browser.close()
