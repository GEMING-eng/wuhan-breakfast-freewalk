// Runtime exports only: compression preserves the generated alpha; no background removal.
const sharp=require(process.env.SHARP_MODULE||'sharp');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const names=['doupi-keeper-v8','doupi-keeper-present-v8','doupi-wall-past-v8','doupi-wall-present-v8'];
 const records=[];
 for(const name of names){
  const source=path.join('docs/street/storybook-source',name+'.png'),dest=path.join('public/assets/storybook',name+'.webp');
  const metadata=await sharp(source).metadata();
  if(name.includes('keeper')&&!metadata.hasAlpha)throw new Error(name+' has no transparent alpha');
  if(name.includes('keeper')){
   const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   let clear=0,solid=0;for(let i=3;i<data.length;i+=info.channels){if(data[i]===0)clear++;if(data[i]>180)solid++;}
   if(clear/(info.width*info.height)<.25||solid/(info.width*info.height)<.1)throw new Error('Invalid alpha '+name);
   records.push({name,width:metadata.width,height:metadata.height,transparentRatio:clear/(info.width*info.height),solidRatio:solid/(info.width*info.height)});
  }else records.push({name,width:metadata.width,height:metadata.height});
  await sharp(source).webp(name.includes('keeper')?{lossless:true}:{quality:90}).toFile(dest);
 }
 fs.writeFileSync('docs/street/doupi-asset-validation-v8.json',JSON.stringify(records,null,2));
 console.log(records);
})().catch(e=>{console.error(e);process.exitCode=1;});
