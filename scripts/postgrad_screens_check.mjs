import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
const SAVE='clinical-five-years-save-v5'
async function loadState(index, patch) {
  await page.goto('http://127.0.0.1:5173/', {waitUntil:'networkidle'})
  await page.evaluate(async ({index, patch}) => {
    const { newGameState } = await import('/src/game.ts')
    const { SEASONS } = await import('/src/data.ts')
    const { demoPlayer } = await import('/src/demo.ts')
    const base = newGameState(demoPlayer)
    const s = { ...base, seasonIndex:index, season:SEASONS[index], screen:'plan', week:1, plan:'B', habit:'timeManagement', money:1180, energy:80, stress:30, cumulativeCredits:83, cumulativePoints:290, cet6Score:552, prep:Object.fromEntries(SEASONS[index].courses.map(c=>[c.id,30])), peResults:[1,2,3].map(y=>({year:y,score:90,gpa:5,passed:true})), ...patch }
    localStorage.setItem('clinical-five-years-save-v5', JSON.stringify({game:s,savedAt:Date.now()}))
  }, {index, patch})
  await page.reload({waitUntil:'networkidle'})
  await page.locator('.title-actions .btn-ghost').click()
  await page.waitForTimeout(400)
}
// route
await loadState(14,{screen:'route',postgradChance:0.56})
console.log('route:', await page.locator('.event-title').innerText())
await page.screenshot({path:'/tmp/shots/postgrad-route.png',fullPage:true})
await page.locator('.event-actions .btn-primary').click(); await page.waitForTimeout(300)
console.log('after route plan:', await page.locator('.plan-screen').count())
// baoyan failure
await loadState(16,{screen:'baoyanResult',postgradChoice:'both',postgradChance:0.4,baoyanResult:'fail'})
console.log('baoyan:', await page.locator('.event-title').innerText())
await page.screenshot({path:'/tmp/shots/postgrad-baoyan.png',fullPage:true})
// kaoyan exam
await loadState(17,{screen:'kaoyanExam',postgradChoice:'both',baoyanResult:'fail',kaoyanRegistered:true,kaoyanPrep:6,kaoyanScore:342})
console.log('kaoyan exam:', await page.locator('.event-title').innerText())
// kaoyan result
await loadState(18,{screen:'kaoyanResult',postgradChoice:'both',baoyanResult:'fail',kaoyanRegistered:true,kaoyanScore:342,kaoyanResult:'success'})
console.log('kaoyan result:', await page.locator('.event-title').innerText())
// graduation
await loadState(19,{screen:'graduation',postgradChoice:'both',baoyanResult:'fail',kaoyanRegistered:true,kaoyanScore:342,kaoyanResult:'success',cumulativeCredits:163,cumulativePoints:520,peResults:[{year:1,score:95,gpa:5,passed:true},{year:2,score:95,gpa:5,passed:true},{year:3,score:95,gpa:5,passed:true},{year:4,score:95,gpa:5,passed:true},{year:5,score:95,gpa:5,passed:true}],cet6Score:560,peMakeupPassed:null,pendingMakeups:[]})
console.log('graduation:', await page.locator('.ending-title').innerText())
await page.screenshot({path:'/tmp/shots/postgrad-graduation.png',fullPage:true})
console.log('errors:', errors.slice(0,10))
await browser.close()
