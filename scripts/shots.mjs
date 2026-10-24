import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})
const desktop = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const shots = [
  ['title', '?demo=title'],
  ['create', '?demo=create'],
  ['plan', '?demo=plan'],
  ['week', '?demo=week'],
  ['prep', '?demo=prep'],
  ['result', '?demo=result'],
  ['ending', '?demo=ending'],
]
for (const [name, path] of shots) {
  await desktop.goto('http://127.0.0.1:5173/' + path, { waitUntil: 'networkidle' })
  await desktop.screenshot({ path: `/tmp/shots/final-${name}.png` })
}
const mobile = await browser.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
await mobile.goto('http://127.0.0.1:5173/?demo=title', { waitUntil: 'networkidle' })
await mobile.screenshot({ path: '/tmp/shots/mobile-title.png' })
await mobile.goto('http://127.0.0.1:5173/?demo=week', { waitUntil: 'networkidle' })
await mobile.screenshot({ path: '/tmp/shots/mobile-week.png', fullPage: true })
await mobile.goto('http://127.0.0.1:5173/?demo=create', { waitUntil: 'networkidle' })
await mobile.screenshot({ path: '/tmp/shots/mobile-create.png', fullPage: true })
await browser.close()
console.log('done')
