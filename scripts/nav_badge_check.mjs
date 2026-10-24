import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function inject(screen){
 await page.evaluate(async(screen)=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen=screen;s.seasonIndex=0;s.season=d.SEASONS[0];s.week=screen==='prep'?4:1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.relationships=social.createInitialRelationships(demo.demoPlayer);localStorage.setItem('clinical-five-years-save-v27',JSON.stringify({game:s,savedAt:Date.now()}))},screen)
 await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(500)
}
await inject('plan')
console.log('plan nav',await page.locator('.interface-nav').count(),'badges',await page.locator('.interface-badge').allInnerTexts())
await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(300)
console.log('ta nav badges after view',await page.locator('.interface-badge').allInnerTexts())
await page.locator('.interface-btn',{hasText:'主界面'}).click();await page.waitForTimeout(300)
console.log('back view plan?',await page.locator('.plan-screen').count(),'badges',await page.locator('.interface-badge').allInnerTexts())
await inject('prep')
console.log('prep nav',await page.locator('.interface-nav').count())
await browser.close()
