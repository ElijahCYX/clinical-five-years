import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const m=await import('/src/mentors.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.labEntered=true;s.researchStarted=true;s.researchPublished=false;s.researchProgress=99;s.awaitingNextProject=false;s.mentorContactUnlocked=true;s.mentorProfileId=m.MENTOR_LIBRARY[0].id;s.relationships=[...social.createInitialRelationships(demo.demoPlayer),m.createMentorRelationship(m.MENTOR_LIBRARY[0],demo.demoPlayer)];s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v30',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400);await page.evaluate(()=>{Math.random=()=>0.99})
await page.locator('.action-card',{hasText:'投稿发表'}).click();await page.locator('.action-card',{hasText:'纯粹的休息'}).click();await page.locator('.action-footer .btn-primary',{hasText:'结束本周'}).click();await page.waitForTimeout(700)
console.log('after end modal',await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=>''))
const btn=page.locator('.research-notice-modal .btn-primary');if(await btn.count()){await btn.click();await page.waitForTimeout(500)}
console.log('after acknowledge modal',await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=>'none'))
await browser.close()
