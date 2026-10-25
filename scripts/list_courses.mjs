import { chromium } from 'playwright-core'
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']})
const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'})
const out=await page.evaluate(async()=>{const d=await import('/src/data.ts');return d.SEASONS.map((s,i)=>({i,id:s.id,label:s.seasonLabel,exam:s.examKind,courses:s.courses.map(c=>({name:c.name,credits:c.credits,exam:c.examType,elective:c.electiveType??null,chance:c.selectionChance??null}))}))})
console.log(JSON.stringify(out,null,2));await browser.close()
