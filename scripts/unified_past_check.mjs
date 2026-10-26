import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1600,height:1000}});await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
for (const slot of [6,7,8]) {
 await page.evaluate(async (savedSlot)=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='C';s.habits=[];s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.energy=70;s.stress=20;s.money=1000;s.pendingEvent=null;s.weekSlot=savedSlot;s.weekSlotSkipped=true;s.weekFocus='balanced';localStorage.setItem('clinical-five-years-save-v44',JSON.stringify({game:s,savedAt:Date.now()}))},slot)
 await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(250);await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(350)
 console.log(slot,await page.evaluate((savedSlot)=>{const cells=[...document.querySelectorAll('.week-slot-square')];return {past0:getComputedStyle(cells[0]).backgroundColor,past5:getComputedStyle(cells[5]).backgroundColor,current:getComputedStyle(cells[savedSlot]).backgroundColor,future:getComputedStyle(cells[Math.min(20,savedSlot+1)]).backgroundColor}},slot))
}
await browser.close()
