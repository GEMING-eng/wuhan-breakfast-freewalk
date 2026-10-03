import * as T from 'three';
import {gsap} from 'gsap';
import {tourStops,type TourStop} from './tourContent';
const up=new T.Vector3(0,1,0);
/** Guided walking uses a safe centre-lane polyline. Looking rotates the head, never the feet. */
export class FirstPersonWalk{
 readonly position=new T.Vector3(...tourStops[0].position);
 readonly target=new T.Vector3(...tourStops[0].look);
 private tween:gsap.core.Tween|null=null;
 private active=0;private moving=false;private currentStop=tourStops[0];
 constructor(private onTravel:(moving:boolean)=>void){}
 go(index:number,animate:boolean,custom?:TourStop){
  this.tween?.kill();this.active=index;
  const stop=custom??tourStops[index];this.currentStop=stop;
  const end=new T.Vector3(...stop.position),aim=new T.Vector3(...stop.look),start=this.position.clone(),fromAim=this.target.clone();
  const far=Math.abs(start.z-end.z)>3;
  const points=far?[start,new T.Vector3(0,2.45,start.z),new T.Vector3(0,2.45,end.z),end]:[start,end];
  const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i])),total=lengths.reduce((a,b)=>a+b,0);
  const phase={value:0};this.moving=animate;this.onTravel(animate);
  const update=()=>{
   let distance=phase.value*total,segment=0;
   while(segment<lengths.length-1&&distance>lengths[segment]){distance-=lengths[segment];segment++;}
   this.position.lerpVectors(points[segment],points[segment+1],lengths[segment]===0?1:Math.min(1,distance/lengths[segment]));
   const look=T.MathUtils.smoothstep(phase.value,0,1);this.target.lerpVectors(fromAim,aim,look);
  };
  if(!animate){this.position.copy(end);this.target.copy(aim);this.moving=false;this.tween=null;return;}
  this.tween=gsap.to(phase,{value:1,duration:total<.1?1.1:Math.max(1.8,Math.min(11,total/2.2)),ease:'power1.inOut',onUpdate:update,onComplete:()=>{this.position.copy(end);this.target.copy(aim);this.moving=false;this.tween=null;this.onTravel(false);}});
 }
 finish(){this.tween?.progress(1);}
 view(orbit:number,aspect:number){
  const aim=this.target.clone();
  // A portrait screen frames the keeper together with the bowl at the counter.
  if(aspect<1&&this.active===2)aim.z+=.40;
  const direction=aim.sub(this.position).normalize().applyAxisAngle(up,orbit*2.9);
  // On a phone the reading card lives below the eye line; lift the subject into the open upper half.
  if(aspect<1)direction.y-=.15;
  return {position:this.position.clone(),target:this.position.clone().add(direction),direct:true,fov:aspect<1?86:64};
 }
 get state(){return {stop:this.currentStop.id,moving:this.moving,eye:this.position.y};}
 dispose(){this.tween?.kill();}
}
