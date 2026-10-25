import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']})
const page=await browser.newPage({viewport:{width:1600,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function load(index, patch){await page.evaluate(async({index,patch})=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='plan';s.seasonIndex=index;s.season=d.SEASONS[index];s.week=1;s.plan='B';s.habits=[];s.electiveSelectionDone=false;s.electiveOffers=index<12?g.generateElectiveOffers([],[],[]):[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);Object.assign(s,patch);localStorage.setItem('clinical-five-years-save-v44',JSON.stringify({game:s,savedAt:Date.now()}))},{index,patch});await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(400);await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(500)}
await load(0,{});console.log('screen has pe box',await page.locator('.pe-select-sheet').count(),'text', (await page.locator('.pe-select-sheet').innerText().catch(()=>'' )).slice(0,80));
await page.locator('.pe-picker-actions .btn').last().click();await page.waitForTimeout(200);console.log('selected button',await page.locator('.pe-picker-actions .btn').last().innerText());
const submit=page.locator('.elective-footer .btn-primary');console.log('submit disabled first term?',await submit.isDisabled());await submit.click();await page.waitForTimeout(300);console.log('accepted count',await page.locator('.elective-result-list .is-win').count());
await load(1,{pendingPeCourseId:'pe-badminton',pendingPePairKey:'y1-autumn-winter'});console.log('second term disabled',await page.locator('.pe-select-sheet').getAttribute('class'),(await page.locator('.pe-disabled-state').innerText().catch(()=>'' )).slice(0,60));
await load(1,{});console.log('second mandatory disabled?',await page.locator('.elective-footer .btn-primary').isDisabled());
await load(17,{});console.log('senior',await page.locator('.pe-disabled-state').innerText().catch(()=>''));
await load(17,{});await page.screenshot({path:'/tmp/pe-senior.png'});
console.log('errors',errors.slice(0,5));await browser.close()
