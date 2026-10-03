const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve('docs/street/verification-details');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--enable-webgl','--use-angle=d3d11']});
 const page=await browser.newPage({viewport:{width:1440,height:960}});page.setDefaultTimeout(90000);
 const report={date:'2026-10-03',checks:[],errors:[]};
 const check=(name,passed,data={})=>{report.checks.push({name,passed,...data});console.log(name,passed,data);};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 const ready=()=>page.waitForFunction(()=>document.querySelector('.street-canvas')?.dataset.status==='ready');
 const settle=()=>page.waitForFunction(()=>document.querySelector('.street-canvas')?.dataset.cameraSettled==='true');
 const shot=name=>page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
 const moment=id=>page.getByRole('group',{name:'街边小事'}).getByRole('button',{name:id,exact:true});
 try{
  await page.goto('http://127.0.0.1:4173/?sample=street&v=5');await ready();await settle();await shot('01-street');
  check('all-three-corners-reachable',await page.locator('.street-moments button').count()===3);
  const targets=new Set();
  for(const [id,label] of [['tea','茶桌边'],['market','菜篮旁'],['notice','留言板']]){
   await moment(label).click();await settle();targets.add(await page.locator('.street-canvas').getAttribute('data-camera-target'));
   check('closeup-'+id,await page.locator('.street-canvas').getAttribute('data-street-moment')===id);
   await shot('02-'+id+'-past');
  }
  check('three-different-camera-destinations',targets.size===3);
  await moment('茶桌边').click();await settle();
  await page.getByRole('button',{name:'静一静',exact:true}).click();
  const paused=await page.locator('.street-canvas').getAttribute('data-street-time');
  await page.locator('.street-moment-card').getByRole('button',{name:'今日',exact:true}).click();
  await page.waitForFunction(()=>{const t=+document.querySelector('.street-canvas').dataset.streetTurn;return t>.2&&t<.8;},null,{polling:16});await shot('03-tea-turn');
  check('corner-turns-while-ambient-paused',await page.locator('.street-canvas').getAttribute('data-street-time')===paused);
  await page.waitForFunction(()=>document.querySelector('.street-canvas').dataset.turning==='false');await settle();await shot('04-tea-present');
  check('era-change-keeps-selected-corner',await page.locator('.street-canvas').getAttribute('data-street-moment')==='tea'&&await page.locator('.street-canvas').getAttribute('data-street-turn')==='1.000');
  check('corner-copy-follows-present-era',await page.locator('.street-moment-card h2').innerText()==='带走一杯，留下一句话。');
  for(const [id,label] of [['market','菜篮旁'],['notice','留言板']]){await moment(label).click();await settle();await shot('05-'+id+'-present');}
  await page.locator('.street-moment-card').getByRole('button',{name:'昔日',exact:true}).click();await page.waitForTimeout(1350);
  await page.locator('.street-moment-card').getByRole('button',{name:'今日',exact:true}).click();await page.waitForTimeout(350);
  await page.locator('.street-moment-card').getByRole('button',{name:'昔日',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.street-canvas').dataset.turning==='false');
  check('rapid-reversal-settles-corner-and-shop',await page.locator('.street-canvas').getAttribute('data-street-turn')==='0.000'&&await page.locator('main').getAttribute('data-era')==='past');
  await page.getByRole('button',{name:'回到街上',exact:true}).click();await settle();check('close-restores-street',await page.locator('.street-title').isVisible()&&await page.locator('.street-canvas').getAttribute('data-street-moment')==='');
  const perf=await page.locator('.street-canvas').evaluate(e=>({calls:e.dataset.drawCalls,triangles:e.dataset.triangles}));check('five-shop-reservations-preserved',await page.locator('.street-canvas').getAttribute('data-reserved-plots')==='5',perf);
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);await shot('06-mobile-street');
  await moment('茶桌边').click();await settle();await shot('07-mobile-tea');
  const boxes=await page.evaluate(()=>{const rect=s=>{const b=document.querySelector(s).getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right};};return {card:rect('.street-moment-card'),menu:rect('.street-moments'),nav:rect('.street-navigation'),overflow:document.documentElement.scrollWidth>innerWidth};});
  check('mobile-panels-fit-without-overlap',!boxes.overflow&&boxes.card.bottom<boxes.menu.top&&boxes.menu.bottom<boxes.nav.top,boxes);
  await page.locator('.street-moment-card').getByRole('button',{name:'今日',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.street-canvas').dataset.turning==='false');await shot('08-mobile-tea-present');
  await page.getByRole('button',{name:'回到街上',exact:true}).click();await page.getByRole('button',{name:/走进林记/}).click();await settle();
  check('shop-still-reachable-after-corner',await page.locator('.street-canvas').getAttribute('data-focus')==='keeper'&&await page.locator('.street-moments').count()===0);await shot('09-mobile-shop');
  await page.goto('http://127.0.0.1:4173/?sample=street&era=present');await ready();await moment('茶桌边').click();await settle();
  check('direct-present-initializes-corner',await page.locator('.street-canvas').getAttribute('data-street-turn')==='1.000'&&await page.locator('.street-moment-card h2').innerText()==='带走一杯，留下一句话。');
 }catch(e){report.errors.push(e.stack);console.error(e);await shot('failure').catch(()=>{});}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log(JSON.stringify(report,null,2));if(report.errors.length||report.checks.some(c=>!c.passed))process.exitCode=1;
})();
