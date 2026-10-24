import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const demo=await import('/src/demo.ts')
  const player={...demo.demoPlayer,attrs:{...demo.demoPlayer.attrs,appearance:10,social:10,memory:10}}
  const base={year:1,gpa:4.5,compositeGain:40,researchGain:300,papers:3,failed:false,cumulativeCredits:40,cumulativePoints:180,cumulativeComposite:40,cumulativeResearch:300,evaluated:false,award:null,awards:[],score:null}
  const high=g.scholarshipFor(base,player,[],false)
  const prior=[{...base,award:'national',awards:['national','school'],evaluated:true}]
  const highWithNational=g.scholarshipFor({...base,gpa:4.5},player,prior,false)
  const low=g.scholarshipFor({...base,gpa:3.9,compositeGain:20,papers:0,cumulativePoints:130},player,[],false)
  const failedHigh=g.scholarshipFor({...base,failed:true},player,[],true)
  return {high,highWithNational,low,failedHigh}
})
console.log(JSON.stringify(r,null,2))
await browser.close()
