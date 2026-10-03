import {tourStops,foodNotes,memoryChoices,type FoodNote} from './tourContent.ts';
export type TourSave={version:1;stop:number;page:number;furthest:number;foods:FoodNote[];era:'past'|'present';compared:boolean;memory:string;complete:boolean};
export const TOUR_SAVE_KEY='wuhan-breakfast-story.tour.v1';
export const freshTour=():TourSave=>({version:1,stop:0,page:0,furthest:0,foods:[],era:'past',compared:false,memory:'',complete:false});
export function parseTour(raw:string|null):TourSave|null{
 try{const s=JSON.parse(raw??'null');if(!s||s.version!==1||![s.stop,s.page,s.furthest].every(Number.isInteger)||s.stop<0||s.stop>=tourStops.length||s.page<0||s.page>=tourStops[s.stop].pages.length||s.furthest<s.stop||s.furthest>=tourStops.length||!Array.isArray(s.foods)||s.foods.some((id:unknown)=>!foodNotes.some(f=>f.id===id))||new Set(s.foods).size!==s.foods.length||!['past','present'].includes(s.era)||typeof s.compared!=='boolean'||typeof s.complete!=='boolean'||!['',...memoryChoices].includes(s.memory))return null;
 if((s.furthest>=3&&!s.foods.includes('noodle'))||(s.furthest>=5&&!s.compared))return null;
 if(s.complete&&(s.stop!==tourStops.length-1||!s.memory||!s.compared||!s.foods.includes('noodle')))return null;
 return {version:1,stop:s.stop,page:s.page,furthest:s.furthest,foods:s.foods,era:s.era,compared:s.compared,memory:s.memory,complete:s.complete};
 }catch{return null;}
}
export function nextTour(s:TourSave):TourSave{
 if(s.complete)return s;
 const stop=tourStops[s.stop];
 if(stop.id==='eras'&&s.page===0&&!s.compared)return s;
 if(stop.id==='noodle'&&s.page===stop.pages.length-1&&!s.foods.includes('noodle'))return s;
 if(s.page<stop.pages.length-1)return {...s,page:s.page+1};
 if(s.stop===tourStops.length-1)return s.memory&&s.compared&&s.foods.includes('noodle')?{...s,complete:true}:s;
 return {...s,stop:s.stop+1,page:0,furthest:Math.max(s.furthest,s.stop+1)};
}
export function previousTour(s:TourSave):TourSave{
 if(s.page>0)return {...s,page:s.page-1};
 if(s.stop===0)return s;
 return {...s,stop:s.stop-1,page:tourStops[s.stop-1].pages.length-1,complete:false};
}
export function recordFood(s:TourSave,id:FoodNote):TourSave{return s.foods.includes(id)?s:{...s,foods:[...s.foods,id]};}
