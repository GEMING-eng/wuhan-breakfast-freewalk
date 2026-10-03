const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const sharp=require(process.env.SHARP_MODULE||'sharp'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('docs/atelier/verification-v3');fs.mkdirSync(out,{recursive:true});
const url=process.env.ATELIER_URL||'http://127.0.0.1:4173/?sample=noodle';
async function pixels(a,b){const [x,y]=await Promise.all([a,b].map(v=>sharp(v).ensureAlpha().raw().toBuffer()));let n=0;for(let i=0;i<x.length;i+=4)if(Math.max(...[0,1,2].map(c=>Math.abs(x[i+c]-y[i+c])))>4)n++;return n;}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});p.setDefaultTimeout(60000);
const report={url,checks:[],errors:[]};p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const check=(name,passed,details={})=>{report.checks.push({name,passed,...details});console.log(name,passed,details);};
const stage=p.locator('.atelier-canvas');
const ready=async()=>{await stage.waitFor();await p.waitForFunction(()=>document.querySelector('.atelier-canvas')?.dataset.status==='ready',null,{timeout:120000});await p.locator('.atelier-loading').waitFor({state:'hidden'});};
const settle=async()=>p.waitForFunction(()=>document.querySelector('.atelier-canvas').dataset.cameraSettled==='true');
const shot=async name=>p.screenshot({path:path.join(out,name+'.png'),fullPage:true,timeout:60000});
const select=async label=>{await p.locator('.atelier-tabs').getByRole('button',{name:new RegExp(label)}).click();await settle();};
const theme=async()=>p.locator('.atelier-header').evaluate(el=>getComputedStyle(el).backgroundColor);
try{
 await p.goto(url,{waitUntil:'networkidle'});await ready();await settle();await shot('01-past-overview');
 report.metrics=await stage.evaluate(el=>({...el.dataset}));const overview=Number(await stage.getAttribute('data-camera-distance')),pastTheme=await theme();
 for(const [id,label] of [['bowl','这一碗面'],['jar','旧酱罐'],['stool','门前小凳'],['keeper','听林姐说']]){await select(label);await shot('02-'+id);check('camera-'+id,await stage.getAttribute('data-focus')===id&&overview/Number(await stage.getAttribute('data-camera-distance'))>2);}
 await p.getByRole('button',{name:'再聊一会儿 ↻'}).click();
 const observed=await stage.evaluate(el=>new Promise(resolve=>{const frames=new Set(),blinks=new Set();let samples=0;const observer=new MutationObserver(()=>{frames.add(el.dataset.portraitFrame);blinks.add(el.dataset.blink);samples++;});observer.observe(el,{attributes:true,attributeFilter:['data-portrait-frame','data-blink']});setTimeout(()=>{observer.disconnect();resolve({frames:[...frames],blinks:[...blinks],samples});},7200);}));
 check('five-mouth-poses-and-independent-blink',observed.frames.length===5&&observed.blinks.includes('true'),observed);
 await p.getByRole('button',{name:'再聊一会儿 ↻'}).click();for(let i=0;i<3;i++){await shot('03-face-'+i);await p.waitForTimeout(110);}
 await select('这一碗面');const before=await stage.screenshot();await p.waitForTimeout(800);const after=await stage.screenshot();check('steam-animates',await pixels(before,after)>100,{changedPixels:await pixels(before,after)});
 check('bowl-ground-clearance',Number(await stage.getAttribute('data-bowl-clearance'))>0&&Number(await stage.getAttribute('data-bowl-clearance'))<.01);
 await p.getByRole('button',{name:'让画面静一静',exact:true}).click();await p.waitForTimeout(200);const stillA=await stage.screenshot();await p.waitForTimeout(500);const stillB=await stage.screenshot();check('ambient-pause-is-stable',await pixels(stillA,stillB)===0);
 await p.getByRole('button',{name:'今日',exact:true}).click();await p.waitForFunction(()=>{const a=+document.querySelector('.atelier-canvas').dataset.wallAngle;return a>3&&a<177;},null,{polling:30});
 const mid=await stage.evaluate(el=>({...el.dataset}));check('paused-ambient-still-allows-visible-turn',mid.turning==='true'&&+mid.wallAngle>0&&+mid.wallAngle<180,{angles:mid.wallAngles});await shot('04-turning');
 await p.waitForFunction(()=>document.querySelector('.atelier-canvas').dataset.turning==='false');await p.waitForTimeout(900);await shot('05-present-overview');
 check('wall-and-ui-arrive-together',await stage.getAttribute('data-wall-angles')==='180.0,180.0,180.0,180.0'&&await p.locator('main.atelier').getAttribute('data-era')==='present'&&pastTheme!==await theme(),{pastTheme,presentTheme:await theme()});
 await p.getByRole('button',{name:'让清晨动起来',exact:true}).click();await select('听小林说');await shot('06-present-keeper');
 await p.getByRole('button',{name:'昔日',exact:true}).click();await p.waitForTimeout(1100);await p.getByRole('button',{name:'今日',exact:true}).click();await p.waitForTimeout(400);await p.getByRole('button',{name:'昔日',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.atelier-canvas').dataset.turning==='false');
 check('rapid-reversal-settles',await stage.getAttribute('data-wall-angles')==='0.0,0.0,0.0,0.0'&&await p.locator('main.atelier').getAttribute('data-era')==='past');
 await p.getByRole('button',{name:'看看纸层',exact:true}).click();await p.waitForTimeout(1400);await shot('07-layers');await p.getByRole('button',{name:'合上纸层',exact:true}).click();await p.waitForTimeout(1400);
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(700);await shot('08-mobile');check('mobile-no-overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await select('这一碗面');await shot('09-mobile-bowl');check('mobile-focus',await stage.getAttribute('data-focus')==='bowl');
 await p.getByRole('button',{name:'关于这段清晨 ↗',exact:true}).click();check('about-dialog',await p.locator('dialog').isVisible());await p.keyboard.press('Escape');
 await p.getByRole('button',{name:/^收下一段街巷记忆/}).click();await p.reload({waitUntil:'networkidle'});await ready();check('saved-memory-persists',await p.getByRole('button',{name:/已收下/}).isVisible());
 await p.emulateMedia({reducedMotion:'reduce'});await p.reload({waitUntil:'networkidle'});await ready();check('reduced-motion-default',await stage.getAttribute('data-motion')==='off');
 await p.goto(url.replace('?sample=noodle',''),{waitUntil:'networkidle'});await p.getByRole('button',{name:/翻开这段清晨/}).waitFor();check('original-story-preserved',true);
}catch(e){report.errors.push(e.stack);console.error(e);await shot('failure').catch(()=>{});}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report,null,2));if(report.errors.length||report.checks.some(c=>!c.passed))process.exitCode=1;
})();
