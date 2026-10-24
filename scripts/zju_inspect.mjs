import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({viewport:{width:1400,height:1000}})
const reqs=[]
page.on('request', r=>{ if(/person\.zju\.edu\.cn|api|search|teacher|faculty/i.test(r.url())) reqs.push(r.method()+' '+r.url()) })
page.on('response', async r=>{ const u=r.url(); if(/api|search|teacher|faculty|person\.zju/i.test(u) && !u.includes('.js') && !u.includes('.css')) { try{const t=await r.text(); console.log('RESP',r.status(),u,'len',t.length,'head',t.slice(0,300).replace(/\n/g,' '))}catch(e){} } })
await page.goto('https://person.zju.edu.cn/index/search',{waitUntil:'networkidle',timeout:60000})
await page.waitForTimeout(2000)
console.log('URL',page.url())
console.log('TITLE',await page.title())
console.log('TEXT',(await page.locator('body').innerText()).slice(0,2000))
console.log('REQS',reqs.slice(0,80).join('\n'))
await browser.close()
