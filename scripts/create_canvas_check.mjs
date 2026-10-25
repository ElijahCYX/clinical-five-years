import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page=await browser.newPage({viewport:{width:1600,height:1000}})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
// go to create from title
await page.locator('.title-actions .btn-primary').click();await page.waitForTimeout(500)
const m=await page.evaluate(()=>{const shell=document.querySelector('.create-screen .shell');const grid=document.querySelector('.create-grid');const main=document.querySelector('.create-main');const aside=document.querySelector('.create-aside');const rh=e=>e?e.getBoundingClientRect():null;return {shell:{h:shell?.clientHeight,sh:shell?.scrollHeight,top:shell?.getBoundingClientRect().top},grid:rh(grid),main:rh(main),aside:rh(aside),head:rh(document.querySelector('.create-head')),talent:rh(document.querySelector('.talent-grid')),attrs:rh(document.querySelector('.attr-section')),basic:rh(document.querySelector('.basic-info')),confirm:rh(document.querySelector('.confirm-box'))}})
console.log(JSON.stringify(m,null,2));await page.screenshot({path:'/tmp/create-before.png',fullPage:false});await browser.close()
