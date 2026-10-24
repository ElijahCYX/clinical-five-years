import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const r=await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const data=await import('/src/data.ts'); const demo=await import('/src/demo.ts')
  const base=()=>{const s=g.newGameState(demo.demoPlayer); s.seasonIndex=0; s.season=data.SEASONS[0]; s.plan='B'; s.habits=['timeManagement','earlySleep']; s.week=1; s.weekFocus='balanced'; return s}
  const steady=g.applyOpeningTalent(base(),'steadyHands')
  const memory=g.applyOpeningTalent(base(),'memoryBread')
  const socialBase=g.simulateWeek({...base(),selected:['social']}); const socialBeast=g.simulateWeek({...g.applyOpeningTalent(base(),'socialBeast'),selected:['social']})
  const mock=g.getReviewEffect('mock',data.SEASONS[1].courses,demo.demoPlayer.attrs,'B')
  const highCourse=data.SEASONS.flatMap(s=>s.courses).find(c=>c.memory==='高')
  const noTalent=g.simulateWeek({...base(),season:{...data.SEASONS[0],courses:[highCourse]},selected:['library']})
  const withMemory=g.simulateWeek({...g.applyOpeningTalent({...base(),season:{...data.SEASONS[0],courses:[highCourse]}},'memoryBread'),selected:['library']})
  const rescue=g.applyScoreRescue({openingTalent:'caiCaiLaoLao'},57)
  return {
    talents:data.OPENING_TALENTS.length,
    implemented:data.OPENING_TALENTS.filter(t=>t.implemented).length,
    steadyDex:[base().player.attrs.dexterity,steady.player.attrs.dexterity],
    memoryAttr:[base().player.attrs.memory,memory.player.attrs.memory],
    social:[socialBase.composite,socialBeast.composite],
    mockCap:mock.scoreCap,
    highMemory:[highCourse.name,noTalent.prep[highCourse.id],withMemory.prep[highCourse.id]],
    rescue57:rescue,
  }
})
console.log(JSON.stringify(r,null,2))
await browser.close()
