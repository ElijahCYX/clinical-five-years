import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1600,height:1100}, deviceScaleFactor:1 })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=[];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.money=3000;s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v38',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(500)
const layout=await page.evaluate(()=>{
 const grid=document.querySelector('.game-grid'); const actions=document.querySelector('.week-wide-actions'); const aside=document.querySelector('.game-right'); const cards=document.querySelectorAll('.actions-grid .action-card');
 const cols=getComputedStyle(document.querySelector('.actions-grid')).gridTemplateColumns;
 const r=(el)=>el?el.getBoundingClientRect():null;
 return {gridClass:grid?.className,columns:cols,cardCount:cards.length,wide:r(actions),center:r(document.querySelector('.game-center')),aside:r(aside),courses:document.querySelectorAll('.course-card').length,identity:r(document.querySelector('.identity-card')),left:r(document.querySelector('.game-left'))}
})
console.log(JSON.stringify(layout,null,2));console.log('errors',errors.slice(0,5));
await page.screenshot({path:'/tmp/week-layout-v1315.png',fullPage:true})
await browser.close()
