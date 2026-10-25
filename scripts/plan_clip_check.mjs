import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']})
const page=await browser.newPage({viewport:{width:1600,height:1000}})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='plan';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=[];s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer);localStorage.setItem('clinical-five-years-save-v41',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(450)
console.log(await page.evaluate(()=>{const sheet=document.querySelector('.plan-sheet');const footer=document.querySelector('.plan-footer');const shell=document.querySelector('.shell');const r=e=>e?e.getBoundingClientRect():null;return {sheet:{client:sheet?.clientHeight,scroll:sheet?.scrollHeight,rect:r(sheet)},footer:r(footer),shell:{client:shell?.clientHeight,scroll:shell?.scrollHeight},pageFooter:r(document.querySelector('.screen .footer'))}}))
await browser.close()
