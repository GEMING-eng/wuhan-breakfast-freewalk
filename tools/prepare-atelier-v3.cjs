// Copy original generations verbatim; only WebP encoding for runtime delivery.
const fs=require('node:fs'),path=require('node:path'),sharp=require(process.env.SHARP_MODULE||'sharp');
(async()=>{for(const row of JSON.parse(fs.readFileSync('docs/atelier/generated-v3.json','utf8'))){
 const original=path.resolve('docs/atelier/source-art',row.name+'.png');if(fs.existsSync(row.source))fs.copyFileSync(row.source,original);
 if(!fs.existsSync(original))throw new Error('缺少原图：'+original);
 await sharp(original).webp({quality:95,alphaQuality:100,effort:6}).toFile(path.resolve('public/assets/atelier',row.name+'.webp'));
 console.log(row.name,await sharp(original).metadata().then(({width,height,hasAlpha})=>({width,height,hasAlpha})));
}})().catch(e=>{console.error(e);process.exitCode=1;});
