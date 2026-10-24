import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
const wait=(ms=300)=>page.waitForTimeout(ms)
const click=async(sel)=>{await page.locator(sel).first().click(); await wait(160)}
async function choosePlan(){ await page.locator('.plan-card',{hasText:'周期回顾'}).click(); await page.locator('.habit-card',{hasText:'时间管理'}).click(); await page.locator('.habit-card',{hasText:'早睡'}).click(); await page.locator('.plan-footer .btn-primary').click(); await wait(350) }
async function week(){ await page.locator('.action-card',{hasText:'泡图书馆'}).first().click(); await page.locator('.action-card',{hasText:'纯粹的休息'}).first().click(); await page.locator('.action-footer .btn-primary').click(); await wait(300) }
async function prep(){ await page.locator('.review-card',{hasText:'历年卷'}).first().click(); await page.locator('.prep-confirm .btn-primary').click(); await wait(450) }
async function vacationWeek(){ await page.locator('.action-card',{hasText:'纯粹的休息'}).first().click(); await page.locator('.action-card',{hasText:'健身 / 运动'}).first().click(); await page.locator('.action-footer .btn-primary').click(); await wait(350) }
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'})
await page.locator('.title-actions .btn-primary').click(); await wait(250)
await page.locator('.field input').first().fill('三年测试'); await page.locator('.confirm-box .btn-primary').click(); await wait(300)
let steps=0
while (steps++ < 200) {
  if (await page.locator('.plan-screen').count()) { const planTitle=(await page.locator('.plan-head h1').innerText()).replace(/\n/g,' '); await choosePlan(); console.log('PLAN', planTitle); continue }
  if (await page.locator('.prep-screen').count()) { const prepTitle=await page.locator('.prep-head .page-title').innerText(); await prep(); console.log('PREP', prepTitle); continue }
  if (await page.locator('.result-screen').count()) {
    const label=await page.locator('.result-actions .btn-primary').innerText(); console.log('RESULT continue:', label.replace(/\n/g,' '));
    await page.locator('.result-actions .btn-primary').click(); await wait(400); continue
  }
  if (await page.locator('.vacation-screen').count()) { await vacationWeek(); console.log('VACATION week'); continue }
  if (await page.locator('.event-screen').count()) {
    const eventTitle = await page.locator('.event-title').innerText().catch(() => '')
    console.log('EVENT', eventTitle.replace(/\n/g, ' '))
    if (eventTitle.includes('英语四六级报名')) {
      await page.locator('.event-actions button', { hasText: '不参加' }).first().click()
      await wait(100)
      await page.locator('.event-actions button', { hasText: '确认' }).click()
      await wait(350)
    } else {
      await page.locator('.event-actions .btn-primary').first().click()
      await wait(400)
    }
    continue
  }
  if (await page.locator('.game-screen').count()) {
    console.log('WEEK', (await page.locator('.game-head-left p').innerText()).replace(/\n/g,' '));
    await week(); continue
  }
  if (await page.locator('.ending-screen').count()) {
    console.log('YEAREND', (await page.locator('.ending-title').innerText()).replace(/\n/g,' '));
    const next=page.locator('.ending-actions .btn-primary');
    const txt=await next.innerText().catch(()=> '');
    if (txt.includes('继续')) { await next.click(); await wait(450); continue }
    break
  }
  if (await page.locator('.title-screen').count()) { console.log('TITLE'); break }
  console.log('UNKNOWN', (await page.locator('body').innerText()).slice(0,200).replace(/\n/g,' ')); break
}
console.log('steps',steps,'errors',errors.length,errors.slice(0,5))
await page.screenshot({path:'/tmp/shots/three-year-end.png', fullPage:true})
await browser.close()
