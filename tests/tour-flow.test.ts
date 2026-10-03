import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshTour,nextTour,previousTour,parseTour,recordFood} from '../src/street/tourState.ts';
import {tourStops,tourSources} from '../src/street/tourContent.ts';
test('food observation and deliberate comparison gate cultural route progress',()=>{
 const state={...freshTour(),stop:2,page:1,furthest:2};assert.equal(nextTour(state),state);
 const food=recordFood(state,'noodle');assert.equal(nextTour(food).stop,3);assert.equal(recordFood(food,'noodle'),food);
 const comparison={...food,stop:4,page:0,furthest:4};assert.equal(nextTour(comparison),comparison);assert.equal(nextTour({...comparison,compared:true}).page,1);
});
test('an entire route completes once and backtracking preserves observations',()=>{
 let s=freshTour();for(let guard=0;guard<40&&!s.complete;guard++){
  if(tourStops[s.stop].id==='noodle')s=recordFood(s,'noodle');
  if(tourStops[s.stop].id==='eras')s={...s,compared:true,era:'present'};
  if(tourStops[s.stop].id==='ending')s={...s,memory:'手上的分寸'};
  s=nextTour(s);
 }
 assert.equal(s.complete,true);assert.equal(s.stop,7);assert.equal(nextTour(s),s);
 const before=previousTour(s);assert.equal(before.stop,6);assert.deepEqual(before.foods,['noodle']);assert.equal(before.complete,false);
 assert.deepEqual(parseTour(JSON.stringify(s)),s);
});
test('corrupt or contradictory saves cannot bypass the tour',()=>{
 for(const raw of ['bad','null',JSON.stringify({...freshTour(),stop:999}),JSON.stringify({...freshTour(),page:20}),JSON.stringify({...freshTour(),complete:true}),JSON.stringify({...freshTour(),foods:['unknown']}),JSON.stringify({...freshTour(),stop:7,furthest:7})])assert.equal(parseTour(raw),null);
});
test('walking stops remain in the unobstructed lane at eye height and facts have sources',()=>{
 const sourceIds=new Set(tourSources.map(s=>s.id));
 for(const stop of tourStops){assert.ok(Math.abs(stop.position[0])<=3.5);assert.equal(stop.position[1],2.45);for(const page of stop.pages)if(page.kind==='fact'){assert.ok(page.sources?.length);assert.ok(page.sources?.every(id=>sourceIds.has(id as typeof tourSources[number]['id'])));}}
});
