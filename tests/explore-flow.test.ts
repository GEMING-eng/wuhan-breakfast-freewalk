import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshExplore,arriveAt,addToBasket,removeFromBasket,parseExplore,migrateTourBasket} from '../src/street/exploreState.ts';
import {places} from '../src/street/exploreContent.ts';
test('any shop can be the first stop and no previous story is required',()=>{
 for(const id of ['mianwo','doupi','noodle'] as const){const s=arriveAt(freshExplore(),id);assert.deepEqual(s.visited,[id]);assert.deepEqual(addToBasket(s,id).foods,[id]);}
});
test('basket accepts only seen food, deduplicates, removes and persists',()=>{
 let s=freshExplore();assert.equal(addToBasket(s,'mianwo'),s);s=arriveAt(s,'mianwo');s=addToBasket(s,'mianwo');assert.equal(addToBasket(s,'mianwo'),s);s=arriveAt(s,'noodle');s=addToBasket(s,'noodle');assert.deepEqual(parseExplore(JSON.stringify(s)),s);s=removeFromBasket(s,'mianwo');assert.deepEqual(s.foods,['noodle']);assert.ok(s.visited.includes('mianwo'));
});
test('malformed or unseen basket entries cannot enter a restored save',()=>{
 for(const raw of ['bad','null',JSON.stringify({...freshExplore(),place:'missing'}),JSON.stringify({...freshExplore(),foods:['doupi']}),JSON.stringify({...freshExplore(),visited:['doupi','doupi']})])assert.equal(parseExplore(raw),null);
});
test('v6 food notes migrate without requiring or inventing an ordered route',()=>{
 const old={version:1,stop:5,page:0,furthest:5,foods:['noodle','doupi'],era:'present',compared:true,memory:'',complete:false};const s=migrateTourBasket(JSON.stringify(old));assert.deepEqual(s?.foods,['noodle','doupi']);assert.deepEqual(s?.visited,['noodle','doupi']);assert.equal(s?.place,null);
});
test('free-choice destinations have safe walking targets and attributable cultural pages',()=>{
 assert.equal(new Set(places.map(p=>p.id)).size,places.length);
 for(const p of places){assert.ok(Math.abs(p.stop.position[0])<=3.5);assert.equal(p.stop.position[1],2.45);for(const c of p.chapters)for(const page of c.pages)if(page.kind==='fact')assert.ok(page.sources?.length);}
});
