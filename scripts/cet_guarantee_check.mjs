import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts')
  const score=(kind,en)=>Math.min(...Array.from({length:200},()=>g.cetScore(kind,en,2)))
  return {cet4at25:score('cet4',25),cet6at60:score('cet6',60),cet6at100:score('cet6',100),cet4at24:score('cet4',24)}
})
console.log(r)
await browser.close()
