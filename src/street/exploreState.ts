import {places,type PlaceId} from './exploreContent.ts';
import {foodNotes,type FoodNote} from './tourContent.ts';
import {parseTour} from './tourState.ts';
export type ExploreSave={version:1;place:PlaceId|null;visited:PlaceId[];foods:FoodNote[];era:'past'|'present'};
export const EXPLORE_SAVE_KEY='wuhan-breakfast-story.explore.v1';
export const freshExplore=():ExploreSave=>({version:1,place:null,visited:[],foods:[],era:'past'});
export function parseExplore(raw:string|null):ExploreSave|null{
 try{const s=JSON.parse(raw??'null'),ids=places.map(p=>p.id);if(!s||s.version!==1||(s.place!==null&&!ids.includes(s.place))||!Array.isArray(s.visited)||s.visited.some((id:PlaceId)=>!ids.includes(id))||new Set(s.visited).size!==s.visited.length||!Array.isArray(s.foods)||s.foods.some((id:FoodNote)=>!foodNotes.some(f=>f.id===id))||new Set(s.foods).size!==s.foods.length||!['past','present'].includes(s.era))return null;
  if(s.foods.some((id:FoodNote)=>!s.visited.includes(id)))return null;
  return {version:1,place:s.place,visited:s.visited,foods:s.foods,era:s.era};
 }catch{return null;}
}
export function arriveAt(s:ExploreSave,id:PlaceId):ExploreSave{return {...s,place:id,visited:s.visited.includes(id)?s.visited:[...s.visited,id]};}
export function addToBasket(s:ExploreSave,id:FoodNote):ExploreSave{return !s.visited.includes(id)||s.foods.includes(id)?s:{...s,foods:[...s.foods,id]};}
export function removeFromBasket(s:ExploreSave,id:FoodNote):ExploreSave{return {...s,foods:s.foods.filter(f=>f!==id)};}
/** Only migrate food observations, never infer a new ordered route or overwrite v6. */
export function migrateTourBasket(raw:string|null):ExploreSave|null{const old=parseTour(raw);if(!old)return null;return {...freshExplore(),foods:old.foods,visited:[...old.foods],era:old.era};}
