// Run with a local Playwright installation or PLAYWRIGHT_MODULE pointing to one.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const sharp=require(process.env.SHARP_MODULE||'sharp');
const fs=require('node:fs');const path=require('node:path');
const out=path.resolve(__dirname,'../docs/atelier/verification');fs.mkdirSync(out,{recursive:true});
const base=process.env.ATELIER_URL||'http://127.0.0.1:5188/?sample=noodle';
async function pixelDifference(a,b){
 const [first,second]=await Promise.all([a,b].map(v=>sharp(v).ensureAlpha().raw().toBuffer({resolveWithObject:true})));
 if(first.info.width!==second.info.width||first.info.height!==second.info.height)return {changedPixels:Infinity};
 let changedPixels=0,maxChannelDifference=0;
 for(let i=0;i<first.data.length;i+=4){let delta=0;for(let c=0;c<3;c++)delta=Math.max(delta,Math.abs(first.data[i+c]-second.data[i+c]));maxChannelDifference=Math.max(maxChannelDifference,delta);if(delta>2)changedPixels++;}
 return {changedPixels,maxChannelDifference,tolerance:2};
}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(base,{waitUntil:'networkidle'});await page.locator('.atelier-loading').waitFor({state:'hidden',timeout:60000});await page.waitForTimeout(1500);
 const shot=async name=>{await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});};
 await shot('01-past-desktop');
 const report={url:base,checks:[],errors};
 report.metrics=await page.locator('.atelier-canvas').evaluate(el=>({viewport:[innerWidth,innerHeight],drawCalls:el.dataset.drawCalls,triangles:el.dataset.triangles,layers:el.dataset.layers,canvasCount:el.querySelectorAll('canvas').length}));
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.waitForTimeout(1500);await shot('02-present-desktop');
 report.checks.push({name:'present-era',passed:await page.locator('main.atelier').getAttribute('data-era')==='present'});
 await page.locator('.atelier-tabs').getByRole('button',{name:/旧酱罐/}).click();await shot('03-jar-story');
 report.checks.push({name:'jar-story',passed:await page.locator('.atelier-reading h2').innerText()==='旧罐子旁边，\n多了一双新手。'});
 await page.getByRole('button',{name:'看看纸层',exact:true}).click();await page.waitForTimeout(1400);await shot('04-layers');
 await page.getByRole('button',{name:'合上纸层',exact:true}).click();await page.waitForTimeout(1400);
 await page.getByRole('button',{name:/^走近一点/}).click();await page.waitForTimeout(1400);await shot('05-closeup');
 await page.getByRole('button',{name:/^回到全景/}).click();await page.waitForTimeout(1300);
 await page.getByRole('button',{name:/^收下一段街巷记忆/}).click();await page.reload({waitUntil:'networkidle'});await page.locator('.atelier-loading').waitFor({state:'hidden',timeout:60000});
 report.checks.push({name:'memory-persists',passed:await page.getByRole('button',{name:/已收下 · 一段街巷记忆/}).isVisible()});
 await page.getByRole('button',{name:'关于这段清晨 ↗',exact:true}).click();report.checks.push({name:'about-dialog',passed:await page.locator('dialog').isVisible()});await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(800);await shot('06-mobile-past');
 await page.getByRole('button',{name:'今日',exact:true}).click();await page.waitForTimeout(1200);await page.locator('.atelier-tabs').getByRole('button',{name:/门前小凳/}).click();await shot('07-mobile-present');
 report.checks.push({name:'mobile-no-horizontal-overflow',passed:await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)});
 await page.getByRole('button',{name:'让画面静一静',exact:true}).click();report.checks.push({name:'motion-off',passed:await page.locator('.atelier-canvas').getAttribute('data-motion')==='off'});
 await page.getByRole('button',{name:'昔日',exact:true}).click();await page.getByRole('button',{name:'今日',exact:true}).click();await page.getByRole('button',{name:'昔日',exact:true}).click();
 report.checks.push({name:'rapid-era-switch',passed:await page.locator('.atelier-canvas').getAttribute('data-era')==='past'});
 await page.setViewportSize({width:1440,height:960});await page.getByRole('button',{name:'让清晨动起来',exact:true}).click();
 await page.locator('.atelier-marker').filter({hasText:'03'}).click();report.checks.push({name:'projected-hotspot-opens-story',passed:(await page.locator('.atelier-reading h2').innerText()).includes('罐沿缺了一角')});
 const before=await page.locator('.atelier-canvas').screenshot();await page.waitForTimeout(900);const after=await page.locator('.atelier-canvas').screenshot();
 const moving=await pixelDifference(before,after);report.checks.push({name:'rendered-motion-frames-differ',passed:moving.changedPixels>100,...moving});
 await page.getByRole('button',{name:'让画面静一静',exact:true}).click();await page.waitForTimeout(1400);const still1=await page.locator('.atelier-canvas').screenshot();await page.waitForTimeout(500);const still2=await page.locator('.atelier-canvas').screenshot();
 // Ignore up to two 8-bit channel steps from text antialias rounding; actual paper motion changes far more.
 const stable=await pixelDifference(still1,still2);report.checks.push({name:'motion-off-renders-stable',passed:stable.changedPixels===0,...stable});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await page.locator('.atelier-loading').waitFor({state:'hidden',timeout:60000});
 report.checks.push({name:'respects-reduced-motion',passed:await page.locator('.atelier-canvas').getAttribute('data-motion')==='off'});
 await page.goto(base.replace('?sample=noodle',''),{waitUntil:'networkidle'});await page.getByRole('button',{name:/翻开这段清晨/}).waitFor({timeout:60000});report.checks.push({name:'original-story-opens',passed:true});
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
 if(errors.length||report.checks.some(c=>!c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
