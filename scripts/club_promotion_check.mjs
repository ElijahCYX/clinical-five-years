import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1500,height:1200} })
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(async()=>{const g=await import('/src/game.ts');const d=await import('/src/data.ts');const demo=await import('/src/demo.ts');const social=await import('/src/social.ts');const s=g.newGameState(demo.demoPlayer);s.screen='week';s.seasonIndex=4;s.season=d.SEASONS[4];s.week=1;s.plan='B';s.habits=[];s.weekFocus='balanced';s.electiveSelectionDone=true;s.electiveOffers=[];s.eventWeek=1;s.clubInitialRecruitmentDone=true;s.clubMembership={orgId:'org-research',category:'academic',role:'member',joinedSeasonIndex:0,totalActivities:6,semesterActivities:1,roleSinceSeasonIndex:0,presidentStartSeasonIndex:null,memberIds:[],highestRole:'member',activitySeasonIndex:4};s.relationships=social.createInitialRelationships(demo.demoPlayer);s.seenRelationIds=s.relationships.map(r=>r.id);localStorage.setItem('clinical-five-years-save-v36',JSON.stringify({game:s,savedAt:Date.now()}))})
await page.reload({waitUntil:'networkidle'});await page.locator('.title-actions .btn-ghost').click();await page.waitForTimeout(600)
console.log('notice',await page.locator('.research-notice-modal .random-event-title').innerText().catch(()=>''))
const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinical-five-years-save-v36')).game);console.log('role',s.clubMembership?.role,'lastPromo',s.clubLastPromotionSeason)
await browser.close()
