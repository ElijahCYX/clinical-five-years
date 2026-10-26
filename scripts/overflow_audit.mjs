import { chromium } from 'playwright-core'
const demos=['title','create','talentSelect','talentEvent','electiveSelect','plan','clubRecruitment','week','prep','result','vacation','cetEvent','cetResult','randomEvent','yearend','ending','stressEnding']
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true,args:['--no-sandbox']})
const page=await browser.newPage({viewport:{width:1624,height:1048}})
page.on('pageerror',e=>console.log('PAGEERR',e.message))
for(const demo of demos){
  await page.goto(`http://127.0.0.1:5173/?demo=${demo}`,{waitUntil:'networkidle'})
  await page.waitForTimeout(250)
  const info=await page.evaluate(()=>{
    const shell=document.querySelector('.screen > .shell')||document.querySelector('.shell')
    const body=document.body
    const shellInfo=shell?{cw:shell.clientWidth,sw:shell.scrollWidth,ch:shell.clientHeight,sh:shell.scrollHeight,oy:getComputedStyle(shell).overflowY,ox:getComputedStyle(shell).overflowX}:null
    return {shell:shellInfo,body:{cw:body.clientWidth,sw:body.scrollWidth},screen:document.querySelector('.screen')?.className}
  })
  console.log(demo,JSON.stringify(info))
}
await browser.close()
