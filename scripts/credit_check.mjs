import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/', {waitUntil:'networkidle'})
const result = await page.evaluate(async () => {
  const { SEASONS } = await import('/src/data.ts')
  const courseTotal = SEASONS.reduce((sum,s)=>sum+s.courses.reduce((a,c)=>a+c.credits,0),0)
  const perSeason = SEASONS.map(s=>({label:s.seasonLabel,credits:s.courses.reduce((a,c)=>a+c.credits,0)}))
  return { courseTotal, withPe: courseTotal+10, seasons: SEASONS.length, perSeason }
})
console.log(JSON.stringify(result,null,2))
await browser.close()
