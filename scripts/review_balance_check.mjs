import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const data=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const attrs=demo.demoPlayer.attrs; const courses=data.SEASONS[1].courses
  const balanced=g.getReviewEffect('balanced',courses,attrs,'B')
  const mock=g.getReviewEffect('mock',courses,attrs,'B')
  const single=g.getReviewEffect('mock',[courses[0]],attrs,'B')
  return {balanced,mock,single}
})
console.log(JSON.stringify(r,null,2))
await browser.close()
