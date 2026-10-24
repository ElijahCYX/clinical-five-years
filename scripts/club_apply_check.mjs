import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function setup(){await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=[];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.money=1000;s.energy=80;s.stress=40;s.clubInitialRecruitmentDone=true;s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v36',JSON.stringify({game:s,savedAt:Date.now()}))});await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(450)}
await setup();console.log('club action',await page.locator('.action-card',{hasText:'申请加入社团学生会'}).innerText())
await page.locator('.action-card',{hasText:'申请加入社团学生会'}).click();await page.waitForTimeout(400)
console.log('recruit screen',await page.locator('.club-recruit-screen').count())
await page.locator('.club-recruit-card').nth(0).click();await page.evaluate(()=>{Math.random=()=>0.01});await page.locator('.club-recruit-footer .btn-primary').click();await page.waitForTimeout(500)
let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v36')).game);console.log('success',{membership:!!s.clubMembership,selected:s.selected,plan:s.clubActivityPlan?.mode,view:await page.locator('.game-screen').count()})
console.log('welcome',await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=>''))
console.log('errors',errors.slice(0,5))
await browser.close()
