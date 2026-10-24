import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const demo=await import('/src/demo.ts')
  const before=g.archetypeFor(demo.demoPlayer.attrs)
  const s=g.newGameState({...demo.demoPlayer,archiveTitle:before})
  const after=g.applyOpeningTalent(s,['steadyHands','memoryBread'])
  return {before,stored:after.player.archiveTitle,dynamicAfter:g.archetypeFor(after.player.attrs),attrs:after.player.attrs}
})
console.log(r)
await browser.close()
