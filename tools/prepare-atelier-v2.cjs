// Encoding only: originals from built-in imagegen remain unchanged under docs/atelier/source-art.
const sharp=require(process.env.SHARP_MODULE||'sharp');
const fs=require('node:fs');const path=require('node:path');
const base=path.resolve(__dirname,'..');
const entries=JSON.parse(fs.readFileSync(path.join(base,'docs/atelier/prompts-v2.json'),'utf8')).assets;
(async()=>{for(const {name} of entries){
 const input=path.join(base,'docs/atelier/source-art',name+'.png');
 const output=path.join(base,'public/assets/atelier',name+'.webp');
 await sharp(input).webp({quality:93,alphaQuality:100,effort:6}).toFile(output);
 console.log(name,await sharp(output).metadata().then(({width,height,hasAlpha})=>({width,height,hasAlpha})));}
})().catch(e=>{console.error(e);process.exitCode=1;});
