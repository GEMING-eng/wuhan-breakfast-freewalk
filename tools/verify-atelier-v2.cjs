const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const sharp=require(process.env.SHARP_MODULE||'sharp');
const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../docs/atelier/verification-v2');fs.mkdirSync(out,{recursive:true});
const base=process.env.ATELIER_URL||'http://127.0.0.1:5188/?sample=noodle';
async function changed(a,b){const [x,y]=await Promise.all([a,b].map(v=>sharp(v).ensureAlpha().raw().toBuffer()));let n=0;for(let i=0;i<x.length;i+=4)if(Math.max(...[0,1,2].map(c=>Math.abs(x[i+c]-y[i+c])))>3)n++;return n;}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
 const report={url:base,checks:[],errors:[]};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 const check=(name,passed,details)=>{report.checks.push({name,passed,...details});console.log(name,passed,details||'');};
 const shot=async name=>page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
 const stage=page.locator('.atelier-canvas');
 const ready=async()=>{await page.locator('.atelier-loading').waitFor({state:'hidden',timeout:90000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1600);};
 try{
  await page.goto(base,{waitUntil:'networkidle'});await ready();await shot('01-past-overview');
  const overview=Number(await stage.getAttribute('data-camera-distance'));report.metrics=await stage.evaluate(e=>({...e.dataset}));
  for(const [id,label] of [['bowl','这一碗面'],['jar','旧酱罐'],['stool','门前小凳'],['keeper','听林姐说']]){
   await page.locator('.atelier-tabs').getByRole('button',{name:new RegExp(label)}).click();await page.waitForFunction(()=>document.querySelector('.atelier-canvas').dataset.cameraSettled==='true');await page.waitForTimeout(200);await shot('02-focus-'+id);
   const d=Number(await stage.getAttribute('data-camera-distance'));
   check('camera-follows-'+id,await stage.getAttribute('data-focus')===id&&overview/d>2,{magnification:overview/d,distance:d,target:await stage.getAttribute('data-camera-target')});
  }
  await page.getByRole('button',{name:'再聊一会儿 ↻'}).click();
  // Observe every rendered frame state, rather than aliasing a short blink with 150 ms polling.
  const observed=await stage.evaluate(el=>new Promise(resolve=>{const values=new Set([el.dataset.portraitFrame]);const observer=new MutationObserver(()=>values.add(el.dataset.portraitFrame));observer.observe(el,{attributes:true,attributeFilter:['data-portrait-frame']});setTimeout(()=>{observer.disconnect();resolve([...values]);},6500);}));
  const frames=new Set(observed);for(const i of [2,4,6]){await shot('03-speaking-'+i);await page.waitForTimeout(170);}
  check('generated-speaking-and-blink-frames',frames.has('0')&&frames.has('1')&&frames.has('2'),{frames:[...frames]});
  await page.getByRole('button',{name:'今日',exact:true}).click();
  await page.waitForFunction(()=>{const a=Number(document.querySelector('.atelier-canvas').dataset.wallAngle);return a>5&&a<175;},{},{timeout:15000,polling:50});report.turningAngle=await stage.getAttribute('data-wall-angle');await shot('04-wall-turning');
  await page.waitForFunction(()=>document.querySelector('.atelier-canvas').dataset.turning==='false');await page.waitForTimeout(200);await shot('05-present-overview');
  check('wall-rotates-180-and-camera-resets',Number(await stage.getAttribute('data-wall-angle'))===180&&await stage.getAttribute('data-era')==='present'&&await stage.getAttribute('data-focus')==='welcome');
  await page.locator('.atelier-tabs').getByRole('button',{name:/听小林说/}).click();await page.waitForTimeout(1600);await shot('06-present-keeper');
  await page.getByRole('button',{name:'返回店铺全景',exact:false}).click();await page.waitForTimeout(1500);
  await page.getByRole('button',{name:'看看纸层',exact:true}).click();await page.waitForTimeout(1400);await shot('07-layers');
  check('paper-layers-open',await page.getByRole('button',{name:'合上纸层'}).getAttribute('aria-pressed')==='true');
  await page.getByRole('button',{name:'合上纸层',exact:true}).click();await page.waitForTimeout(1400);
  await page.getByRole('button',{name:'昔日',exact:true}).click();await page.waitForTimeout(850);await page.getByRole('button',{name:'今日',exact:true}).click();await page.waitForTimeout(150);await page.getByRole('button',{name:'昔日',exact:true}).click();
  await page.waitForTimeout(3400);check('rapid-switch-settles-consistently',await stage.getAttribute('data-wall-angle')==='0.0'&&await stage.getAttribute('data-era')==='past'&&await stage.getAttribute('data-turning')==='false');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(900);await shot('08-mobile-overview');
  await page.locator('.atelier-tabs').getByRole('button',{name:/旧酱罐/}).click();await page.waitForTimeout(1600);await shot('09-mobile-jar');
  check('mobile-focus-and-no-overflow',await stage.getAttribute('data-focus')==='jar'&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('button',{name:'让画面静一静',exact:true}).click();await page.waitForTimeout(1300);
  await stage.scrollIntoViewIfNeeded();const a=await stage.screenshot();await page.waitForTimeout(650);const b=await stage.screenshot();const pixels=await changed(a,b);
  check('motion-off-stays-still',pixels===0,{changedPixels:pixels});
  await page.getByRole('button',{name:'今日',exact:true}).click();await page.waitForTimeout(250);check('reduced-motion-era-snap',await stage.getAttribute('data-wall-angle')==='180.0');
  await page.getByRole('button',{name:'关于这段清晨 ↗',exact:true}).click();check('dialog-opens',await page.locator('dialog').isVisible());await page.keyboard.press('Escape');
  await page.getByRole('button',{name:/^收下一段街巷记忆/}).click();await page.reload({waitUntil:'networkidle'});await ready();check('memory-persists',await page.getByRole('button',{name:/已收下/}).isVisible());
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await ready();check('prefers-reduced-motion',await stage.getAttribute('data-motion')==='off');
  await page.goto(base.replace('?sample=noodle',''),{waitUntil:'networkidle'});await page.getByRole('button',{name:/翻开这段清晨/}).waitFor({timeout:60000});check('original-story-preserved',true);
 }catch(e){report.errors.push(e.stack);console.error(e);await shot('failure').catch(()=>{});}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log(JSON.stringify(report,null,2));if(report.errors.length||report.checks.some(c=>!c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
