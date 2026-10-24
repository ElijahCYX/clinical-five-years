import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1600,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/?demo=vacation',{waitUntil:'networkidle'})
await page.waitForTimeout(300)
console.log('version:', await page.locator('#app-version').innerText())
console.log('actions:', await page.locator('.action-card').count())
for (const name of ['回家 / 陪家人','出门旅行','社会实践 / 志愿','健身 / 运动','学英语','纯粹的休息','娱乐 / 追剧','约朋友耍起','实验室牛马']) {
  const el=page.locator('.action-card',{hasText:name}).first()
  const count=await el.count()
  if(count) console.log(name, '|', (await el.innerText()).replace(/\n/g,' | ').slice(0,220), '| disabled:', await el.isDisabled())
}
await page.screenshot({path:'/tmp/shots/vacation-new.png', fullPage:true})
console.log('errors:', errors.slice(0,5))
await browser.close()
