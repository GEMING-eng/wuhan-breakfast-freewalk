import {test} from 'node:test';
import assert from 'node:assert/strict';
import {walkStep,clampFov,WALK_BOUNDS,EYE_HEIGHT,angleDelta} from '../src/street/walkMath.ts';
import {places} from '../src/street/exploreContent.ts';
import {freshExplore,parseExplore,arriveAt,addToBasket} from '../src/street/exploreState.ts';

test('forward and strafe follow the heading, with no faster diagonal travel',()=>{
 const forward=walkStep(0,0,0,0,1,.05),right=walkStep(0,0,0,1,0,.05),turned=walkStep(0,0,Math.PI/2,0,1,.05),diagonal=walkStep(0,0,0,1,1,.05);
 assert.ok(forward.z<0&&forward.x===0);assert.ok(right.x>0&&right.z===0);assert.ok(turned.x>0&&Math.abs(turned.z)<1e-8);
 assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-Math.abs(forward.z))<1e-8);
});
test('street bounds and frame cap prevent walking through shop volumes or jumping after a stall',()=>{
 let p={x:0,z:0};for(let i=0;i<1000;i++)p=walkStep(p.x,p.z,0,1,1,.06);
 assert.equal(p.x,WALK_BOUNDS.maxX);assert.equal(p.z,WALK_BOUNDS.minZ);
 const step=walkStep(0,0,0,0,1,10);assert.ok(Math.abs(step.z)<.3);assert.equal(EYE_HEIGHT,2.45);
});
test('zoom clamps at readable fields of view and turning crosses pi by the short arc',()=>{
 assert.equal(clampFov(-100),38);assert.equal(clampFov(300),96);assert.ok(Math.abs(angleDelta(Math.PI-.05,-Math.PI+.05)-.1)<1e-8);
});
test('all six building fronts have accessible stops and new neighbors do not invalidate an old basket',()=>{
 for(const id of ['noodle','doupi','mianwo','east-middle','west-end','east-end']){
  const p=places.find(p=>p.id===id)!;assert.ok(p,id);assert.equal(p.stop.position[1],EYE_HEIGHT);assert.ok(Math.abs(p.stop.position[0])<WALK_BOUNDS.maxX);
 }
 let old=addToBasket(arriveAt(freshExplore(),'doupi'),'doupi');assert.deepEqual(parseExplore(JSON.stringify(old)),old);
 old=arriveAt(old,'east-middle');assert.deepEqual(parseExplore(JSON.stringify(old)),old);assert.deepEqual(old.foods,['doupi']);
});
