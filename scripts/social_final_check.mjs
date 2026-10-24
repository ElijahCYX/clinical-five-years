import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
// actual creation: gender male + orientation homosexual, then inspect roommates
await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await page.waitForTimeout(250)
await page.locator('.field input').first().fill('舍友测试')
await page.locator('.segmented button',{hasText:'男'}).click()
await page.locator('.field',{hasText:'性取向'}).locator('.segmented button',{hasText:'同性恋'}).click()
await page.locator('.confirm-box .btn-primary').click(); await page.waitForTimeout(350)
// talent select first card then maybe event; inspect save
console.log('talent page:',await page.locator('.opening-talent-card').count())
await page.locator('.opening-talent-card').first().click(); await page.locator('.talent-select-footer .btn-primary').click(); await page.waitForTimeout(500)
const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v21')||'null'))
if(save){
  const rels=save.game.relationships||[]
  console.log('relationships:',rels.map(r=>({name:r.name,kind:r.kind,gender:r.gender,intimacy:r.intimacy,statsKnown:r.statsKnown})))
  console.log('roommates same gender:',rels.filter(r=>r.kind==='roommate').every(r=>r.gender==='男'), 'count',rels.filter(r=>r.kind==='roommate').length)
}
console.log('errors',errors.slice(0,6))
await browser.close()
