import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dialogue,shops,shopIds} from '../src/content/story.ts';
import {sources,facts} from '../src/content/sources.ts';
import {initialState,storyReducer,memoryCount,type StoryState,type Action} from '../src/app/storyReducer.ts';
import {parseSave,readSave,writeSave,SAVE_KEY} from '../src/app/persistence.ts';
const act=(s:StoryState,...events:Action[])=>events.reduce(storyReducer,s);
const street=()=>act(initialState(),{type:'START'},{type:'PICK_PHOTO'},{type:'ENTER_PAST'});
function follow(s:StoryState,id:typeof shopIds[number]){const shop=shops[id];s=act(s,{type:'ENTER_SHOP',shop:id},{type:'OBSERVE',object:shop.object},{type:'CHOOSE_TOPIC',topic:shop.prefix+'_follow'});for(let i=0;i<4;i++)s=storyReducer(s,{type:'NEXT'});return s;}
test('unique content identifiers, valid edges, facts and source references',()=>{
  assert.equal(new Set(Object.values(dialogue).map(n=>n.id)).size,Object.keys(dialogue).length);
  for(const n of Object.values(dialogue)){assert.equal(n.contentType,'fictionalDialogue');if(n.end.type==='next')assert.ok(dialogue[n.end.target]);}
  for(const id of shopIds){const shop=shops[id];assert.equal(shop.topics.length,3);for(const t of shop.topics){assert.ok(dialogue[t.target]);let node=dialogue[t.target],seen=new Set<string>();while(node.end.type==='next'){assert.ok(!seen.has(node.id));seen.add(node.id);node=dialogue[node.end.target];}assert.ok(['returnMenu','completeShop'].includes(node.end.type));}assert.ok(shop.topics.find(t=>t.requires===shop.object));assert.ok(shop.food.sourceIds.every(s=>sources.some(x=>x.id===s)));assert.ok(shop.food.factIds.every(f=>facts.some(x=>x.id===f)));}
});
test('unobserved followup cannot jump or write completion',()=>{const s=act(street(),{type:'ENTER_SHOP',shop:'noodle'});assert.equal(storyReducer(s,{type:'CHOOSE_TOPIC',topic:'n_follow'}),s);assert.equal(memoryCount(s),0);});
test('wrong observation and invalid choice cannot cross shops',()=>{let s=act(street(),{type:'ENTER_SHOP',shop:'noodle'});assert.equal(storyReducer(s,{type:'OBSERVE',object:'stool'}),s);s=act(s,{type:'OBSERVE',object:'sauceJar'});assert.equal(storyReducer(s,{type:'CHOOSE_TOPIC',topic:'m_follow'}),s);});
test('completion is only after last followup sentence; no duplicate records',()=>{
  let s=act(street(),{type:'ENTER_SHOP',shop:'noodle'},{type:'OBSERVE',object:'sauceJar'},{type:'CHOOSE_TOPIC',topic:'n_follow'});
  for(let i=0;i<3;i++)s=storyReducer(s,{type:'NEXT'});assert.equal(s.dialogueNodeId,'n_follow_04');assert.equal(memoryCount(s),0);
  s=storyReducer(s,{type:'NEXT'});assert.equal(memoryCount(s),1);s=storyReducer(s,{type:'NEXT'});assert.equal(memoryCount(s),1);
  s=act(s,{type:'CHOOSE_TOPIC',topic:'n_follow'});for(let i=0;i<4;i++)s=storyReducer(s,{type:'NEXT'});assert.equal(memoryCount(s),1);
});
test('six shop permutations complete without reading basic topics',()=>{
  for(const order of [['noodle','doupi','mianwo'],['noodle','mianwo','doupi'],['doupi','noodle','mianwo'],['doupi','mianwo','noodle'],['mianwo','noodle','doupi'],['mianwo','doupi','noodle']] as const){let s=street();for(const id of order){s=follow(s,id);s=storyReducer(s,{type:'RETURN_STREET'});}assert.equal(memoryCount(s),3);s=act(s,{type:'VIEW_PHOTO'},{type:'RETURN_PRESENT'});assert.equal(s.endingSeen,'complete');assert.equal(s.dialogueNodeId,'ending_01');}
});
test('exit shop and re-enter restores an unfinished stable sentence',()=>{let s=act(street(),{type:'ENTER_SHOP',shop:'doupi'},{type:'NEXT'});const id=s.dialogueNodeId;s=act(s,{type:'RETURN_STREET'},{type:'ENTER_SHOP',shop:'doupi'});assert.equal(s.dialogueNodeId,id);assert.equal(memoryCount(s),0);});
test('partial ending remains resumable without losing observations',()=>{let s=follow(street(),'mianwo');s=act(s,{type:'RETURN_PRESENT'});assert.equal(s.endingSeen,'partial');s=act(s,{type:'RESUME_PAST'});assert.equal(s.screen,'past-street');assert.ok(s.completed.mianwo);assert.ok(s.observed.stool);});
test('fresh doupi entry uses alternative greeting without invented Lin visit',()=>{const node=dialogue.d_greet_02;assert.equal(node.alternate?.withoutShop,'noodle');assert.match(node.alternate!.text,/街口/);});
test('portal finish repeated or late cannot replace current screen',()=>{let s=street();assert.equal(storyReducer(s,{type:'ENTER_PAST'}),s);s=storyReducer(s,{type:'ENTER_SHOP',shop:'noodle'});assert.equal(storyReducer(s,{type:'ENTER_PAST'}),s);});
test('valid save restores checkpoint and remains behind welcome',()=>{const s=act(street(),{type:'ENTER_SHOP',shop:'mianwo'},{type:'NEXT'});const loaded=parseSave(JSON.stringify(s));assert.ok(loaded);assert.equal(loaded.screen,'welcome');assert.equal(storyReducer(loaded,{type:'CONTINUE'}).dialogueNodeId,s.dialogueNodeId);});
test('welcome action preserves the stable checkpoint and all progress',()=>{const s=follow(street(),'noodle');const home=storyReducer(s,{type:'WELCOME'});assert.equal(home.screen,'welcome');assert.deepEqual(home.stableCheckpoint,s.stableCheckpoint);assert.deepEqual(home.completed,s.completed);assert.equal(storyReducer(home,{type:'CONTINUE'}).dialogueNodeId,s.dialogueNodeId);});
test('low performance setting roundtrips and malformed value is rejected',()=>{const s=act(street(),{type:'SET_SETTING',key:'lowPerformance',value:true});assert.equal(parseSave(JSON.stringify(s))?.settings.lowPerformance,true);assert.equal(parseSave(JSON.stringify({...s,settings:{...s.settings,lowPerformance:'yes'}})),null);});
test('damaged saves, old versions, invalid nodes and contradictory completion rejected',()=>{
  for(const raw of ['{',null,'null','[]','{"saveVersion":0}'])assert.equal(parseSave(raw),null);
  const s=street();assert.equal(parseSave(JSON.stringify({...s,stableCheckpoint:{screen:'shop',shopId:'noodle',dialogueNodeId:'ending_01'}})),null);
  assert.equal(parseSave(JSON.stringify({...s,completed:{noodle:true,doupi:false,mianwo:false}})),null);
  assert.equal(parseSave(JSON.stringify({...s,settings:{...s.settings,volume:100}})),null);
});
test('failed storage does not crash the experience',()=>{const storage={getItem(){throw Error('denied');},setItem(){throw Error('quota');},removeItem(){throw Error('denied');}};assert.equal(readSave(storage).failed,true);assert.equal(writeSave(storage,street()),false);});
test('reset touches project key only and preserves settings',()=>{const removed:string[]=[];const s=storyReducer({...street(),settings:{...initialState().settings,instantText:true}},{type:'RESET'});assert.equal(s.started,false);assert.equal(s.settings.instantText,true);assert.equal(memoryCount(s),0);writeSave({getItem(){return null;},setItem(){},removeItem(k){removed.push(k);}},s);assert.deepEqual(removed,[SAVE_KEY]);});
test('settings clamp volume and reject wrong types',()=>{let s=initialState();s=storyReducer(s,{type:'SET_SETTING',key:'volume',value:9});assert.equal(s.settings.volume,1);assert.equal(storyReducer(s,{type:'SET_SETTING',key:'muted',value:9}),s);});
