import * as T from 'three';
import type {Anchor} from './ShopBuilder';
const ray=new T.Raycaster(),point=new T.Vector3();
const isVisible=(object:T.Object3D)=>{let current:T.Object3D|null=object;while(current){if(!current.visible)return false;current=current.parent;}return true;};
export function projectAnchor(anchor:Anchor,camera:T.PerspectiveCamera,w:number,h:number,meshes:T.Mesh[]){
  const world=anchor.object.localToWorld(anchor.local.clone());point.copy(world).project(camera);const visible=point.z>-1&&point.z<1&&point.x>-.92&&point.x<.92&&point.y>-.90&&point.y<.86;
  let occluded=false;if(visible&&anchor.kind!=='shop'){const direction=world.clone().sub(camera.position);const distance=direction.length();ray.set(camera.position,direction.normalize());ray.far=distance-.14;const hits=ray.intersectObjects(meshes.filter(isVisible),false);for(const hit of hits){let el:T.Object3D|null=hit.object;let same=false;while(el){if(el===anchor.object||el.userData.interactionId===anchor.id){same=true;break;}el=el.parent;}if(!same){occluded=true;break;}}}
  return {x:(point.x*.5+.5)*w,y:(-.5*point.y+.5)*h,visible:visible&&!occluded,world:world.toArray()};
}
export function pickAt(x:number,y:number,camera:T.PerspectiveCamera,meshes:T.Mesh[]){ray.setFromCamera(new T.Vector2(x,y),camera);ray.far=100;const hits=ray.intersectObjects(meshes.filter(isVisible),false);if(!hits.length)return null;let hit:T.Object3D|null=hits[0].object;while(hit){if(hit.userData.interactionId)return hit.userData.interactionId as string;hit=hit.parent;}return null;}
