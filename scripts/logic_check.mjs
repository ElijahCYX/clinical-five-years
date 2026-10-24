import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', headless: true, args:['--no-sandbox','--disable-gpu'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
const result = await page.evaluate(async () => {
  const m = await import('/src/game.ts')
  const base = { memory:5, comprehension:5, dexterity:5, social:5, appearance:5, energy:5, constitution:5, resilience:5 }
  const titles = {
    energy: m.archetypeFor({ ...base, energy: 9 }),
    constitution: m.archetypeFor({ ...base, constitution: 9 }),
    appearance: m.archetypeFor({ ...base, appearance: 9 }),
    social: m.archetypeFor({ ...base, social: 9 }),
    memory: m.archetypeFor({ ...base, memory: 9 }),
    pair: m.archetypeFor({ ...base, memory: 8, comprehension: 7 }),
    balanced: m.archetypeFor({ ...base }),
  }
  let cet4min = 999, cet6min75 = 999, cet6min100 = 999
  for (let i=0;i<500;i++) {
    cet4min = Math.min(cet4min, m.cetScore('cet4', 40, 2))
    cet6min75 = Math.min(cet6min75, m.cetScore('cet6', 75, 2))
    cet6min100 = Math.min(cet6min100, m.cetScore('cet6', 100, 2))
  }
  return { titles, cet4min, cet6min75, cet6min100 }
})
console.log(JSON.stringify(result, null, 2))
await browser.close()
