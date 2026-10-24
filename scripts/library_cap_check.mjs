import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const p={...demo.demoPlayer,attrs:{...demo.demoPlayer.attrs,energy:5,resilience:5}}; const baseCourses=d.SEASONS[0].courses; const extras=d.ELECTIVE_COURSES.slice(0,4); const out={}; for(let n=1;n<=5;n++){const s=g.newGameState(p); s.season={...d.SEASONS[0],courses:[...baseCourses,...extras].slice(0,n)}; s.energy=80; out[n]=g.libraryCosts(s)} return out})
console.log(r)
await browser.close()
