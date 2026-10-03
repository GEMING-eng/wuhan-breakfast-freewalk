import * as T from 'three';
import {gsap} from 'gsap';
import type {CameraPreset} from './cameraPresets';
export {cameraPreset} from './cameraPresets';
export class CameraRig {
  target=new T.Vector3();animation:gsap.core.Timeline|null=null;current='';
  constructor(public camera:T.PerspectiveCamera){}
  apply(p:CameraPreset,animate:boolean,done?:()=>void){this.cancel();this.current=p.id;this.camera.fov=p.fov;this.camera.updateProjectionMatrix();if(!animate){this.camera.position.set(...p.position);this.target.set(...p.target);this.update();done?.();return;}this.animation=gsap.timeline({onComplete:()=>{this.animation=null;done?.();}}).to(this.camera.position,{x:p.position[0],y:p.position[1],z:p.position[2],duration:1.6,ease:'power2.inOut'},0).to(this.target,{x:p.target[0],y:p.target[1],z:p.target[2],duration:1.6,ease:'power2.inOut'},0);}
  update(){this.camera.lookAt(this.target);this.camera.updateMatrixWorld();}
  cancel(){this.animation?.kill();this.animation=null;}
}
