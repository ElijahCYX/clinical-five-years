import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
async function setup(){await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=0;s.season=d.SEASONS[0];s.week=1;s.plan='B';s.habits=['timeManagement'];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.money=500;s.relationships=social.createInitialRelationships(demo.demoPlayer).map((r,i)=>i===0?{...r,intimacy:40,birthdayMonth:9,birthYear:2005,birthdayGiftYear:0,birthdayContactType:null}:r);s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v31',JSON.stringify({game:s,savedAt:Date.now()}))});await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(400);await page.locator('.interface-btn',{hasText:'TA 是谁'}).click();await page.waitForTimeout(300)}
await setup();await page.locator('.whois-birthday').first().click();await page.waitForTimeout(200)
console.log('choices',await page.locator('.birthday-choice').allInnerTexts())
await page.locator('.birthday-choice',{hasText:'只送祝福'}).click();await page.waitForTimeout(300)
let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v31')).game);console.log('blessing state',{money:s.money,intimacy:s.relationships[0].intimacy,type:s.relationships[0].birthdayContactType},'label',await page.locator('.whois-birthday').first().innerText(),'msg',await page.locator('.whois-message').innerText().catch(()=>''))
await setup();await page.locator('.whois-birthday').first().click();await page.waitForTimeout(200);await page.locator('.birthday-choice',{hasText:'送生日礼物'}).click();await page.waitForTimeout(300)
s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v31')).game);console.log('gift state',{money:s.money,intimacy:s.relationships[0].intimacy,type:s.relationships[0].birthdayContactType},'response',await page.locator('.birthday-response-modal').count())
console.log('errors',errors.slice(0,5))
await browser.close()
