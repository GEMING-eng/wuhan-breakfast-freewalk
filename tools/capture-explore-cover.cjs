const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const out=path.resolve('docs/street/verification-explore');
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--enable-webgl','--use-angle=d3d11']});
 const p=await browser.newPage({viewport:{width:1440,height:960}}),report={errors:[],views:[]};
 p.on('pageerror',e=>report.errors.push(e.message));
 try{
  await p.goto('http://127.0.0.1:4173/?sample=tour&v=7');
  await p.waitForFunction(()=>document.querySelector('.explore-canvas')?.dataset.status==='ready',null,{timeout:90000});
  await p.locator('.market-cover-art').evaluate(e=>e.decode());
  for(const [width,height,name] of [[1440,960,'01-cover'],[390,844,'13-mobile-cover'],[320,740,'14-small-cover']]){
   await p.setViewportSize({width,height});await p.screenshot({path:path.join(out,name+'.png'),fullPage:true});
   const metrics=await p.locator('.cover-copy h1').evaluate(e=>{const s=getComputedStyle(e);return {lines:Math.round(e.getBoundingClientRect().height/parseFloat(s.lineHeight)),overflow:document.documentElement.scrollWidth>innerWidth,entryVisible:document.querySelector('.cover-enter').getBoundingClientRect().bottom<innerHeight};});
   report.views.push({width,height,...metrics});
  }
  await p.getByRole('button',{name:/去街上逛逛/}).click();
  report.reservedPlots=await p.locator('.explore-canvas').getAttribute('data-reserved-plots');
 }finally{fs.writeFileSync(path.join(out,'cover-report.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log(JSON.stringify(report,null,2));if(report.errors.length||report.views.some(v=>v.overflow||!v.entryVisible||v.lines>2)||report.reservedPlots!=='3')process.exitCode=1;
})();
