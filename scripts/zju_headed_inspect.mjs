import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: false, args:['--no-sandbox','--disable-blink-features=AutomationControlled'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
const hits=[]
page.on('response', async r=>{ const u=r.url(); if(u.includes('/server/api/front/psons/search')) { try{const t=await r.text(); console.log('API',r.status(),u,t.slice(0,500));}catch(e){} } if(u.includes('/server/api/')) hits.push(r.status()+' '+u) })
await page.goto('https://person.zju.edu.cn/index/search',{waitUntil:'networkidle',timeout:60000})
await page.waitForTimeout(4000)
console.log('TITLE',await page.title())
console.log('BODY',(await page.locator('body').innerText()).slice(0,800))
console.log('HITS',hits.slice(0,30).join('\n'))
await page.screenshot({path:'/tmp/zju-search.png',fullPage:true})
await browser.close()
