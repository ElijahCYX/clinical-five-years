import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1624,height:1048}});page.on('pageerror',e=>console.log('ERR',e.message));await page.goto('http://127.0.0.1:5173/?demo=plan',{waitUntil:'networkidle'});await page.waitForTimeout(500);
console.log('switch',await page.locator('.explain-toggle').innerText());
console.log('initial',await page.evaluate(()=>({lede:!!document.querySelector('.page-lede')&&getComputedStyle(document.querySelector('.page-lede')).display,flavor:document.querySelectorAll('.action-flavor').length,icons:document.querySelectorAll('.explain-i').length,cat:document.querySelector('.page-lede')?.dataset.explainCategory,root:document.documentElement.dataset.explainMaster})));
await page.locator('.explain-toggle').click();await page.waitForTimeout(500);
console.log('off',await page.evaluate(()=>({lede:getComputedStyle(document.querySelector('.page-lede')).display,desc:[...document.querySelectorAll('.plan-desc')].map(e=>getComputedStyle(e).display),icons:[...document.querySelectorAll('.explain-i')].map(e=>({text:e.parentElement?.textContent?.slice(0,20),explain:e.dataset.explainText?.slice(0,30)}))})));
const icon=page.locator('.explain-i').first();await icon.hover();await page.waitForTimeout(300);console.log('tip',await page.locator('.explain-tip').evaluate(e=>({visible:e.classList.contains('is-visible'),text:e.textContent?.slice(0,60)})));
await page.locator('.explain-toggle').click();await page.waitForTimeout(300); // master on
await page.locator('.explain-caret').click();await page.waitForTimeout(200);console.log('menu rows',await page.locator('.explain-menu-row').count());
// turn card off
await page.locator('.explain-menu-row',{hasText:'卡片描述'}).click();await page.waitForTimeout(400);console.log('card off',await page.evaluate(()=>({flavor:document.querySelectorAll('.plan-desc').length,display:getComputedStyle(document.querySelector('.plan-desc')).display,icons:document.querySelectorAll('.explain-i').length,settings:[...document.querySelectorAll('.explain-menu-row')].map(e=>e.getAttribute('aria-checked'))})));
await page.screenshot({path:'/tmp/explain-off.png'});await browser.close()
