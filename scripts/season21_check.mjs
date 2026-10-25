import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']})
const page=await browser.newPage({viewport:{width:1600,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const data=await page.evaluate(async()=>{const d=await import('/src/data.ts');const s=await import('/src/social.ts');const out=[];for(const i of [11,12,13,16,17,20]){out.push({i,label:d.SEASONS[i].seasonLabel,date:s.gameDate({seasonIndex:i,season:d.SEASONS[i],week:1,vacation:null})})}return {n:d.SEASONS.length,rows:out}})
console.log(data)
for(const i of [11,12,13,16,17,20]){await page.evaluate(async(i)=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const s=g.newGameState(demo.demoPlayer);s.seasonIndex=i;s.season=d.SEASONS[i];s.week=1;s.screen='week';s.plan='B';s.habits=[];s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;localStorage.setItem('clinical-five-years-save-v43',JSON.stringify({game:s,savedAt:Date.now()}))},i);await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(350);console.log(i,await page.locator('.game-head-left h1').innerText().catch(()=> 'ERR'),await page.locator('.game-screen').count())}
console.log('errors',errors.slice(0,5));await browser.close()
