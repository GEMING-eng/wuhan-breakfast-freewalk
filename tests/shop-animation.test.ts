import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shopFrame,eraVisibility} from '../src/street/ShopModule.ts';
import {places} from '../src/street/exploreContent.ts';
import {tourSources} from '../src/street/tourContent.ts';

test('shop animation has five mouth poses, an independent blink and a natural rest',()=>{
 const poses=new Set<number>();let blink=false;
 for(let t=0;t<8;t+=.03){const f=shopFrame(t,8,true);poses.add(f.from);blink||=f.blink>.5;assert.ok(f.blend>=0&&f.blend<=1);}
 assert.equal(poses.size,5);assert.ok(blink);assert.equal(shopFrame(9,8,true).speaking,false);
 const f=shopFrame(.1,8,false);assert.equal(f.from,0);assert.equal(f.to,0);assert.equal(f.blink,0);
});
test('edge-on era turns hide actors and suppress steam; endpoints restore one era',()=>{
 assert.deepEqual(eraVisibility(0),{present:false,furniture:true,steam:1});
 assert.equal(eraVisibility(.5).furniture,false);assert.ok(eraVisibility(.5).steam<1e-10);
 assert.deepEqual(eraVisibility(1),{present:true,furniture:true,steam:1});
});
test('doupi has independent topics, a safe utensil close-up and valid specific sources',()=>{
 const shop=places.find(p=>p.id==='doupi')!;assert.equal(shop.chapters.length,3);
 assert.equal(shop.chapters[1].view?.id,'doupi-spatula');assert.equal(shop.chapters[2].compare,true);
 for(const c of shop.chapters){if(c.view){assert.equal(c.view.position[1],2.45);assert.ok(Math.abs(c.view.position[0])<=3.5);}
  for(const page of c.pages){if(page.kind==='fact'){assert.ok(page.sources?.length);assert.ok(page.sources!.every(id=>tourSources.some(s=>s.id===id)));}}
 }
});
