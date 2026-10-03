import { gsap } from 'gsap';
import type { Settings } from '../app/storyReducer';
const asset=(f:string)=>import.meta.env.BASE_URL+'assets/audio/'+f;
export class StoryAudio {
  tracks={present:new Audio(asset('ambient-present.wav')),past:new Audio(asset('ambient-past.wav'))};
  effect=new Audio(asset('choice.wav')); paper=new Audio(asset('paper.wav'));
  unlocked=false; current:'present'|'past'='present'; settings:Settings={muted:true,volume:.35,reducedMotion:false,instantText:false}; onRejected=()=>{};
  constructor(){Object.values(this.tracks).forEach(a=>{a.loop=true;a.volume=0;a.preload='none';});this.effect.preload='none';this.paper.preload='none';}
  unlock(settings:Settings){this.unlocked=true;this.settings=settings;this.sync(this.current,settings);}
  sync(period:'present'|'past',settings:Settings,paused=false){
    this.current=period;this.settings=settings;
    Object.entries(this.tracks).forEach(([key,a])=>{gsap.killTweensOf(a);if(!this.unlocked||settings.muted||document.hidden||paused){a.pause();a.volume=0;return;}
      if(key===period){void a.play().catch(()=>this.onRejected());gsap.to(a,{volume:settings.volume*.45,duration:1.2});}
      else gsap.to(a,{volume:0,duration:1.2,onComplete:()=>a.pause()});
    });
  }
  click(paper=false){if(!this.unlocked||this.settings.muted||document.hidden)return;const a=paper?this.paper:this.effect;a.volume=this.settings.volume*.45;a.currentTime=0;void a.play().catch(()=>{});}
  destroy(){Object.values(this.tracks).forEach(a=>{gsap.killTweensOf(a);a.pause();a.src='';});this.effect.pause();this.paper.pause();}
}
