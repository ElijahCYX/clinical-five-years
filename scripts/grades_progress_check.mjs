import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{
  const g=await import('/src/game.ts'); const d=await import('/src/data.ts'); const demo=await import('/src/demo.ts'); const social=await import('/src/social.ts')
  const s=g.newGameState(demo.demoPlayer); s.screen='week'; s.seasonIndex=2; s.season=d.SEASONS[2]; s.week=1; s.plan='B'; s.habits=['timeManagement']; s.weekFocus='balanced'; s.electiveSelectionDone=true; s.electiveOffers=[]; s.eventWeek=1
  s.courseRecords=[
    {id:'math',name:'大学数学',credits:3,gpa:4.2,score:88,category:'professional'},
    {id:'introMedicine',name:'医学导论',credits:1,gpa:3.8,score:82,category:'professional'},
    {id:'politics-ethics',name:'思修',credits:2,gpa:4.0,score:85,category:'politics'},
    {id:'elective-piano',name:'打开艺术之门：钢琴',credits:3,gpa:4.5,score:91,category:'elective'},
  ]
  s.politicsCredits=2; s.electiveCredits=3; s.peResults=[{year:1,score:86,gpa:4.0,passed:true}]
  s.cumulativeCredits=11; s.cumulativePoints=46
  localStorage.setItem('clinical-five-years-save-v22',JSON.stringify({game:s,savedAt:Date.now()}))
})
await page.reload({waitUntil:'networkidle'}); await page.locator('.title-actions .btn-ghost').click(); await page.waitForTimeout(500)
await page.locator('.tabs button',{hasText:'成绩'}).click(); await page.waitForTimeout(300)
console.log('progress rows:',await page.locator('.grade-progress-row').count(),'records:',await page.locator('.grade-record-row').count())
console.log('progress text:',(await page.locator('.grade-progress').innerText()).replace(/\n/g,' | '))
console.log('record gpas:',await page.locator('.grade-record-gpa').allInnerTexts())
await page.screenshot({path:'/tmp/shots/grades.png',fullPage:true})
console.log('errors',errors.slice(0,5))
await browser.close()
