import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1000} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const make=(n,energy,resilience)=>{const p={...demo.demoPlayer,attrs:{...demo.demoPlayer.attrs,energy,resilience}}; const s=g.newGameState(p); s.seasonIndex=0; s.season={...d.SEASONS[0],courses:d.SEASONS[0].courses.slice(0,n)}; s.energy=80; return g.libraryCosts(s)}; return {one:make(1,5,5),two:make(2,5,5),three:make(3,5,5),highAttrs:make(3,10,10),lowEnergy:make(3,5,5)}})
console.log(r)
await browser.close()
