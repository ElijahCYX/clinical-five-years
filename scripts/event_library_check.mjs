import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1100} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{const e=await import('/src/events.ts'); const counts={}; for(const x of e.EVENT_LIBRARY) counts[x.kind]=(counts[x.kind]||0)+1; return {total:e.EVENT_LIBRARY.length,counts,ids:new Set(e.EVENT_LIBRARY.map(x=>x.id)).size}})
console.log(r)
await browser.close()
