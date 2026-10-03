const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const sharp=require(process.env.SHARP_MODULE||'sharp'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('docs/street/verification-final');fs.mkdirSync(out,{recursive:true});
async function diff(a,b){const [x,y]=await Promise.all([a,b].map(v=>sharp(v).ensureAlpha().raw().toBuffer()));let changed=0;for(let i=0;i<x.length;i+=4)if(Math.max(...[0,1,2].map(c=>Math.abs(x[i+c]-y[i+c])))>6)changed++;return changed;}
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--enable-webgl','--use-angle=d3d11']});
  const p=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});p.setDefaultTimeout(90000);
  const report={date:'2026-10-03',url:'http://127.0.0.1:4173/?sample=street',checks:[],errors:[]};
  p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  p.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
  const check=(name,passed,data={})=>{report.checks.push({name,passed,...data});console.log(name,passed,data);};
  let stage=p.locator('.street-canvas');
  const ready=async()=>{await p.waitForFunction(()=>document.querySelector('.street-canvas,.atelier-canvas')?.dataset.status==='ready');await settle();};
  const settle=async()=>p.waitForFunction(()=>document.querySelector('.street-canvas,.atelier-canvas')?.dataset.cameraSettled==='true');
  const shot=async name=>p.screenshot({path:path.join(out,name+'.png'),fullPage:true,timeout:90000});
  const nav=async label=>{await p.getByRole('navigation').getByRole('button',{name:new RegExp(label)}).click();await p.waitForTimeout(80);await settle();};
  try{
    await p.goto(report.url);await ready();await shot('01-entry');report.initial=await stage.evaluate(e=>({...e.dataset}));
    report.gpu=await p.evaluate(()=>{const g=document.createElement('canvas').getContext('webgl2'),ext=g.getExtension('WEBGL_debug_renderer_info');return ext?g.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown';});
    check('surroundings-and-five-reserved-plots-load',report.initial.streetAssets==='10'&&report.initial.reservedPlots==='5'&&report.initial.streetPeople==='18');
    report.renderRate=await stage.evaluate(el=>new Promise(resolve=>{let last='',count=0;const start=performance.now();const obs=new MutationObserver(()=>{if(el.dataset.streetTime!==last){last=el.dataset.streetTime;count++;}});obs.observe(el,{attributes:true,attributeFilter:['data-street-time']});setTimeout(()=>{obs.disconnect();resolve({frames:count,seconds:(performance.now()-start)/1000,scope:'desktop Chromium D3D11'});},3200);}));
    const walkingA=await stage.getAttribute('data-pedestrian-z');await p.waitForTimeout(900);check('pedestrians-move',walkingA!==await stage.getAttribute('data-pedestrian-z'));
    await p.getByRole('button',{name:'静一静',exact:true}).click();await p.waitForTimeout(100);const frozen=await stage.getAttribute('data-street-time');await p.waitForTimeout(500);check('ambient-motion-pauses',frozen===await stage.getAttribute('data-street-time'));
    const slider=p.getByRole('slider',{name:'晨光高度'});await slider.fill('0');await p.waitForTimeout(150);const low=await stage.screenshot();const h0=await stage.getAttribute('data-sun-height');await slider.fill('1');await p.waitForTimeout(150);const high=await stage.screenshot();const changed=await diff(low,high);check('dawn-changes-rendered-light',h0!==await stage.getAttribute('data-sun-height')&&changed>5000,{changedPixels:changed});await shot('02-morning-light');await slider.fill('0.36');
    await p.getByRole('button',{name:'动起来',exact:true}).click();
    const targets=new Set([await stage.getAttribute('data-camera-target')]);for(const label of ['沿街','树下','回望','布局']){await nav(label);targets.add(await stage.getAttribute('data-camera-target'));await shot('03-'+label);}check('five-camera-routes-reach-different-targets',targets.size===5);
    check('six-plots-listed',await p.locator('.street-plot-list button').count()===6);await p.locator('.street-plot-list').getByRole('button',{name:/豆皮铺/}).click();await settle();check('reserved-plot-can-be-inspected',await stage.getAttribute('data-street-view')==='plot-doupi');await shot('04-reserved-plot');
    await nav('街口');await p.locator('.street-shop-marker').click();await settle();await shot('05-keeper');check('enter-shop-follows-subject',await stage.getAttribute('data-focus')==='keeper'&&Number(await stage.getAttribute('data-camera-distance'))<8);
    for(const [id,label] of [['bowl','面碗'],['jar','酱罐'],['stool','小凳']]){await p.locator('.street-detail-tabs').getByRole('button',{name:label,exact:true}).click();await settle();await shot('06-'+id);check('closeup-'+id,await stage.getAttribute('data-focus')===id);}
    await p.locator('.street-detail-tabs').getByRole('button',{name:'面碗',exact:true}).click();await settle();const steamA=await stage.screenshot();await p.waitForTimeout(750);const steamB=await stage.screenshot();check('bowl-steam-actually-animates',await diff(steamA,steamB)>50);check('bowl-clearance-positive',Number(await stage.getAttribute('data-bowl-clearance'))>0);
    await p.getByRole('button',{name:'静一静',exact:true}).click();const pastColor=await p.locator('.street-detail').evaluate(e=>getComputedStyle(e).backgroundColor);await p.locator('.street-era').getByRole('button',{name:'今日',exact:true}).click();await p.waitForFunction(()=>{const a=+document.querySelector('.street-canvas').dataset.wallAngle;return a>10&&a<170;},null,{polling:16});await shot('07-wall-mid-turn');check('wall-turn-visible-while-ambient-paused',await stage.getAttribute('data-turning')==='true');
    await p.waitForFunction(()=>document.querySelector('.street-canvas').dataset.turning==='false');await settle();await shot('08-present-shop');check('walls-and-interface-switch-together',await stage.getAttribute('data-wall-angles')==='180.0,180.0,180.0,180.0'&&await p.locator('main').getAttribute('data-era')==='present'&&pastColor!==await p.locator('.street-detail').evaluate(e=>getComputedStyle(e).backgroundColor));
    await p.getByRole('button',{name:'动起来',exact:true}).click();await p.locator('.street-detail-tabs').getByRole('button',{name:'店主',exact:true}).click();await settle();await shot('09-present-keeper');
    const frames=await stage.evaluate(el=>new Promise(resolve=>{const poses=new Set(),blinks=new Set();const obs=new MutationObserver(()=>{poses.add(el.dataset.portraitFrame);blinks.add(el.dataset.blink);});obs.observe(el,{attributes:true,attributeFilter:['data-portrait-frame','data-blink']});setTimeout(()=>{obs.disconnect();resolve({poses:[...poses],blinks:[...blinks]});},7000);}));check('five-mouth-poses-and-blink',frames.poses.length===5&&frames.blinks.includes('true'),frames);
    await p.locator('.street-era').getByRole('button',{name:'昔日',exact:true}).click();await p.waitForTimeout(1300);await p.locator('.street-era').getByRole('button',{name:'今日',exact:true}).click();await p.waitForTimeout(350);await p.locator('.street-era').getByRole('button',{name:'昔日',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.street-canvas').dataset.turning==='false');check('rapid-era-reversal-settles',await stage.getAttribute('data-wall-angles')==='0.0,0.0,0.0,0.0');
    await nav('街口');await p.setViewportSize({width:390,height:844});await p.waitForTimeout(700);await shot('10-mobile-street');check('mobile-no-horizontal-overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.getByRole('button',{name:/走进林记/}).click();await settle();await p.locator('.street-detail-tabs').getByRole('button',{name:'面碗',exact:true}).click();await settle();await shot('11-mobile-bowl');check('mobile-bowl-focus',await stage.getAttribute('data-focus')==='bowl');
    await p.setViewportSize({width:1440,height:960});await nav('街口');await p.getByRole('button',{name:'打开街巷说明'}).click();check('handbook-opens',await p.locator('dialog').isVisible());await p.keyboard.press('Escape');
    await p.emulateMedia({reducedMotion:'reduce'});await p.reload();await ready();check('reduced-motion-respected',await stage.getAttribute('data-motion')==='off');
    await p.goto('http://127.0.0.1:4173/?sample=noodle&art=storybook');stage=p.locator('.atelier-canvas');await ready();await shot('12-standalone-shop');check('standalone-shop-preserved',await p.locator('.atelier-tabs button').count()===4);
    await p.goto('http://127.0.0.1:4173/');await p.getByRole('button',{name:/翻开这段清晨/}).waitFor();check('original-story-preserved',true);
  }catch(e){report.errors.push(e.stack);console.error(e);await shot('failure').catch(()=>{});}
  finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();}
  console.log(JSON.stringify(report,null,2));if(report.errors.length||report.checks.some(c=>!c.passed))process.exitCode=1;
})();

