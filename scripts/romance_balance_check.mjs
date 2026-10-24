import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{const e=await import('/src/events.ts'); const g=await import('/src/game.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts'); const base=g.newGameState(demo.demoPlayer); const mk=(ints)=>{const s={...base,relationships:social.createInitialRelationships(demo.demoPlayer)}; s.relationships.forEach((r,i)=>{r.partner=i<ints.length; r.intimacy=ints[i]??r.intimacy}); return e.romanceRiskAfterWeek(s)}; return {low2:mk([30,30]),mid2:mk([60,60]),high2:mk([90,90]),low3:mk([30,30,30]),high3:mk([90,90,90]),high4:mk([80,80,80,80])}})
console.log(r)
await browser.close()
