const {chromium}=require(process.env.PLAYWRIGHT_MODULE);const fs=require('node:fs');const path=require('node:path');
const out=path.resolve('docs/atelier/verification-v3');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await browser.newPage({viewport:{width:1440,height:960}});try{
 await p.goto('http://127.0.0.1:4173/?sample=noodle');await p.locator('.atelier-loading').waitFor({state:'hidden',timeout:90000});await p.waitForTimeout(1500);
 const stage=p.locator('.atelier-canvas');console.log('DEFAULT',await stage.evaluate(el=>({...el.dataset,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches})));
 await p.screenshot({path:path.join(out,'baseline-overview.png'),fullPage:true});await p.getByRole('button',{name:'让画面静一静',exact:true}).click();await p.getByRole('button',{name:'今日',exact:true}).click();await p.waitForTimeout(350);console.log('PAUSED_SWITCH',await stage.evaluate(el=>({...el.dataset})));
 await p.getByRole('button',{name:'让清晨动起来',exact:true}).click();await p.getByRole('button',{name:'昔日',exact:true}).click();await p.waitForTimeout(3500);
 await p.locator('.atelier-tabs').getByRole('button',{name:/这一碗面/}).click();await p.waitForFunction(()=>document.querySelector('.atelier-canvas').dataset.cameraSettled==='true');await p.screenshot({path:path.join(out,'baseline-bowl.png'),fullPage:true});
 await p.locator('.atelier-tabs').getByRole('button',{name:/听林姐说/}).click();await p.waitForFunction(()=>document.querySelector('.atelier-canvas').dataset.cameraSettled==='true');await p.getByRole('button',{name:'再聊一会儿 ↻'}).click();
 for(let i=0;i<4;i++){await p.screenshot({path:path.join(out,`baseline-face-${i}.png`),fullPage:true});await p.waitForTimeout(170);}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
