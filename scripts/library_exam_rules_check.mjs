import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const core=d.SEASONS[0].courses
  const politics=d.POLITICS_COURSES[0]
  const elective=d.ELECTIVE_COURSE_BY_ID['elective-piano']
  const courses=[...core,politics,elective]
  const attrs=demo.demoPlayer.attrs
  const balanced=g.getReviewEffect('balanced',courses,attrs,'B')
  const focusPol=g.getReviewEffect('focus2',courses,attrs,'B')
  const base=g.newGameState(demo.demoPlayer); base.seasonIndex=0; base.season={...d.SEASONS[0],courses}; base.plan='B'; base.habits=['timeManagement','earlySleep']; base.weekFocus='balanced'; base.selected=['library','rest']
  const sim=g.simulateWeek(base)
  return {libraryFormula:'6*K', coreGains:core.map(c=>[c.name,balanced.gains[c.id]]), politicsGain:balanced.gains[politics.id], electiveGain:balanced.gains[elective.id], focusPolitics:focusPol.gains[politics.id], libraryPrep:sim.prep}
})
console.log(JSON.stringify(r,null,2).slice(0,1600))
await browser.close()
