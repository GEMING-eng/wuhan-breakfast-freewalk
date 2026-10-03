import { initialState, type StoryState, type Checkpoint } from './storyReducer.ts';
import { dialogue, shops, shopIds, type ShopId, type Screen } from '../content/story.ts';
export const SAVE_KEY='wuhan-breakfast-story.save.v1';
export interface StoragePort {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void}
const screens:Screen[]=['present-entry','past-street','shop','photo-return','present-ending'];
const isRecord=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
function validCheckpoint(v:unknown):v is Checkpoint {
  if(!isRecord(v)||!screens.includes(v.screen as Screen)||typeof v.dialogueNodeId!=='string'||!dialogue[v.dialogueNodeId])return false;
  if(v.screen==='shop')return shopIds.includes(v.shopId as ShopId)&&v.dialogueNodeId.startsWith(shops[v.shopId as ShopId].prefix+'_');
  return v.shopId===null&&(v.screen==='present-entry'?/^(intro_|pick_photo)/.test(v.dialogueNodeId):v.screen==='past-street'?v.dialogueNodeId.startsWith('street_'):v.screen==='photo-return'?v.dialogueNodeId.startsWith('return_'):/^(ending_|partial_)/.test(v.dialogueNodeId));
}
export function parseSave(raw:string|null):StoryState|null {
  try {
    if(!raw)return null;const x:unknown=JSON.parse(raw);if(!isRecord(x)||x.saveVersion!==1||x.started!==true||!validCheckpoint(x.stableCheckpoint))return null;
    if(!isRecord(x.observed)||!isRecord(x.completed)||!isRecord(x.settings)||!isRecord(x.topicsRead)||!isRecord(x.visited)||!isRecord(x.shopNodes))return null;
    const observed=x.observed,completed=x.completed,settings=x.settings;
    if(['sauceJar','spatula','stool'].some(k=>typeof observed[k]!=='boolean')||shopIds.some(k=>typeof completed[k]!=='boolean'))return null;
    if(['muted','reducedMotion','instantText'].some(k=>typeof settings[k]!=='boolean')||typeof settings.volume!=='number'||!Number.isFinite(settings.volume)||settings.volume<0||settings.volume>1)return null;
    if(![null,'partial','complete'].includes(x.endingSeen as null)||typeof x.invitationSeen!=='boolean')return null;
    if(Object.values(x.topicsRead).some(v=>v!==true)||Object.entries(x.visited).some(([k,v])=>!shopIds.includes(k as ShopId)||v!==true))return null;
    for(const id of shopIds){if(completed[id]&&!observed[shops[id].object])return null;const n=x.shopNodes[id];if(n!==undefined&&(typeof n!=='string'||!dialogue[n]||!n.startsWith(shops[id].prefix+'_')))return null;}
    if(settings.lowPerformance!==undefined&&typeof settings.lowPerformance!=='boolean')return null;
    const base=initialState();return {...base,...x,...x.stableCheckpoint,screen:'welcome'} as StoryState;
  } catch{return null;}
}
export function readSave(storage:StoragePort):{state:StoryState|null;failed:boolean} {try{return {state:parseSave(storage.getItem(SAVE_KEY)),failed:false};}catch{return {state:null,failed:true};}}
export function writeSave(storage:StoragePort,state:StoryState):boolean {try{if(state.started)storage.setItem(SAVE_KEY,JSON.stringify(state));else storage.removeItem(SAVE_KEY);return true;}catch{return false;}}
