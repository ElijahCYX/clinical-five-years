import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const direct=await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.seasonIndex=0;s.season=d.SEASONS[0];s.week=2;s.relationships=social.createInitialRelationships(demo.demoPlayer).map((r,i)=>i===0?{...r,intimacy:50,birthdayMonth:9,birthdayNextYear:2025,birthdayGiftYear:0,birthdayContactType:null}:r);const out=social.applyMissedBirthdayPenalties(s);const r=out[0];return {intimacy:r.intimacy,block:r.patBlockedUntilWeek,nextYear:r.birthdayNextYear,canPat:social.canPat(s,r),blocked:social.isPatBlocked(s,r)}})
console.log('direct missed',direct)
// UI blocked pat
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=2;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=2;s.relationships=social.createInitialRelationships(demo.demoPlayer).map((r,i)=>i===0?{...r,intimacy:40,patBlockedUntilWeek:5}:r);s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v31',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400);await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(300)
console.log('pat button',await page.locator('.whois-action').first().innerText(),'disabled',await page.locator('.whois-action').first().isDisabled())
console.log('errors',errors.slice(0,5))
await browser.close()
