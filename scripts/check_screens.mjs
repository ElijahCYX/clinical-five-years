import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
for (const name of ['title','create','plan','week','prep','result','vacation','yearend']) {
  await page.goto(`http://127.0.0.1:5173/?demo=${name}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  await page.screenshot({ path: `/tmp/shots/new-${name}.png`, fullPage: true })
  console.log(name, '->', (await page.locator('body').innerText()).slice(0, 60).replace(/\n/g, ' | '))
}
console.log('ERRORS', errors)
await browser.close()
