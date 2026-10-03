import { dialogue, shops, shopIds, type Screen, type ShopId, type ObjectId } from '../content/story.ts';
export interface Settings { muted:boolean; volume:number; reducedMotion:boolean; instantText:boolean; lowPerformance?:boolean }
export interface Checkpoint { screen:Screen; shopId:ShopId|null; dialogueNodeId:string }
export interface StoryState {
  saveVersion:1; started:boolean; screen:Screen; shopId:ShopId|null; dialogueNodeId:string; stableCheckpoint:Checkpoint;
  observed:Record<ObjectId,boolean>; topicsRead:Record<string,boolean>; completed:Record<ShopId,boolean>;
  visited:Partial<Record<ShopId,boolean>>; shopNodes:Partial<Record<ShopId,string>>;
  endingSeen:'partial'|'complete'|null; invitationSeen:boolean; settings:Settings;
}
export type Action = {type:'START'|'WELCOME'|'CONTINUE'|'PICK_PHOTO'|'ENTER_PAST'|'NEXT'|'RETURN_STREET'|'RETURN_PRESENT'|'VIEW_PHOTO'|'RESUME_PAST'|'ACK_INVITATION'|'RESET'} | {type:'ENTER_SHOP';shop:ShopId} | {type:'OBSERVE';object:ObjectId} | {type:'CHOOSE_TOPIC';topic:string} | {type:'SET_SETTING';key:keyof Settings;value:boolean|number};
export function initialState(settings?:Settings):StoryState {
  return {saveVersion:1,started:false,screen:'welcome',shopId:null,dialogueNodeId:'intro_01',stableCheckpoint:{screen:'present-entry',shopId:null,dialogueNodeId:'intro_01'},observed:{sauceJar:false,spatula:false,stool:false},topicsRead:{},completed:{noodle:false,doupi:false,mianwo:false},visited:{},shopNodes:{},endingSeen:null,invitationSeen:false,settings:settings??{muted:true,volume:.35,reducedMotion:false,instantText:false}};
}
const commit=(s:StoryState):StoryState=>({...s,stableCheckpoint:{screen:s.screen,shopId:s.shopId,dialogueNodeId:s.dialogueNodeId},shopNodes:s.screen==='shop'&&s.shopId?{...s.shopNodes,[s.shopId]:s.dialogueNodeId}:s.shopNodes});
export function storyReducer(state:StoryState, action:Action):StoryState {
  switch(action.type) {
    case 'SET_SETTING': {const v=action.value;if(action.key==='volume'&&(typeof v!=='number'||!Number.isFinite(v))) return state;if(action.key!=='volume'&&typeof v!=='boolean')return state;return {...state,settings:{...state.settings,[action.key]:action.key==='volume'?Math.max(0,Math.min(1,v as number)):v}};}
    case 'RESET': return initialState(state.settings);
    case 'START': return commit({...initialState(state.settings),started:true,screen:'present-entry'});
    case 'WELCOME': return {...state,screen:'welcome'};
    case 'CONTINUE': return state.started?{...state,...state.stableCheckpoint}:state;
    case 'PICK_PHOTO': return state.screen==='present-entry'?commit({...state,dialogueNodeId:'pick_photo'}):state;
    case 'ENTER_PAST': return state.screen==='present-entry'&&state.dialogueNodeId==='pick_photo'?commit({...state,screen:'past-street',dialogueNodeId:'street_01'}):state;
    case 'ENTER_SHOP': {if(!shopIds.includes(action.shop)||state.screen!=='past-street') return state;const s=shops[action.shop];return commit({...state,screen:'shop',shopId:s.id,dialogueNodeId:state.shopNodes[s.id]??s.prefix+'_greet_01',visited:{...state.visited,[s.id]:true}});}
    case 'OBSERVE': {if(state.screen!=='shop'||!state.shopId||shops[state.shopId].object!==action.object)return state;return commit({...state,observed:{...state.observed,[action.object]:true},dialogueNodeId:shops[state.shopId].prefix+'_menu'});}
    case 'CHOOSE_TOPIC': {if(state.screen!=='shop'||!state.shopId||dialogue[state.dialogueNodeId]?.end.type!=='choices')return state;const t=shops[state.shopId].topics.find(t=>t.id===action.topic);if(!t||(t.requires&&!state.observed[t.requires]))return state;return commit({...state,dialogueNodeId:t.target});}
    case 'NEXT': {
      if(state.screen==='welcome')return state;
      const end=dialogue[state.dialogueNodeId]?.end;if(!end)return state;
      if(end.type==='next')return commit({...state,dialogueNodeId:end.target});
      if(end.type==='returnMenu'&&end.shop===state.shopId)return commit({...state,dialogueNodeId:shops[end.shop].prefix+'_menu',topicsRead:{...state.topicsRead,[end.topic]:true}});
      if(end.type==='completeShop'&&end.shop===state.shopId&&state.observed[shops[end.shop].object])return commit({...state,dialogueNodeId:shops[end.shop].prefix+'_menu',completed:{...state.completed,[end.shop]:true},topicsRead:{...state.topicsRead,[shops[end.shop].prefix+'_follow']:true}});
      return state;
    }
    case 'RETURN_STREET': return state.screen==='shop'?commit({...state,screen:'past-street',shopId:null,dialogueNodeId:'street_ready'}):state;
    case 'RESUME_PAST': return state.started?commit({...state,screen:'past-street',shopId:null,dialogueNodeId:'street_ready'}):state;
    case 'ACK_INVITATION':return {...state,invitationSeen:true};
    case 'VIEW_PHOTO':return state.screen==='past-street'?commit({...state,screen:'photo-return',dialogueNodeId:'return_01'}):state;
    case 'RETURN_PRESENT': {if(!['shop','past-street','photo-return'].includes(state.screen))return state;const complete=shopIds.every(id=>state.completed[id]);return commit({...state,screen:'present-ending',shopId:null,dialogueNodeId:complete?'ending_01':'partial_01',endingSeen:complete?'complete':'partial'});}
  }
}
export const memoryCount = (s:StoryState)=>shopIds.filter(id=>s.completed[id]).length;
