import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage({ viewport:{width:1400,height:1100} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())})
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const roles=await page.evaluate(async()=>{
  const e=await import('/src/events.ts'); const demo=await import('/src/demo.ts')
  const out={}
  for(const o of ['heterosexual','homosexual','bisexual']){
    for(const g of ['女','男']){
      const p={...demo.demoPlayer,gender:g,orientation:o}; const set=new Set(); for(let i=0;i<80;i++) set.add(e.npcRole(p)); out[g+'-'+o]=[...set].sort().join('/')
    }
  }
  return out
})
console.log(roles)
await page.locator('.title-actions .btn-primary').click(); await page.waitForTimeout(300)
console.log('orientation fields:',await page.locator('.field',{hasText:'性取向'}).count())
console.log('orientation buttons:',await page.locator('.field',{hasText:'性取向'}).locator('.segmented button').allInnerTexts())
await page.locator('.name-random-btn').click(); await page.waitForTimeout(150)
console.log('random identity active:',await page.evaluate(()=>({name:document.querySelector('.name-input-row input').value,gender:[...document.querySelectorAll('.segmented button')].map(b=>b.classList.contains('is-active')?b.textContent:null).filter(Boolean),orientation:[...document.querySelectorAll('.field')].find(f=>f.innerText.includes('性取向'))?.querySelector('.is-active')?.textContent})))
console.log('errors',errors.slice(0,5))
await browser.close()
