import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']})
// desktop disabled card icon + persistence
const ctx=await browser.newContext({viewport:{width:1624,height:1048}});const page=await ctx.newPage();page.on('pageerror',e=>console.log('ERR',e.message));await page.goto('http://127.0.0.1:5173/?demo=plan',{waitUntil:'networkidle'});await page.evaluate(()=>localStorage.removeItem('clinical-five-years-explanations-v1'));await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(500);
// master off all categories off
await page.locator('.explain-toggle').click();await page.waitForTimeout(500);
const disabledIcon=page.locator('.habit-card[data-disabled] .explain-i').first();console.log('disabledIcon count',await disabledIcon.count());if(await disabledIcon.count()){await disabledIcon.click();await page.waitForTimeout(300);console.log('disabled tip',await page.locator('.explain-tip').evaluate(e=>e.classList.contains('is-visible')))}
await page.evaluate(()=>localStorage.setItem('clinical-five-years-canvas-ratio','16:10'));await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(500);
console.log('persist title root',await page.evaluate(()=>({master:document.documentElement.dataset.explainMaster,icons:document.querySelectorAll('.explain-i').length})));
await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(600);console.log('persist inside',await page.evaluate(()=>{const d=document.querySelector('.plan-desc');return {master:document.documentElement.dataset.explainMaster,display:d?getComputedStyle(d).display:null,icons:document.querySelectorAll('.explain-i').length}}));
await page.locator('.explain-toggle').click();await page.waitForTimeout(500);console.log('back on',await page.evaluate(()=>({icons:document.querySelectorAll('.explain-i').length,display:getComputedStyle(document.querySelector('.plan-desc')).display})));
await ctx.close();
// mobile visual
const mctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mp=await mctx.newPage();await mp.goto('http://127.0.0.1:5173/?demo=plan',{waitUntil:'networkidle'});await mp.waitForTimeout(500);console.log('mobile topbar',await mp.evaluate(()=>({w:document.querySelector('.topbar').clientWidth,sw:document.querySelector('.topbar').scrollWidth,toggle:document.querySelector('.explain-toggle').getBoundingClientRect().toJSON(),caret:document.querySelector('.explain-caret')?.getBoundingClientRect().toJSON()})));await mp.screenshot({path:'/tmp/explain-mobile-final.png'});await mctx.close();await browser.close()
