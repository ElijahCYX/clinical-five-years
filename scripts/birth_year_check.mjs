import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const out=await page.evaluate(async()=>{const s=await import('/src/social.ts');const demo=await import('/src/demo.ts');const g=await import('/src/game.ts');const rels=[];for(let i=0;i<120;i++){rels.push(s.createEventFriend(demo.demoPlayer))}const years=[...new Set(rels.map(r=>r.birthYear))].sort();const old=[{...rels[0],birthYear:2000},{...rels[1],birthYear:2020},{...rels[2],kind:'mentor',birthYear:1960}];const normalized=s.normalizeRelationships(old);return {years,min:Math.min(...rels.map(r=>r.birthYear)),max:Math.max(...rels.map(r=>r.birthYear)),clamped:normalized.map(r=>({kind:r.kind,year:r.birthYear}))}})
console.log(out);await browser.close()
